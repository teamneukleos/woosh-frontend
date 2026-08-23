import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import { ensureApplicationConversation } from "@/domains/messaging/threads";
import { recordAnalyticsEvent } from "@/domains/analytics/events";
import {
  requireApplicationAccess,
  requireBrandPermission,
} from "@/domains/work/access";
import { canRespondToOffer } from "@/domains/work/policy";

export async function counterOffer(input: {
  applicationId: string;
  amount: number;
  message?: string;
  createdById: string;
}) {
  const { application, side } = await requireApplicationAccess(
    input.applicationId,
    input.createdById,
  );
  if (side === "brand") {
    await requireBrandPermission(
      input.createdById,
      application.brief.brandId,
      "briefs.manage",
    );
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Enter a valid offer amount");
  }
  if (!["APPLIED", "SHORTLISTED"].includes(application.status)) {
    throw new Error("This negotiation is closed");
  }
  const latest = await prisma.offer.findFirst({
    where: {
      applicationId: input.applicationId,
      status: { in: ["OPEN", "COUNTERED"] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (latest?.createdById === input.createdById) {
    throw new Error("Wait for the other party to respond to your offer");
  }
  const offer = await prisma.$transaction(async (tx) => {
    await tx.offer.updateMany({
      where: {
        applicationId: input.applicationId,
        status: { in: ["OPEN", "COUNTERED"] },
      },
      data: { status: "SUPERSEDED" },
    });
    return tx.offer.create({
      data: {
        applicationId: input.applicationId,
        amount: input.amount,
        currency: application.currency,
        message: input.message?.trim() || undefined,
        status: "COUNTERED",
        createdById: input.createdById,
        previousOfferId: latest?.id,
      },
    });
  });

  const conversation = await ensureApplicationConversation(input.applicationId);
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: input.createdById,
      isSystem: true,
      offerId: offer.id,
      body: `Counter-offer: ${input.amount} ${application.currency}${input.message ? ` — ${input.message}` : ""}`,
    },
  });

  if (side === "brand") {
    await createNotification({
      userId: application.creator.userId,
      type: "offer.counter",
      title: "New counter-offer",
      body: `${application.brief.title}: ${input.amount} ${application.currency}`,
      href: `/app/jobs/${application.briefId}`,
      dedupeKey: `offer-counter:${offer.id}:${application.creator.userId}`,
    });
  } else {
    const brand = await prisma.brand.findUniqueOrThrow({
      where: { id: application.brief.brandId },
      include: {
        memberships: true,
        organisation: { include: { memberships: true } },
      },
    });
    const users = new Set([
      ...brand.memberships.map((row) => row.userId),
      ...brand.organisation.memberships.map((row) => row.userId),
    ]);
    await Promise.all(
      [...users].map((userId) =>
        createNotification({
          userId,
          type: "offer.counter",
          title: "Creator sent a counter-offer",
          body: `${application.brief.title}: ${input.amount} ${application.currency}`,
          href: `/app/briefs/${application.briefId}`,
          dedupeKey: `offer-counter:${offer.id}:${userId}`,
        }),
      ),
    );
  }

  await writeAudit({
    actorId: input.createdById,
    action: "offer.counter",
    targetType: "Offer",
    targetId: offer.id,
  });
  await recordAnalyticsEvent({
    eventType: "OFFER_COUNTERED",
    actorUserId: input.createdById,
    brandId: application.brief.brandId,
    creatorProfileId: application.creatorProfileId,
    briefId: application.briefId,
    metadata: { amount: input.amount, currency: application.currency },
  });

  return offer;
}

export async function acceptOffer(input: {
  offerId: string;
  actorUserId: string;
}) {
  const access = await requireApplicationAccess(
    (
      await prisma.offer.findUnique({
        where: { id: input.offerId },
        select: { applicationId: true },
      })
    )?.applicationId ?? "",
    input.actorUserId,
  );
  if (access.side === "brand") {
    await requireBrandPermission(
      input.actorUserId,
      access.application.brief.brandId,
      "briefs.manage",
    );
  }
  const offer = await prisma.offer.findUnique({
    where: { id: input.offerId },
    include: {
      application: {
        include: {
          creator: true,
          brief: { include: { brand: { include: { memberships: true } } } },
        },
      },
    },
  });
  if (!offer) throw new Error("Offer not found");
  if (
    !canRespondToOffer({
      status: offer.status,
      offerCreatedById: offer.createdById,
      actorUserId: input.actorUserId,
      applicationStatus: offer.application.status,
    })
  ) {
    throw new Error("The other party cannot accept this offer now");
  }
  const updated = await prisma.$transaction(async (tx) => {
    const agreed = await tx.offer.updateMany({
      where: { id: offer.id, status: { in: ["OPEN", "COUNTERED"] } },
      data: { status: "AGREED" },
    });
    if (agreed.count !== 1) throw new Error("Offer has already changed");
    await tx.offer.updateMany({
      where: {
        applicationId: offer.applicationId,
        id: { not: offer.id },
        status: { in: ["OPEN", "COUNTERED"] },
      },
      data: { status: "SUPERSEDED" },
    });
    return tx.offer.findUniqueOrThrow({ where: { id: offer.id } });
  });

  const conversation = await ensureApplicationConversation(offer.applicationId);
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderUserId: input.actorUserId,
      isSystem: true,
      offerId: offer.id,
      body: `Offer agreed at ${offer.amount} ${offer.currency}`,
    },
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "offer.accept",
    targetType: "Offer",
    targetId: offer.id,
  });
  const recipientId =
    access.side === "brand"
      ? offer.application.creator.userId
      : offer.createdById;
  await createNotification({
    userId: recipientId,
    type: "offer.agreed",
    title: "Offer agreed",
    body: `${offer.application.brief.title}: ${offer.amount} ${offer.currency}`,
    href:
      access.side === "brand"
        ? `/app/jobs/${offer.application.briefId}`
        : `/app/briefs/${offer.application.briefId}`,
    dedupeKey: `offer-agreed:${offer.id}:${recipientId}`,
  });

  return updated;
}
