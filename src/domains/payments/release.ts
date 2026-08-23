import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notify";
import { initiatePayout, completePayoutFromWebhook } from "@/domains/payments/ledger";
import { payoutReleaseAt } from "@/domains/payments/policy";
import { paystackConfigured, verifyTransfer } from "@/lib/paystack";

export async function scheduleParticipantPayout(
  campaignParticipantId: string,
  completedAt = new Date(),
) {
  const obligation = await prisma.paymentObligation.findUnique({
    where: { campaignParticipantId },
    include: { participant: { include: { creator: true } } },
  });
  if (!obligation || obligation.status !== "APPROVED") return obligation;
  const availableAt = payoutReleaseAt(completedAt);
  const updated = await prisma.paymentObligation.update({
    where: { id: obligation.id },
    data: { availableAt },
  });
  await createNotification({
    userId: obligation.participant.creator.userId,
    type: "payment.release.scheduled",
    title: "Payout release scheduled",
    body: `Your payout will be released after ${availableAt.toLocaleString("en-NG")} unless a dispute is opened.`,
    href: "/app/earnings",
    dedupeKey: `payment-release:${obligation.id}:${availableAt.toISOString()}`,
  });
  return updated;
}

export async function processAutomaticPayoutReleases(now = new Date()) {
  const eligible = await prisma.paymentObligation.findMany({
    where: {
      status: { in: ["APPROVED", "FAILED"] },
      availableAt: { lte: now },
      disputes: { none: { status: { in: ["OPEN", "UNDER_REVIEW"] } } },
    },
    include: {
      participant: { include: { creator: { include: { payoutAccount: true } } } },
    },
    take: 100,
  });
  const results = { queued: 0, missingAccount: 0, failed: 0 };
  for (const obligation of eligible) {
    if (!obligation.participant.creator.payoutAccount?.verifiedAt) {
      results.missingAccount += 1;
      await createNotification({
        userId: obligation.participant.creator.userId,
        type: "payment.account.required",
        title: "Add a verified payout account",
        body: "Your earnings are ready, but Woosh needs verified bank details to send them.",
        href: "/app/earnings",
        dedupeKey: `payment-account-required:${obligation.id}`,
      });
      continue;
    }
    try {
      await initiatePayout({ obligationId: obligation.id, automated: true });
      results.queued += 1;
    } catch {
      results.failed += 1;
    }
  }
  return results;
}

export async function reconcileProcessingPayouts(now = new Date()) {
  if (!paystackConfigured()) return { checked: 0 };
  const stale = await prisma.paymentObligation.findMany({
    where: {
      status: "PROCESSING",
      processingAt: { lt: new Date(now.getTime() - 30 * 60 * 1000) },
    },
    include: {
      transactions: {
        where: { type: "PAYOUT", status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: 100,
  });
  for (const obligation of stale) {
    const reference = obligation.transactions[0]?.providerReference;
    if (!reference) {
      await prisma.paymentObligation.update({
        where: { id: obligation.id },
        data: {
          status: "FAILED",
          failedAt: now,
          failureReason: "Payout claim expired before provider submission",
        },
      });
      continue;
    }
    const transfer = await verifyTransfer(reference);
    if (transfer.status === "success") {
      await completePayoutFromWebhook({
        reference,
        success: true,
        amountKobo: transfer.amount,
        currency: transfer.currency,
      });
    } else if (["failed", "reversed"].includes(transfer.status)) {
      await completePayoutFromWebhook({
        reference,
        success: false,
        reversed: transfer.status === "reversed",
        failureReason: transfer.reason || transfer.status,
        amountKobo: transfer.amount,
        currency: transfer.currency,
      });
    }
  }
  return { checked: stale.length };
}
