/**
 * Messaging & notifications domain
 */
export type ConversationKind =
  | "APPLICATION"
  | "INVITATION"
  | "CAMPAIGN"
  | "SUPPORT";

/** Rate offers must be structured objects, never plain-text only. */
export type StructuredOfferPayload = {
  offerId: string;
  amount: string;
  currency: string;
  status: string;
};
