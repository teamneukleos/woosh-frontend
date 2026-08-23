import { prisma } from "@/lib/db";
import { getWorkActor } from "@/domains/work/access";
import { hasPermission } from "@/lib/permissions";

export async function requireObligationAccess(
  obligationId: string,
  actorUserId: string,
) {
  const [actor, obligation] = await Promise.all([
    getWorkActor(actorUserId),
    prisma.paymentObligation.findUnique({
      where: { id: obligationId },
      include: {
        participant: {
          include: {
            creator: { include: { user: true, payoutAccount: true } },
            campaign: { include: { brand: true } },
          },
        },
        disputes: { orderBy: { createdAt: "desc" } },
        transactions: { orderBy: { createdAt: "desc" } },
      },
    }),
  ]);
  if (!obligation) throw new Error("Payment not found");
  const brandId = obligation.participant.campaign.brandId;
  const side =
    actor.creatorProfileId === obligation.participant.creatorProfileId
      ? "creator"
      : actor.isPlatformAdmin || actor.brandIds.includes(brandId)
        ? "brand"
        : null;
  if (!side) throw new Error("Forbidden");
  return { actor, obligation, side };
}

export async function requireBrandFinanceAccess(
  brandId: string,
  actorUserId: string,
) {
  const actor = await getWorkActor(actorUserId);
  if (actor.isPlatformAdmin) return actor;
  if (!actor.brandIds.includes(brandId)) throw new Error("Forbidden");
  const brand = await prisma.brand.findUniqueOrThrow({
    where: { id: brandId },
    select: { organisationId: true },
  });
  const [membership, brandMembership] = await Promise.all([
    prisma.membership.findUnique({
      where: {
        organisationId_userId: {
          organisationId: brand.organisationId,
          userId: actorUserId,
        },
      },
    }),
    prisma.brandMembership.findUnique({
      where: { brandId_userId: { brandId, userId: actorUserId } },
    }),
  ]);
  const allowed =
    (membership &&
      hasPermission(membership.role, "payments.approve", {
        canApprovePayments: membership.canApprovePayments,
      })) ||
    (brandMembership &&
      hasPermission(brandMembership.role, "payments.approve"));
  if (!allowed) throw new Error("Finance permission required");
  return actor;
}
