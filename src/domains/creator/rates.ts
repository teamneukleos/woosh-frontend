import { api } from "@/lib/api";

export async function createRatePackage(input: {
  creatorProfileId: string;
  actorUserId: string;
  channel: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";
  deliverableType: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  turnaroundDays?: number;
  revisions?: number;
  usageRights?: string;
}) {
  return api("/creators/me/rates", {
    method: "POST",
    body: {
      channel: input.channel,
      deliverableType: input.deliverableType,
      title: input.title,
      description: input.description,
      price: input.price,
      currency: input.currency,
      turnaroundDays: input.turnaroundDays,
      revisions: input.revisions,
      usageRights: input.usageRights,
    },
  });
}

export async function deleteRatePackage(input: {
  creatorProfileId: string;
  actorUserId: string;
  ratePackageId: string;
}) {
  return api(`/creators/me/rates/${input.ratePackageId}`, { method: "DELETE" });
}
