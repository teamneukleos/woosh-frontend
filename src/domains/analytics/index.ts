import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import {
  requireCampaignAccess,
  requireBrandPermission,
  requireDeliverableAccess,
} from "@/domains/work/access";
import { assertDeliverableTransition } from "@/domains/work/policy";
import { scheduleParticipantPayout } from "@/domains/payments/release";

export async function logCampaignMetric(input: {
  campaignId: string;
  source: string;
  reach?: number;
  impressions?: number;
  views?: number;
  engagement?: number;
  postUrl?: string;
  creatorProfileId?: string;
  deliverableId?: string;
  submissionId?: string;
  actorUserId: string;
}) {
  const access = await requireCampaignAccess(
    input.campaignId,
    input.actorUserId,
  );
  if (access.side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    input.actorUserId,
    access.campaign.brandId,
    "campaigns.manage",
  );
  const campaign = await prisma.campaign.findUnique({
    where: { id: input.campaignId },
    include: { participants: { select: { creatorProfileId: true } } },
  });
  if (!campaign) throw new Error("Campaign not found");
  const creatorProfileId =
    input.creatorProfileId ||
    (campaign.participants.length === 1
      ? campaign.participants[0]?.creatorProfileId
      : undefined);
  if (
    creatorProfileId &&
    !campaign.participants.some(
      (participant) => participant.creatorProfileId === creatorProfileId,
    )
  ) {
    throw new Error("Creator is not part of this campaign");
  }
  if (input.deliverableId) {
    const deliverable = await prisma.deliverable.findFirst({
      where: { id: input.deliverableId, campaignId: input.campaignId },
      select: { campaignParticipantId: true },
    });
    if (!deliverable) throw new Error("Deliverable is not part of this campaign");
  }
  if (input.submissionId) {
    const submission = await prisma.submission.findFirst({
      where: {
        id: input.submissionId,
        deliverable: { campaignId: input.campaignId },
      },
      select: { id: true },
    });
    if (!submission) throw new Error("Submission is not part of this campaign");
  }
  const metric = await prisma.campaignMetric.create({
    data: {
      campaignId: input.campaignId,
      creatorProfileId,
      deliverableId: input.deliverableId,
      submissionId: input.submissionId,
      postUrl: input.postUrl,
      source: input.source,
      reach: input.reach,
      impressions: input.impressions,
      views: input.views,
      engagement: input.engagement,
      raw: input.postUrl ? { postUrl: input.postUrl } : undefined,
    },
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "campaign.metric.log",
    targetType: "CampaignMetric",
    targetId: metric.id,
  });

  return metric;
}

export async function listBrandCampaignMetrics(brandId: string) {
  const campaigns = await prisma.campaign.findMany({
    where: { brandId },
    include: {
      metrics: { orderBy: { capturedAt: "desc" }, take: 20 },
      participants: { include: { creator: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const totals = { reach: 0, views: 0, engagement: 0, impressions: 0 };
  for (const c of campaigns) {
    const latestByContent = new Map<string, (typeof c.metrics)[number]>();
    for (const metric of c.metrics) {
      const key =
        metric.submissionId ||
        metric.deliverableId ||
        metric.postUrl ||
        metric.id;
      if (!latestByContent.has(key)) latestByContent.set(key, metric);
    }
    for (const m of latestByContent.values()) {
      totals.reach += m.reach ?? 0;
      totals.views += m.views ?? 0;
      totals.engagement += m.engagement ?? 0;
      totals.impressions += m.impressions ?? 0;
    }
  }

  return { campaigns, totals };
}

export async function setDeliverableLive(input: {
  deliverableId: string;
  liveUrl?: string;
  actorUserId: string;
}) {
  const access = await requireDeliverableAccess(
    input.deliverableId,
    input.actorUserId,
  );
  const { deliverable } = access;
  if (access.side !== "creator") throw new Error("Creator access required");
  if (!["APPROVED", "SCHEDULED"].includes(deliverable.state)) {
    throw new Error("Only approved content can be marked live");
  }
  if (!input.liveUrl) throw new Error("Enter the published content URL");
  let liveUrl: URL;
  try {
    liveUrl = new URL(input.liveUrl);
  } catch {
    throw new Error("Enter a valid published content URL");
  }
  if (!["http:", "https:"].includes(liveUrl.protocol)) {
    throw new Error("Published URL must use HTTP or HTTPS");
  }
  const latest = deliverable.submissions[0];
  if (!latest) throw new Error("No approved submission found");
  assertDeliverableTransition(deliverable.state, "LIVE");
  await prisma.$transaction([
    prisma.submission.update({
      where: { id: latest.id },
      data: { liveUrl: liveUrl.toString() },
    }),
    prisma.deliverable.update({
      where: { id: deliverable.id },
      data: { state: "LIVE" },
    }),
  ]);

  await writeAudit({
    actorId: input.actorUserId,
    action: "deliverable.live",
    targetType: "Deliverable",
    targetId: input.deliverableId,
  });
  await recordAnalyticsEvent({
    eventType: "CONTENT_LIVE",
    actorUserId: input.actorUserId,
    brandId: deliverable.campaign.brandId,
    creatorProfileId: deliverable.participant.creatorProfileId,
    campaignId: deliverable.campaignId,
    metadata: {
      deliverableId: deliverable.id,
      submissionId: latest.id,
      liveUrl: liveUrl.toString(),
    },
  });

  return prisma.deliverable.findUniqueOrThrow({
    where: { id: deliverable.id },
  });
}

export async function completeDeliverable(input: {
  deliverableId: string;
  actorUserId: string;
}) {
  const access = await requireDeliverableAccess(
    input.deliverableId,
    input.actorUserId,
  );
  if (access.side !== "brand") throw new Error("Brand access required");
  await requireBrandPermission(
    input.actorUserId,
    access.deliverable.campaign.brandId,
    "campaigns.manage",
  );
  if (access.deliverable.state !== "LIVE") {
    throw new Error("Only live work can be completed");
  }
  assertDeliverableTransition(access.deliverable.state, "COMPLETED");
  const deliverable = await prisma.deliverable.update({
    where: { id: input.deliverableId },
    data: { state: "COMPLETED", completedAt: new Date() },
  });
  const remainingForParticipant = await prisma.deliverable.count({
    where: {
      campaignParticipantId: access.deliverable.campaignParticipantId,
      state: { not: "COMPLETED" },
    },
  });
  if (remainingForParticipant === 0) {
    await prisma.campaignParticipant.update({
      where: { id: access.deliverable.campaignParticipantId },
      data: { status: "COMPLETED" },
    });
    await scheduleParticipantPayout(
      access.deliverable.campaignParticipantId,
      new Date(),
    );
  }
  const remainingForCampaign = await prisma.deliverable.count({
    where: {
      campaignId: access.deliverable.campaignId,
      state: { not: "COMPLETED" },
    },
  });
  if (remainingForCampaign === 0) {
    await prisma.campaign.update({
      where: { id: access.deliverable.campaignId },
      data: { status: "COMPLETED" },
    });
  }
  await writeAudit({
    actorId: input.actorUserId,
    action: "deliverable.complete",
    targetType: "Deliverable",
    targetId: input.deliverableId,
  });
  if (remainingForCampaign === 0) {
    await recordAnalyticsEvent({
      eventType: "CAMPAIGN_COMPLETED",
      actorUserId: input.actorUserId,
      brandId: access.deliverable.campaign.brandId,
      creatorProfileId: access.deliverable.participant.creatorProfileId,
      campaignId: deliverable.campaignId,
      metadata: { deliverableId: deliverable.id },
    });
  }
  return deliverable;
}
