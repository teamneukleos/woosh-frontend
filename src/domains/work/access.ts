import { prisma } from "@/lib/db";
import { canAccessOwnedWork } from "@/domains/work/policy";
import { hasPermission, type Permission } from "@/lib/permissions";

export type WorkActor = {
  userId: string;
  isPlatformAdmin: boolean;
  creatorProfileId: string | null;
  brandIds: string[];
};

export async function getWorkActor(userId: string): Promise<WorkActor> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      status: true,
      emailVerified: true,
      isPlatformAdmin: true,
      creatorProfile: { select: { id: true } },
      memberships: {
        select: {
          organisation: {
            select: { brands: { select: { id: true } } },
          },
        },
      },
      brandMemberships: { select: { brandId: true } },
    },
  });
  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.emailVerified
  ) {
    throw new Error("Unauthorized");
  }
  const brandIds = new Set(user.brandMemberships.map((row) => row.brandId));
  for (const membership of user.memberships) {
    for (const brand of membership.organisation.brands) brandIds.add(brand.id);
  }
  return {
    userId: user.id,
    isPlatformAdmin: user.isPlatformAdmin,
    creatorProfileId: user.creatorProfile?.id ?? null,
    brandIds: [...brandIds],
  };
}

export async function requireBrandPermission(
  userId: string,
  brandId: string,
  permission: Permission,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPlatformAdmin: true,
      memberships: {
        where: { organisation: { brands: { some: { id: brandId } } } },
        select: {
          role: true,
          canApprovePayments: true,
          canEditRates: true,
          canManageTeam: true,
          canExportData: true,
        },
      },
      brandMemberships: {
        where: { brandId },
        select: { role: true },
      },
    },
  });
  if (!user) throw new Error("Unauthorized");
  const allowed =
    user.isPlatformAdmin ||
    user.memberships.some((membership) =>
      hasPermission(membership.role, permission, membership),
    ) ||
    user.brandMemberships.some((membership) =>
      hasPermission(membership.role, permission),
    );
  if (!allowed) throw new Error("Forbidden");
}

export async function requireOrganisationPermission(
  userId: string,
  organisationId: string,
  permission: Permission,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPlatformAdmin: true,
      memberships: {
        where: { organisationId },
        select: {
          role: true,
          canApprovePayments: true,
          canEditRates: true,
          canManageTeam: true,
          canExportData: true,
        },
      },
    },
  });
  if (
    !user ||
    (!user.isPlatformAdmin &&
      !user.memberships.some((membership) =>
        hasPermission(membership.role, permission, membership),
      ))
  ) {
    throw new Error("Forbidden");
  }
}

export async function requireCreatorActor(userId: string) {
  const actor = await getWorkActor(userId);
  if (!actor.creatorProfileId) throw new Error("Creator workspace required");
  return { ...actor, creatorProfileId: actor.creatorProfileId };
}

export async function requireApplicationAccess(
  applicationId: string,
  userId: string,
) {
  const [actor, application] = await Promise.all([
    getWorkActor(userId),
    prisma.application.findUnique({
      where: { id: applicationId },
      include: { brief: true, creator: true },
    }),
  ]);
  if (!application) throw new Error("Application not found");
  const side =
    actor.creatorProfileId === application.creatorProfileId
      ? "creator"
      : actor.isPlatformAdmin || actor.brandIds.includes(application.brief.brandId)
        ? "brand"
        : null;
  if (!side) throw new Error("Forbidden");
  return { actor, application, side };
}

export async function requireCampaignAccess(campaignId: string, userId: string) {
  const actor = await getWorkActor(userId);
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      participants: {
        where: actor.creatorProfileId
          ? { creatorProfileId: actor.creatorProfileId }
          : undefined,
        select: { id: true, creatorProfileId: true, termsAcceptedAt: true },
      },
    },
  });
  if (!campaign) throw new Error("Campaign not found");
  const participant = actor.creatorProfileId
    ? campaign.participants.find(
        (row) => row.creatorProfileId === actor.creatorProfileId,
      )
    : undefined;
  const side = participant
    ? "creator"
    : actor.isPlatformAdmin || actor.brandIds.includes(campaign.brandId)
      ? "brand"
      : null;
  if (!side) throw new Error("Forbidden");
  return { actor, campaign, participant, side };
}

export async function requireDeliverableAccess(
  deliverableId: string,
  userId: string,
) {
  const actor = await getWorkActor(userId);
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    include: {
      participant: { include: { creator: true } },
      campaign: { include: { brand: true } },
      submissions: { orderBy: { version: "desc" } },
    },
  });
  if (!deliverable) throw new Error("Deliverable not found");
  const allowed = canAccessOwnedWork({
    isPlatformAdmin: actor.isPlatformAdmin,
    actorCreatorProfileId: actor.creatorProfileId,
    actorBrandIds: actor.brandIds,
    ownerCreatorProfileId: deliverable.participant.creatorProfileId,
    ownerBrandId: deliverable.campaign.brandId,
  });
  const side = !allowed
    ? null
    : actor.creatorProfileId === deliverable.participant.creatorProfileId
      ? "creator"
      : "brand";
  if (!side) throw new Error("Forbidden");
  return { actor, deliverable, side };
}
