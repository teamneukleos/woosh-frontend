import { describe, expect, it } from "vitest";
import {
  ANNUAL_MONTHS_BILLED,
  BRAND_PLANS,
  annualNgn,
  annualSavingsNgn,
  billedMonthlyNgn,
  canPublishBrief,
  formatNgn,
  plansFor,
} from "@/lib/pricing";

describe("pricing logic", () => {
  it("gives brands a free one-brief plan and a ₦20k five-brief plan", () => {
    const starter = BRAND_PLANS.find((plan) => plan.id === "brand-starter");
    const studio = BRAND_PLANS.find((plan) => plan.id === "brand-studio");
    expect(starter?.monthlyNgn).toBe(0);
    expect(starter?.briefsPerMonth).toBe(1);
    expect(studio?.monthlyNgn).toBe(20_000);
    expect(studio?.briefsPerMonth).toBe(5);
  });

  it("formats naira without a locale-dependent currency prefix", () => {
    expect(formatNgn(0)).toBe("₦0");
    expect(formatNgn(20_000)).toBe("₦20,000");
  });

  it("bills annual as ten months", () => {
    expect(ANNUAL_MONTHS_BILLED).toBe(10);
    expect(annualNgn(20_000)).toBe(200_000);
    expect(billedMonthlyNgn(20_000, "annual")).toBe(16_667);
    expect(annualSavingsNgn(20_000)).toBe(40_000);
  });

  it("never caps creators and defaults buyers to the free plan", () => {
    expect(canPublishBrief({ audience: "creator", briefsPublishedThisMonth: 40 }).ok).toBe(
      true,
    );
    expect(
      canPublishBrief({
        audience: "brand",
        briefsPublishedThisMonth: 1,
      }).ok,
    ).toBe(false);
    expect(
      canPublishBrief({
        audience: "brand",
        planId: "brand-studio",
        briefsPublishedThisMonth: 4,
      }),
    ).toEqual({ ok: true, remaining: 1 });
  });

  it("keeps agency and brand catalogues separate", () => {
    expect(plansFor("agency").every((plan) => plan.audience === "agency")).toBe(true);
    expect(plansFor("brand").every((plan) => plan.audience === "brand")).toBe(true);
  });
});
