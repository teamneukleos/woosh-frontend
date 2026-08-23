import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { createObligationOnApprove } from "@/domains/payments/ledger";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import {
  requireCampaignAccess,
  requireBrandPermission,
  requireDeliverableAccess,
} from "@/domains/work/access";
import {
  assertDeliverableTransition,
  idempotencyMatches,
} from "@/domains/work/policy";

export async function listCampaignsForUser(userId: string) {
  const ctx = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      memberships: {
        include: { organisation: { include: { brands: true } } },
      },
      brandMemberships: true,
    },
  });
  if (!ctx) return [];

  if (ctx.creatorProfile) {
    return prisma.campaign.findMany({
      where: {
        participants: { some: { creatorProfileId: ctx.creatorProfile.id } },
      },
      include: {
        brand: true,
        deliverables: {
          where: {
            participant: { creatorProfileId: ctx.creatorProfile.id },
          },
        },
        participants: {
          where: { creatorProfileId: ctx.creatorProfile.id },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  const brandIds = new Set<string>();
  for (const m of ctx.memberships) {
    for (const b of m.organisation.brands) brandIds.add(b.id);
  }
  for (const m of ctx.brandMemberships) brandIds.add(m.brandId);

  return prisma.campaign.findMany({
    where: { brandId: { in: [...brandIds] } },
    include: {
      brand: true,
      deliverables: true,
      participants: { include: { creator: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCampaign(id: string, actorUserId: string) {
  const access = await requireCampaignAccess(id, actorUserId);
  return prisma.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      brief: true,
      deliverables: {
        where:
          access.side === "creator" && access.participant
            ? { campaignParticipantId: access.participant.id }
            : undefined,
        include: {
          participant: { include: { creator: true } },
          submissions: { orderBy: { version: "desc" } },
        },
      },
      participants: {
        where:
          access.side === "creator" && access.participant
            ? { id: access.participant.id }
            : undefined,
        include: { creator: true },
      },
      conversations: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function submitDraft(input: {
  deliverableId: string;
  draftUrl: string;
  notes?: string;
  actorUserId: string;
  storageKey?: string;
  fileName?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  idempotencyKey?: string;
}) {
  const { deliverable, side } = await requireDeliverableAccess(
    input.deliverableId,
    input.actorUserId,
  );
  if (side !== "creator") throw new Error("Creator access required");
  if (!deliverable.participant.termsAcceptedAt) {
    throw new Error("Accept campaign terms before submitting work");
  }
  if (input.idempotencyKey) {
    const existing = await prisma.submission.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) {
      if (!idempotencyMatches(existing.deliverableId, input.deliverableId)) {
        throw new Error("Invalid idempotency key");
      }
      return existing;
    }
  }
  if (!["IN_PROGRESS", "REVISION_REQUESTED"].includes(deliverable.state)) {
    throw new Error("This deliverable is not ready for a submission");
  }
  let draftUrl: URL;
  try {
    draftUrl = new URL(input.draftUrl);
  } catch {
    throw new Error("Enter a valid submission URL");
  }
  if (!["http:", "https:"].includes(draftUrl.protocol)) {
    throw new Error("Submission URL must use HTTP or HTTPS");
  }
  if (input.fileSizeBytes != null && input.fileSizeBytes < 0) {
    throw new Error("Invalid file size");
  }
  const isRevision = deliverable.state === "REVISION_REQUESTED";
  assertDeliverableTransition(
    deliverable.state,
    isRevision ? "RESUBMITTED" : "DRAFT_SUBMITTED",
  );
  const submission = await prisma.$transaction(
    async (tx) => {
      const latest = await tx.submission.findFirst({
        where: { deliverableId: input.deliverableId },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      const version = (latest?.version ?? 0) + 1;
      const created = await tx.submission.create({
        data: {
          deliverableId: input.deliverableId,
          version,
          submittedById: input.actorUserId,
          draftUrl: draftUrl.toString(),
          notes: input.notes?.trim() || undefined,
          storageKey: input.storageKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          fileSizeBytes: input.fileSizeBytes,
          idempotencyKey: input.idempotencyKey,
        },
      });
      const transitioned = await tx.deliverable.updateMany({
        where: {
          id: input.deliverableId,
          state: isRevision ? "REVISION_REQUESTED" : "IN_PROGRESS",
        },
        data: { state: isRevision ? "RESUBMITTED" : "DRAFT_SUBMITTED" },
      });
      if (transitioned.count !== 1) {
        throw new Error("Deliverable changed while the draft was uploading");
      }
      return created;
    },
    { isolationLevel: "Serializable" },
  );
  const brand = await prisma.brand.findUniqueOrThrow({
    where: { id: deliverable.campaign.brandId },
    include: {
      memberships: true,
      organisation: { include: { memberships: true } },
    },
  });
  const brandUsers = new Set([
    ...brand.memberships.map((row) => row.userId),
    ...brand.organisation.memberships.map((row) => row.userId),
  ]);
  await Promise.all(
    [...brandUsers].map((userId) =>
      createNotification({
        userId,
        type: "deliverable.submitted",
        title: isRevision ? "Revision submitted" : "Draft submitted",
        body: deliverable.title,
        href: `/app/campaigns/${deliverable.campaignId}`,
        dedupeKey: `deliverable-submitted:${submission.id}:${userId}`,
      }),
    ),
  );

  await writeAudit({
    actorId: input.actorUserId,
    action: "deliverable.submit",
    targetType: "Deliverable",
    targetId: input.deliverableId,
    after: { version: submission.version, draftUrl: input.draftUrl },
  });
  await recordAnalyticsEvent({
    eventType: "DELIVERABLE_SUBMITTED",
    actorUserId: input.actorUserId,
    brandId: deliverable.campaign.brandId,
    creatorProfileId: deliverable.participant.creatorProfileId,
    campaignId: deliverable.campaignId,
    metadata: {
      deliverableId: deliverable.id,
      submissionId: submission.id,
      version: submission.version,
    },
  });

  return submission;
}

export async function requestRevision(input: {
  deliverableId: string;
  reviewNotes: string;
  actorUserId: string;
}) {
  const { deliverable, side } = await requireDeliverableAccess(
    input.deliverableId,
    input.actorUserId,
  );
  if (side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    input.actorUserId,
    deliverable.campaign.brandId,
    "campaigns.manage",
  );
  const reviewNotes = input.reviewNotes.trim();
  if (reviewNotes.length < 3 || reviewNotes.length > 2_000) {
    throw new Error("Revision feedback must be between 3 and 2,000 characters");
  }
  if (!["DRAFT_SUBMITTED", "RESUBMITTED"].includes(deliverable.state)) {
    throw new Error("Only a submitted draft can be returned for revision");
  }
  const latest = deliverable.submissions[0];
  if (!latest) throw new Error("No submission to review");
  assertDeliverableTransition(deliverable.state, "REVISION_REQUESTED");
  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: latest.id },
      data: { reviewNotes, reviewedAt: new Date() },
    });
    const transitioned = await tx.deliverable.updateMany({
      where: {
        id: deliverable.id,
        state: { in: ["DRAFT_SUBMITTED", "RESUBMITTED"] },
      },
      data: { state: "REVISION_REQUESTED" },
    });
    if (transitioned.count !== 1) throw new Error("Deliverable already reviewed");
  });
  await createNotification({
    userId: deliverable.participant.creator.userId,
    type: "deliverable.revision",
    title: "Revision requested",
    body: reviewNotes.slice(0, 120),
    href: `/app/campaigns/${deliverable.campaignId}`,
    dedupeKey: `deliverable-revision:${latest.id}`,
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "deliverable.revision_requested",
    targetType: "Deliverable",
    targetId: input.deliverableId,
  });
  await recordAnalyticsEvent({
    eventType: "REVISION_REQUESTED",
    actorUserId: input.actorUserId,
    brandId: deliverable.campaign.brandId,
    creatorProfileId: deliverable.participant.creatorProfileId,
    campaignId: deliverable.campaignId,
    metadata: { deliverableId: deliverable.id, submissionId: latest.id },
  });
}

export async function approveDeliverable(input: {
  deliverableId: string;
  actorUserId: string;
  liveUrl?: string;
}) {
  const { deliverable, side } = await requireDeliverableAccess(
    input.deliverableId,
    input.actorUserId,
  );
  if (side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    input.actorUserId,
    deliverable.campaign.brandId,
    "campaigns.manage",
  );
  if (!["DRAFT_SUBMITTED", "RESUBMITTED"].includes(deliverable.state)) {
    throw new Error("Only a submitted draft can be approved");
  }
  const latest = deliverable.submissions[0];
  if (!latest) throw new Error("No submission to approve");
  assertDeliverableTransition(deliverable.state, "APPROVED");
  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: latest.id },
      data: { reviewedAt: new Date(), liveUrl: input.liveUrl },
    });
    const transitioned = await tx.deliverable.updateMany({
      where: {
        id: deliverable.id,
        state: { in: ["DRAFT_SUBMITTED", "RESUBMITTED"] },
      },
      data: { state: "APPROVED" },
    });
    if (transitioned.count !== 1) throw new Error("Deliverable already reviewed");
  });
  await createObligationOnApprove({
    campaignParticipantId: deliverable.participant.id,
    actorUserId: input.actorUserId,
  });
  await createNotification({
    userId: deliverable.participant.creator.userId,
    type: "deliverable.approved",
    title: "Deliverable approved",
    body: deliverable.title,
    href: `/app/campaigns/${deliverable.campaignId}`,
    dedupeKey: `deliverable-approved:${deliverable.id}`,
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "deliverable.approve",
    targetType: "Deliverable",
    targetId: input.deliverableId,
  });
  await recordAnalyticsEvent({
    eventType: "DELIVERABLE_APPROVED",
    actorUserId: input.actorUserId,
    brandId: deliverable.campaign.brandId,
    creatorProfileId: deliverable.participant.creatorProfileId,
    campaignId: deliverable.campaignId,
    metadata: { deliverableId: deliverable.id, submissionId: latest.id },
  });
}
