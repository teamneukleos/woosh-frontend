import { describe, expect, it } from "vitest";
import {
  canAcceptThreadOffer,
  threadViewerSide,
  type ThreadOffer,
} from "./presentation";

const brandCounter: ThreadOffer = {
  id: "offer-1",
  status: "COUNTERED",
  createdById: "brand-owner",
  createdBySide: "brand",
  amount: 300_000,
  currency: "NGN",
};
const creator = { userId: "creator-user", side: "creator" as const };

describe("canAcceptThreadOffer", () => {
  it("shows Accept to the creator receiving a brand counter-offer", () => {
    expect(canAcceptThreadOffer(brandCounter, creator)).toBe(true);
    expect(canAcceptThreadOffer({ ...brandCounter, status: "OPEN" }, creator)).toBe(true);
  });

  it("does not show Accept to the person who made the offer", () => {
    expect(
      canAcceptThreadOffer(brandCounter, { userId: "brand-owner", side: "brand" }),
    ).toBe(false);
  });

  it("does not show Accept to a teammate on the same side as the offer", () => {
    expect(
      canAcceptThreadOffer(brandCounter, { userId: "brand-teammate", side: "brand" }),
    ).toBe(false);
  });

  it("shows Accept to the brand for a creator's counter-offer", () => {
    expect(
      canAcceptThreadOffer(
        { ...brandCounter, createdById: "creator-user", createdBySide: "creator" },
        { userId: "brand-owner", side: "brand" },
      ),
    ).toBe(true);
  });

  it("does not show Accept once the offer is agreed, superseded or withdrawn", () => {
    for (const status of ["AGREED", "SUPERSEDED", "WITHDRAWN"]) {
      expect(canAcceptThreadOffer({ ...brandCounter, status }, creator)).toBe(false);
    }
  });

  it("does not show Accept without an offer, or to viewers with no side (admins)", () => {
    expect(canAcceptThreadOffer(null, creator)).toBe(false);
    expect(canAcceptThreadOffer(brandCounter, { userId: "admin", side: null })).toBe(false);
    expect(
      canAcceptThreadOffer({ ...brandCounter, createdBySide: null }, creator),
    ).toBe(false);
  });
});

describe("threadViewerSide", () => {
  it("maps workspace kinds to the offer side", () => {
    expect(threadViewerSide("creator")).toBe("creator");
    expect(threadViewerSide("brand")).toBe("brand");
    expect(threadViewerSide("agency")).toBe("brand");
    expect(threadViewerSide("admin")).toBeNull();
    expect(threadViewerSide(undefined)).toBeNull();
  });
});
