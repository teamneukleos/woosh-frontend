import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { splitFee } from "@/domains/payments/index";
import {
  initiateTransfer,
  paystackConfigured,
} from "@/lib/paystack";
import { createNotification } from "@/lib/notify";
import { requireBrandFinanceAccess } from "@/domains/payments/access";
import {
  assertObligationTransition,
  assertProductionPaymentConfiguration,
  providerMoneyMatches,
} from "@/domains/payments/policy";
import { createBrandReceipt } from "@/domains/payments/documents";

async function notifyPaymentParties(
  obligationId: string,
  input: { type: string; title: string; body: string; href: string },
) {
  const obligation = await prisma.paymentObligation.findUniqueOrThrow({
    where: { id: obligationId },
    include: {
      participant: {
        include: {
          creator: true,
          campaign: {
            include: {
              brand: {
                include: {
                  memberships: true,
                  organisation: { include: { memberships: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  const users = new Set([
    obligation.participant.creator.userId,
    ...obligation.participant.campaign.brand.memberships.map(
      (row) => row.userId,
    ),
    ...obligation.participant.campaign.brand.organisation.memberships.map(
      (row) => row.userId,
    ),
  ]);
  await Promise.all(
    [...users].map((userId) =>
      createNotification({
        userId,
        ...input,
        dedupeKey: `${input.type}:${obligationId}:${userId}:${obligation.status}`,
      }),
    ),
  );
}

/**
 * After deliverable approve: promote COMMITTED → APPROVED,
 * or create APPROVED obligation if legacy path had no commitment.
 */
export async function createObligationOnApprove(input: {
  campaignParticipantId: string;
  actorUserId: string;
}) {
  const existing = await prisma.paymentObligation.findFirst({
    where: {
      campaignParticipantId: input.campaignParticipantId,
      status: { notIn: ["REVERSED", "FAILED", "PAID"] },
    },
  });

  if (existing) {
    if (existing.status === "COMMITTED" || existing.status === "FUNDED") {
      const updated = await prisma.paymentObligation.update({
        where: { id: existing.id },
        data: { status: "APPROVED", approvedAt: new Date() },
      });
      await writeAudit({
        actorId: input.actorUserId,
        action: "payment.obligation.approve",
        targetType: "PaymentObligation",
        targetId: updated.id,
      });
      await notifyPaymentParties(updated.id, {
        type: "payment.approved",
        title: "Creator payment approved",
        body: "The campaign payment is secured and will enter its release window when work is completed.",
        href: "/app/earnings",
      });
      return updated;
    }
    return existing;
  }

  const participant = await prisma.campaignParticipant.findUnique({
    where: { id: input.campaignParticipantId },
  });
  if (!participant) throw new Error("Participant not found");

  const gross = Number(participant.agreedRate);
  const { platformFee, net } = splitFee(gross);

  const obligation = await prisma.paymentObligation.create({
    data: {
      campaignParticipantId: participant.id,
      grossAmount: gross,
      platformFee,
      netAmount: net,
      currency: participant.currency,
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "payment.obligation.create",
    targetType: "PaymentObligation",
    targetId: obligation.id,
    after: { gross, platformFee, net, note: "legacy_no_prior_commit" },
  });

  return obligation;
}

export async function listCreatorEarnings(creatorProfileId: string) {
  return prisma.paymentObligation.findMany({
    where: {
      participant: { creatorProfileId },
    },
    include: {
      participant: {
        include: {
          campaign: { include: { brand: true } },
        },
      },
      transactions: { orderBy: { createdAt: "desc" } },
      disputes: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Pay a creator obligation.
 * With Paystack keys + recipient: initiate transfer (PROCESSING → webhook PAID).
 * Without keys: test-mode mark PAID immediately.
 * Brand/finance actors only in production paths — callers enforce RBAC.
 */
export async function initiatePayout(input: {
  obligationId: string;
  actorUserId?: string;
  automated?: boolean;
}) {
  assertProductionPaymentConfiguration();
  const obligation = await prisma.paymentObligation.findUnique({
    where: { id: input.obligationId },
    include: {
      participant: {
        include: {
          creator: { include: { payoutAccount: true, user: true } },
          campaign: true,
        },
      },
    },
  });
  if (!obligation) throw new Error("Obligation not found");
  const brandId = obligation.participant.campaign?.brandId;
  if (!input.automated) {
    if (!input.actorUserId || !brandId) throw new Error("Finance access required");
    await requireBrandFinanceAccess(brandId, input.actorUserId);
  }
  if (!["APPROVED", "FAILED"].includes(obligation.status)) {
    throw new Error(`Cannot payout from status ${obligation.status}`);
  }
  if (!obligation.availableAt || obligation.availableAt > new Date()) {
    throw new Error("The payout release window is still open");
  }
  if (
    await prisma.dispute.count({
      where: {
        obligationId: obligation.id,
        status: { in: ["OPEN", "UNDER_REVIEW"] },
      },
    })
  ) {
    throw new Error("Payout is frozen by an open dispute");
  }
  const activePayout = await prisma.ledgerTransaction.findFirst({
    where: {
      obligationId: obligation.id,
      type: "PAYOUT",
      status: "PENDING",
    },
  });
  if (activePayout) {
    return {
      mode: "paystack" as const,
      reference: activePayout.providerReference!,
    };
  }

  const net = Number(obligation.netAmount);
  const reference = `payout_${obligation.id}_${randomUUID().slice(0, 8)}`;
  const payout = obligation.participant.creator.payoutAccount;
  if (!payout?.verifiedAt || !payout.recipientCode) {
    throw new Error(
      "Creator has not added a payout bank account. Ask them to save one on Profile.",
    );
  }

  const recipientCode = payout.recipientCode;
  assertObligationTransition(obligation.status, "PROCESSING");
  const claimed = await prisma.paymentObligation.updateMany({
    where: { id: obligation.id, status: obligation.status },
    data: {
      status: "PROCESSING",
      processingAt: new Date(),
      failedAt: null,
      failureReason: null,
    },
  });
  if (claimed.count !== 1) {
    throw new Error("Payout is already being processed");
  }

  if (!paystackConfigured()) {
    return markPaidLocal({
      obligationId: obligation.id,
      actorUserId: input.actorUserId,
      provider: "test_mode",
      reference,
    });
  }

  try {
    const transfer = await initiateTransfer({
      amountMajor: net,
      recipientCode,
      reference,
      reason: `Woosh payout ${obligation.id}`,
      currency: obligation.currency,
    });

    await prisma.ledgerTransaction.create({
        data: {
        obligationId: obligation.id,
        type: "PAYOUT",
        amount: net,
        currency: obligation.currency,
        status: "PENDING",
        provider: "paystack",
        providerReference: transfer.reference || reference,
        idempotencyKey: `payout_${obligation.id}_${reference}`,
          metadata: { transfer_code: transfer.transfer_code },
        },
      });

    await writeAudit({
      actorId: input.actorUserId,
      action: "payment.payout.initiated",
      targetType: "PaymentObligation",
      targetId: obligation.id,
      after: { reference },
    });
    await notifyPaymentParties(obligation.id, {
      type: "payment.payout.initiated",
      title: "Payout processing",
      body: `${obligation.currency} ${net.toLocaleString()} is being sent to the creator’s verified bank account.`,
      href: "/app/earnings",
    });

    return { mode: "paystack" as const, reference };
  } catch (err) {
    const reason = err instanceof Error ? err.message.slice(0, 500) : "Provider error";
    await prisma.paymentObligation.update({
      where: { id: obligation.id },
      data: { status: "FAILED", failedAt: new Date(), failureReason: reason },
    });
    throw err;
  }
}

export async function completePayoutFromWebhook(input: {
  reference: string;
  success: boolean;
  reversed?: boolean;
  failureReason?: string;
  amountKobo?: number;
  currency?: string;
}) {
  const tx = await prisma.ledgerTransaction.findFirst({
    where: { providerReference: input.reference, type: "PAYOUT" },
  });
  if (!tx?.obligationId) return null;
  const obligationId = tx.obligationId;
  if (!providerMoneyMatches({
    expectedMajor: Number(tx.amount),
    expectedCurrency: tx.currency,
    amountMinor: input.amountKobo,
    currency: input.currency,
  })) {
    throw new Error("Transfer webhook amount or currency mismatch");
  }
  const obligation = await prisma.paymentObligation.findUniqueOrThrow({
    where: { id: obligationId },
  });

  if (!input.success || input.reversed) {
    const nextStatus = input.reversed ? "REVERSED" : "FAILED";
    if (obligation.status === nextStatus) return tx;
    assertObligationTransition(obligation.status, nextStatus);
    await prisma.$transaction(async (db) => {
      await db.ledgerTransaction.update({
        where: { id: tx.id },
        data: {
          status: input.reversed ? "REVERSED" : "FAILED",
          failureReason: input.failureReason,
          completedAt: new Date(),
        },
      });
      await db.paymentObligation.update({
        where: { id: obligationId },
        data: {
          status: nextStatus,
          failedAt: input.reversed ? undefined : new Date(),
          reversedAt: input.reversed ? new Date() : undefined,
          failureReason: input.failureReason,
          reversalReason: input.reversed ? input.failureReason : undefined,
        },
      });
      if (input.reversed) {
        const full = Number(obligation.grossAmount) + Number(obligation.platformFee);
        const participant = await db.campaignParticipant.findUniqueOrThrow({
          where: { id: obligation.campaignParticipantId },
          include: { campaign: true },
        });
        await db.brandWallet.update({
          where: { brandId: participant.campaign.brandId },
          data: { balance: { increment: full } },
        });
        await db.ledgerTransaction.upsert({
          where: { idempotencyKey: `transfer_reversal_${obligation.id}` },
          create: {
            obligationId: obligation.id,
            type: "REFUND",
            amount: full,
            currency: obligation.currency,
            status: "SUCCEEDED",
            provider: "paystack",
            providerReference: input.reference,
            idempotencyKey: `transfer_reversal_${obligation.id}`,
            completedAt: new Date(),
            metadata: { brandId: participant.campaign.brandId },
          },
          update: {},
        });
      }
    });
    await notifyPaymentParties(obligationId, {
      type: input.reversed ? "payment.reversed" : "payment.failed",
      title: input.reversed ? "Payout reversed" : "Payout failed",
      body:
        input.failureReason ||
        "The payout provider could not complete this transfer.",
      href: "/app/earnings",
    });
    return tx;
  }

  if (tx.status === "SUCCEEDED") return tx;
  if (obligation.status === "PAID") return tx;

  assertObligationTransition(obligation.status, "PAID");
  await prisma.$transaction([
    prisma.ledgerTransaction.update({
      where: { id: tx.id },
      data: { status: "SUCCEEDED", completedAt: new Date() },
    }),
    prisma.paymentObligation.update({
      where: { id: obligationId },
      data: { status: "PAID", paidAt: new Date(), failureReason: null },
    }),
  ]);
  await createBrandReceipt(obligationId);
  await notifyPaymentParties(obligationId, {
    type: "payment.paid",
    title: "Creator payout completed",
    body: `${tx.currency} ${Number(tx.amount).toLocaleString()} has been paid.`,
    href: "/app/earnings",
  });

  return tx;
}

async function markPaidLocal(input: {
  obligationId: string;
  actorUserId?: string;
  provider: string;
  reference: string;
}) {
  const obligation = await prisma.paymentObligation.findUnique({
    where: { id: input.obligationId },
  });
  if (!obligation) throw new Error("Obligation not found");
  if (process.env.NODE_ENV === "production") {
    throw new Error("Test payouts are disabled in production");
  }

  const tx = await prisma.ledgerTransaction.create({
    data: {
      obligationId: obligation.id,
      type: "PAYOUT",
      amount: obligation.netAmount,
      currency: obligation.currency,
      status: "SUCCEEDED",
      provider: input.provider,
      providerReference: input.reference,
      idempotencyKey: `payout_${obligation.id}_${input.reference}`,
      metadata: { mode: "test" },
      completedAt: new Date(),
    },
  });

  await prisma.paymentObligation.update({
    where: { id: obligation.id },
    data: { status: "PAID", paidAt: new Date() },
  });
  await createBrandReceipt(obligation.id);

  await writeAudit({
    actorId: input.actorUserId,
    action: "payment.mark_paid",
    targetType: "PaymentObligation",
    targetId: obligation.id,
    after: { provider: input.provider, transactionId: tx.id },
  });

  return { mode: "test" as const, transactionId: tx.id };
}

/** @deprecated Prefer initiatePayout — kept for action alias */
export async function markPaidTestMode(input: {
  obligationId: string;
  actorUserId: string;
}) {
  return initiatePayout(input);
}
