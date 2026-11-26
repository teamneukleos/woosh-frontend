import { describe, expect, it } from "vitest";
import { summarizeEarnings } from "./earnings";

const entry = (stage: string, netAmount: number) => ({ stage, netAmount });

describe("summarizeEarnings", () => {
  it("totals each stage separately and counts every payment once", () => {
    const totals = summarizeEarnings([
      entry("reserved", 10_000),
      entry("pending", 20_000),
      entry("processing", 30_000),
      entry("paid", 40_000),
      entry("paid", 5_000),
      entry("attention", 7_000),
    ]);

    expect(totals).toEqual({
      reserved: 10_000,
      pending: 20_000,
      processing: 30_000,
      paid: 45_000,
      attention: 7_000,
    });
    const counted =
      totals.reserved + totals.pending + totals.processing + totals.paid + totals.attention;
    expect(counted).toBe(112_000);
  });

  it("keeps reserved money out of everything that counts as earned", () => {
    const totals = summarizeEarnings([entry("reserved", 50_000)]);
    expect(totals.pending + totals.processing + totals.paid).toBe(0);
    expect(totals.reserved).toBe(50_000);
  });

  it("ignores unknown stages instead of counting them as paid", () => {
    const totals = summarizeEarnings([entry("mystery", 9_000)]);
    expect(Object.values(totals).every((value) => value === 0)).toBe(true);
  });
});
