import type { MembershipRole } from "@/lib/enums";

export type Permission =
  | "team.manage"
  | "rates.edit"
  | "payments.approve"
  | "data.export"
  | "briefs.manage"
  | "campaigns.manage"
  | "creators.search"
  | "analytics.view";

const roleDefaults: Record<MembershipRole, Permission[]> = {
  OWNER: [
    "team.manage",
    "rates.edit",
    "payments.approve",
    "data.export",
    "briefs.manage",
    "campaigns.manage",
    "creators.search",
    "analytics.view",
  ],
  ADMIN: [
    "team.manage",
    "rates.edit",
    "payments.approve",
    "data.export",
    "briefs.manage",
    "campaigns.manage",
    "creators.search",
    "analytics.view",
  ],
  MANAGER: [
    "briefs.manage",
    "campaigns.manage",
    "creators.search",
    "analytics.view",
  ],
  ACCOUNT_MANAGER: [
    "briefs.manage",
    "campaigns.manage",
    "creators.search",
    "analytics.view",
  ],
  FINANCE: ["payments.approve", "data.export", "analytics.view"],
  VIEWER: ["analytics.view", "creators.search"],
};

export function permissionsForRole(role: MembershipRole): Permission[] {
  return roleDefaults[role];
}

export function hasPermission(
  role: MembershipRole,
  permission: Permission,
  overrides?: {
    canApprovePayments?: boolean;
    canEditRates?: boolean;
    canManageTeam?: boolean;
    canExportData?: boolean;
  },
): boolean {
  if (overrides?.canApprovePayments && permission === "payments.approve") {
    return true;
  }
  if (overrides?.canEditRates && permission === "rates.edit") return true;
  if (overrides?.canManageTeam && permission === "team.manage") return true;
  if (overrides?.canExportData && permission === "data.export") return true;
  return permissionsForRole(role).includes(permission);
}
