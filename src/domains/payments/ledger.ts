import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

type NestObligation = {
  id: string;
  status: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  availableAt: string | Date | null;
  paidAt: string | Date | null;
  failureReason?: string | null;
  campaign?: { id: string; title: string; brand: { id: string; name: string } };
  creator?: { displayName: string };
  disputes?: Array<{ id: string; status: string; category: string; subject: string }>;
  transactions?: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string | Date;
    completedAt?: string | Date | null;
  }>;
};

function mapObligation(row: NestObligation) {
  return {
    ...row,
    availableAt: asDate(row.availableAt),
    paidAt: asDate(row.paidAt),
    participant: {
      campaignId: row.campaign?.id,
      campaign: row.campaign ?? { id: "", title: "", brand: { id: "", name: "" } },
      creator: row.creator ?? { displayName: "Creator" },
    },
    disputes: row.disputes ?? [],
    transactions: (row.transactions ?? []).map((entry) => ({
      ...entry,
      createdAt: asDate(entry.createdAt) ?? new Date(),
      provider: "paystack",
      providerReference: null as string | null,
    })),
  };
}

export async function listCreatorEarnings(_creatorProfileId?: string) {
  const rows = await api<NestObligation[]>("/creators/me/earnings");
  return rows.map(mapObligation);
}

export async function listBrandPayments(brandId: string) {
  const rows = await api<NestObligation[]>("/payments", { brandId });
  return rows.map(mapObligation);
}

export async function initiatePayout(input: {
  obligationId: string;
  actorUserId?: string;
  automated?: boolean;
}) {
  return api(`/payments/${input.obligationId}/release`, { method: "POST" });
}

export async function completePayoutFromWebhook(_input?: unknown) {
  /* Paystack payout completion is handled by the Nest webhook. */
}

export async function markPaidTestMode(input: {
  obligationId: string;
  actorUserId: string;
}) {
  return initiatePayout(input);
}
