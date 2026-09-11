import { NextResponse } from "next/server";
import { completeOAuthCallback } from "@/domains/creator/oauth";
import type { SocialChannel } from "@/lib/enums";

const CHANNELS: Record<string, SocialChannel> = {
  instagram: "INSTAGRAM",
  tiktok: "TIKTOK",
  youtube: "YOUTUBE",
};

export async function GET(
  req: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;
  const channel = CHANNELS[provider.toLowerCase()];
  const origin = new URL(req.url).origin;
  if (!channel) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/app/profile?oauth=error", origin));
  }

  try {
    await completeOAuthCallback({ channel, code, state });
    return NextResponse.redirect(new URL("/app/profile?oauth=success", origin));
  } catch {
    return NextResponse.redirect(new URL("/app/profile?oauth=error", origin));
  }
}
