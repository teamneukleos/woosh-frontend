import { describe, expect, it } from "vitest";
import {
  estimateAverageLikes,
  formatCompact,
  formatEngagement,
} from "@/lib/discovery-stats";

describe("discovery stats", () => {
  it("compacts follower counts", () => {
    expect(formatCompact(850)).toBe("850");
    expect(formatCompact(12_400)).toBe("12k");
    expect(formatCompact(210_000)).toBe("210k");
  });

  it("formats engagement and estimated likes", () => {
    expect(formatEngagement(4.2)).toBe("4.2%");
    expect(estimateAverageLikes(85_000, 4.2)).toBe(3570);
  });
});
