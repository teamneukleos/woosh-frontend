import { NextResponse } from "next/server";
import { sendWeeklyNotificationDigests } from "@/lib/notify";
import { cronAuthorizationStatus } from "@/lib/cron-auth";

export async function POST(request: Request) {
  const auth = cronAuthorizationStatus(request);
  if (auth === "unconfigured") {
    return NextResponse.json(
      { error: "Weekly digest job is not configured" },
      { status: 503 },
    );
  }
  if (auth === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await sendWeeklyNotificationDigests());
}
