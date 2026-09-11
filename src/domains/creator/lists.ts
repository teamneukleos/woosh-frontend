import { api } from "@/lib/api";

export async function saveCreator(input: {
  organisationId: string;
  brandId?: string;
  creatorProfileId: string;
  actorUserId: string;
}) {
  return api(`/creators/${input.creatorProfileId}/save`, {
    method: "POST",
    brandId: input.brandId,
  });
}

export async function unsaveCreator(input: {
  organisationId: string;
  brandId?: string;
  creatorProfileId: string;
  actorUserId: string;
}) {
  return api(`/creators/${input.creatorProfileId}/save`, {
    method: "DELETE",
    brandId: input.brandId,
  });
}
