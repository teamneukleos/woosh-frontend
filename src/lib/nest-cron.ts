import { NextResponse } from "next/server";
import { ApiError, nestRequest } from "@/lib/nest";

/** Forward a scheduler POST to Nest. Auth is `Bearer $WOOSH_CRON_SECRET` on Nest. */
export async function proxyCronJob(request: Request, path: string) {
  try {
    const authorization = request.headers.get("authorization");
    const result = await nestRequest(path, {
      method: "POST",
      headers: authorization ? { Authorization: authorization } : {},
    });
    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message =
      error instanceof Error ? error.message : "Cron job failed";
    return NextResponse.json({ error: message }, { status: status || 502 });
  }
}
