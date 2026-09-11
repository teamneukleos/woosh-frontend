import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

type NestCampaignList = {
  id: string;
  title: string;
  status: string;
  brand: { id: string; name: string };
  deliverableCount: number;
  states: string[];
};

export async function listCampaignsForUser(_userId?: string) {
  const campaigns = await api<NestCampaignList[]>("/campaigns");
  return campaigns.map((campaign) => ({
    ...campaign,
    deliverables: campaign.states.map((state, index) => ({
      id: `${campaign.id}-${index}`,
      state,
      dueAt: null as Date | null,
    })),
  }));
}

export async function getCampaign(id: string, _actorUserId?: string) {
  const campaign = await api<{
    id: string;
    title: string;
    status: string;
    brand: { id: string; name: string };
    brief: { id: string; title: string; rights?: unknown; timing?: unknown };
    side: string;
    participants: Array<{
      id: string;
      creatorProfileId: string;
      displayName: string;
      agreedRate: number | null;
      currency: string;
      status: string;
      termsAcceptedAt: string | Date | null;
    }>;
    deliverables: Array<{
      id: string;
      title: string;
      channel: string | null;
      requirements?: unknown;
      state: string;
      dueAt: string | Date | null;
      startedAt: string | Date | null;
      completedAt: string | Date | null;
      creator: string;
      submissions: Array<{
        id: string;
        version: number;
        draftUrl: string | null;
        liveUrl: string | null;
        notes: string | null;
        reviewNotes: string | null;
        submittedAt: string | Date | null;
        reviewedAt: string | Date | null;
      }>;
    }>;
    conversations: Array<{
      id: string;
      type: string;
      messages: Array<{
        id: string;
        body: string;
        isSystem: boolean;
        senderUserId: string | null;
        createdAt: string | Date;
      }>;
    }>;
  }>(`/campaigns/${id}`);

  return {
    ...campaign,
    participants: campaign.participants.map((row) => ({
      ...row,
      termsAcceptedAt: asDate(row.termsAcceptedAt),
      creator: { displayName: row.displayName, id: row.creatorProfileId },
    })),
    deliverables: campaign.deliverables.map((row) => ({
      ...row,
      requirements: row.requirements ?? null,
      dueAt: asDate(row.dueAt),
      startedAt: asDate(row.startedAt),
      completedAt: asDate(row.completedAt),
      participant: {
        id: campaign.participants[0]?.id,
        creator: { displayName: row.creator, id: campaign.participants[0]?.creatorProfileId },
      },
      submissions: row.submissions.map((submission) => ({
        ...submission,
        submittedAt: asDate(submission.submittedAt) ?? new Date(),
        reviewedAt: asDate(submission.reviewedAt),
        fileName: null,
        mimeType: null,
        fileSizeBytes: null,
      })),
    })),
    conversations: campaign.conversations.map((conversation) => ({
      id: conversation.id,
      type: conversation.type,
      messages: (conversation.messages ?? []).map((message) => ({
        ...message,
        createdAt: asDate(message.createdAt) ?? new Date(),
      })),
    })),
  };
}

export async function submitDraft(input: {
  deliverableId: string;
  actorUserId: string;
  draftUrl: string;
  notes?: string;
  idempotencyKey?: string;
  storageKey?: string;
  fileName?: string;
  mimeType?: string;
  fileSizeBytes?: number;
}) {
  return api(`/deliverables/${input.deliverableId}/submit`, {
    method: "POST",
    body: {
      draftUrl: input.draftUrl,
      notes: input.notes,
      idempotencyKey: input.idempotencyKey,
    },
  });
}

export async function requestRevision(input: {
  deliverableId: string;
  actorUserId: string;
  reviewNotes: string;
}) {
  return api(`/deliverables/${input.deliverableId}/revision`, {
    method: "POST",
    body: { reviewNotes: input.reviewNotes },
  });
}

export async function approveDeliverable(input: {
  deliverableId: string;
  actorUserId: string;
  liveUrl?: string;
}) {
  return api(`/deliverables/${input.deliverableId}/approve`, {
    method: "POST",
    body: { liveUrl: input.liveUrl },
  });
}
