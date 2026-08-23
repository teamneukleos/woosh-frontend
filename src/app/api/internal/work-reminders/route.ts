import { NextResponse } from "next/server";
import { sendCreatorWorkReminders } from "@/domains/work/reminders";
import { cronAuthorizationStatus } from "@/lib/cron-auth";

export async function POST(request: Request) {
  const auth = cronAuthorizationStatus(request);
  if (auth === "unconfigured") {
    return NextResponse.json(
      { error: "Reminder job is not configured" },
      { status: 503 },
    );
  }
  if (auth === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendCreatorWorkReminders();
  return NextResponse.json(result);
}
