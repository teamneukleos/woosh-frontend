import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { nestRequest } from "@/lib/nest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const reference =
    url.searchParams.get("reference") || url.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/app/payments", origin));
  }

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshFailed") {
    const next = `/api/paystack/verify?reference=${encodeURIComponent(reference)}`;
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(next)}`, origin),
    );
  }

  try {
    await nestRequest("/wallet/verify-top-up", {
      method: "POST",
      body: { reference },
      accessToken: session.accessToken,
    });
    return NextResponse.redirect(new URL("/app/payments?funded=1", origin));
  } catch {
    return NextResponse.redirect(new URL("/app/payments?funded=error", origin));
  }
}
