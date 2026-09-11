import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

export async function listPendingBriefs() {
  return api<
    Array<{
      id: string;
      title: string;
      status: string;
      brand: { name: string; organisation: { publicName: string } };
    }>
  >("/admin/briefs/moderation");
}

export async function listCreatorModeration() {
  const data = await api<{
    profiles: Array<{
      id: string;
      displayName: string;
      marketplaceStatus: string;
      submittedAt: string | null;
      _count: { portfolioItems: number; ratePackages: number };
      socialAccounts: Array<{ id: string; handle: string }>;
    }>;
    media: Array<{
      id: string;
      title: string;
      status: string;
      mediaType: string;
      url: string;
      creator: { displayName: string };
    }>;
  }>("/admin/creators/moderation");
  return {
    profiles: data.profiles.map((profile) => ({
      ...profile,
      submittedAt: asDate(profile.submittedAt),
    })),
    media: data.media,
  };
}

export async function moderateCreatorProfile(input: {
  profileId?: string;
  creatorProfileId?: string;
  actorId: string;
  approve: boolean;
  notes?: string;
  reason?: string;
}) {
  const id = input.profileId ?? input.creatorProfileId;
  if (!id) throw new Error("Creator required");
  return api(`/admin/creators/${id}/review`, {
    method: "POST",
    body: { approve: input.approve, reason: input.notes ?? input.reason },
  });
}

export async function moderateCreatorMedia(input: {
  itemId: string;
  actorId: string;
  approve: boolean;
  notes?: string;
  reason?: string;
}) {
  return api(`/admin/creators/media/${input.itemId}/review`, {
    method: "POST",
    body: { approve: input.approve, reason: input.notes ?? input.reason },
  });
}

export async function approveBrief(briefId: string, _actorId: string) {
  return api(`/admin/briefs/${briefId}/review`, {
    method: "POST",
    body: { approve: true },
  });
}

export async function rejectBrief(briefId: string, _actorId: string, reason?: string) {
  return api(`/admin/briefs/${briefId}/review`, {
    method: "POST",
    body: { approve: false, reason },
  });
}

export async function verifyOrganisation(
  organisationId: string,
  _actorId: string,
  verified: boolean,
) {
  return api(`/admin/organisations/${organisationId}/verify`, {
    method: "POST",
    body: { verified },
  });
}

export async function listOrganisations() {
  const rows = await api<
    Array<{
      id: string;
      publicName: string;
      type: string;
      verifiedAt: string | Date | null;
      brands: Array<{ id: string; name: string }>;
    }>
  >("/admin/organisations");
  return rows.map((row) => ({
    ...row,
    verifiedAt: asDate(row.verifiedAt),
  }));
}

export async function countProspects() {
  const data = await api<{ count: number }>("/admin/prospects");
  return data.count;
}

export async function listUsers() {
  return api<
    Array<{
      id: string;
      name: string | null;
      email: string;
      isPlatformAdmin: boolean;
      creatorProfile: { displayName: string } | null;
      memberships: Array<{ organisation: { type: string } }>;
    }>
  >("/admin/users");
}

export async function setUserAdmin(
  userId: string,
  isAdmin: boolean,
  _actorId: string,
) {
  return api(`/admin/users/${userId}/admin`, {
    method: "POST",
    body: { isAdmin },
  });
}

export async function adminSeedProspects(
  rows: Array<{
    channel: string;
    handle: string;
    displayName?: string;
    categories?: string[];
    followerEstimate?: number;
    locationCountry?: string;
  }>,
  _actorId: string,
) {
  return api("/admin/prospects/seed", {
    method: "POST",
    body: {
      rows: rows.filter(
        (row) =>
          row.handle.trim() &&
          ["INSTAGRAM", "TIKTOK", "YOUTUBE"].includes(row.channel) &&
          (row.followerEstimate == null || Number.isFinite(row.followerEstimate)),
      ),
    },
  });
}
