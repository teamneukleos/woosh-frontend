import { api } from "@/lib/api";

export async function counterOffer(input: {
  applicationId: string;
  amount: number;
  message?: string;
  actorUserId?: string;
  createdById?: string;
}) {
  return api(`/applications/${input.applicationId}/offers`, {
    method: "POST",
    body: { amount: input.amount, message: input.message },
  });
}

export async function acceptOffer(input: { offerId: string; actorUserId: string }) {
  return api(`/offers/${input.offerId}/agree`, { method: "POST" });
}
