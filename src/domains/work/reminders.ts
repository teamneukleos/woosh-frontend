import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notify";

const DAY_MS = 86_400_000;

function dayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function sendCreatorWorkReminders(now = new Date()) {
  const inThreeDays = new Date(now.getTime() + 3 * DAY_MS);
  const expiringInvitations = await prisma.briefInvitation.findMany({
    where: {
      status: { in: ["SENT", "VIEWED"] },
      brief: {
        applicationDeadline: { gt: now, lte: inThreeDays },
      },
    },
    include: { creator: true, brief: { include: { brand: true } } },
  });
  const expiredInvitations = await prisma.briefInvitation.findMany({
    where: {
      status: { in: ["SENT", "VIEWED"] },
      brief: { applicationDeadline: { lte: now } },
    },
    include: { creator: true, brief: { include: { brand: true } } },
  });
  const dueDeliverables = await prisma.deliverable.findMany({
    where: {
      dueAt: { lte: inThreeDays },
      state: {
        in: [
          "NOT_STARTED",
          "IN_PROGRESS",
          "REVISION_REQUESTED",
          "APPROVED",
          "SCHEDULED",
        ],
      },
      campaign: { status: "ACTIVE" },
    },
    include: {
      participant: { include: { creator: true } },
      campaign: { include: { brand: true } },
    },
  });

  if (expiredInvitations.length) {
    await prisma.briefInvitation.updateMany({
      where: { id: { in: expiredInvitations.map((row) => row.id) } },
      data: { status: "EXPIRED", respondedAt: now },
    });
  }

  await Promise.all([
    ...expiringInvitations.map((invitation) =>
      createNotification({
        userId: invitation.creator.userId,
        type: "brief.invitation.expiring",
        title: "Invitation expires soon",
        body: `${invitation.brief.brand.name} invited you to ${invitation.brief.title}`,
        href: `/app/jobs/${invitation.briefId}`,
        dedupeKey: `invite-expiring:${invitation.id}:${invitation.brief.applicationDeadline?.toISOString()}`,
      }),
    ),
    ...expiredInvitations.map((invitation) =>
      createNotification({
        userId: invitation.creator.userId,
        type: "brief.invitation.expired",
        title: "Invitation expired",
        body: `${invitation.brief.title} is no longer accepting applications`,
        href: `/app/work`,
        dedupeKey: `invite-expired:${invitation.id}`,
      }),
    ),
    ...dueDeliverables.map((deliverable) => {
      const overdue = !!deliverable.dueAt && deliverable.dueAt < now;
      return createNotification({
        userId: deliverable.participant.creator.userId,
        type: overdue ? "deliverable.overdue" : "deliverable.due_soon",
        title: overdue ? "Deliverable overdue" : "Deliverable due soon",
        body: `${deliverable.title} for ${deliverable.campaign.brand.name}`,
        href: `/app/campaigns/${deliverable.campaignId}`,
        dedupeKey: overdue
          ? `deliverable-overdue:${deliverable.id}:${dayKey(now)}`
          : `deliverable-due:${deliverable.id}:${deliverable.dueAt?.toISOString()}`,
      });
    }),
  ]);

  return {
    expiringInvitations: expiringInvitations.length,
    expiredInvitations: expiredInvitations.length,
    dueDeliverables: dueDeliverables.length,
  };
}
