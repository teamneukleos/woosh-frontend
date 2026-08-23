import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import {
  requireApplicationAccess,
  requireCreatorActor,
  requireDeliverableAccess,
} from "@/domains/work/access";
import {
  assertDeliverableTransition,
  canWithdrawApplication,
} from "@/domains/work/policy";

const reasonSchema = z.string().trim().max(500).optional();

function brandUserIds(brand: {
  memberships: Array<{ userId: string }>;
  organisation: { memberships: Array<{ userId: string }> };
}) {
  return [
    ...new Set([
      ...brand.memberships.map((row) => row.userId),
      ...brand.organisation.memberships.map((row) => row.userId),
    ]),
  ];
}

export async function declineInvitation(input: {
  invitationId: string;
  actorUserId: string;
  reason?: string;
}) {
  const actor = await requireCreatorActor(input.actorUserId);
  const invitation = await prisma.briefInvitation.findUnique({
    where: { id: input.invitationId },
    include: {
      brief: {
        include: {
          brand: {
            include: {
              memberships: true,
              organisation: { include: { memberships: true } },
            },
          },
        },
      },
    },
  });
  if (
    !invitation ||
    invitation.creatorProfileId !== actor.creatorProfileId
  ) {
    throw new Error("Invitation not found");
  }
  if (!["SENT", "VIEWED"].includes(invitation.status)) {
    throw new Error("Invitation can no longer be declined");
  }
  const reason = reasonSchema.parse(input.reason);
  const updated = await prisma.briefInvitation.update({
    where: { id: invitation.id },
    data: {
      status: "DECLINED",
      respondedAt: new Date(),
      responseReason: reason,
    },
  });
  await Promise.all([
    recordAnalyticsEvent({
      eventType: "INVITE_DECLINED",
      actorUserId: input.actorUserId,
      brandId: invitation.brief.brandId,
      creatorProfileId: actor.creatorProfileId,
      briefId: invitation.briefId,
      metadata: reason ? { reason } : undefined,
    }),
    writeAudit({
      actorId: input.actorUserId,
      action: "brief.invitation.decline",
      targetType: "BriefInvitation",
      targetId: invitation.id,
      after: reason ? { reason } : undefined,
    }),
    ...brandUserIds(invitation.brief.brand).map((userId) =>
      createNotification({
        userId,
        type: "brief.invitation.declined",
        title: "Creator declined invitation",
        body: `${invitation.brief.title}${reason ? ` — ${reason}` : ""}`,
        href: `/app/briefs/${invitation.briefId}`,
        dedupeKey: `invite-declined:${invitation.id}:${userId}`,
      }),
    ),
  ]);
  return updated;
}

export async function withdrawApplication(input: {
  applicationId: string;
  actorUserId: string;
  reason?: string;
}) {
  const { application, side } = await requireApplicationAccess(
    input.applicationId,
    input.actorUserId,
  );
  if (side !== "creator") throw new Error("Creator access required");
  if (!canWithdrawApplication(application.status)) {
    throw new Error("Application can no longer be withdrawn");
  }
  const reason = reasonSchema.parse(input.reason);
  const updated = await prisma.$transaction(async (tx) => {
    await tx.offer.updateMany({
      where: {
        applicationId: application.id,
        status: { in: ["OPEN", "COUNTERED"] },
      },
      data: { status: "WITHDRAWN" },
    });
    return tx.application.update({
      where: { id: application.id },
      data: {
        status: "WITHDRAWN",
        withdrawnAt: new Date(),
        withdrawalReason: reason,
      },
    });
  });
  const brand = await prisma.brand.findUniqueOrThrow({
    where: { id: application.brief.brandId },
    include: {
      memberships: true,
      organisation: { include: { memberships: true } },
    },
  });
  await Promise.all([
    recordAnalyticsEvent({
      eventType: "APPLICATION_WITHDRAWN",
      actorUserId: input.actorUserId,
      brandId: application.brief.brandId,
      creatorProfileId: application.creatorProfileId,
      briefId: application.briefId,
      metadata: reason ? { reason } : undefined,
    }),
    writeAudit({
      actorId: input.actorUserId,
      action: "application.withdraw",
      targetType: "Application",
      targetId: application.id,
      after: reason ? { reason } : undefined,
    }),
    ...brandUserIds(brand).map((userId) =>
      createNotification({
        userId,
        type: "application.withdrawn",
        title: "Application withdrawn",
        body: `${application.creator.displayName} withdrew from ${application.brief.title}`,
        href: `/app/briefs/${application.briefId}`,
        dedupeKey: `application-withdrawn:${application.id}:${userId}`,
      }),
    ),
  ]);
  return updated;
}

export async function acceptCampaignTerms(input: {
  campaignParticipantId: string;
  actorUserId: string;
}) {
  const actor = await requireCreatorActor(input.actorUserId);
  const participant = await prisma.campaignParticipant.findFirst({
    where: {
      id: input.campaignParticipantId,
      creatorProfileId: actor.creatorProfileId,
      status: "ACTIVE",
      campaign: { status: "ACTIVE" },
    },
  });
  if (!participant) throw new Error("Campaign participation not found");
  if (participant.termsAcceptedAt) return participant;
  const updated = await prisma.campaignParticipant.update({
    where: { id: participant.id },
    data: { termsAcceptedAt: new Date() },
  });
  await Promise.all([
    recordAnalyticsEvent({
      eventType: "TERMS_ACCEPTED",
      actorUserId: input.actorUserId,
      creatorProfileId: actor.creatorProfileId,
      campaignId: participant.campaignId,
    }),
    writeAudit({
      actorId: input.actorUserId,
      action: "campaign.terms.accept",
      targetType: "CampaignParticipant",
      targetId: participant.id,
    }),
  ]);
  return updated;
}

export async function startDeliverable(input: {
  deliverableId: string;
  actorUserId: string;
}) {
  const { deliverable, side } = await requireDeliverableAccess(
    input.deliverableId,
    input.actorUserId,
  );
  if (side !== "creator") throw new Error("Creator access required");
  if (!deliverable.participant.termsAcceptedAt) {
    throw new Error("Accept campaign terms before starting work");
  }
  if (deliverable.state !== "NOT_STARTED") {
    throw new Error("Deliverable has already started");
  }
  assertDeliverableTransition(deliverable.state, "IN_PROGRESS");
  if (deliverable.dueAt && deliverable.dueAt < new Date()) {
    throw new Error("This deliverable is overdue; contact the brand before starting");
  }
  const updated = await prisma.deliverable.update({
    where: { id: deliverable.id },
    data: { state: "IN_PROGRESS", startedAt: new Date() },
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "deliverable.start",
    targetType: "Deliverable",
    targetId: deliverable.id,
  });
  return updated;
}
