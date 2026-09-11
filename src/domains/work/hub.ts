import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

type NestJob = {
  id: string;
  title: string;
  brand: { name: string };
  applicationDeadline?: string | Date | null;
  currency: string;
  myInvitation?: {
    id: string;
    status: string;
    message?: string | null;
    responseReason?: string | null;
  } | null;
  myApplication?: {
    id: string;
    status: string;
    proposedRate?: number | null;
    currency?: string;
    withdrawalReason?: string | null;
    offers?: Array<{
      id: string;
      amount: number;
      currency: string;
      message?: string | null;
      createdById?: string;
      status?: string;
    }>;
  } | null;
};

type NestCampaignList = {
  id: string;
  title: string;
  brand: { name: string };
};

type NestCampaign = {
  id: string;
  title: string;
  brand: { name: string };
  participants: Array<{
    id: string;
    termsAcceptedAt: string | Date | null;
  }>;
  deliverables: Array<{
    id: string;
    title: string;
    state: string;
    dueAt: string | Date | null;
    submissions: Array<{
      version: number;
      reviewNotes?: string | null;
      fileName?: string | null;
    }>;
  }>;
};

export type WorkHubFilters = {
  status?: string;
  deadline?: "overdue" | "7-days" | "30-days";
};

function deadlineMatches(
  dueAt: Date | null,
  deadline: WorkHubFilters["deadline"],
  now: Date,
) {
  if (!deadline) return true;
  if (!dueAt) return false;
  if (deadline === "overdue") return dueAt < now;
  const days = deadline === "7-days" ? 7 : 30;
  return dueAt <= new Date(now.getTime() + days * 86_400_000);
}

export async function getCreatorWorkHub(
  actorUserId: string,
  filters: WorkHubFilters = {},
) {
  const now = new Date();
  const [invited, applied, campaignList] = await Promise.all([
    api<NestJob[]>("/jobs?tab=invited"),
    api<NestJob[]>("/jobs?tab=applied"),
    api<NestCampaignList[]>("/campaigns"),
  ]);

  const campaigns = await Promise.all(
    campaignList.slice(0, 20).map((row) => api<NestCampaign>(`/campaigns/${row.id}`)),
  );

  const inviteItems = invited.map((job) => {
    const invitation = job.myInvitation;
    const dueAt = asDate(job.applicationDeadline);
    const expired =
      invitation?.status === "EXPIRED" ||
      (!!dueAt && dueAt < now && !["ACCEPTED", "DECLINED"].includes(invitation?.status ?? ""));
    return {
      kind: "invitation" as const,
      id: invitation?.id ?? job.id,
      briefId: job.id,
      title: job.title,
      brandName: job.brand.name,
      status: expired ? "EXPIRED" : invitation?.status ?? "SENT",
      dueAt,
      message: invitation?.message,
      responseReason: invitation?.responseReason,
      href: `/app/jobs/${job.id}`,
      actionRequired: ["SENT", "VIEWED"].includes(invitation?.status ?? "") && !expired,
      priority: expired ? 99 : dueAt ? Math.max(1, dueAt.getTime() - now.getTime()) : 50,
    };
  });

  const applicationItems = applied
    .map((job) => {
      const application = job.myApplication;
      if (!application) return null;
      const offer = application.offers?.find((row) =>
        ["OPEN", "COUNTERED"].includes(row.status ?? ""),
      );
      const hasIncomingOffer =
        !!offer && offer.createdById !== actorUserId && application.status !== "ACCEPTED";
      return {
        kind: "application" as const,
        id: application.id,
        title: job.title,
        brandName: job.brand.name,
        status: application.status,
        dueAt: asDate(job.applicationDeadline),
        proposedRate: application.proposedRate ?? null,
        currency: application.currency ?? job.currency,
        offer: offer
          ? {
              id: offer.id,
              amount: Number(offer.amount),
              currency: offer.currency,
              message: offer.message,
              incoming: hasIncomingOffer,
            }
          : null,
        href: `/app/jobs/${job.id}`,
        actionRequired: hasIncomingOffer,
        priority: hasIncomingOffer ? 2 : 60,
        withdrawalReason: application.withdrawalReason,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const campaignItems = campaigns.flatMap((campaign) => {
    const participant = campaign.participants[0];
    return campaign.deliverables.map((deliverable) => {
      const dueAt = asDate(deliverable.dueAt);
      const overdue =
        !!dueAt && dueAt < now && !["COMPLETED", "LIVE"].includes(deliverable.state);
      const actionRequired = [
        "NOT_STARTED",
        "IN_PROGRESS",
        "REVISION_REQUESTED",
        "APPROVED",
        "SCHEDULED",
      ].includes(deliverable.state);
      return {
        kind: "deliverable" as const,
        id: deliverable.id,
        title: deliverable.title,
        campaignTitle: campaign.title,
        brandName: campaign.brand.name,
        status: deliverable.state,
        dueAt,
        overdue,
        termsAccepted: Boolean(participant?.termsAcceptedAt),
        campaignId: campaign.id,
        campaignParticipantId: participant?.id ?? "",
        latestSubmission: deliverable.submissions[0]
          ? {
              version: deliverable.submissions[0].version,
              reviewNotes: deliverable.submissions[0].reviewNotes,
              fileName: deliverable.submissions[0].fileName,
            }
          : null,
        href: `/app/campaigns/${campaign.id}`,
        actionRequired,
        priority:
          deliverable.state === "REVISION_REQUESTED"
            ? 0
            : overdue
              ? 1
              : dueAt?.getTime() ?? 40,
      };
    });
  });

  const all = [...inviteItems, ...applicationItems, ...campaignItems].filter(
    (item) =>
      (!filters.status || item.status === filters.status) &&
      deadlineMatches(item.dueAt, filters.deadline, now),
  );
  const active = all
    .filter(
      (item) =>
        !["DECLINED", "EXPIRED", "WITHDRAWN", "COMPLETED", "REJECTED"].includes(item.status),
    )
    .sort(
      (a, b) => Number(b.actionRequired) - Number(a.actionRequired) || a.priority - b.priority,
    );
  const completed = all
    .filter((item) =>
      ["DECLINED", "EXPIRED", "WITHDRAWN", "COMPLETED", "REJECTED"].includes(item.status),
    )
    .sort((a, b) => (b.dueAt?.getTime() ?? 0) - (a.dueAt?.getTime() ?? 0));

  return {
    active,
    completed,
    counts: {
      actionRequired: active.filter((item) => item.actionRequired).length,
      invitations: inviteItems.filter((item) => item.actionRequired).length,
      offers: applicationItems.filter((item) => item.actionRequired).length,
      overdue: campaignItems.filter((item) => item.overdue).length,
    },
  };
}
