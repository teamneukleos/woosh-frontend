import { NextResponse } from "next/server";
import { completeOAuthCallback } from "@/domains/creator/oauth";
import { ApiError } from "@/lib/api";

function youtubeCallbackError(error: unknown) {
  const message = error instanceof ApiError ? error.message : "";
  if (
    message.includes("youtube_channel_required") ||
    message.toLowerCase().includes("no youtube channel")
  ) {
    return "youtube_channel_required";
  }
  return "connection_failed";
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/oauth/youtube?youtube=error&message=authorization_cancelled", origin),
    );
  }

  try {
    await completeOAuthCallback({ channel: "YOUTUBE", code, state });
    return NextResponse.redirect(
      new URL("/oauth/youtube?youtube=connected", origin),
    );
  } catch (callbackError) {
    return NextResponse.redirect(
      new URL(
        `/oauth/youtube?youtube=error&message=${youtubeCallbackError(callbackError)}`,
        origin,
      ),
    );
  }
}
