import { NextResponse } from "next/server";
import { refreshDueSocialMetrics } from "@/domains/creator/oauth";
import { cronAuthorizationStatus } from "@/lib/cron-auth";

export async function POST(request: Request) {
  const auth = cronAuthorizationStatus(request);
  if (auth === "unconfigured") {
    return NextResponse.json(
      { error: "Social metrics job is not configured" },
      { status: 503 },
    );
  }
  if (auth === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshDueSocialMetrics();
  return NextResponse.json(result);
}
