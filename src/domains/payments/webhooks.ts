import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { creditWalletFromPaystack } from "@/domains/payments/wallet";
import { completePayoutFromWebhook } from "@/domains/payments/ledger";

export type PaystackWebhookPayload = {
  event: string;
  data: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    reason?: string;
    gateway_response?: string;
    metadata?: { brandId?: string; purpose?: string };
    transfer_code?: string;
  };
};

export async function processPaystackWebhookPayload(
  event: PaystackWebhookPayload,
) {
  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const brandId = event.data.metadata?.brandId;
    if (!reference || !brandId || event.data.amount == null) {
      throw new Error("Incomplete charge.success payload");
    }
    await creditWalletFromPaystack({
      reference,
      amountKobo: event.data.amount,
      brandId,
    });
  }

  if (
    event.event === "transfer.success" ||
    event.event === "transfer.failed" ||
    event.event === "transfer.reversed"
  ) {
    const reference = event.data.reference;
    if (!reference) throw new Error("Missing transfer reference");
    await completePayoutFromWebhook({
      reference,
      success: event.event === "transfer.success",
      reversed: event.event === "transfer.reversed",
      failureReason:
        event.data.reason ||
        event.data.gateway_response ||
        event.data.status,
      amountKobo: event.data.amount,
      currency: event.data.currency,
    });
  }
}

export async function processStoredPaystackWebhook(
  id: string,
  event: PaystackWebhookPayload,
) {
  try {
    await processPaystackWebhookPayload(event);
    await prisma.providerWebhookEvent.update({
      where: { id },
      data: {
        processedAt: new Date(),
        processingStartedAt: null,
        error: null,
      },
    });
  } catch (error) {
    await prisma.providerWebhookEvent.update({
      where: { id },
      data: {
        processingStartedAt: null,
        error: error instanceof Error ? error.message.slice(0, 1_000) : "Error",
      },
    });
    throw error;
  }
}

export async function listFailedWebhookEvents() {
  return prisma.providerWebhookEvent.findMany({
    where: { processedAt: null, error: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function replayPaystackWebhook(id: string, actorUserId: string) {
  const actor = await prisma.user.findUnique({
    where: { id: actorUserId },
    select: { isPlatformAdmin: true },
  });
  if (!actor?.isPlatformAdmin) throw new Error("Platform admin required");
  const event = await prisma.providerWebhookEvent.findUnique({ where: { id } });
  if (!event || event.provider !== "paystack") {
    throw new Error("Paystack webhook event not found");
  }
  if (event.processedAt) throw new Error("Webhook was already processed");
  const claimed = await prisma.providerWebhookEvent.updateMany({
    where: {
      id: event.id,
      processedAt: null,
      OR: [
        { processingStartedAt: null },
        {
          processingStartedAt: {
            lt: new Date(Date.now() - 10 * 60 * 1000),
          },
        },
      ],
    },
    data: { processingStartedAt: new Date(), error: null },
  });
  if (claimed.count !== 1) {
    throw new Error("Webhook is already being processed");
  }
  await processStoredPaystackWebhook(
    event.id,
    event.payload as Prisma.JsonObject as PaystackWebhookPayload,
  );
  await writeAudit({
    actorId: actorUserId,
    action: "provider_webhook.replay",
    targetType: "ProviderWebhookEvent",
    targetId: event.id,
    after: { eventType: event.eventType, reference: event.reference },
  });
}
