import { prisma } from "@/lib/db";
import { requireCreatorActor } from "@/domains/work/access";

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
  const actor = await requireCreatorActor(actorUserId);
  const now = new Date();
  const [invitations, applications, participants] = await Promise.all([
    prisma.briefInvitation.findMany({
      where: { creatorProfileId: actor.creatorProfileId },
      include: { brief: { include: { brand: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: { creatorProfileId: actor.creatorProfileId },
      include: {
        brief: { include: { brand: true } },
        offers: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.campaignParticipant.findMany({
      where: { creatorProfileId: actor.creatorProfileId },
      include: {
        campaign: { include: { brand: true } },
        deliverables: {
          include: {
            submissions: { orderBy: { version: "desc" }, take: 1 },
          },
          orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const inviteItems = invitations.map((invitation) => {
    const dueAt = invitation.brief.applicationDeadline;
    const expired =
      invitation.status === "EXPIRED" ||
      (!!dueAt && dueAt < now && !["ACCEPTED", "DECLINED"].includes(invitation.status));
    return {
      kind: "invitation" as const,
      id: invitation.id,
      title: invitation.brief.title,
      brandName: invitation.brief.brand.name,
      status: expired ? "EXPIRED" : invitation.status,
      dueAt,
      message: invitation.message,
      responseReason: invitation.responseReason,
      href: `/app/jobs/${invitation.briefId}`,
      actionRequired: ["SENT", "VIEWED"].includes(invitation.status) && !expired,
      priority: expired ? 99 : dueAt ? Math.max(1, dueAt.getTime() - now.getTime()) : 50,
    };
  });

  const applicationItems = applications.map((application) => {
    const offer = application.offers.find((row) =>
      ["OPEN", "COUNTERED"].includes(row.status),
    );
    const hasIncomingOffer =
      !!offer && offer.createdById !== actorUserId && application.status !== "ACCEPTED";
    return {
      kind: "application" as const,
      id: application.id,
      title: application.brief.title,
      brandName: application.brief.brand.name,
      status: application.status,
      dueAt: application.brief.applicationDeadline,
      proposedRate:
        application.proposedRate == null
          ? null
          : Number(application.proposedRate),
      currency: application.currency,
      offer: offer
        ? {
            id: offer.id,
            amount: Number(offer.amount),
            currency: offer.currency,
            message: offer.message,
            incoming: hasIncomingOffer,
          }
        : null,
      href: `/app/jobs/${application.briefId}`,
      actionRequired: hasIncomingOffer,
      priority: hasIncomingOffer ? 2 : 60,
      withdrawalReason: application.withdrawalReason,
    };
  });

  const campaignItems = participants.flatMap((participant) =>
    participant.deliverables.map((deliverable) => {
      const overdue =
        !!deliverable.dueAt &&
        deliverable.dueAt < now &&
        !["COMPLETED", "LIVE"].includes(deliverable.state);
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
        campaignTitle: participant.campaign.title,
        brandName: participant.campaign.brand.name,
        status: deliverable.state,
        dueAt: deliverable.dueAt,
        overdue,
        termsAccepted: Boolean(participant.termsAcceptedAt),
        campaignParticipantId: participant.id,
        latestSubmission: deliverable.submissions[0]
          ? {
              version: deliverable.submissions[0].version,
              reviewNotes: deliverable.submissions[0].reviewNotes,
              fileName: deliverable.submissions[0].fileName,
            }
          : null,
        href: `/app/campaigns/${participant.campaignId}`,
        actionRequired,
        priority:
          deliverable.state === "REVISION_REQUESTED"
            ? 0
            : overdue
              ? 1
              : deliverable.dueAt?.getTime() ?? 40,
      };
    }),
  );

  const all = [...inviteItems, ...applicationItems, ...campaignItems].filter(
    (item) =>
      (!filters.status || item.status === filters.status) &&
      deadlineMatches(item.dueAt, filters.deadline, now),
  );
  const active = all
    .filter(
      (item) =>
        ![
          "DECLINED",
          "EXPIRED",
          "WITHDRAWN",
          "COMPLETED",
          "REJECTED",
        ].includes(item.status),
    )
    .sort(
      (a, b) =>
        Number(b.actionRequired) - Number(a.actionRequired) ||
        a.priority - b.priority,
    );
  const completed = all
    .filter((item) =>
      ["DECLINED", "EXPIRED", "WITHDRAWN", "COMPLETED", "REJECTED"].includes(
        item.status,
      ),
    )
    .sort(
      (a, b) => (b.dueAt?.getTime() ?? 0) - (a.dueAt?.getTime() ?? 0),
    );

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
