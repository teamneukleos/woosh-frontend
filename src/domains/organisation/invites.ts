import { api, publicApi } from "@/lib/api";
import type { MembershipRole } from "@/lib/enums";

export async function inviteTeammate(input: {
  organisationId: string;
  email: string;
  role: MembershipRole;
  invitedById: string;
}) {
  return api("/team/invites", {
    method: "POST",
    body: { email: input.email, role: input.role },
  });
}

export async function previewTeamInvite(token: string) {
  return publicApi<{ email: string; orgName: string; role: string }>(
    `/invites/preview?token=${encodeURIComponent(token)}`,
  );
}

export async function acceptTeamInvite(input: { token: string; userId: string }) {
  return api("/team/invites/accept", {
    method: "POST",
    body: { token: input.token },
  });
}

export async function inviteToBrief(input: {
  briefId: string;
  creatorProfileId: string;
  message?: string;
  actorUserId: string;
}) {
  return api(`/briefs/${input.briefId}/invites`, {
    method: "POST",
    body: { creatorProfileId: input.creatorProfileId, message: input.message },
  });
}

export async function sendVerificationEmail(_userId: string) {
  return { ok: true };
}

export async function requestVerificationEmail(email: string) {
  return publicApi("/auth/resend-verification", {
    method: "POST",
    body: { email },
  });
}

export async function verifyEmailToken(_email: string, token: string) {
  return publicApi("/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

export async function requestPasswordReset(email: string) {
  return publicApi("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(input: {
  email: string;
  token: string;
  newPassword: string;
}) {
  return publicApi("/auth/reset-password", {
    method: "POST",
    body: {
      email: input.email,
      token: input.token,
      password: input.newPassword,
    },
  });
}
