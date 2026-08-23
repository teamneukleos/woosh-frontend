import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCreatorInsights } from "@/domains/analytics/creator";
import { AppPage } from "@/components/ui/app-page";
import { Panel, EmptyState } from "@/components/ui/panel";
import { ChannelMark } from "@/components/ui/social-icon";
import { Stat } from "@/components/ui/stat";
import { FilterChips } from "@/components/ui/filter-chips";

export default async function CreatorInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days))
    ? Number(params.days)
    : 30;
  const insights = await getCreatorInsights(ctx.creatorProfile.id, days);
  const totalFollowers = insights.channels.reduce(
    (sum, channel) => sum + (channel.followers ?? 0),
    0,
  );
  const totalGrowth = insights.channels.reduce(
    (sum, channel) => sum + (channel.growth ?? 0),
    0,
  );

  return (
    <AppPage
      eyebrow="Creator"
      title="Insights"
      description="Verified social performance, Woosh opportunities, campaign results and earnings in one place."
      toolbar={
        <FilterChips
          active={String(days)}
          items={[7, 30, 90].map((range) => ({
            label: `${range} days`,
            value: String(range),
            href: `/app/insights?days=${range}`,
          }))}
        />
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Followers"
          value={totalFollowers.toLocaleString()}
          hint={`${totalGrowth >= 0 ? "+" : ""}${totalGrowth.toLocaleString()} in snapshot range`}
        />
        <Stat
          label="Profile views"
          value={insights.opportunities.profileViews.toLocaleString()}
        />
        <Stat
          label="Saves"
          value={insights.opportunities.saves.toLocaleString()}
        />
        <Stat
          label="MTD earnings"
          value={`₦${insights.earnings.monthToDate.toLocaleString()}`}
        />
      </div>

      <Panel title="Channel performance">
        {insights.channels.length ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {insights.channels.map((channel) => (
              <article
                key={channel.id}
                className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <ChannelMark
                      channel={channel.channel}
                      className="text-xs font-semibold text-[var(--woosh-navy)]"
                    />
                    <p className="mt-2 font-semibold text-[var(--woosh-navy)]">
                      @{channel.handle}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {channel.capturedAt
                      ? new Date(channel.capturedAt).toLocaleDateString()
                      : "Pending"}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--text-muted)]">Followers</dt>
                    <dd className="font-semibold">
                      {channel.followers?.toLocaleString() ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Growth</dt>
                    <dd className="font-semibold">
                      {channel.growth == null
                        ? "—"
                        : `${channel.growth >= 0 ? "+" : ""}${channel.growth.toLocaleString()}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Engagement</dt>
                    <dd className="font-semibold">
                      {channel.engagementRate == null
                        ? "—"
                        : `${channel.engagementRate.toFixed(2)}%`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Avg views</dt>
                    <dd className="font-semibold">
                      {channel.averageViews?.toLocaleString() ?? "—"}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-[var(--text-muted)]">
                  Source: {channel.source?.replaceAll("_", " ") ?? "pending"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Connect a channel"
            description="Your verified social performance will appear after the first provider sync."
          />
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Opportunity funnel">
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Invitations"
              value={String(insights.opportunities.invites)}
            />
            <Stat
              label="Invite views"
              value={String(insights.opportunities.inviteViews)}
            />
            <Stat
              label="Applications"
              value={String(insights.opportunities.applications)}
            />
            <Stat
              label="Accepted"
              value={String(insights.opportunities.accepted)}
            />
          </div>
        </Panel>
        <Panel title="Earnings">
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label="Available"
              value={`₦${insights.earnings.available.toLocaleString()}`}
            />
            <Stat
              label="Processing"
              value={`₦${insights.earnings.processing.toLocaleString()}`}
            />
            <Stat
              label="Paid"
              value={`₦${insights.earnings.paid.toLocaleString()}`}
            />
            <Stat
              label="Lifetime"
              value={`₦${insights.earnings.total.toLocaleString()}`}
            />
          </div>
        </Panel>
      </div>

      <Panel title="Campaign performance">
        {insights.campaigns.length ? (
          <div className="grid gap-3">
            {insights.campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--woosh-navy)]">
                    {campaign.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {campaign.brand} · {campaign.status}
                  </p>
                </div>
                <p className="text-sm">
                  <span className="block text-xs text-[var(--text-muted)]">
                    Reach
                  </span>
                  {campaign.reach.toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="block text-xs text-[var(--text-muted)]">
                    Views
                  </span>
                  {campaign.views.toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="block text-xs text-[var(--text-muted)]">
                    Engagement
                  </span>
                  {campaign.engagement.toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No campaign analytics yet"
            description="Metrics appear once approved content goes live."
          />
        )}
      </Panel>
    </AppPage>
  );
}
