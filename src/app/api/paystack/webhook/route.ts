import { NextResponse } from "next/server";
import { nestApiUrl } from "@/lib/nest";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const response = await fetch(`${nestApiUrl()}/payments/webhooks/paystack`, {
    method: "POST",
    headers: {
      "content-type": req.headers.get("content-type") || "application/json",
      "x-paystack-signature": signature,
    },
    body: rawBody,
  });
  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json",
    },
  });
}
