import { prisma } from "@/lib/db";
import { getActiveBrandId } from "@/lib/brand-cookie";
import type {
  Brand,
  CreatorProfile,
  Membership,
  Organisation,
  User,
} from "@/generated/prisma/client";

export type WorkspaceKind = "creator" | "brand" | "agency" | "admin";

export type WorkspaceContext = {
  kind: WorkspaceKind;
  user: User;
  creatorProfile?: CreatorProfile | null;
  organisation?: Organisation | null;
  membership?: Membership | null;
  brands: Brand[];
  activeBrandId?: string | null;
  activeBrand?: Brand | null;
};

export async function getWorkspaceContext(
  userId: string,
): Promise<WorkspaceContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      memberships: {
        include: {
          organisation: {
            include: { brands: { orderBy: { name: "asc" } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      brandMemberships: {
        include: { brand: true },
      },
    },
  });

  if (!user || user.status !== "ACTIVE" || !user.emailVerified) return null;

  if (user.isPlatformAdmin) {
    const cookieBrand = await getActiveBrandId();
    const membership = user.memberships[0] ?? null;
    const brands =
      membership?.organisation.brands ??
      user.brandMemberships.map((m) => m.brand);
    const activeBrandId =
      brands.find((b) => b.id === cookieBrand)?.id ?? brands[0]?.id ?? null;
    return {
      kind: "admin",
      user,
      creatorProfile: user.creatorProfile,
      organisation: membership?.organisation ?? null,
      membership,
      brands,
      activeBrandId,
      activeBrand: brands.find((b) => b.id === activeBrandId) ?? null,
    };
  }

  if (user.creatorProfile) {
    return {
      kind: "creator",
      user,
      creatorProfile: user.creatorProfile,
      brands: [],
      activeBrandId: null,
      activeBrand: null,
    };
  }

  const membership = user.memberships[0] ?? null;
  if (!membership) {
    return {
      kind: "brand",
      user,
      brands: [],
      activeBrandId: null,
      activeBrand: null,
    };
  }

  const org = membership.organisation;
  const brands = org.brands;
  const cookieBrand = await getActiveBrandId();
  const activeBrandId =
    brands.find((b) => b.id === cookieBrand)?.id ?? brands[0]?.id ?? null;

  return {
    kind: org.type === "AGENCY" ? "agency" : "brand",
    user,
    organisation: org,
    membership,
    brands,
    activeBrandId,
    activeBrand: brands.find((b) => b.id === activeBrandId) ?? null,
  };
}

export async function requireWorkspace(userId: string) {
  const ctx = await getWorkspaceContext(userId);
  if (!ctx) throw new Error("Workspace not found");
  return ctx;
}
