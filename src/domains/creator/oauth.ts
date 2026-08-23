import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { prisma } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import {
  decryptOAuthToken,
  encryptOAuthToken,
} from "@/lib/oauth-token";
import type { SocialChannel } from "@/generated/prisma/client";

export function oauthConfiguredFor(channel: SocialChannel) {
  if (channel === "INSTAGRAM") return Boolean(process.env.META_APP_ID?.trim());
  if (channel === "TIKTOK") return Boolean(process.env.TIKTOK_CLIENT_KEY?.trim());
  if (channel === "YOUTUBE") return Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  return false;
}

export function anyOAuthConfigured() {
  return (
    Boolean(process.env.META_APP_ID?.trim()) ||
    Boolean(process.env.TIKTOK_CLIENT_KEY?.trim()) ||
    Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) ||
    process.env.WOOSH_ALLOW_DEV_OAUTH === "true"
  );
}

export function allowDevOAuth() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.WOOSH_ALLOW_DEV_OAUTH === "true"
  );
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function metaGraphVersion() {
  return process.env.META_GRAPH_VERSION || "v26.0";
}

function encodeState(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for OAuth state");
  const signature = createHmac("sha256", secret)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function decodeState<T>(state: string): T {
  const [body, suppliedSignature] = state.split(".");
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!body || !suppliedSignature || !secret) throw new Error("Invalid OAuth state");
  const expected = createHmac("sha256", secret).update(body).digest();
  const supplied = Buffer.from(suppliedSignature, "base64url");
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  ) {
    throw new Error("Invalid OAuth state signature");
  }
  return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
}

export type OAuthState = {
  channel: SocialChannel;
  creatorProfileId: string;
  userId: string;
  nonce: string;
};

type ProviderTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  identity: {
    externalId: string;
    handle: string;
    followers?: number;
    engagementRate?: number;
    averageViews?: number;
    topContent?: object;
    raw: object;
  };
};

/** Build provider authorize URL, or null if channel not configured. */
export function buildOAuthAuthorizeUrl(input: OAuthState): string | null {
  const state = encodeState(input);
  const redirectUri = `${appUrl()}/api/oauth/${input.channel.toLowerCase()}`;

  if (input.channel === "INSTAGRAM" && process.env.META_APP_ID) {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID,
      redirect_uri: redirectUri,
      scope: "instagram_basic,pages_show_list,pages_read_engagement",
      response_type: "code",
      state,
    });
    return `https://www.facebook.com/${metaGraphVersion()}/dialog/oauth?${params}`;
  }

  if (input.channel === "TIKTOK" && process.env.TIKTOK_CLIENT_KEY) {
    const params = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      redirect_uri: redirectUri,
      scope: "user.info.basic,user.info.stats",
      response_type: "code",
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${params}`;
  }

  if (input.channel === "YOUTUBE" && process.env.GOOGLE_CLIENT_ID) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  return null;
}

/**
 * Complete OAuth: store tokens, ACTIVE status, metric snapshot.
 * Provider-specific token exchange is best-effort; without secrets we reject.
 */
export async function completeOAuthCallback(input: {
  channel: SocialChannel;
  code: string;
  state: OAuthState;
}) {
  const tokens = await exchangeCode(input.channel, input.code);
  const identity = tokens.identity;
  const existingAccount = await prisma.socialAccount.findUnique({
    where: {
      channel_externalId: {
        channel: input.channel,
        externalId: identity.externalId,
      },
    },
  });
  if (
    existingAccount &&
    existingAccount.creatorProfileId !== input.state.creatorProfileId
  ) {
    throw new Error("This social account is already connected to another creator");
  }

  const account = await prisma.socialAccount.upsert({
    where: {
      channel_externalId: {
        channel: input.channel,
        externalId: identity.externalId,
      },
    },
    create: {
      creatorProfileId: input.state.creatorProfileId,
      channel: input.channel,
      externalId: identity.externalId,
      handle: identity.handle,
      status: "ACTIVE",
      accessTokenEnc: encryptOAuthToken(tokens.accessToken),
      refreshTokenEnc: encryptOAuthToken(tokens.refreshToken),
      tokenExpiresAt: tokens.expiresAt,
      lastRefreshedAt: new Date(),
    },
    update: {
      creatorProfileId: input.state.creatorProfileId,
      handle: identity.handle,
      status: "ACTIVE",
      accessTokenEnc: encryptOAuthToken(tokens.accessToken),
      refreshTokenEnc: encryptOAuthToken(tokens.refreshToken),
      tokenExpiresAt: tokens.expiresAt,
      lastRefreshedAt: new Date(),
    },
  });

  await prisma.socialMetricSnapshot.create({
    data: {
      socialAccountId: account.id,
      source: `${input.channel.toLowerCase()}_oauth`,
      followers: identity.followers ?? null,
      engagementRate: identity.engagementRate ?? null,
      averageViews: identity.averageViews ?? null,
      topContent: identity.topContent,
      raw: identity.raw as object,
    },
  });

  await writeAudit({
    actorId: input.state.userId,
    action: "creator.social.oauth_complete",
    targetType: "SocialAccount",
    targetId: account.id,
    after: { channel: input.channel, handle: identity.handle },
  });

  return account;
}

/** Dev-only connect that marks ACTIVE with provider-labelled snapshot. */
export async function completeDevOAuth(input: {
  creatorProfileId: string;
  channel: SocialChannel;
  handle: string;
  followers?: number;
  engagementRate?: number;
  averageViews?: number;
  audienceGeo?: object;
  audienceAge?: object;
  audienceGender?: object;
  actorUserId: string;
}) {
  if (!allowDevOAuth()) {
    throw new Error("Dev OAuth is disabled. Set WOOSH_ALLOW_DEV_OAUTH=true");
  }

  const handle = input.handle.trim().replace(/^@/, "").toLowerCase();
  const externalId = `dev_${input.channel.toLowerCase()}_${handle}`;

  const account = await prisma.socialAccount.upsert({
    where: {
      channel_externalId: {
        channel: input.channel,
        externalId,
      },
    },
    create: {
      creatorProfileId: input.creatorProfileId,
      channel: input.channel,
      externalId,
      handle,
      status: "ACTIVE",
      accessTokenEnc: encryptOAuthToken(
        `dev_${randomBytes(8).toString("hex")}`,
      ),
      lastRefreshedAt: new Date(),
    },
    update: {
      creatorProfileId: input.creatorProfileId,
      handle,
      status: "ACTIVE",
      lastRefreshedAt: new Date(),
    },
  });

  await prisma.socialMetricSnapshot.create({
    data: {
      socialAccountId: account.id,
      source: "dev_oauth",
      followers: input.followers ?? null,
      engagementRate: input.engagementRate ?? null,
      averageViews: input.averageViews ?? null,
      audienceGeo: input.audienceGeo,
      audienceAge: input.audienceAge,
      audienceGender: input.audienceGender,
      raw: { mode: "dev", note: "WOOSH_ALLOW_DEV_OAUTH" },
    },
  });

  await writeAudit({
    actorId: input.actorUserId,
    action: "creator.social.dev_oauth",
    targetType: "SocialAccount",
    targetId: account.id,
  });

  return account;
}

export async function refreshSocialMetrics(socialAccountId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId },
  });
  if (!account || account.status !== "ACTIVE") {
    throw new Error("Account not active");
  }

  const latest = await prisma.socialMetricSnapshot.findFirst({
    where: { socialAccountId },
    orderBy: { capturedAt: "desc" },
  });

  if (latest?.source === "dev_oauth") {
    await prisma.$transaction([
      prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: { lastRefreshedAt: new Date() },
      }),
      prisma.socialMetricSnapshot.create({
        data: {
          socialAccountId,
          source: "dev_oauth",
          followers: latest.followers,
          engagementRate: latest.engagementRate,
          averageViews: latest.averageViews,
          postingFrequency: latest.postingFrequency,
          audienceGeo: latest.audienceGeo ?? undefined,
          audienceAge: latest.audienceAge ?? undefined,
          audienceGender: latest.audienceGender ?? undefined,
          topContent: latest.topContent ?? undefined,
          raw: { mode: "dev_refresh", refreshedFrom: latest.id },
        },
      }),
    ]);
    return account;
  }

  try {
    const token = decryptOAuthToken(account.accessTokenEnc);
    if (!token) throw new Error("Social account needs reconnecting");
    const metrics = await fetchProviderMetrics({
      channel: account.channel,
      externalId: account.externalId,
      accessToken: token,
    });
    await prisma.$transaction([
      prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: {
          lastRefreshedAt: new Date(),
          handle: metrics.handle || account.handle,
          status: "ACTIVE",
        },
      }),
      prisma.socialMetricSnapshot.create({
        data: {
          socialAccountId,
          source: `${account.channel.toLowerCase()}_oauth_refresh`,
          followers: metrics.followers ?? null,
          engagementRate: metrics.engagementRate ?? null,
          averageViews: metrics.averageViews ?? null,
          topContent: metrics.topContent,
          raw: metrics.raw,
        },
      }),
    ]);
    return account;
  } catch (error) {
    await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: { status: "EXPIRED" },
    });
    throw error;
  }
}

export async function refreshDueSocialMetrics(input?: {
  staleBefore?: Date;
  limit?: number;
}) {
  const staleBefore =
    input?.staleBefore ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
  const accounts = await prisma.socialAccount.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { lastRefreshedAt: null },
        { lastRefreshedAt: { lt: staleBefore } },
      ],
    },
    select: { id: true },
    orderBy: { lastRefreshedAt: "asc" },
    take: Math.min(Math.max(input?.limit ?? 100, 1), 250),
  });

  const result = { attempted: accounts.length, refreshed: 0, failed: 0 };
  for (const account of accounts) {
    try {
      await refreshSocialMetrics(account.id);
      result.refreshed += 1;
    } catch {
      result.failed += 1;
    }
  }
  return result;
}

async function fetchProviderMetrics(input: {
  channel: SocialChannel;
  externalId: string;
  accessToken: string;
}) {
  if (input.channel === "INSTAGRAM") {
    const response = await fetch(
      `https://graph.facebook.com/${metaGraphVersion()}/${input.externalId}?fields=id,username,followers_count&access_token=${encodeURIComponent(input.accessToken)}`,
    );
    const json = (await response.json()) as {
      id?: string;
      username?: string;
      followers_count?: number;
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(json.error?.message || "Instagram refresh failed");
    return {
      handle: json.username,
      followers: json.followers_count,
      raw: json as object,
    };
  }

  if (input.channel === "TIKTOK") {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count",
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
    );
    const json = (await response.json()) as {
      data?: {
        user?: {
          username?: string;
          display_name?: string;
          follower_count?: number;
          likes_count?: number;
          video_count?: number;
        };
      };
      error?: { message?: string; code?: string };
    };
    if (!response.ok || !json.data?.user) {
      throw new Error(json.error?.message || "TikTok refresh failed");
    }
    const user = json.data.user;
    return {
      handle: user.username || user.display_name,
      followers: user.follower_count,
      engagementRate: undefined,
      raw: json as object,
    };
  }

  const channelResponse = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${input.accessToken}` } },
  );
  const channelJson = (await channelResponse.json()) as {
    items?: Array<{
      id: string;
      snippet?: { title?: string; customUrl?: string };
      statistics?: { subscriberCount?: string };
    }>;
    error?: { message?: string };
  };
  if (!channelResponse.ok || !channelJson.items?.[0]) {
    throw new Error(channelJson.error?.message || "YouTube refresh failed");
  }
  const channel = channelJson.items[0];
  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=id&channelId=${channel.id}&order=date&type=video&maxResults=12`,
    { headers: { Authorization: `Bearer ${input.accessToken}` } },
  );
  const searchJson = (await searchResponse.json()) as {
    items?: Array<{ id?: { videoId?: string } }>;
  };
  const ids =
    searchJson.items?.map((item) => item.id?.videoId).filter(Boolean) ?? [];
  let averageViews: number | undefined;
  let engagementRate: number | undefined;
  let topContent: object | undefined;
  if (ids.length) {
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}`,
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
    );
    const videosJson = (await videosResponse.json()) as {
      items?: Array<{
        id: string;
        snippet?: { title?: string; thumbnails?: object };
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }>;
    };
    const videos = videosJson.items ?? [];
    const totalViews = videos.reduce(
      (sum, video) => sum + Number(video.statistics?.viewCount ?? 0),
      0,
    );
    const totalEngagement = videos.reduce(
      (sum, video) =>
        sum +
        Number(video.statistics?.likeCount ?? 0) +
        Number(video.statistics?.commentCount ?? 0),
      0,
    );
    averageViews = videos.length ? Math.round(totalViews / videos.length) : undefined;
    engagementRate = totalViews ? (totalEngagement / totalViews) * 100 : undefined;
    topContent = videos.slice(0, 6);
  }
  return {
    handle:
      channel.snippet?.customUrl?.replace(/^@/, "") ||
      channel.snippet?.title,
    followers: channel.statistics?.subscriberCount
      ? Number(channel.statistics.subscriberCount)
      : undefined,
    averageViews,
    engagementRate,
    topContent,
    raw: channelJson as object,
  };
}

async function exchangeCode(
  channel: SocialChannel,
  code: string,
): Promise<ProviderTokens> {
  const redirectUri = `${appUrl()}/api/oauth/${channel.toLowerCase()}`;

  if (channel === "INSTAGRAM") {
    const body = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    });
    const tokenRes = await fetch(
      `https://graph.facebook.com/${metaGraphVersion()}/oauth/access_token`,
      { method: "POST", body },
    );
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: { message: string };
    };
    if (!tokenJson.access_token) {
      throw new Error(tokenJson.error?.message || "Instagram token exchange failed");
    }

    const accountsRes = await fetch(
      `https://graph.facebook.com/${metaGraphVersion()}/me/accounts?fields=id,name,instagram_business_account{id,username,followers_count}&access_token=${encodeURIComponent(tokenJson.access_token)}`,
    );
    const accounts = (await accountsRes.json()) as {
      data?: Array<{
        instagram_business_account?: {
          id?: string;
          username?: string;
          followers_count?: number;
        };
      }>;
      error?: { message?: string };
    };
    const instagram = accounts.data?.find(
      (item) => item.instagram_business_account?.id,
    )?.instagram_business_account;
    if (!accountsRes.ok || !instagram?.id) {
      throw new Error(
        accounts.error?.message ||
          "Connect an Instagram Business or Creator account linked to a Facebook Page",
      );
    }
    const externalId = instagram.id;
    return {
      accessToken: tokenJson.access_token,
      refreshToken: undefined as string | undefined,
      expiresAt: tokenJson.expires_in
        ? new Date(Date.now() + tokenJson.expires_in * 1000)
        : undefined,
      identity: {
        externalId,
        handle: instagram.username || externalId,
        followers: instagram.followers_count,
        raw: accounts,
      },
    };
  }

  if (channel === "YOUTUBE") {
    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      error_description?: string;
    };
    if (!tokenJson.access_token) {
      throw new Error(tokenJson.error_description || "YouTube token exchange failed");
    }

    const chRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
    );
    const chJson = (await chRes.json()) as {
      items?: Array<{
        id: string;
        snippet?: { title?: string; customUrl?: string };
        statistics?: { subscriberCount?: string };
      }>;
    };
    const item = chJson.items?.[0];
    const externalId = item?.id || createHash("sha256").update(code).digest("hex").slice(0, 16);
    const handle =
      item?.snippet?.customUrl?.replace(/^@/, "") ||
      item?.snippet?.title?.toLowerCase().replace(/\s+/g, "") ||
      externalId;
    const followers = item?.statistics?.subscriberCount
      ? Number(item.statistics.subscriberCount)
      : undefined;

    const metrics = await fetchProviderMetrics({
      channel: "YOUTUBE",
      externalId,
      accessToken: tokenJson.access_token,
    });
    return {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      expiresAt: tokenJson.expires_in
        ? new Date(Date.now() + tokenJson.expires_in * 1000)
        : undefined,
      identity: {
        externalId,
        handle: metrics.handle || handle,
        followers: metrics.followers ?? followers,
        engagementRate: metrics.engagementRate,
        averageViews: metrics.averageViews,
        topContent: metrics.topContent,
        raw: metrics.raw,
      },
    };
  }

  if (channel === "TIKTOK") {
    const body = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });
    const tokenRes = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      open_id?: string;
      error_description?: string;
    };
    if (!tokenJson.access_token) {
      throw new Error(tokenJson.error_description || "TikTok token exchange failed");
    }
    const externalId =
      tokenJson.open_id ||
      createHash("sha256").update(code).digest("hex").slice(0, 16);
    const metrics = await fetchProviderMetrics({
      channel: "TIKTOK",
      externalId,
      accessToken: tokenJson.access_token,
    });
    return {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      expiresAt: tokenJson.expires_in
        ? new Date(Date.now() + tokenJson.expires_in * 1000)
        : undefined,
      identity: {
        externalId,
        handle: metrics.handle || externalId.slice(0, 12),
        followers: metrics.followers,
        engagementRate: metrics.engagementRate,
        averageViews: metrics.averageViews,
        raw: metrics.raw,
      },
    };
  }

  throw new Error(`Unsupported channel ${channel}`);
}

export { encodeState };
