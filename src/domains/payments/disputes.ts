import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notify";
import type {
  DisputeCategory,
  DisputeResolutionType,
} from "@/generated/prisma/client";
import { requireObligationAccess } from "@/domains/payments/access";
import {
  assertObligationTransition,
  disputeWindowOpen,
} from "@/domains/payments/policy";
import { getWorkActor } from "@/domains/work/access";

export async function createPaymentDispute(input: {
  obligationId: string;
  actorUserId: string;
  category: DisputeCategory;
  subject: string;
  description: string;
  requestedResolution?: string;
}) {
  const { obligation } = await requireObligationAccess(
    input.obligationId,
    input.actorUserId,
  );
  if (!["APPROVED", "FAILED"].includes(obligation.status)) {
    throw new Error("This payment cannot be disputed");
  }
  if (
    input.category !== "PAYOUT_DELAY" &&
    !disputeWindowOpen(obligation.availableAt)
  ) {
    throw new Error("The 72-hour dispute window has closed");
  }
  if (input.subject.trim().length < 3 || input.description.trim().length < 20) {
    throw new Error("Provide a subject and detailed explanation");
  }
  const existing = obligation.disputes.find((row) =>
    ["OPEN", "UNDER_REVIEW"].includes(row.status),
  );
  if (existing) return existing;
  assertObligationTransition(obligation.status, "DISPUTED");
  const dispute = await prisma.$transaction(async (tx) => {
    const created = await tx.dispute.create({
      data: {
        raisedById: input.actorUserId,
        obligationId: obligation.id,
        campaignId: obligation.participant.campaignId,
        category: input.category,
        subject: input.subject.trim(),
        description: input.description.trim(),
        requestedResolution: input.requestedResolution?.trim() || undefined,
        responseDueAt: new Date(Date.now() + 2 * 86_400_000),
      },
    });
    await tx.paymentObligation.update({
      where: { id: obligation.id },
      data: { status: "DISPUTED" },
    });
    return created;
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "payment.dispute.open",
    targetType: "Dispute",
    targetId: dispute.id,
    after: { obligationId: obligation.id, category: input.category },
  });
  const creatorUserId = obligation.participant.creator.userId;
  await createNotification({
    userId: creatorUserId,
    type: "payment.dispute.opened",
    title: "Payment dispute opened",
    body: input.subject,
    href: `/app/disputes/${dispute.id}`,
    dedupeKey: `dispute-open:${dispute.id}:${creatorUserId}`,
  });
  return dispute;
}

export async function listDisputesForUser(actorUserId: string) {
  const actor = await getWorkActor(actorUserId);
  return prisma.dispute.findMany({
    where: actor.isPlatformAdmin
      ? undefined
      : {
          OR: [
            { raisedById: actorUserId },
            ...(actor.creatorProfileId
              ? [
                  {
                    obligation: {
                      participant: {
                        creatorProfileId: actor.creatorProfileId,
                      },
                    },
                  },
                ]
              : []),
            ...(actor.brandIds.length
              ? [
                  {
                    obligation: {
                      participant: {
                        campaign: { brandId: { in: actor.brandIds } },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
    include: {
      obligation: {
        include: {
          participant: {
            include: { creator: true, campaign: { include: { brand: true } } },
          },
        },
      },
      raisedBy: { select: { name: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function resolvePaymentDispute(input: {
  disputeId: string;
  actorUserId: string;
  resolutionType: DisputeResolutionType;
  resolution: string;
}) {
  const actor = await getWorkActor(input.actorUserId);
  if (!actor.isPlatformAdmin) throw new Error("Platform admin required");
  const dispute = await prisma.dispute.findUnique({
    where: { id: input.disputeId },
    include: {
      obligation: {
        include: {
          participant: {
            include: {
              creator: true,
              campaign: { include: { brand: true } },
            },
          },
        },
      },
    },
  });
  if (!dispute || !["OPEN", "UNDER_REVIEW"].includes(dispute.status)) {
    throw new Error("Open dispute not found");
  }
  if (input.resolution.trim().length < 10) {
    throw new Error("Document the resolution");
  }
  const nextStatus =
    input.resolutionType === "RELEASE_PAYOUT" ? "APPROVED" : "REVERSED";
  assertObligationTransition(dispute.obligation.status, nextStatus);
  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "RESOLVED",
        resolutionType: input.resolutionType,
        resolution: input.resolution.trim(),
        resolvedById: input.actorUserId,
        resolvedAt: new Date(),
      },
    });
    await tx.paymentObligation.update({
      where: { id: dispute.obligationId },
      data:
        nextStatus === "APPROVED"
          ? { status: "APPROVED", availableAt: new Date() }
          : {
              status: "REVERSED",
              reversedAt: new Date(),
              reversalReason: input.resolution.trim(),
            },
    });
    if (nextStatus === "REVERSED") {
      const amount =
        Number(dispute.obligation.grossAmount) +
        Number(dispute.obligation.platformFee);
      const brandId = dispute.obligation.participant.campaign.brandId;
      await tx.brandWallet.update({
        where: { brandId },
        data: { balance: { increment: amount } },
      });
      await tx.ledgerTransaction.create({
        data: {
          obligationId: dispute.obligationId,
          type: "REFUND",
          amount,
          currency: dispute.obligation.currency,
          status: "SUCCEEDED",
          provider: "woosh_ledger",
          providerReference: `dispute_refund_${dispute.id}`,
          idempotencyKey: `dispute_refund_${dispute.id}`,
          completedAt: new Date(),
          metadata: { brandId, disputeId: dispute.id },
        },
      });
    }
  });
  await writeAudit({
    actorId: input.actorUserId,
    action: "payment.dispute.resolve",
    targetType: "Dispute",
    targetId: dispute.id,
    after: {
      resolutionType: input.resolutionType,
      obligationStatus: nextStatus,
    },
  });
  await createNotification({
    userId: dispute.obligation.participant.creator.userId,
    type: "payment.dispute.resolved",
    title: "Payment dispute resolved",
    body: input.resolution.trim().slice(0, 160),
    href: `/app/disputes/${dispute.id}`,
    dedupeKey: `dispute-resolved:${dispute.id}`,
  });
  return prisma.dispute.findUniqueOrThrow({ where: { id: dispute.id } });
}
