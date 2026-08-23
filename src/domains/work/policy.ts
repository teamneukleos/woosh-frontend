import type {
  ApplicationStatus,
  DeliverableState,
  OfferStatus,
} from "@/generated/prisma/client";

const DELIVERABLE_TRANSITIONS: Record<
  DeliverableState,
  readonly DeliverableState[]
> = {
  NOT_STARTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["DRAFT_SUBMITTED"],
  DRAFT_SUBMITTED: ["REVISION_REQUESTED", "APPROVED"],
  REVISION_REQUESTED: ["RESUBMITTED"],
  RESUBMITTED: ["REVISION_REQUESTED", "APPROVED"],
  APPROVED: ["SCHEDULED", "LIVE"],
  SCHEDULED: ["LIVE"],
  LIVE: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
};

export function canTransitionDeliverable(
  from: DeliverableState,
  to: DeliverableState,
) {
  return DELIVERABLE_TRANSITIONS[from].includes(to);
}

export function assertDeliverableTransition(
  from: DeliverableState,
  to: DeliverableState,
) {
  if (!canTransitionDeliverable(from, to)) {
    throw new Error(`Deliverable cannot move from ${from} to ${to}`);
  }
}

export function canWithdrawApplication(status: ApplicationStatus) {
  return status === "APPLIED" || status === "SHORTLISTED";
}

export function canRespondToOffer(input: {
  status: OfferStatus;
  offerCreatedById: string;
  actorUserId: string;
  applicationStatus: ApplicationStatus;
}) {
  return (
    ["OPEN", "COUNTERED"].includes(input.status) &&
    canWithdrawApplication(input.applicationStatus) &&
    input.offerCreatedById !== input.actorUserId
  );
}

export function canAccessOwnedWork(input: {
  isPlatformAdmin: boolean;
  actorCreatorProfileId?: string | null;
  actorBrandIds: readonly string[];
  ownerCreatorProfileId: string;
  ownerBrandId: string;
}) {
  return (
    input.isPlatformAdmin ||
    input.actorCreatorProfileId === input.ownerCreatorProfileId ||
    input.actorBrandIds.includes(input.ownerBrandId)
  );
}

export function idempotencyMatches(
  existingDeliverableId: string,
  requestedDeliverableId: string,
) {
  return existingDeliverableId === requestedDeliverableId;
}

export function analyticsEventForTransition(
  from: DeliverableState,
  to: DeliverableState,
) {
  if (
    (from === "IN_PROGRESS" && to === "DRAFT_SUBMITTED") ||
    (from === "REVISION_REQUESTED" && to === "RESUBMITTED")
  ) {
    return "DELIVERABLE_SUBMITTED" as const;
  }
  if (
    (from === "DRAFT_SUBMITTED" || from === "RESUBMITTED") &&
    to === "REVISION_REQUESTED"
  ) {
    return "REVISION_REQUESTED" as const;
  }
  if (
    (from === "DRAFT_SUBMITTED" || from === "RESUBMITTED") &&
    to === "APPROVED"
  ) {
    return "DELIVERABLE_APPROVED" as const;
  }
  if ((from === "APPROVED" || from === "SCHEDULED") && to === "LIVE") {
    return "CONTENT_LIVE" as const;
  }
  if (from === "LIVE" && to === "COMPLETED") {
    return "CAMPAIGN_COMPLETED" as const;
  }
  return null;
}
