import { api } from "@/lib/api";

export async function saveCreator(input: {
  organisationId: string;
  brandId?: string;
  creatorProfileId?: string;
  prospectId?: string;
  actorUserId: string;
}) {
  const id = input.creatorProfileId || input.prospectId;
  if (!id) throw new Error("Select a creator to shortlist.");
  return api(`/creators/${id}/save`, {
    method: "POST",
    brandId: input.brandId,
  });
}

export async function unsaveCreator(input: {
  organisationId: string;
  brandId?: string;
  creatorProfileId?: string;
  prospectId?: string;
  actorUserId: string;
}) {
  const id = input.creatorProfileId || input.prospectId;
  if (!id) throw new Error("Select a creator to remove.");
  return api(`/creators/${id}/save`, {
    method: "DELETE",
    brandId: input.brandId,
  });
}
