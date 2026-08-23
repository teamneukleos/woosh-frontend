/**
 * Commercial terms domain
 * Rates, structured offers, negotiation, locked terms.
 * Negotiation history is immutable (PRD §8.3).
 */
export type RateMode =
  | "FIXED_NON_NEGOTIABLE"
  | "FIXED_NEGOTIABLE"
  | "RANGE_NEGOTIABLE"
  | "DELIVERABLE_BASED"
  | "CREATOR_BUNDLE";

export function isNegotiable(mode: RateMode): boolean {
  return (
    mode === "FIXED_NEGOTIABLE" ||
    mode === "RANGE_NEGOTIABLE" ||
    mode === "DELIVERABLE_BASED" ||
    mode === "CREATOR_BUNDLE"
  );
}
