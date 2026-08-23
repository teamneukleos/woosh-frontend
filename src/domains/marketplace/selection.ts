import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { ensureApplicationConversation } from "@/domains/messaging/threads";
import { commitFundsOnAccept } from "@/domains/payments/wallet";
import { hasPermission } from "@/lib/permissions";
import type { Prisma, SocialChannel } from "@/generated/prisma/client";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import {
  requireApplicationAccess,
  requireBrandPermission,
} from "@/domains/work/access";

const ACCEPT_RATE_THRESHOLD = Number(
  process.env.WOOSH_ACCEPT_RATE_THRESHOLD ?? "500000",
);

export async function shortlist(applicationId: string, actorId: string) {
  const access = await requireApplicationAccess(applicationId, actorId);
  if (access.side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    actorId,
    access.application.brief.brandId,
    "briefs.manage",
  );
  if (access.application.status !== "APPLIED") {
    throw new Error("Only new applications can be shortlisted");
  }
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "SHORTLISTED" },
    include: { creator: true, brief: true },
  });

  await ensureApplicationConversation(applicationId);
  await createNotification({
    userId: application.creator.userId,
    type: "application.shortlisted",
    title: "You've been shortlisted",
    body: application.brief.title,
    href: `/app/jobs/${application.briefId}`,
  });

  await writeAudit({
    actorId,
    action: "application.shortlist",
    targetType: "Application",
    targetId: applicationId,
  });
  await recordAnalyticsEvent({
    eventType: "APPLICATION_SHORTLISTED",
    actorUserId: actorId,
    brandId: application.brief.brandId,
    creatorProfileId: application.creatorProfileId,
    briefId: application.briefId,
  });

  return application;
}

export async function decline(applicationId: string, actorId: string) {
  const access = await requireApplicationAccess(applicationId, actorId);
  if (access.side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    actorId,
    access.application.brief.brandId,
    "briefs.manage",
  );
  if (!["APPLIED", "SHORTLISTED"].includes(access.application.status)) {
    throw new Error("Application can no longer be declined");
  }
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "DECLINED" },
    include: { creator: true, brief: true },
  });

  await createNotification({
    userId: application.creator.userId,
    type: "application.declined",
    title: "Application update",
    body: `Not selected for ${application.brief.title}`,
    href: `/app/jobs/${application.briefId}`,
  });

  await writeAudit({
    actorId,
    action: "application.decline",
    targetType: "Application",
    targetId: applicationId,
  });
  await recordAnalyticsEvent({
    eventType: "APPLICATION_DECLINED",
    actorUserId: actorId,
    brandId: application.brief.brandId,
    creatorProfileId: application.creatorProfileId,
    briefId: application.briefId,
  });

  return application;
}

type DeliverableSpec = {
  title?: string;
  channel?: SocialChannel;
  dueAt?: string;
  requirements?: Prisma.InputJsonValue;
};

async function assertCanAcceptRate(
  actorId: string,
  brandId: string,
  rate: number,
) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { organisationId: true },
  });
  if (!brand) throw new Error("Brand not found");
  const membership = await prisma.membership.findFirst({
    where: { userId: actorId, organisationId: brand.organisationId },
  });
  if (!membership) {
    const brandMem = await prisma.brandMembership.findFirst({
      where: { userId: actorId, brandId },
    });
    if (!brandMem) throw new Error("Not a brand/agency member");
    if (rate > ACCEPT_RATE_THRESHOLD) {
      throw new Error(
        `Rate ₦${rate.toLocaleString()} exceeds manager threshold ₦${ACCEPT_RATE_THRESHOLD.toLocaleString()}. An owner or finance user must accept.`,
      );
    }
    return;
  }

  const canApproveMoney = hasPermission(membership.role, "payments.approve", {
    canApprovePayments: membership.canApprovePayments,
  });

  if (rate > ACCEPT_RATE_THRESHOLD && !canApproveMoney) {
    throw new Error(
      `Rate ₦${rate.toLocaleString()} exceeds manager threshold ₦${ACCEPT_RATE_THRESHOLD.toLocaleString()}. An owner or finance user must accept.`,
    );
  }
}

export async function acceptApplication(applicationId: string, actorId: string) {
  const access = await requireApplicationAccess(applicationId, actorId);
  if (access.side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    actorId,
    access.application.brief.brandId,
    "briefs.manage",
  );
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      creator: true,
      brief: true,
      offers: {
        where: { status: { in: ["AGREED", "OPEN", "COUNTERED"] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!application) throw new Error("Application not found");
  if (!["APPLIED", "SHORTLISTED"].includes(application.status)) {
    throw new Error("Application can no longer be accepted");
  }

  const agreed = application.offers.find((o) => o.status === "AGREED");
  if (application.offers.length > 0 && !agreed) {
    throw new Error("The creator must agree to the active offer first");
  }

  const rate =
    agreed?.amount ??
    application.proposedRate ??
    application.brief.rateAmount;
  if (rate == null) {
    throw new Error("No agreed rate — accept or counter an offer first");
  }

  const rateNum = Number(rate);
  await assertCanAcceptRate(actorId, application.brief.brandId, rateNum);

  const specs = Array.isArray(application.brief.deliverables)
    ? (application.brief.deliverables as DeliverableSpec[])
    : [];

  const deliverableCreates =
    specs.length > 0
      ? specs.map((d) => ({
          title: d.title || "Deliverable",
          channel: d.channel,
          dueAt: d.dueAt ? new Date(d.dueAt) : undefined,
          requirements: d.requirements,
          state: "NOT_STARTED" as const,
        }))
      : [
          {
            title: "Primary deliverable",
            channel: application.brief.channels[0] ?? null,
            state: "NOT_STARTED" as const,
          },
        ];

  const priorBriefStatus = application.brief.status;

  const result = await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    });

    const campaign = await tx.campaign.create({
      data: {
        briefId: application.briefId,
        brandId: application.brief.brandId,
        title: application.brief.title,
        status: "ACTIVE",
      },
    });
    const participant = await tx.campaignParticipant.create({
      data: {
        campaignId: campaign.id,
        creatorProfileId: application.creatorProfileId,
        agreedRate: rate,
        currency: application.currency,
      },
    });
    await tx.deliverable.createMany({
      data: deliverableCreates.map((deliverable) => ({
        ...deliverable,
        campaignId: campaign.id,
        campaignParticipantId: participant.id,
      })),
    });

    await tx.brief.update({
      where: { id: application.briefId },
      data: { status: "SELECTING" },
    });

    return tx.campaign.findUniqueOrThrow({
      where: { id: campaign.id },
      include: { participants: true, deliverables: true },
    });
  });

  const participant = result.participants[0];
  if (!participant) throw new Error("Campaign participant missing");

  try {
    await commitFundsOnAccept({
      brandId: application.brief.brandId,
      campaignParticipantId: participant.id,
      gross: rateNum,
      currency: application.currency,
      actorUserId: actorId,
    });
  } catch (err) {
    await prisma.$transaction([
      prisma.campaign.delete({ where: { id: result.id } }),
      prisma.application.update({
        where: { id: applicationId },
        data: { status: "SHORTLISTED" },
      }),
      prisma.brief.update({
        where: { id: application.briefId },
        data: { status: priorBriefStatus },
      }),
    ]);
    throw err;
  }

  await ensureApplicationConversation(applicationId);
  await prisma.conversation.create({
    data: {
      type: "CAMPAIGN",
      campaignId: result.id,
      messages: {
        create: {
          isSystem: true,
          body: `Campaign opened for ${application.creator.displayName}`,
        },
      },
    },
  });

  await createNotification({
    userId: application.creator.userId,
    type: "application.accepted",
    title: "You're on the campaign",
    body: application.brief.title,
    href: `/app/campaigns/${result.id}`,
  });

  await writeAudit({
    actorId,
    action: "application.accept",
    targetType: "Application",
    targetId: applicationId,
    after: { campaignId: result.id },
  });
  await Promise.all([
    recordAnalyticsEvent({
      eventType: "APPLICATION_ACCEPTED",
      actorUserId: actorId,
      brandId: application.brief.brandId,
      creatorProfileId: application.creatorProfileId,
      briefId: application.briefId,
      campaignId: result.id,
    }),
    recordAnalyticsEvent({
      eventType: "CAMPAIGN_STARTED",
      actorUserId: actorId,
      brandId: application.brief.brandId,
      creatorProfileId: application.creatorProfileId,
      briefId: application.briefId,
      campaignId: result.id,
    }),
  ]);

  return result;
}
