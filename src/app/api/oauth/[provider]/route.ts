import { NextResponse } from "next/server";
import {
  buildOAuthAuthorizeUrl,
  completeOAuthCallback,
  decodeState,
  type OAuthState,
} from "@/domains/creator/oauth";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";
import type { SocialChannel } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

const CHANNELS = new Set(["instagram", "tiktok", "youtube"]);

function toChannel(slug: string): SocialChannel {
  return slug.toUpperCase() as SocialChannel;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;
  const slug = provider.toLowerCase();
  if (!CHANNELS.has(slug)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const start = url.searchParams.get("start");

  // Start OAuth
  if (start === "1" || (!code && !stateParam)) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const creatorProfileId = url.searchParams.get("creatorProfileId");
    if (!creatorProfileId) {
      return NextResponse.json(
        { error: "creatorProfileId required" },
        { status: 400 },
      );
    }
    const ownedProfile = await prisma.creatorProfile.findFirst({
      where: { id: creatorProfileId, userId: session.user.id },
      select: { id: true },
    });
    if (!ownedProfile) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const channel = toChannel(slug);
    const authorize = buildOAuthAuthorizeUrl({
      channel,
      creatorProfileId,
      userId: session.user.id,
      nonce: randomBytes(8).toString("hex"),
    });

    if (!authorize) {
      if (process.env.WOOSH_ALLOW_DEV_OAUTH === "true") {
        return NextResponse.redirect(
          new URL(
            `/app/profile?dev_oauth=${channel}&need_handle=1`,
            req.url,
          ),
        );
      }
      return NextResponse.json(
        { error: `${channel} OAuth is not configured` },
        { status: 503 },
      );
    }

    return NextResponse.redirect(authorize);
  }

  // Callback
  if (!code || !stateParam) {
    return NextResponse.redirect(
      new URL("/app/profile?oauth=error", req.url),
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const state = decodeState<OAuthState>(stateParam);
    if (
      state.userId !== session.user.id ||
      state.channel !== toChannel(slug)
    ) {
      throw new Error("OAuth state does not match the current session");
    }
    const ownedProfile = await prisma.creatorProfile.findFirst({
      where: {
        id: state.creatorProfileId,
        userId: session.user.id,
      },
      select: { id: true },
    });
    if (!ownedProfile) throw new Error("Creator profile not owned by user");
    await completeOAuthCallback({
      channel: toChannel(slug),
      code,
      state,
    });
    return NextResponse.redirect(
      new URL("/app/profile?oauth=success", req.url),
    );
  } catch (err) {
    console.error("[oauth] callback failed", err);
    return NextResponse.redirect(
      new URL("/app/profile?oauth=error", req.url),
    );
  }
}
