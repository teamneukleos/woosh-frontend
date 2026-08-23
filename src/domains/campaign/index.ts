/**
 * Campaign operations domain
 * Participants, deliverables, submissions, approvals, timelines.
 */
export const DELIVERABLE_FLOW = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "DRAFT_SUBMITTED",
  "REVISION_REQUESTED",
  "RESUBMITTED",
  "APPROVED",
  "SCHEDULED",
  "LIVE",
  "COMPLETED",
] as const;
