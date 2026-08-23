import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { CREATOR_CATEGORIES } from "@/lib/taxonomy";
import {
  CATALOG_BY_KEY,
  DISCOVERY_CATALOG,
  catalogKey,
} from "@/lib/discovery-catalog";
import { estimateAverageLikes } from "@/lib/discovery-stats";
import { cartoonAvatar } from "@/lib/cartoon-avatar";
import type { SocialChannel } from "@/generated/prisma/client";

const categoryEnum = z.enum(
  CREATOR_CATEGORIES as unknown as [string, ...string[]],
);

const prospectSchema = z.object({
  channel: z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE"]),
  handle: z.string().min(1).max(100),
  displayName: z.string().max(120).optional(),
  locationCountry: z.string().max(8).optional(),
  locationCity: z.string().max(80).optional(),
  categories: z.array(categoryEnum).optional(),
  followerEstimate: z.number().int().positive().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(40).optional(),
});

function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

export async function createProspect(
  input: z.infer<typeof prospectSchema>,
  actorId?: string,
) {
  const parsed = prospectSchema.parse(input);
  const handle = normalizeHandle(parsed.handle);

  const prospect = await prisma.creatorProspect.upsert({
    where: {
      channel_handle: { channel: parsed.channel, handle },
    },
    create: {
      channel: parsed.channel,
      handle,
      displayName: parsed.displayName,
      locationCountry: parsed.locationCountry,
      locationCity: parsed.locationCity,
      categories: parsed.categories ?? [],
      followerEstimate: parsed.followerEstimate,
      contactEmail: parsed.contactEmail,
      contactPhone: parsed.contactPhone,
      status: "UNCLAIMED",
    },
    update: {
      displayName: parsed.displayName,
      locationCountry: parsed.locationCountry,
      locationCity: parsed.locationCity,
      categories: parsed.categories ?? undefined,
      followerEstimate: parsed.followerEstimate,
      contactEmail: parsed.contactEmail,
      contactPhone: parsed.contactPhone,
    },
  });

  await writeAudit({
    actorId,
    action: "prospect.upsert",
    targetType: "CreatorProspect",
    targetId: prospect.id,
    after: { channel: prospect.channel, handle: prospect.handle },
  });

  return prospect;
}

export type DiscoveryItem = {
  id: string;
  type: "claimed" | "prospect";
  displayName: string;
  channel?: SocialChannel;
  channels?: SocialChannel[];
  handle?: string;
  locationCountry?: string | null;
  locationCity?: string | null;
  categories: string[];
  followerEstimate?: number | null;
  verified?: boolean;
  status?: string;
  avatarUrl?: string | null;
  portfolioCount?: number;
  portfolioThumbnail?: string | null;
  startingRate?: number | null;
  rateCurrency?: string;
  followers?: number | null;
  engagementRate?: number | null;
  averageViews?: number | null;
  averageLikes?: number | null;
  metricsVerified?: boolean;
  metrics?: Array<{
    channel: SocialChannel;
    followers: number | null;
    engagementRate: number | null;
    averageViews: number | null;
    source: string;
    capturedAt: Date;
  }>;
};

export async function ensureCatalogProspects() {
  const existing = await prisma.creatorProspect.findMany({
    where: {
      OR: DISCOVERY_CATALOG.map((row) => ({
        channel: row.channel,
        handle: row.handle,
      })),
    },
    select: { channel: true, handle: true },
  });
  const seen = new Set(
    existing.map((row) => catalogKey(row.channel, row.handle)),
  );
  const missing = DISCOVERY_CATALOG.filter(
    (row) => !seen.has(catalogKey(row.channel, row.handle)),
  );
  if (!missing.length) return;
  await prisma.creatorProspect.createMany({
    data: missing.map((row) => ({
      channel: row.channel,
      handle: row.handle,
      displayName: row.displayName,
      locationCountry: "NG",
      locationCity: row.locationCity,
      categories: row.categories,
      followerEstimate: row.followers,
      status: "UNCLAIMED" as const,
    })),
    skipDuplicates: true,
  });
}

export async function listDiscovery(filters?: {
  q?: string;
  channel?: SocialChannel;
  category?: string;
  claimedOnly?: boolean;
  prospectOnly?: boolean;
  country?: string;
  city?: string;
  language?: string;
  minFollowers?: number;
  minEngagement?: number;
  minAverageViews?: number;
  maxRate?: number;
  ageBand?: string;
  gender?: string;
  sort?: "newest" | "followers" | "engagement" | "views" | "price";
}) {
  const q = filters?.q?.trim().toLowerCase();
  const items: DiscoveryItem[] = [];

  if (!filters?.prospectOnly) {
    const profiles = await prisma.creatorProfile.findMany({
      where: {
        profileVisible: true,
        marketplaceStatus: "PUBLISHED",
        socialAccounts: {
          some: {
            status: "ACTIVE",
            snapshots: {
              some: {
                source: { not: "manual_unverified" },
              },
            },
          },
        },
        ...(filters?.category
          ? { categories: { has: filters.category } }
          : {}),
        ...(filters?.country
          ? { locationCountry: filters.country }
          : {}),
        ...(filters?.city
          ? { locationCity: { contains: filters.city, mode: "insensitive" } }
          : {}),
        ...(filters?.language
          ? { languages: { has: filters.language } }
          : {}),
        ...(filters?.ageBand
          ? { ageSearchable: true, ageBand: filters.ageBand }
          : {}),
        ...(filters?.gender
          ? { genderSearchable: true, gender: filters.gender }
          : {}),
        ...(q
          ? {
              OR: [
                { displayName: { contains: q, mode: "insensitive" } },
                { bio: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        socialAccounts: {
          where: {
            status: "ACTIVE",
            ...(filters?.channel ? { channel: filters.channel } : {}),
          },
          include: {
            snapshots: {
              where: { source: { not: "manual_unverified" } },
              orderBy: { capturedAt: "desc" },
              take: 1,
            },
          },
          take: 3,
        },
        portfolioItems: {
          where: { status: "APPROVED" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        ratePackages: {
          where: { active: true },
          orderBy: { price: "asc" },
          take: 1,
        },
        _count: {
          select: {
            portfolioItems: { where: { status: "APPROVED" } },
          },
        },
      },
      take: 80,
      orderBy: { updatedAt: "desc" },
    });

    for (const p of profiles) {
      if (filters?.channel && p.socialAccounts.length === 0) continue;
      const primary = p.socialAccounts[0];
      const metrics = p.socialAccounts
        .map((account) => {
          const snapshot = account.snapshots[0];
          if (!snapshot) return null;
          return {
            channel: account.channel,
            followers: snapshot.followers,
            engagementRate: snapshot.engagementRate
              ? Number(snapshot.engagementRate)
              : null,
            averageViews: snapshot.averageViews,
            source: snapshot.source,
            capturedAt: snapshot.capturedAt,
          };
        })
        .filter((metric): metric is NonNullable<typeof metric> => !!metric);
      const bestFollowers = Math.max(
        0,
        ...metrics.map((metric) => metric.followers ?? 0),
      );
      const bestEngagement = Math.max(
        0,
        ...metrics.map((metric) => metric.engagementRate ?? 0),
      );
      const bestViews = Math.max(
        0,
        ...metrics.map((metric) => metric.averageViews ?? 0),
      );
      const startingRate = p.ratePackages[0]
        ? Number(p.ratePackages[0].price)
        : p.typicalRateMin
          ? Number(p.typicalRateMin)
          : null;
      if (filters?.minFollowers && bestFollowers < filters.minFollowers) continue;
      if (filters?.minEngagement && bestEngagement < filters.minEngagement) continue;
      if (filters?.minAverageViews && bestViews < filters.minAverageViews) continue;
      if (filters?.maxRate && (startingRate == null || startingRate > filters.maxRate)) {
        continue;
      }
      items.push({
        id: p.id,
        type: "claimed",
        displayName: p.displayName,
        channel: primary?.channel,
        channels: p.socialAccounts
          .map((account) => account.channel)
          .filter((channel, index, all) => all.indexOf(channel) === index),
        handle: primary?.handle,
        locationCountry: p.locationCountry,
        locationCity: p.locationCity,
        categories: p.categories,
        verified: !!p.verifiedAt,
        status: "CLAIMED",
        avatarUrl:
          p.avatarStatus === "APPROVED" ? p.avatarUrl : cartoonAvatar(p.displayName),
        portfolioCount: p._count.portfolioItems,
        portfolioThumbnail: p.portfolioItems[0]?.url ?? null,
        startingRate,
        rateCurrency: p.ratePackages[0]?.currency ?? p.rateCurrency,
        followers: bestFollowers || null,
        engagementRate: bestEngagement || null,
        averageViews: bestViews || null,
        averageLikes: estimateAverageLikes(bestFollowers, bestEngagement),
        metricsVerified: true,
        metrics,
      });
    }
  }

  if (!filters?.claimedOnly) {
    const prospects = await prisma.creatorProspect.findMany({
      where: {
        status: { in: ["UNCLAIMED", "CLAIM_PENDING"] },
        ...(filters?.channel ? { channel: filters.channel } : {}),
        ...(filters?.category
          ? { categories: { has: filters.category } }
          : {}),
        ...(filters?.country
          ? { locationCountry: filters.country }
          : {}),
        ...(filters?.city
          ? { locationCity: { contains: filters.city, mode: "insensitive" } }
          : {}),
        ...(filters?.minFollowers
          ? { followerEstimate: { gte: filters.minFollowers } }
          : {}),
        ...(q
          ? {
              OR: [
                { handle: { contains: q, mode: "insensitive" } },
                { displayName: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 80,
      orderBy: { updatedAt: "desc" },
    });

    for (const p of prospects) {
      const catalog = CATALOG_BY_KEY.get(catalogKey(p.channel, p.handle));
      const followers = p.followerEstimate ?? catalog?.followers ?? null;
      const engagementRate = catalog?.engagementRate ?? null;
      const averageViews = catalog?.averageViews ?? null;
      const averageLikes =
        catalog?.averageLikes ?? estimateAverageLikes(followers, engagementRate);
      if (filters?.minEngagement && (engagementRate ?? 0) < filters.minEngagement) {
        continue;
      }
      if (filters?.minAverageViews && (averageViews ?? 0) < filters.minAverageViews) {
        continue;
      }
      items.push({
        id: p.id,
        type: "prospect",
        displayName: p.displayName || `@${p.handle}`,
        channel: p.channel,
        channels: [p.channel],
        handle: p.handle,
        locationCountry: p.locationCountry,
        locationCity: p.locationCity,
        categories: p.categories,
        followerEstimate: followers,
        followers,
        engagementRate,
        averageViews,
        averageLikes,
        metricsVerified: false,
        verified: false,
        status: p.status,
        avatarUrl: cartoonAvatar(p.handle),
      });
    }
  }

  if (filters?.sort && filters.sort !== "newest") {
    items.sort((a, b) => {
      if (filters.sort === "price") {
        return (a.startingRate ?? Number.MAX_SAFE_INTEGER) -
          (b.startingRate ?? Number.MAX_SAFE_INTEGER);
      }
      const value = (item: DiscoveryItem) => {
        if (filters.sort === "followers") return item.followers ?? 0;
        if (filters.sort === "engagement") return item.engagementRate ?? 0;
        return item.averageViews ?? 0;
      };
      return value(b) - value(a);
    });
  }
  return items;
}

export async function seedProspects(
  rows: z.infer<typeof prospectSchema>[],
  actorId?: string,
) {
  const created = [];
  for (const row of rows) {
    created.push(await createProspect(row, actorId));
  }
  return created;
}

export async function getProspect(id: string) {
  return prisma.creatorProspect.findUnique({ where: { id } });
}

export async function getClaimedCreator(
  id: string,
  viewer?: { userId: string; brandId?: string | null; isAdmin?: boolean },
) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { id },
    include: {
      socialAccounts: {
        where: { status: "ACTIVE" },
        include: {
          snapshots: {
            where: { source: { not: "manual_unverified" } },
            take: 30,
            orderBy: { capturedAt: "desc" },
          },
        },
      },
      portfolioItems: {
        where: { status: "APPROVED" },
        orderBy: { sortOrder: "asc" },
      },
      ratePackages: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
      user: { select: { id: true, name: true } },
    },
  });
  if (!profile) return null;
  const publicProfile =
    profile.profileVisible && profile.marketplaceStatus === "PUBLISHED";
  const owner = viewer?.userId === profile.userId;
  if (publicProfile || owner || viewer?.isAdmin) return profile;
  if (!viewer?.brandId) return null;
  const relationship = await prisma.creatorProfile.count({
    where: {
      id,
      OR: [
        { brandInterests: { some: { brandId: viewer.brandId } } },
        { invitations: { some: { brief: { brandId: viewer.brandId } } } },
        { applications: { some: { brief: { brandId: viewer.brandId } } } },
        { participants: { some: { campaign: { brandId: viewer.brandId } } } },
      ],
    },
  });
  return relationship ? profile : null;
}
