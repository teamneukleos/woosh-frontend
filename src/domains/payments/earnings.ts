/**
 * Creator earnings stages, computed by the API (one stage per payment):
 *  reserved   — held at accept; work not (fully) approved, so NOT earned
 *  pending    — final work approved, inside the 72-hour hold
 *  processing — hold over, payout queued or with Paystack
 *  paid       — Paystack confirmed the transfer
 *  attention  — failed, disputed or reversed; never counted as paid
 */
export const EARNINGS_STAGES = [
  "reserved",
  "pending",
  "processing",
  "paid",
  "attention",
] as const;

export type EarningsStage = (typeof EARNINGS_STAGES)[number];

export type EarningsTotals = Record<EarningsStage, number>;

export function isEarningsStage(value: unknown): value is EarningsStage {
  return EARNINGS_STAGES.includes(value as EarningsStage);
}

/** Sums net amounts per stage. Each payment lands in exactly one bucket. */
export function summarizeEarnings(
  entries: ReadonlyArray<{ stage: string; netAmount: number }>,
): EarningsTotals {
  const totals: EarningsTotals = {
    reserved: 0,
    pending: 0,
    processing: 0,
    paid: 0,
    attention: 0,
  };
  for (const entry of entries) {
    if (isEarningsStage(entry.stage)) totals[entry.stage] += Number(entry.netAmount);
  }
  return totals;
}

export const EARNINGS_STAGE_LABEL: Record<EarningsStage, string> = {
  reserved: "Reserved",
  pending: "Pending release",
  processing: "Processing",
  paid: "Paid",
  attention: "Needs attention",
};
