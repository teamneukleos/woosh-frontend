import { api } from "@/lib/api";

export async function getOrCreateWallet(_brandId: string, _currency = "NGN") {
  return getWalletBalance(_brandId);
}

export async function getWalletBalance(brandId: string) {
  return api<{ id: string; brandId: string; balance: number; currency: string }>("/wallet", {
    brandId,
  });
}

export async function startWalletTopUp(input: {
  brandId: string;
  amountMajor: number;
  actorUserId: string;
  actorEmail: string;
}) {
  return api<{
    mode: "test" | "paystack";
    balance?: number;
    currency?: string;
    reference: string;
    authorizationUrl?: string;
    publicKey?: string;
  }>("/wallet/top-up", {
    method: "POST",
    brandId: input.brandId,
    body: { amount: input.amountMajor },
  });
}

export async function creditWalletFromPaystack(_input: {
  reference: string;
  amountKobo: number;
  brandId: string;
}) {
  throw new Error("Paystack charges are credited by the Nest webhook.");
}
