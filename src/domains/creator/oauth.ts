import { api, publicApi } from "@/lib/api";
import type { SocialChannel } from "@/lib/enums";

export async function startSocialOAuth(channel: SocialChannel) {
  return api<{
    authorizeUrl: string | null;
    channel: string;
    message: string;
  }>("/creators/me/socials/oauth/authorize", {
    method: "POST",
    body: { channel },
  });
}

export async function completeDevOAuth(input: {
  creatorProfileId: string;
  channel: SocialChannel;
  handle: string;
  followers?: number;
  actorUserId: string;
}) {
  return api("/creators/me/socials/dev", {
    method: "POST",
    body: {
      channel: input.channel,
      handle: input.handle,
      followers: input.followers,
    },
  });
}

export async function refreshSocialMetrics(socialAccountId: string) {
  return api(`/creators/me/socials/${socialAccountId}/refresh`, {
    method: "POST",
  });
}

export async function completeOAuthCallback(input: {
  channel: SocialChannel;
  code?: string;
  state: string;
  connectedAccountId?: string;
}) {
  return publicApi("/creators/oauth/callback", {
    method: "POST",
    body: input,
  });
}
