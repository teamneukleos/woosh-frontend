import { api } from "@/lib/api";

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
  return api(`/campaigns/${input.campaignId}/metrics`, {
    method: "POST",
    body: {
      source: input.source,
      reach: input.reach,
      impressions: input.impressions,
      views: input.views,
      engagement: input.engagement,
      postUrl: input.postUrl,
      creatorProfileId: input.creatorProfileId,
      deliverableId: input.deliverableId,
      submissionId: input.submissionId,
    },
  });
}

export async function listBrandCampaignMetrics(brandId: string) {
  return api<{
    campaigns: Array<{
      id: string;
      title: string;
      status: string;
      metrics: Array<{
        id: string;
        source: string;
        capturedAt: string;
        views: number | null;
        reach: number | null;
        impressions: number | null;
        engagement: number | null;
        postUrl: string | null;
        raw: unknown;
      }>;
    }>;
    totals: {
      reach: number;
      views: number;
      engagement: number;
      impressions: number;
    };
  }>(`/analytics/campaigns?brandId=${encodeURIComponent(brandId)}`);
}

export async function setDeliverableLive(input: {
  deliverableId: string;
  liveUrl?: string;
  actorUserId: string;
}) {
  return api(`/deliverables/${input.deliverableId}/live`, {
    method: "POST",
    body: { liveUrl: input.liveUrl },
  });
}

export async function completeDeliverable(input: {
  deliverableId: string;
  actorUserId: string;
}) {
  return api(`/deliverables/${input.deliverableId}/complete`, { method: "POST" });
}
