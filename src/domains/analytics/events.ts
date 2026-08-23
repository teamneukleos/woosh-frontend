import { prisma } from "@/lib/db";
import type { AnalyticsEventType } from "@/generated/prisma/client";

export async function recordAnalyticsEvent(input: {
  eventType: AnalyticsEventType;
  actorUserId?: string;
  organisationId?: string;
  brandId?: string;
  creatorProfileId?: string;
  briefId?: string;
  campaignId?: string;
  metadata?: object;
  dedupePerDay?: boolean;
}) {
  if (input.dedupePerDay && input.actorUserId && input.creatorProfileId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const existing = await prisma.analyticsEvent.findFirst({
      where: {
        eventType: input.eventType,
        actorUserId: input.actorUserId,
        creatorProfileId: input.creatorProfileId,
        createdAt: { gte: start },
      },
    });
    if (existing) return existing;
  }

  return prisma.analyticsEvent.create({
    data: {
      eventType: input.eventType,
      actorUserId: input.actorUserId,
      organisationId: input.organisationId,
      brandId: input.brandId,
      creatorProfileId: input.creatorProfileId,
      briefId: input.briefId,
      campaignId: input.campaignId,
      metadata: input.metadata,
    },
  });
}
