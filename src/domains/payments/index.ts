/**
 * Payments & ledger domain
 * Provider-led collection/payout (Paystack) + Woosh internal ledger.
 * Brands fund before selection. Woosh charges 0% platform fee;
 * Paystack processing fees are separate.
 */
import { brand } from "@/lib/brand";

export const PAYMENT_PROVIDER = brand.paymentProvider;
export const MVP_CURRENCIES = brand.mvpCurrencies;

export type ObligationLifecycle =
  | "PENDING_FUNDING"
  | "FUNDED"
  | "COMMITTED"
  | "APPROVED"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REVERSED"
  | "DISPUTED";

/** Woosh platform fee as a fraction of creator gross. 0% for brands, agencies, and creators. */
export const DEFAULT_PLATFORM_FEE_RATE = 0;

export function splitFee(gross: number, feeRate = DEFAULT_PLATFORM_FEE_RATE) {
  const platformFee = Math.round(gross * feeRate * 100) / 100;
  const net = Math.round((gross - platformFee) * 100) / 100;
  return { gross, platformFee, net };
}
