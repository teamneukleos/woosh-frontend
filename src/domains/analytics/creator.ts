import { prisma } from "@/lib/db";

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function getCreatorInsights(
  creatorProfileId: string,
  days = 30,
) {
  const since = daysAgo(Math.min(Math.max(days, 7), 90));
  const [accounts, events, applications, invitations, campaigns, earnings] =
    await Promise.all([
      prisma.socialAccount.findMany({
        where: { creatorProfileId, status: "ACTIVE" },
        include: {
          snapshots: {
            where: {
              capturedAt: { gte: daysAgo(90) },
              source: { not: "manual_unverified" },
            },
            orderBy: { capturedAt: "asc" },
          },
        },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["eventType"],
        where: { creatorProfileId, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.application.findMany({
        where: { creatorProfileId, createdAt: { gte: since } },
        select: { status: true },
      }),
      prisma.briefInvitation.findMany({
        where: { creatorProfileId, createdAt: { gte: since } },
        select: { status: true, viewedAt: true },
      }),
      prisma.campaignParticipant.findMany({
        where: { creatorProfileId },
        include: {
          campaign: {
            include: {
              metrics: {
                where: { creatorProfileId },
                orderBy: { capturedAt: "desc" },
              },
              brand: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.paymentObligation.findMany({
        where: { participant: { creatorProfileId } },
        select: {
          status: true,
          netAmount: true,
          createdAt: true,
        },
      }),
    ]);

  const eventCounts = Object.fromEntries(
    events.map((event) => [event.eventType, event._count._all]),
  );
  const channelSummaries = accounts.map((account) => {
    const first = account.snapshots[0];
    const latest = account.snapshots.at(-1);
    const followers = latest?.followers ?? null;
    const growth =
      followers != null && first?.followers != null
        ? followers - first.followers
        : null;
    return {
      id: account.id,
      channel: account.channel,
      handle: account.handle,
      followers,
      growth,
      engagementRate: latest?.engagementRate
        ? Number(latest.engagementRate)
        : null,
      averageViews: latest?.averageViews ?? null,
      postingFrequency: latest?.postingFrequency
        ? Number(latest.postingFrequency)
        : null,
      audienceGeo: latest?.audienceGeo,
      audienceAge: latest?.audienceAge,
      audienceGender: latest?.audienceGender,
      topContent: latest?.topContent,
      source: latest?.source ?? null,
      capturedAt: latest?.capturedAt ?? null,
      history: account.snapshots.map((snapshot) => ({
        capturedAt: snapshot.capturedAt,
        followers: snapshot.followers,
      })),
    };
  });

  const campaignRows = campaigns.map((participant) => {
    const uniqueLatest = new Map<string, (typeof participant.campaign.metrics)[number]>();
    for (const metric of participant.campaign.metrics) {
      const key =
        metric.submissionId ||
        metric.deliverableId ||
        metric.postUrl ||
        metric.id;
      if (!uniqueLatest.has(key)) uniqueLatest.set(key, metric);
    }
    const metrics = [...uniqueLatest.values()];
    return {
      id: participant.campaign.id,
      title: participant.campaign.title,
      brand: participant.campaign.brand.name,
      status: participant.campaign.status,
      reach: metrics.reduce((sum, metric) => sum + (metric.reach ?? 0), 0),
      views: metrics.reduce((sum, metric) => sum + (metric.views ?? 0), 0),
      engagement: metrics.reduce(
        (sum, metric) => sum + (metric.engagement ?? 0),
        0,
      ),
    };
  });

  const earningsSummary = earnings.reduce(
    (summary, row) => {
      const value = Number(row.netAmount);
      summary.total += value;
      if (row.status === "PAID") summary.paid += value;
      else if (row.status === "PROCESSING") summary.processing += value;
      else summary.available += value;
      if (row.createdAt >= daysAgo(30)) summary.monthToDate += value;
      return summary;
    },
    { total: 0, paid: 0, processing: 0, available: 0, monthToDate: 0 },
  );

  return {
    days,
    channels: channelSummaries,
    opportunities: {
      profileViews: eventCounts.PROFILE_VIEW ?? 0,
      saves: eventCounts.CREATOR_SAVED ?? 0,
      invites: invitations.length,
      inviteViews: invitations.filter((item) => item.viewedAt).length,
      applications: applications.length,
      shortlisted: applications.filter((item) => item.status === "SHORTLISTED")
        .length,
      accepted: applications.filter((item) => item.status === "ACCEPTED")
        .length,
    },
    campaigns: campaignRows,
    earnings: earningsSummary,
  };
}
