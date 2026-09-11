import { api } from "@/lib/api";
import type { SocialChannel } from "@/lib/enums";

export type DiscoveryItem = {
  id: string;
  type: "claimed" | "prospect";
  displayName: string;
  channel?: SocialChannel;
  channels?: SocialChannel[];
  handle?: string;
  avatarUrl?: string | null;
  locationCountry?: string | null;
  locationCity?: string | null;
  categories: string[];
  followerEstimate?: number | null;
  followers?: number | null;
  engagementRate?: number | null;
  averageLikes?: number | null;
  averageViews?: number | null;
  metricsVerified: boolean;
  verified: boolean;
  status?: string;
  startingRate?: number | null;
  rateCurrency?: string;
  saved?: boolean;
  interested?: boolean;
};

export async function createProspect(
  input: {
    channel: SocialChannel;
    handle: string;
    displayName?: string;
    categories?: string[];
    followerEstimate?: number;
    locationCountry?: string;
    locationCity?: string;
    contactEmail?: string;
  },
  _actorUserId?: string,
) {
  return api("/creators/prospects", { method: "POST", body: input });
}

export async function getProspect(id: string) {
  return api<{
    id: string;
    type: "prospect";
    channel: SocialChannel;
    handle: string;
    displayName: string;
    locationCountry: string | null;
    locationCity: string | null;
    categories: string[];
    followerEstimate: number | null;
    metricsVerified: boolean;
    status: string;
    contactEmail: string | null;
    interested?: boolean;
  }>(`/creators/prospects/${id}`);
}

export async function listDiscovery(filters: {
  q?: string;
  channel?: SocialChannel;
  category?: string;
  claimedOnly?: boolean;
  prospectOnly?: boolean;
  country?: string;
  city?: string;
  language?: string;
  ageBand?: string;
  gender?: string;
  minFollowers?: number;
  minEngagement?: number;
  minAverageViews?: number;
  maxRate?: number;
  sort?: "newest" | "followers" | "engagement" | "views" | "price";
}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.channel) params.set("channel", filters.channel);
  if (filters.category) params.set("category", filters.category);
  if (filters.claimedOnly) params.set("claimedOnly", "true");
  if (filters.prospectOnly) params.set("prospectOnly", "true");
  if (filters.country) params.set("country", filters.country);
  if (filters.city) params.set("city", filters.city);
  if (filters.language) params.set("language", filters.language);
  if (filters.minFollowers != null) params.set("minFollowers", String(filters.minFollowers));
  if (filters.minEngagement != null) params.set("minEngagement", String(filters.minEngagement));
  if (filters.minAverageViews != null) {
    params.set("minAverageViews", String(filters.minAverageViews));
  }
  if (filters.maxRate != null) params.set("maxRate", String(filters.maxRate));
  if (filters.sort) params.set("sort", filters.sort);
  const query = params.toString();
  return api<DiscoveryItem[]>(`/creators/discovery${query ? `?${query}` : ""}`);
}

export async function getClaimedCreator(
  id: string,
  _actor?: { userId?: string; brandId?: string | null; isAdmin?: boolean },
) {
  return api<{
    type: "claimed";
    id: string;
    displayName: string;
    bio: string | null;
    locationCountry: string | null;
    locationCity: string | null;
    categories: string[];
    languages: string[];
    verified: boolean;
    marketplaceStatus: string;
    saved?: boolean;
    interested?: boolean;
    socialAccounts: Array<{
      channel: string;
      handle: string;
      metrics: {
        followers: number | null;
        engagementRate: number | null;
        averageViews: number | null;
        source: string;
        capturedAt: string;
      } | null;
    }>;
    ratePackages: Array<{
      id: string;
      title: string;
      channel: string;
      deliverableType: string;
      price: number;
      currency: string;
      description?: string | null;
      turnaroundDays?: number | null;
      revisions?: number;
      usageRights?: string | null;
    }>;
    portfolio: Array<{
      id: string;
      title: string;
      url: string;
      mediaType: string;
      description?: string | null;
      brandName?: string | null;
      campaignType?: string | null;
    }>;
  }>(`/creators/${id}`);
}

export async function ensureCatalogProspects() {
  /* Nest discovery already mixes claimed + prospect rows. */
}
