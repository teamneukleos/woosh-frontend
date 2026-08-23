import { describe, expect, it } from "vitest";
import { automatedBriefChecks, moderationPath } from "@/domains/trust";

describe("brief moderation policy", () => {
  it("queues the first brief from a verified organisation", () => {
    expect(
      moderationPath({
        orgVerified: true,
        isFirstCampaign: true,
        rateAnomaly: false,
      }),
    ).toBe("admin_review_queue");
  });

  it("auto-publishes established verified organisations after clean checks", () => {
    expect(
      moderationPath({
        orgVerified: true,
        isFirstCampaign: false,
        rateAnomaly: false,
      }),
    ).toBe("auto_publish");
  });

  it("flags prohibited categories and anomalous rates", () => {
    const prohibited = automatedBriefChecks({
      title: "Casino launch",
      description: "Create social posts for our new gambling product.",
      currency: "NGN",
      rates: [250_000],
    });
    expect(prohibited.prohibitedCategory).toBe(true);
    expect(
      moderationPath({
        orgVerified: true,
        isFirstCampaign: false,
        rateAnomaly: prohibited.rateAnomaly,
        prohibitedCategory: prohibited.prohibitedCategory,
      }),
    ).toBe("policy_flag");

    expect(
      automatedBriefChecks({
        title: "Beauty launch",
        description: "Create three launch videos.",
        currency: "NGN",
        rates: [5_000],
      }).rateAnomaly,
    ).toBe(true);
    expect(
      automatedBriefChecks({
        title: "Beauty launch",
        description: "Create three launch videos.",
        currency: "USD",
        rates: [250_000],
      }).rateAnomaly,
    ).toBe(true);
  });
});
