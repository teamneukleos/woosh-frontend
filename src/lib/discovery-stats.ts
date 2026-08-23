export function formatCompact(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return Math.round(value).toLocaleString("en-NG");
}

export function formatEngagement(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value) || value <= 0) return "—";
  return `${value.toFixed(1)}%`;
}

export function estimateAverageLikes(
  followers: number | null | undefined,
  engagementRate: number | null | undefined,
) {
  if (!followers || !engagementRate) return null;
  return Math.max(0, Math.round(followers * (engagementRate / 100)));
}

export function bestMetric(
  metrics: Array<{
    followers?: number | null;
    engagementRate?: number | null;
    averageViews?: number | null;
  }> | undefined,
  key: "followers" | "engagementRate" | "averageViews",
) {
  if (!metrics?.length) return null;
  const values = metrics
    .map((metric) => metric[key])
    .filter((value): value is number => value != null && Number.isFinite(value));
  if (!values.length) return null;
  return Math.max(...values);
}
