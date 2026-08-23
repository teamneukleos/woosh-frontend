import { describe, expect, it } from "vitest";
import {
  analyticsEventForTransition,
  canAccessOwnedWork,
  canRespondToOffer,
  canTransitionDeliverable,
  canWithdrawApplication,
  idempotencyMatches,
} from "@/domains/work/policy";
import { validateUploadMetadata } from "@/lib/storage";

describe("creator work access", () => {
  it("denies creators and brands from another tenant", () => {
    expect(
      canAccessOwnedWork({
        isPlatformAdmin: false,
        actorCreatorProfileId: "creator-other",
        actorBrandIds: ["brand-other"],
        ownerCreatorProfileId: "creator-owner",
        ownerBrandId: "brand-owner",
      }),
    ).toBe(false);
  });

  it("allows only the assigned creator or owning brand", () => {
    const base = {
      isPlatformAdmin: false,
      ownerCreatorProfileId: "creator-owner",
      ownerBrandId: "brand-owner",
    };
    expect(
      canAccessOwnedWork({
        ...base,
        actorCreatorProfileId: "creator-owner",
        actorBrandIds: [],
      }),
    ).toBe(true);
    expect(
      canAccessOwnedWork({
        ...base,
        actorCreatorProfileId: null,
        actorBrandIds: ["brand-owner"],
      }),
    ).toBe(true);
  });
});

describe("work lifecycle", () => {
  it("allows only legal deliverable transitions", () => {
    expect(canTransitionDeliverable("NOT_STARTED", "IN_PROGRESS")).toBe(true);
    expect(canTransitionDeliverable("IN_PROGRESS", "APPROVED")).toBe(false);
    expect(canTransitionDeliverable("COMPLETED", "IN_PROGRESS")).toBe(false);
  });

  it("prevents withdrawals after acceptance", () => {
    expect(canWithdrawApplication("SHORTLISTED")).toBe(true);
    expect(canWithdrawApplication("ACCEPTED")).toBe(false);
  });

  it("requires the other party to accept an active offer", () => {
    expect(
      canRespondToOffer({
        status: "COUNTERED",
        offerCreatedById: "brand-user",
        actorUserId: "creator-user",
        applicationStatus: "SHORTLISTED",
      }),
    ).toBe(true);
    expect(
      canRespondToOffer({
        status: "COUNTERED",
        offerCreatedById: "creator-user",
        actorUserId: "creator-user",
        applicationStatus: "SHORTLISTED",
      }),
    ).toBe(false);
  });

  it("binds idempotency keys to one deliverable", () => {
    expect(idempotencyMatches("deliverable-a", "deliverable-a")).toBe(true);
    expect(idempotencyMatches("deliverable-a", "deliverable-b")).toBe(false);
  });

  it("emits revision rather than approval analytics", () => {
    expect(
      analyticsEventForTransition("DRAFT_SUBMITTED", "REVISION_REQUESTED"),
    ).toBe("REVISION_REQUESTED");
    expect(
      analyticsEventForTransition("DRAFT_SUBMITTED", "APPROVED"),
    ).toBe("DELIVERABLE_APPROVED");
  });
});

describe("direct upload validation", () => {
  it("rejects oversized or unsupported declared uploads before signing", () => {
    expect(() =>
      validateUploadMetadata({
        size: 101_000_000,
        contentType: "video/mp4",
        kind: "deliverable",
      }),
    ).toThrow(/smaller/);
    expect(() =>
      validateUploadMetadata({
        size: 10,
        contentType: "text/html",
        kind: "deliverable",
      }),
    ).toThrow(/Unsupported/);
  });
});
