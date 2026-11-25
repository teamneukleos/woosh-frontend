import { redirect } from "next/navigation";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCreatorInsights } from "@/domains/analytics/creator";
import { AppPage } from "@/components/ui/app-page";
import { EmptyState } from "@/components/ui/panel";
import { ChannelMark } from "@/components/ui/social-icon";
import { FilterChips } from "@/components/ui/filter-chips";

const STROKE = { light: 1.25, regular: 1.5 } as const;

function Glyph({
  icon: Icon,
  size = 18,
  weight = "regular",
  className = "",
}: {
  icon: LucideIcon;
  size?: number;
  weight?: keyof typeof STROKE;
  className?: string;
}) {
  return (
    <Icon
      size={size}
      strokeWidth={STROKE[weight]}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCount(value: number) {
  return value >= 10_000
    ? compactNumber.format(value)
    : value.toLocaleString("en-NG");
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function humanize(value: string) {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const CHANNEL_COLUMNS =
  "md:grid md:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,1fr))] md:items-center md:gap-4";

const CAMPAIGN_COLUMNS =
  "md:grid md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] md:items-center md:gap-4";

function Growth({ value }: { value: number }) {
  if (value === 0) {
    return <span className="tabular-nums text-[var(--text-muted)]">0</span>;
  }
  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 tabular-nums ${
        up ? "text-[#087d62]" : "text-[#d92d20]"
      }`}
    >
      <Glyph icon={up ? TrendingUp : TrendingDown} size={14} />
      {up ? "+" : ""}
      {value.toLocaleString()}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function StatCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[132px] min-w-0 flex-col gap-3 bg-white p-5">
      <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      <p className="break-words text-2xl font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)] sm:text-3xl">
        {value}
      </p>
      {note ? (
        <p className="-mt-1.5 text-xs font-medium text-[var(--text-muted)]">
          {note}
        </p>
      ) : null}
    </div>
  );
}

function TableCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 md:block">
      <span className="text-xs text-[var(--text-muted)] md:hidden">
        {label}
      </span>
      <span className="text-sm font-semibold tabular-nums text-[var(--woosh-navy)]">
        {children}
      </span>
    </div>
  );
}

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

  const opportunityStats = [
    { label: "Invitations", value: insights.opportunities.invites },
    { label: "Invite views", value: insights.opportunities.inviteViews },
    { label: "Applications", value: insights.opportunities.applications },
    { label: "Accepted", value: insights.opportunities.accepted },
  ];

  const earningStats = [
    {
      label: "Available",
      value: `₦${insights.earnings.available.toLocaleString()}`,
    },
    {
      label: "Processing",
      value: `₦${insights.earnings.processing.toLocaleString()}`,
    },
    { label: "Paid", value: `₦${insights.earnings.paid.toLocaleString()}` },
    {
      label: "Lifetime",
      value: `₦${insights.earnings.total.toLocaleString()}`,
    },
  ];

  const funnelMax = Math.max(0, ...opportunityStats.map((stat) => stat.value));

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
      <div className="w-full space-y-6">
        <section
          aria-label="Overview"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4"
        >
          <StatCell
            label="Followers"
            value={formatCount(totalFollowers)}
            note={
              <span className="inline-flex flex-wrap items-center gap-1">
                <Growth value={totalGrowth} />
                <span>in snapshot range</span>
              </span>
            }
          />
          <StatCell
            label="Profile views"
            value={insights.opportunities.profileViews.toLocaleString()}
          />
          <StatCell
            label="Saves"
            value={insights.opportunities.saves.toLocaleString()}
          />
          <StatCell
            label="MTD earnings"
            value={`₦${insights.earnings.monthToDate.toLocaleString()}`}
          />
        </section>

        <Section title="Channel performance">
          {insights.channels.length ? (
            <>
              <div
                aria-hidden="true"
                className={`hidden border-b border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:px-6 ${CHANNEL_COLUMNS}`}
              >
                <span>Channel</span>
                <span>Followers</span>
                <span>Growth</span>
                <span>Engagement</span>
                <span>Avg views</span>
              </div>

              <ul className="divide-y divide-[var(--woosh-border)]">
                {insights.channels.map((channel) => (
                  <li
                    key={channel.id}
                    className={`flex flex-col gap-3 px-5 py-4 sm:px-6 ${CHANNEL_COLUMNS}`}
                  >
                    <div className="min-w-0">
                      <ChannelMark
                        channel={channel.channel}
                        className="text-xs font-semibold text-[var(--woosh-navy)]"
                      />
                      <p className="mt-1.5 truncate text-sm font-semibold text-[var(--woosh-navy)]">
                        @{channel.handle}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                        {channel.capturedAt
                          ? `Updated ${formatDate(channel.capturedAt)}`
                          : "Pending"}
                        {" · "}
                        {channel.source
                          ? humanize(channel.source)
                          : "Pending"}
                      </p>
                    </div>

                    <TableCell label="Followers">
                      {channel.followers != null
                        ? formatCount(channel.followers)
                        : "—"}
                    </TableCell>

                    <TableCell label="Growth">
                      {channel.growth == null ? (
                        "—"
                      ) : (
                        <Growth value={channel.growth} />
                      )}
                    </TableCell>

                    <TableCell label="Engagement">
                      {channel.engagementRate == null
                        ? "—"
                        : `${channel.engagementRate.toFixed(2)}%`}
                    </TableCell>

                    <TableCell label="Avg views">
                      {channel.averageViews != null
                        ? formatCount(channel.averageViews)
                        : "—"}
                    </TableCell>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-5 sm:p-6">
              <EmptyState
                title="Connect a channel"
                description="Your verified social performance will appear after the first provider sync."
              />
            </div>
          )}
        </Section>

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
          <Section title="Opportunity funnel">
            <ul className="divide-y divide-[var(--woosh-border)]">
              {opportunityStats.map((stat, index) => (
                <li key={stat.label} className="px-5 py-4 sm:px-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {stat.label}
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-[var(--woosh-navy)]">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#12141a]/[0.06]">
                    <div
                      className={`h-full rounded-full ${
                        index === opportunityStats.length - 1
                          ? "bg-[var(--woosh-teal)]"
                          : "bg-[var(--woosh-blue)]"
                      }`}
                      style={{
                        width: `${funnelMax ? (stat.value / funnelMax) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Earnings">
            <ul className="divide-y divide-[var(--woosh-border)]">
              {earningStats.map((stat, index) => (
                <li
                  key={stat.label}
                  className={`flex items-baseline justify-between gap-3 px-5 py-4 sm:px-6 ${
                    index === earningStats.length - 1 ? "bg-[#faf9f7]" : ""
                  }`}
                >
                  <p className="text-sm text-[var(--text-secondary)]">
                    {stat.label}
                  </p>
                  <p
                    className={`break-words text-right font-semibold tabular-nums text-[var(--woosh-navy)] ${
                      index === 0 ? "text-xl" : "text-base"
                    }`}
                  >
                    {stat.value}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="Campaign performance">
          {insights.campaigns.length ? (
            <>
              <div
                aria-hidden="true"
                className={`hidden border-b border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:px-6 ${CAMPAIGN_COLUMNS}`}
              >
                <span>Campaign</span>
                <span>Reach</span>
                <span>Views</span>
                <span>Engagement</span>
              </div>

              <ul className="divide-y divide-[var(--woosh-border)]">
                {insights.campaigns.map((campaign) => (
                  <li
                    key={campaign.id}
                    className={`flex flex-col gap-3 px-5 py-4 sm:px-6 ${CAMPAIGN_COLUMNS}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--woosh-navy)] sm:text-base">
                        {campaign.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                        {campaign.brand} · {humanize(String(campaign.status))}
                      </p>
                    </div>

                    <TableCell label="Reach">
                      {formatCount(campaign.reach)}
                    </TableCell>
                    <TableCell label="Views">
                      {formatCount(campaign.views)}
                    </TableCell>
                    <TableCell label="Engagement">
                      {formatCount(campaign.engagement)}
                    </TableCell>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="p-5 sm:p-6">
              <EmptyState
                title="No campaign analytics yet"
                description="Metrics appear once approved content goes live."
              />
            </div>
          )}
        </Section>
      </div>
    </AppPage>
  );
}