import { describe, expect, it } from "vitest";
import {
  canTransitionObligation,
  disputeWindowOpen,
  payoutReleaseAt,
  providerMoneyMatches,
  canAccessFinancialDocument,
} from "@/domains/payments/policy";
import {
  decryptAccountNumber,
  encryptAccountNumber,
} from "@/lib/payout-account-crypto";

describe("payment obligation lifecycle", () => {
  it("permits release, payout and failure retry transitions", () => {
    expect(canTransitionObligation("COMMITTED", "APPROVED")).toBe(true);
    expect(canTransitionObligation("APPROVED", "PROCESSING")).toBe(true);
    expect(canTransitionObligation("PROCESSING", "FAILED")).toBe(true);
    expect(canTransitionObligation("FAILED", "PROCESSING")).toBe(true);
    expect(canTransitionObligation("PAID", "PROCESSING")).toBe(false);
  });

  it("creates an exact 72-hour dispute window", () => {
    const completed = new Date("2026-08-17T10:00:00.000Z");
    const release = payoutReleaseAt(completed);
    expect(release.toISOString()).toBe("2026-08-20T10:00:00.000Z");
    expect(
      disputeWindowOpen(release, new Date("2026-08-20T09:59:59.000Z")),
    ).toBe(true);
    expect(disputeWindowOpen(release, release)).toBe(false);
  });

  it("rejects provider amount and currency mismatches", () => {
    expect(
      providerMoneyMatches({
        expectedMajor: 90_000,
        expectedCurrency: "NGN",
        amountMinor: 9_000_000,
        currency: "NGN",
      }),
    ).toBe(true);
    expect(
      providerMoneyMatches({
        expectedMajor: 90_000,
        expectedCurrency: "NGN",
        amountMinor: 8_000_000,
        currency: "NGN",
      }),
    ).toBe(false);
  });

  it("denies cross-tenant statement and receipt access", () => {
    expect(
      canAccessFinancialDocument({
        isPlatformAdmin: false,
        actorCreatorProfileId: "creator-other",
        actorBrandIds: ["brand-other"],
        documentCreatorProfileId: "creator-owner",
        documentBrandId: "brand-owner",
      }),
    ).toBe(false);
    expect(
      canAccessFinancialDocument({
        isPlatformAdmin: false,
        actorCreatorProfileId: "creator-owner",
        actorBrandIds: [],
        documentCreatorProfileId: "creator-owner",
        documentBrandId: "brand-owner",
      }),
    ).toBe(true);
  });
});

describe("payout account encryption", () => {
  it("round-trips account numbers without plaintext storage", () => {
    process.env.PAYOUT_ACCOUNT_ENCRYPTION_KEY = "test-key-for-payouts";
    const encrypted = encryptAccountNumber("0123456789");
    expect(encrypted).not.toContain("0123456789");
    expect(decryptAccountNumber(encrypted)).toBe("0123456789");
  });
});
