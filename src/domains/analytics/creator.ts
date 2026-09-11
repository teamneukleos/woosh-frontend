import { api } from "@/lib/api";

export type CreatorInsights = {
  days: number;
  channels: Array<{
    id: string;
    channel: string;
    handle: string;
    followers: number | null;
    growth: number | null;
    engagementRate: number | null;
    averageViews: number | null;
    postingFrequency: number | null;
    audienceGeo: unknown;
    audienceAge: unknown;
    audienceGender: unknown;
    topContent: unknown;
    source: string | null;
    capturedAt: string | null;
    history: Array<{ capturedAt: string; followers: number | null }>;
  }>;
  opportunities: {
    profileViews: number;
    saves: number;
    invites: number;
    inviteViews: number;
    applications: number;
    shortlisted: number;
    accepted: number;
  };
  campaigns: Array<{
    id: string;
    title: string;
    brand: string;
    status: string;
    reach: number;
    views: number;
    engagement: number;
  }>;
  earnings: {
    total: number;
    paid: number;
    processing: number;
    available: number;
    monthToDate: number;
  };
};

export async function getCreatorInsights(
  _creatorProfileId: string,
  days = 30,
) {
  const window = [7, 30, 90].includes(days) ? days : 30;
  return api<CreatorInsights>(`/creators/me/insights?days=${window}`);
}
