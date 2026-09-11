import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";
import type { SocialChannel } from "@/lib/enums";

export type OwnCreatorProfile = {
  id: string;
  displayName: string;
  bio: string | null;
  websiteUrl: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  locationCountry: string | null;
  locationState: string | null;
  locationCity: string | null;
  categories: string[];
  languages: string[];
  preferredIndustries: string[];
  excludedIndustries: string[];
  ageBand: string | null;
  gender: string | null;
  ageSearchable: boolean;
  genderSearchable: boolean;
  typicalRateMin: number | null;
  typicalRateMax: number | null;
  rateCurrency: string;
  availabilityNotes: string | null;
  marketplaceStatus: string;
  profileVisible: boolean;
  submittedAt: Date | null;
  verifiedAt: Date | null;
  user: { emailVerified: Date | string | null };
  socialAccounts: Array<{
    id: string;
    channel: string;
    handle: string;
    status: string;
    lastRefreshedAt: Date | null;
    snapshots: Array<{
      followers: number | null;
      engagementRate: number | null;
      averageViews: number | null;
      source: string;
      capturedAt?: Date | string;
    }>;
  }>;
  portfolioItems: Array<{
    id: string;
    status: string;
    mediaType?: string;
    title?: string;
    description?: string | null;
    brandName?: string | null;
    campaignType?: string | null;
    url?: string;
    tags?: string[];
    channel?: string | null;
    moderationNotes?: string | null;
  }>;
  ratePackages: Array<{
    id: string;
    channel: string;
    deliverableType: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    turnaroundDays: number | null;
    revisions: number;
    usageRights: string | null;
    active: boolean;
  }>;
  readiness?: { percentage: number; complete: boolean };
  oauth?: {
    allowDev: boolean;
    configured: Record<string, boolean>;
  };
};

export async function updateCreatorProfile(
  _creatorProfileId: string,
  input: Record<string, unknown>,
  _actorId?: string,
) {
  return api("/creators/me", { method: "PATCH", body: input });
}

export async function connectSocialChannel(input: {
  creatorProfileId: string;
  channel: SocialChannel;
  actorId: string;
  handleHint?: string;
}) {
  return api("/creators/me/socials", {
    method: "POST",
    body: { channel: input.channel, handleHint: input.handleHint },
  });
}

export async function attachClaimedChannel() {
  /* Nest claim flow attaches the handle. */
}

export async function getCreatorProfile(emailVerified?: Date | string | null) {
  const raw = await api<{
    id: string;
    displayName: string;
    bio: string | null;
    websiteUrl?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    locationCountry: string | null;
    locationState?: string | null;
    locationCity: string | null;
    categories: string[];
    languages: string[];
    preferredIndustries?: string[];
    excludedIndustries?: string[];
    ageBand?: string | null;
    gender?: string | null;
    ageSearchable?: boolean;
    genderSearchable?: boolean;
    typicalRateMin?: number | null;
    typicalRateMax?: number | null;
    rateCurrency?: string;
    availabilityNotes?: string | null;
    marketplaceStatus: string;
    profileVisible?: boolean;
    submittedAt?: string | null;
    verifiedAt?: string | null;
    socialAccounts: Array<{
      id: string;
      channel: string;
      handle: string;
      status: string;
      lastRefreshedAt?: string | null;
      metrics: {
        followers: number | null;
        engagementRate: number | null;
        averageViews: number | null;
        source: string;
        capturedAt?: string;
      } | null;
    }>;
    portfolioItems?: OwnCreatorProfile["portfolioItems"];
    ratePackages: OwnCreatorProfile["ratePackages"];
    readiness?: { percentage: number; complete: boolean };
    oauth?: OwnCreatorProfile["oauth"];
  }>("/creators/me");

  return {
    ...raw,
    avatarUrl: raw.avatarUrl ?? null,
    coverUrl: raw.coverUrl ?? null,
    websiteUrl: raw.websiteUrl ?? null,
    locationState: raw.locationState ?? null,
    preferredIndustries: raw.preferredIndustries ?? [],
    excludedIndustries: raw.excludedIndustries ?? [],
    ageBand: raw.ageBand ?? null,
    gender: raw.gender ?? null,
    ageSearchable: raw.ageSearchable ?? false,
    genderSearchable: raw.genderSearchable ?? false,
    typicalRateMin: raw.typicalRateMin ?? null,
    typicalRateMax: raw.typicalRateMax ?? null,
    rateCurrency: raw.rateCurrency ?? "NGN",
    availabilityNotes: raw.availabilityNotes ?? null,
    profileVisible: raw.profileVisible ?? false,
    submittedAt: asDate(raw.submittedAt),
    verifiedAt: asDate(raw.verifiedAt),
    user: { emailVerified: emailVerified ? new Date(emailVerified) : null },
    socialAccounts: raw.socialAccounts.map((account) => ({
      ...account,
      lastRefreshedAt: asDate(account.lastRefreshedAt),
      snapshots: account.metrics
        ? [
            {
              followers: account.metrics.followers,
              engagementRate: account.metrics.engagementRate,
              averageViews: account.metrics.averageViews,
              source: account.metrics.source,
              capturedAt: account.metrics.capturedAt,
            },
          ]
        : [],
    })),
    portfolioItems: raw.portfolioItems ?? [],
    ratePackages: raw.ratePackages ?? [],
  } satisfies OwnCreatorProfile;
}
