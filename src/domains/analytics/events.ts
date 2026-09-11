import type { AnalyticsEventType } from "@/lib/enums";

export async function recordAnalyticsEvent(_input: {
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
  /* Profile views and saves are written on Nest when those APIs run. */
}
