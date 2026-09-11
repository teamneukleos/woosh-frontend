import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";
import type { DisputeCategory, DisputeResolutionType } from "@/lib/enums";

type NestDispute = {
  id: string;
  status: string;
  category: string;
  subject: string;
  description: string;
  requestedResolution?: string | null;
  resolution?: string | null;
  responseDueAt?: string | Date | null;
  obligation: {
    id: string;
    status: string;
    campaign?: { id: string; title: string; brand: { id: string; name: string } };
    creator?: { displayName: string };
  };
};

function mapDispute(row: NestDispute) {
  const campaign = row.obligation.campaign ?? {
    id: "",
    title: "",
    brand: { id: "", name: "" },
  };
  const creator = row.obligation.creator ?? { displayName: "Creator" };
  return {
    ...row,
    responseDueAt: asDate(row.responseDueAt),
    obligation: {
      id: row.obligation.id,
      status: row.obligation.status,
      participant: {
        campaign,
        creator,
      },
    },
  };
}

export async function createPaymentDispute(input: {
  obligationId: string;
  actorUserId: string;
  category: DisputeCategory;
  subject: string;
  description: string;
  requestedResolution?: string;
}) {
  return api("/disputes", {
    method: "POST",
    body: {
      obligationId: input.obligationId,
      category: input.category,
      subject: input.subject,
      description: input.description,
      requestedResolution: input.requestedResolution,
    },
  });
}

export async function listDisputesForUser(_actorUserId?: string) {
  const rows = await api<NestDispute[]>("/disputes");
  return rows.map(mapDispute);
}

export async function resolvePaymentDispute(input: {
  disputeId: string;
  actorUserId: string;
  resolutionType: DisputeResolutionType;
  resolution: string;
}) {
  return api(`/admin/disputes/${input.disputeId}/resolve`, {
    method: "POST",
    body: {
      resolutionType: input.resolutionType,
      resolution: input.resolution,
    },
  });
}
