import { api } from "@/lib/api";

export async function declineInvitation(input: {
  invitationId?: string;
  briefId?: string;
  actorUserId: string;
  reason?: string;
}) {
  if (!input.invitationId) throw new Error("Invitation not found");
  return api(`/jobs/invites/${input.invitationId}/decline`, {
    method: "POST",
    body: { reason: input.reason },
  });
}

export async function withdrawApplication(input: {
  applicationId: string;
  actorUserId: string;
  reason?: string;
}) {
  return api(`/applications/${input.applicationId}/withdraw`, {
    method: "POST",
    body: { reason: input.reason },
  });
}

export async function acceptCampaignTerms(input: {
  campaignId?: string;
  campaignParticipantId?: string;
  actorUserId: string;
}) {
  if (!input.campaignId) throw new Error("Campaign required");
  return api(`/campaigns/${input.campaignId}/terms`, { method: "POST" });
}

export async function startDeliverable(input: {
  deliverableId: string;
  actorUserId: string;
}) {
  return api(`/deliverables/${input.deliverableId}/start`, { method: "POST" });
}
