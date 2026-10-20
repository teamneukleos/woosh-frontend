import { api } from "@/lib/api";
import type { BrandDva } from "@/domains/payments/dva";

export type { BrandDva };

export async function getOrCreateWallet(_brandId: string, _currency = "NGN") {
  return getWalletBalance(_brandId);
}

export async function getWalletBalance(brandId: string) {
  return api<{
    id: string;
    brandId: string;
    balance: number;
    currency: string;
    dva: BrandDva | null;
  }>("/wallet", {
    brandId,
  });
}

export async function requestBrandDva(input: {
  brandId: string;
  firstName: string;
  lastName: string;
  phone: string;
  consent: boolean;
  bvn?: string;
  accountNumber?: string;
  bankCode?: string;
}) {
  return api<{
    status: "ready" | "needs_identification" | "pending";
    message?: string;
    dva: BrandDva | null;
  }>("/wallet/dva", {
    method: "POST",
    brandId: input.brandId,
    body: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      consent: input.consent,
      bvn: input.bvn,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
    },
  });
}

export async function listDvaBanks(brandId?: string) {
  return api<{ banks: Array<{ name: string; code: string }> }>("/wallet/dva-banks", {
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
