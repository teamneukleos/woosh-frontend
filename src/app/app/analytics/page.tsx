import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ExternalLink, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listBrandCampaignMetrics } from "@/domains/analytics";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { hasPermission } from "@/lib/permissions";

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

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function humanize(value: string) {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function postUrlOf(raw: unknown) {
  if (typeof raw === "object" && raw && "postUrl" in raw) {
    const value = (raw as { postUrl?: unknown }).postUrl;
    return typeof value === "string" && value ? value : null;
  }
  return null;
}

function StatCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
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

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");
  if (
    !ctx.user.isPlatformAdmin &&
    (!ctx.membership ||
      !hasPermission(ctx.membership.role, "analytics.view"))
  ) {
    redirect("/app");
  }
  if (!ctx.activeBrandId) {
    return (
      <AppPage
        eyebrow="Insights"
        title="Analytics"
        description="Select a brand workspace to view campaign performance."
      >
        <EmptyState
          title="Select a brand"
          description="Analytics are scoped to the active brand."
        />
      </AppPage>
    );
  }

  const { campaigns, totals } = await listBrandCampaignMetrics(
    ctx.activeBrandId,
  );

  const withMetrics = campaigns.filter((c) => c.metrics.length);

  const engagementNote =
    totals.reach > 0
      ? `${((totals.engagement / totals.reach) * 100).toFixed(1)}% of reach`
      : undefined;

  return (
    <AppPage
      eyebrow="Insights"
      title="Analytics"
      description="Logged campaign metrics for the active brand. Add post URLs and views from the campaign workspace."
    >
      <div className="w-full space-y-6">
        <section
          aria-label="Campaign totals"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4"
        >
          <StatCell label="Reach" value={formatCount(totals.reach)} />
          <StatCell label="Views" value={formatCount(totals.views)} />
          <StatCell
            label="Impressions"
            value={formatCount(totals.impressions)}
          />
          <StatCell
            label="Engagement"
            value={formatCount(totals.engagement)}
            note={engagementNote}
          />
        </section>

        {withMetrics.length ? (
          <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                Recent metrics
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                The latest logged posts for each campaign.
              </p>
            </div>

            {withMetrics.map((c, index) => (
              <div
                key={`${c.title}-${index}`}
                className="border-b border-[var(--woosh-border)] last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3 bg-[#faf9f7] px-5 py-2.5 sm:px-6">
                  <p className="min-w-0 truncate text-sm font-semibold text-[var(--woosh-navy)]">
                    {c.title}
                  </p>
                  <p className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
                    {c.metrics.length} logged
                  </p>
                </div>

                <ul className="divide-y divide-[var(--woosh-border)]">
                  {c.metrics.slice(0, 3).map((m) => {
                    const postUrl = postUrlOf(m.raw);
                    const isLink = postUrl ? /^https?:\/\//i.test(postUrl) : false;
                    const figure = m.views ?? m.reach ?? 0;

                    return (
                      <li
                        key={m.id}
                        className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                            {humanize(String(m.source))}
                          </p>
                          <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-muted)]">
                            <span>{formatDateTime(m.capturedAt)}</span>
                            {postUrl ? (
                              <>
                                <span aria-hidden="true">·</span>
                                {isLink ? (
                                  <a
                                    href={postUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-w-0 max-w-full items-center gap-1 text-[var(--woosh-blue)] hover:underline hover:underline-offset-4"
                                  >
                                    <span className="truncate">
                                      {postUrl.replace(/^https?:\/\//i, "")}
                                    </span>
                                    <Glyph icon={ExternalLink} size={12} />
                                  </a>
                                ) : (
                                  <span className="truncate">{postUrl}</span>
                                )}
                              </>
                            ) : null}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm tabular-nums text-[var(--text-secondary)]">
                          <span className="text-lg font-semibold text-[var(--woosh-navy)]">
                            {formatCount(figure)}
                          </span>{" "}
                          {m.views != null ? "views" : "reach"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        ) : (
          <EmptyState
            title="No metrics yet"
            description="Open a campaign and log a live post URL with views to populate this page."
            action={
              <Link
                href="/app/campaigns"
                className="group inline-flex items-center gap-0.5 font-semibold text-[var(--woosh-blue)]"
              >
                Go to campaigns
                <Glyph
                  icon={ChevronRight}
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>
            }
          />
        )}
      </div>
    </AppPage>
  );
}