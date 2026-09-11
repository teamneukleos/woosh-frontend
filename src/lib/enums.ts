/** API enum strings. Keep in sync with Nest Prisma enums. */

export type MembershipRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "FINANCE"
  | "VIEWER"
  | "ACCOUNT_MANAGER";

export type SocialChannel = "INSTAGRAM" | "TIKTOK" | "YOUTUBE";

export type ApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "DECLINED"
  | "ACCEPTED"
  | "WITHDRAWN";

export type OfferStatus =
  | "OPEN"
  | "COUNTERED"
  | "AGREED"
  | "EXPIRED"
  | "WITHDRAWN"
  | "SUPERSEDED";

export type DeliverableState =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "DRAFT_SUBMITTED"
  | "REVISION_REQUESTED"
  | "RESUBMITTED"
  | "APPROVED"
  | "SCHEDULED"
  | "LIVE"
  | "COMPLETED"
  | "REJECTED";

export type ObligationStatus =
  | "PENDING_FUNDING"
  | "FUNDED"
  | "COMMITTED"
  | "APPROVED"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REVERSED"
  | "DISPUTED";

export type DisputeCategory =
  | "CONTENT_APPROVAL"
  | "PAYMENT_AMOUNT"
  | "PAYOUT_DELAY"
  | "CANCELLATION"
  | "OTHER";

export type DisputeResolutionType = "RELEASE_PAYOUT" | "REFUND_BRAND";

export type AnalyticsEventType =
  | "PROFILE_VIEW"
  | "CREATOR_SAVED"
  | "CREATOR_UNSAVED"
  | "INVITE_SENT"
  | "INVITE_VIEWED"
  | "INVITE_ACCEPTED"
  | "INVITE_DECLINED"
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_SHORTLISTED"
  | "APPLICATION_ACCEPTED"
  | "APPLICATION_DECLINED"
  | "APPLICATION_WITHDRAWN"
  | "OFFER_COUNTERED"
  | "TERMS_ACCEPTED"
  | "DELIVERABLE_SUBMITTED"
  | "REVISION_REQUESTED"
  | "CAMPAIGN_STARTED"
  | "DELIVERABLE_APPROVED"
  | "CONTENT_LIVE"
  | "CAMPAIGN_COMPLETED";
