import { NextResponse } from "next/server";
import { completeOAuthCallback } from "@/domains/creator/oauth";
import { ApiError } from "@/lib/api";

function instagramCallbackError(error: unknown) {
  const message = error instanceof ApiError ? error.message : "";
  const lower = message.toLowerCase();
  if (
    lower.includes("instagram_business_required") ||
    lower.includes("business or creator") ||
    lower.includes("facebook page")
  ) {
    return "instagram_business_required";
  }
  if (lower.includes("cancel")) return "authorization_cancelled";
  return "connection_failed";
}

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const connectedAccountId =
    url.searchParams.get("connected_account_id") ||
    url.searchParams.get("connectedAccountId");
  const status = url.searchParams.get("status");
  const error = url.searchParams.get("error");
  const failedStatuses = [
    "failed",
    "FAILED",
    "EXPIRED",
    "cancelled",
    "CANCELLED",
    "error",
    "ERROR",
  ];
  const failed =
    Boolean(error) || Boolean(status && failedStatuses.includes(status));

  if (failed || !state || !connectedAccountId) {
    return NextResponse.redirect(
      new URL(
        `/oauth/instagram?instagram=error&message=${encodeURIComponent(
          error || "authorization_cancelled",
        )}`,
        origin,
      ),
    );
  }

  try {
    await completeOAuthCallback({
      channel: "INSTAGRAM",
      state,
      connectedAccountId,
    });
    return NextResponse.redirect(
      new URL("/oauth/instagram?instagram=connected", origin),
    );
  } catch (callbackError) {
    return NextResponse.redirect(
      new URL(
        `/oauth/instagram?instagram=error&message=${instagramCallbackError(callbackError)}`,
        origin,
      ),
    );
  }
}
