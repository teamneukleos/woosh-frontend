import { z } from "zod";
import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";
import type { SocialChannel } from "@/lib/enums";

const briefSchema = z.object({
  brandId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  objective: z.string().optional(),
  category: z.string().optional(),
  distribution: z.enum(["OPEN", "INVITE_ONLY", "HYBRID"]).default("OPEN"),
  rateMode: z
    .enum([
      "FIXED_NON_NEGOTIABLE",
      "FIXED_NEGOTIABLE",
      "RANGE_NEGOTIABLE",
      "DELIVERABLE_BASED",
      "CREATOR_BUNDLE",
    ])
    .default("FIXED_NON_NEGOTIABLE"),
  rateAmount: z.number().nonnegative().optional(),
  rateMin: z.number().nonnegative().optional(),
  rateMax: z.number().nonnegative().optional(),
  currency: z.string().default("NGN"),
  channels: z.array(z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE"])).default([]),
  deliverables: z.any().optional(),
  applicationDeadline: z.coerce.date().optional(),
  maxCreators: z.number().int().positive().optional(),
  eligibility: z.record(z.string(), z.unknown()).optional(),
  rights: z.record(z.string(), z.unknown()).optional(),
  timing: z.record(z.string(), z.unknown()).optional(),
});

type NestBrief = {
  id: string;
  brandId: string;
  title: string;
  description: string;
  status: string;
  distribution: string;
  rateMode: string;
  rateAmount: number | null;
  currency: string;
  channels: SocialChannel[];
  applicationCount?: number;
  brand?: { id: string; name: string };
  applications?: Array<{
    id: string;
    creatorProfileId: string;
    status: string;
    proposedRate: number | null;
    currency: string;
    creator: {
      id: string;
      displayName: string;
      marketplaceStatus?: string;
      avatarUrl?: string | null;
      avatarStatus?: string;
    };
    offers: Array<{
      id: string;
      amount: number;
      currency: string;
      message?: string | null;
      createdById?: string;
      status?: string;
    }>;
  }>;
  invitations?: Array<{
    id: string;
    creatorProfileId: string;
    status: string;
    message?: string | null;
  }>;
  myApplication?: {
    id: string;
    status: string;
    proposedRate?: number | null;
    currency?: string;
  } | null;
  myInvitation?: {
    id: string;
    status: string;
    message?: string | null;
  } | null;
  applicationDeadline?: string | Date | null;
  eligibility?: unknown;
  rights?: unknown;
  timing?: unknown;
};

export async function createBrief(
  input: z.infer<typeof briefSchema>,
  _actorId?: string,
) {
  const parsed = briefSchema.parse(input);
  return api<NestBrief>("/briefs", {
    method: "POST",
    brandId: parsed.brandId,
    body: {
      ...parsed,
      applicationDeadline: parsed.applicationDeadline?.toISOString(),
    },
  });
}

export async function publishBrief(briefId: string, _actorId?: string) {
  return api(`/briefs/${briefId}/publish`, { method: "POST" });
}

export async function listBriefsForBrand(brandId: string) {
  const briefs = await api<NestBrief[]>("/briefs", { brandId });
  return briefs.map((brief) => ({
    ...brief,
    _count: { applications: brief.applicationCount ?? 0 },
  }));
}

export async function listJobsForCreator(_creatorProfileId: string, tab?: string) {
  const query = tab ? `?tab=${encodeURIComponent(tab)}` : "";
  const jobs = await api<Array<NestBrief & { brand: { id: string; name: string } }>>(
    `/jobs${query}`,
  );
  return jobs.map((job) => ({
    ...job,
    brand: job.brand,
    rateAmount: job.rateAmount,
  }));
}

export async function getBrief(id: string, _actorUserId?: string) {
  const brief = await api<NestBrief & { brand: { id: string; name: string } }>(
    `/briefs/${id}`,
  );
  return {
    ...brief,
    applicationDeadline: asDate(brief.applicationDeadline as never),
    applications: (brief.applications ?? []).map((application) => ({
      ...application,
      creator: {
        id: application.creator.id,
        displayName: application.creator.displayName,
        avatarUrl: application.creator.avatarUrl ?? null,
        avatarStatus: application.creator.avatarStatus ?? "PENDING",
        verifiedAt: null as Date | null,
        socialAccounts: [] as Array<{
          channel: string;
          handle: string;
          snapshots: Array<{
            followers: number | null;
            engagementRate: number | null;
            averageViews: number | null;
            source: string;
          }>;
        }>,
        ratePackages: [] as Array<{ price: number; currency: string }>,
      },
      offers: application.offers ?? [],
    })),
    invitations: brief.invitations ?? [],
  };
}

export async function applyToBrief(input: {
  briefId: string;
  creatorProfileId: string;
  proposedRate?: number;
  availabilityNote?: string;
  actorUserId: string;
}) {
  return api(`/jobs/${input.briefId}/apply`, {
    method: "POST",
    body: {
      proposedRate: input.proposedRate,
      availabilityNote: input.availabilityNote,
    },
  });
}

export async function markInvitationViewed(_input: {
  briefId: string;
  creatorProfileId: string;
  actorUserId: string;
}) {
  /* Nest GET /jobs/:id already marks the invite viewed. */
}
