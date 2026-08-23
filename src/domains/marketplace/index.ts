/**
 * Marketplace domain
 * Briefs, invitations, applications, matching, lists, discovery.
 */
export type BriefDistributionMode = "OPEN" | "INVITE_ONLY" | "HYBRID";

export const MATCHING_WEIGHTS = {
  hardEligibility: "required",
  contentRelevance: "high",
  audienceFit: "high",
  performanceQuality: "medium-high",
  commercialFit: "medium",
  reliability: "medium",
  relationshipHistory: "medium",
  freshnessAvailability: "low-medium",
} as const;
