import { createHash } from "crypto";
import { NextResponse } from "next/server";
import {
  paystackConfigured,
  verifyPaystackWebhookSignature,
} from "@/lib/paystack";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  processStoredPaystackWebhook,
  type PaystackWebhookPayload,
} from "@/domains/payments/webhooks";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!paystackConfigured()) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackWebhookPayload;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!event?.event || !event.data || typeof event.data !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const eventKey = createHash("sha256").update(rawBody).digest("hex");
  const existing = await prisma.providerWebhookEvent.findUnique({
    where: { eventKey },
  });
  if (existing?.processedAt) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  const reference = event.data.reference;
  const stored =
    existing ??
    (await prisma.providerWebhookEvent.upsert({
      where: { eventKey },
      create: {
          provider: "paystack",
          eventKey,
          eventType: event.event,
          reference,
          payload: event as unknown as Prisma.InputJsonValue,
          signature,
      },
      update: {},
    }));
  if (stored.processedAt) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  const claimed = await prisma.providerWebhookEvent.updateMany({
    where: {
      id: stored.id,
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
    return NextResponse.json({ received: true, processing: true });
  }

  try {
    await processStoredPaystackWebhook(stored.id, event);
  } catch {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
