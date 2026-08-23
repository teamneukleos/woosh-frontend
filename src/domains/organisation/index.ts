/**
 * Organisation & brand domain
 * Agency, client-brand workspaces, team configuration.
 */
export type AccountType = "BRAND" | "AGENCY";

export const CLIENT_ACCESS_MODES = [
  "agency_only",
  "shared_with_client",
  "client_approval_required",
] as const;

export type ClientAccessMode = (typeof CLIENT_ACCESS_MODES)[number];
