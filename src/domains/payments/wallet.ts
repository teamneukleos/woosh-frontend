import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  initializeTransaction,
  paystackConfigured,
  verifyTransaction,
} from "@/lib/paystack";
import { randomUUID } from "crypto";
import { splitFee } from "@/domains/payments/index";
import { requireBrandFinanceAccess } from "@/domains/payments/access";
import { assertProductionPaymentConfiguration } from "@/domains/payments/policy";
import type { Prisma } from "@/generated/prisma/client";

export async function getOrCreateWallet(brandId: string, currency = "NGN") {
  return prisma.brandWallet.upsert({
    where: { brandId },
    create: { brandId, balance: 0, currency },
    update: {},
  });
}

export async function getWalletBalance(brandId: string) {
  const wallet = await getOrCreateWallet(brandId);
  return { balance: Number(wallet.balance), currency: wallet.currency, id: wallet.id };
}

/** Required brand capacity to accept a creator at `gross` rate. */
export function capacityRequired(gross: number) {
  const { platformFee } = splitFee(gross);
  return Math.round((gross + platformFee) * 100) / 100;
}

/**
 * Start a wallet top-up. With Paystack keys: returns checkout URL.
 * Without keys: credits wallet immediately (test mode).
 */
export async function startWalletTopUp(input: {
  brandId: string;
  amountMajor: number;
  actorUserId: string;
  actorEmail: string;
}) {
  if (input.amountMajor <= 0) throw new Error("Amount must be positive");
  await requireBrandFinanceAccess(input.brandId, input.actorUserId);
  assertProductionPaymentConfiguration();

  const wallet = await getOrCreateWallet(input.brandId);
  const reference = `fund_${input.brandId.slice(-8)}_${randomUUID().slice(0, 8)}`;

  if (!paystackConfigured()) {
    const updated = await prisma.brandWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: input.amountMajor } },
    });

    await prisma.ledgerTransaction.create({
      data: {
        type: "COLLECTION",
        amount: input.amountMajor,
        currency: wallet.currency,
        status: "SUCCEEDED",
        provider: "test_mode",
        providerReference: reference,
        idempotencyKey: `fund_${reference}`,
        metadata: { brandId: input.brandId, mode: "test" },
      },
    });

    await writeAudit({
      actorId: input.actorUserId,
      action: "wallet.topup.test",
      targetType: "BrandWallet",
      targetId: wallet.id,
      after: { amount: input.amountMajor, balance: Number(updated.balance) },
    });

    return {
      mode: "test" as const,
      balance: Number(updated.balance),
      reference,
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const init = await initializeTransaction({
    email: input.actorEmail,
    amountMajor: input.amountMajor,
    currency: wallet.currency,
    reference,
    callbackUrl: `${appUrl}/api/paystack/verify`,
    metadata: {
      brandId: input.brandId,
      purpose: "wallet_topup",
      actorUserId: input.actorUserId,
    },
  });

  await prisma.ledgerTransaction.create({
    data: {
      type: "COLLECTION",
      amount: input.amountMajor,
      currency: wallet.currency,
      status: "PENDING",
      provider: "paystack",
      providerReference: reference,
      idempotencyKey: `fund_${reference}`,
      metadata: { brandId: input.brandId, purpose: "wallet_topup" },
    },
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "wallet.topup.initiated",
    targetType: "BrandWallet",
    targetId: wallet.id,
    after: { amount: input.amountMajor, reference },
  });

  return {
    mode: "paystack" as const,
    authorizationUrl: init.authorization_url,
    reference,
  };
}

/** Credit wallet after successful Paystack charge (idempotent). */
export async function creditWalletFromPaystack(input: {
  reference: string;
  amountKobo: number;
  brandId: string;
}) {
  const existing = await prisma.ledgerTransaction.findFirst({
    where: { providerReference: input.reference },
  });
  if (existing?.status === "SUCCEEDED") {
    return getOrCreateWallet(input.brandId);
  }

  const amountMajor = input.amountKobo / 100;
  if (
    existing &&
    (Number(existing.amount) !== amountMajor ||
      existing.currency !== "NGN" ||
      String(
        (existing.metadata as { brandId?: string } | null)?.brandId ?? "",
      ) !== input.brandId)
  ) {
    throw new Error("Paystack charge does not match the pending collection");
  }
  const wallet = await getOrCreateWallet(input.brandId);

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.ledgerTransaction.update({
        where: { id: existing.id },
        data: { status: "SUCCEEDED" },
      });
    } else {
      await tx.ledgerTransaction.create({
        data: {
          type: "COLLECTION",
          amount: amountMajor,
          currency: wallet.currency,
          status: "SUCCEEDED",
          provider: "paystack",
          providerReference: input.reference,
          idempotencyKey: `fund_${input.reference}`,
          metadata: { brandId: input.brandId },
        },
      });
    }
    await tx.brandWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amountMajor } },
    });
  });

  return getOrCreateWallet(input.brandId);
}

export async function verifyAndCreditTopUp(reference: string) {
  const verified = await verifyTransaction(reference);
  if (verified.status !== "success") {
    throw new Error(`Payment not successful: ${verified.status}`);
  }
  const brandId = String(
    (verified.metadata as { brandId?: string } | undefined)?.brandId ?? "",
  );
  if (!brandId) throw new Error("Missing brandId in payment metadata");
  return creditWalletFromPaystack({
    reference,
    amountKobo: verified.amount,
    brandId,
  });
}

/**
 * Lock capacity on accept. Deducts gross+fee from wallet; creates COMMITTED obligation.
 */
export async function commitFundsOnAccept(input: {
  brandId: string;
  campaignParticipantId: string;
  gross: number;
  currency: string;
  actorUserId: string;
}) {
  const required = capacityRequired(input.gross);
  const { platformFee, net } = splitFee(input.gross);
  const wallet = await getOrCreateWallet(input.brandId, input.currency);
  const obligation = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "BrandWallet"
        WHERE "id" = ${wallet.id}
        FOR UPDATE
      `;
      const existing = await tx.paymentObligation.findUnique({
        where: { campaignParticipantId: input.campaignParticipantId },
      });
      if (existing) return existing;
      const current = await tx.brandWallet.findUniqueOrThrow({
        where: { id: wallet.id },
      });
      if (Number(current.balance) < required) {
        throw new Error(
          `Insufficient brand funds. Need ₦${required.toLocaleString()} (creator rate); wallet has ₦${Number(current.balance).toLocaleString()}. Top up in Payments.`,
        );
      }
      const created = await tx.paymentObligation.create({
        data: {
          campaignParticipantId: input.campaignParticipantId,
          grossAmount: input.gross,
          platformFee,
          netAmount: net,
          currency: input.currency,
          status: "COMMITTED",
        },
      });
      await tx.brandWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: required } },
      });
      await tx.ledgerTransaction.create({
        data: {
          obligationId: created.id,
          type: "ADJUSTMENT",
          amount: required,
          currency: input.currency,
          status: "SUCCEEDED",
          provider: "woosh_ledger",
          providerReference: `commit_${input.campaignParticipantId}`,
          idempotencyKey: `commit_${input.campaignParticipantId}`,
          completedAt: new Date(),
          metadata: {
            brandId: input.brandId,
            campaignParticipantId: input.campaignParticipantId,
            purpose: "accept_commitment",
          } as Prisma.InputJsonValue,
        },
      });
      return created;
    },
    { isolationLevel: "Serializable" },
  );

  await writeAudit({
    actorId: input.actorUserId,
    action: "payment.commit",
    targetType: "PaymentObligation",
    targetId: obligation.id,
    after: { required, gross: input.gross, platformFee, net },
  });

  return obligation;
}
