import { api } from "@/lib/api";
import { getActiveBrandId } from "@/lib/brand-cookie";
import type { MembershipRole } from "@/lib/enums";

export type WorkspaceKind = "creator" | "brand" | "agency" | "admin";

export type WorkspaceUser = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  isPlatformAdmin: boolean;
  status: string;
  emailVerified: Date | string | null;
  emailNotifications: boolean;
  weeklyDigest: boolean;
};

export type WorkspaceCreatorProfile = {
  id: string;
  displayName: string;
  marketplaceStatus: string;
};

export type WorkspaceOrganisation = {
  id: string;
  type: string;
  legalName?: string | null;
  publicName: string;
  industry?: string | null;
  website?: string | null;
  country?: string;
  verifiedAt: Date | string | null;
};

export type WorkspaceMembership = {
  role: MembershipRole;
  canApprovePayments: boolean;
  canEditRates: boolean;
  canManageTeam: boolean;
  canExportData: boolean;
  permissions?: string[];
};

export type WorkspaceBrand = {
  id: string;
  name: string;
  organisationId?: string;
  industry?: string | null;
  country?: string;
};

export type WorkspaceContext = {
  kind: WorkspaceKind;
  user: WorkspaceUser;
  creatorProfile?: WorkspaceCreatorProfile | null;
  organisation?: WorkspaceOrganisation | null;
  membership?: WorkspaceMembership | null;
  brands: WorkspaceBrand[];
  activeBrandId?: string | null;
  activeBrand?: WorkspaceBrand | null;
};

type NestWorkspace = {
  seat: WorkspaceKind;
  user: {
    id: string;
    email: string;
    name: string | null;
    isPlatformAdmin: boolean;
  };
  organisation: WorkspaceOrganisation | null;
  membership: WorkspaceMembership | null;
  brands: WorkspaceBrand[];
  activeBrandId: string | null;
  activeBrand: WorkspaceBrand | null;
};

type NestMe = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  status: string;
  emailVerified: string | Date | null;
  emailNotifications?: boolean;
  weeklyDigest?: boolean;
  isPlatformAdmin: boolean;
  creatorProfile: WorkspaceCreatorProfile | null;
};

export async function getWorkspaceContext(
  _userId?: string,
): Promise<WorkspaceContext | null> {
  try {
    const cookieBrand = await getActiveBrandId();
    const [workspace, me] = await Promise.all([
      api<NestWorkspace>("/workspace", { brandId: cookieBrand }),
      api<NestMe>("/auth/me", { brandId: cookieBrand }),
    ]);
    if (me.status !== "ACTIVE" || !me.emailVerified) return null;

    return {
      kind: workspace.seat,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        image: me.image,
        isPlatformAdmin: me.isPlatformAdmin,
        status: me.status,
        emailVerified: me.emailVerified,
        emailNotifications: me.emailNotifications ?? true,
        weeklyDigest: me.weeklyDigest ?? true,
      },
      creatorProfile: me.creatorProfile,
      organisation: workspace.organisation,
      membership: workspace.membership,
      brands: workspace.brands,
      activeBrandId: workspace.activeBrandId,
      activeBrand: workspace.activeBrand,
    };
  } catch {
    return null;
  }
}
