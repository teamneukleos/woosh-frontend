import { api, publicApi, ApiError } from "@/lib/api";

export async function expressInterest(input: {
  brandId: string;
  createdById: string;
  prospectId?: string;
  creatorProfileId?: string;
  message?: string;
}) {
  return api("/creators/interests", {
    method: "POST",
    brandId: input.brandId,
    body: {
      brandId: input.brandId,
      prospectId: input.prospectId,
      creatorProfileId: input.creatorProfileId,
      message: input.message,
    },
  });
}

export async function claimProspect(input: {
  token: string;
  userId?: string;
  register?: { name: string; email: string; password: string };
}) {
  if (input.userId) {
    return api(`/creators/claims/${input.token}/accept`, { method: "POST" });
  }
  if (!input.register) throw new Error("Register details required");
  return publicApi(`/creators/claims/${input.token}/register`, {
    method: "POST",
    body: input.register,
  });
}

export async function getClaimInvite(token: string) {
  try {
    const claim = await publicApi<{
      brand: { name: string };
      prospect: { handle: string } | null;
      status: string;
      expiresAt: string;
      message?: string | null;
    }>(`/creators/claims/${token}`);
    return {
      ...claim,
      claimTokenExpiresAt: new Date(claim.expiresAt),
      message: claim.message ?? null,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const getClaimByToken = getClaimInvite;
