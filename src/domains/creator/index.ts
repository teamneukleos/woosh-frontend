/**
 * Creator profile & social data domain
 * Profile, OAuth connection lifecycle, metric snapshots.
 */
import { brand } from "@/lib/brand";

export const SUPPORTED_CHANNELS = brand.mvpChannels;

export type MetricFreshness = "fresh" | "stale" | "unavailable" | "estimated";

export function labelMetricFreshness(
  lastRefreshedAt: Date | null | undefined,
  staleAfterHours = 48,
): MetricFreshness {
  if (!lastRefreshedAt) return "unavailable";
  const ageMs = Date.now() - lastRefreshedAt.getTime();
  if (ageMs > staleAfterHours * 60 * 60 * 1000) return "stale";
  return "fresh";
}
