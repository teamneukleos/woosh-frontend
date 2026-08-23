import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { seedProspects } from "@/domains/creator/prospects";
import type { SocialChannel } from "@/generated/prisma/client";

export async function listPendingBriefs() {
  return prisma.brief.findMany({
    where: { status: "PENDING_MODERATION" },
    include: { brand: { include: { organisation: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function listCreatorModeration() {
  const [profiles, media] = await Promise.all([
    prisma.creatorProfile.findMany({
      where: { marketplaceStatus: "PENDING_REVIEW" },
      include: {
        user: { select: { email: true } },
        socialAccounts: {
          where: { status: "ACTIVE" },
          include: {
            snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
          },
        },
        _count: { select: { portfolioItems: true, ratePackages: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.creatorPortfolioItem.findMany({
      where: { status: "PENDING" },
      include: {
        creator: { select: { displayName: true, userId: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
  ]);
  return { profiles, media };
}

export async function moderateCreatorProfile(input: {
  creatorProfileId: string;
  actorId: string;
  approve: boolean;
  reason?: string;
}) {
  const profile = await prisma.creatorProfile.update({
    where: { id: input.creatorProfileId },
    data: input.approve
      ? {
          marketplaceStatus: "PUBLISHED",
          profileVisible: true,
          verifiedAt: new Date(),
          moderationNotes: null,
          avatarStatus: "APPROVED",
          coverStatus: "APPROVED",
        }
      : {
          marketplaceStatus: "REJECTED",
          profileVisible: false,
          verifiedAt: null,
          moderationNotes: input.reason || "Profile needs changes",
        },
  });
  await createNotification({
    userId: profile.userId,
    type: input.approve ? "creator.approved" : "creator.rejected",
    title: input.approve ? "Your creator profile is live" : "Profile needs changes",
    body: input.reason || (input.approve ? "Brands can now discover you." : "Review the feedback and resubmit."),
    href: "/app/profile",
  });
  await writeAudit({
    actorId: input.actorId,
    action: input.approve ? "creator.profile.approve" : "creator.profile.reject",
    targetType: "CreatorProfile",
    targetId: profile.id,
    after: { reason: input.reason },
  });
  return profile;
}

export async function moderateCreatorMedia(input: {
  itemId: string;
  actorId: string;
  approve: boolean;
  reason?: string;
}) {
  const item = await prisma.creatorPortfolioItem.update({
    where: { id: input.itemId },
    data: {
      status: input.approve ? "APPROVED" : "REJECTED",
      moderationNotes: input.reason,
      moderatedAt: new Date(),
      moderatedById: input.actorId,
    },
    include: { creator: true },
  });
  await createNotification({
    userId: item.creator.userId,
    type: input.approve ? "creator.media.approved" : "creator.media.rejected",
    title: input.approve ? "Portfolio sample approved" : "Portfolio sample needs changes",
    body: input.reason || item.title,
    href: "/app/profile",
  });
  await writeAudit({
    actorId: input.actorId,
    action: input.approve ? "creator.media.approve" : "creator.media.reject",
    targetType: "CreatorPortfolioItem",
    targetId: item.id,
    after: { reason: input.reason },
  });
  return item;
}

export async function approveBrief(briefId: string, actorId: string) {
  const brief = await prisma.brief.update({
    where: { id: briefId },
    data: { status: "OPEN", publishedAt: new Date() },
    include: { brand: { include: { memberships: true } } },
  });

  for (const m of brief.brand.memberships) {
    await createNotification({
      userId: m.userId,
      type: "brief.approved",
      title: "Brief approved",
      body: brief.title,
      href: `/app/briefs/${brief.id}`,
    });
  }

  await writeAudit({
    actorId,
    action: "brief.approve",
    targetType: "Brief",
    targetId: briefId,
  });

  return brief;
}

export async function rejectBrief(
  briefId: string,
  actorId: string,
  reason?: string,
) {
  const brief = await prisma.brief.update({
    where: { id: briefId },
    data: { status: "DRAFT" },
    include: { brand: { include: { memberships: true } } },
  });

  for (const m of brief.brand.memberships) {
    await createNotification({
      userId: m.userId,
      type: "brief.rejected",
      title: "Brief needs changes",
      body: reason || brief.title,
      href: `/app/briefs/${brief.id}`,
    });
  }

  await writeAudit({
    actorId,
    action: "brief.reject",
    targetType: "Brief",
    targetId: briefId,
    after: { reason },
  });

  return brief;
}

export async function verifyOrganisation(
  organisationId: string,
  actorId: string,
  verified: boolean,
) {
  const org = await prisma.organisation.update({
    where: { id: organisationId },
    data: { verifiedAt: verified ? new Date() : null },
  });

  await writeAudit({
    actorId,
    action: verified ? "organisation.verify" : "organisation.unverify",
    targetType: "Organisation",
    targetId: organisationId,
  });

  return org;
}

export async function listOrganisations() {
  return prisma.organisation.findMany({
    include: {
      brands: { select: { id: true, name: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listProspects() {
  return prisma.creatorProspect.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      isPlatformAdmin: true,
      createdAt: true,
      creatorProfile: { select: { id: true, displayName: true } },
      memberships: {
        select: {
          role: true,
          organisation: { select: { publicName: true, type: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function setUserAdmin(userId: string, isAdmin: boolean, actorId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPlatformAdmin: isAdmin },
  });

  await writeAudit({
    actorId,
    action: isAdmin ? "user.grant_admin" : "user.revoke_admin",
    targetType: "User",
    targetId: userId,
  });

  return user;
}

export async function adminSeedProspects(
  rows: {
    channel: SocialChannel;
    handle: string;
    displayName?: string;
    categories?: string[];
    followerEstimate?: number;
    locationCountry?: string;
    locationCity?: string;
    contactEmail?: string;
  }[],
  actorId: string,
) {
  return seedProspects(rows, actorId);
}
