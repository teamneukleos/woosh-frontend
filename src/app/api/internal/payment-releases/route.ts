import { NextResponse } from "next/server";
import {
  processAutomaticPayoutReleases,
  reconcileProcessingPayouts,
} from "@/domains/payments/release";
import { cronAuthorizationStatus } from "@/lib/cron-auth";

export async function POST(request: Request) {
  const auth = cronAuthorizationStatus(request);
  if (auth === "unconfigured") {
    return NextResponse.json(
      { error: "Payment release job is not configured" },
      { status: 503 },
    );
  }
  if (auth === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [release, reconcile] = await Promise.all([
    processAutomaticPayoutReleases(),
    reconcileProcessingPayouts(),
  ]);
  return NextResponse.json({ release, reconcile });
}
