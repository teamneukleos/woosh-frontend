
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listBrandCampaignMetrics } from "@/domains/analytics";
import { Panel, EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/permissions";

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
        width="wide"
        className="w-full max-w-none"
      >
        <div className="rounded-2xl border border-dashed border-[var(--woosh-border)] bg-white px-6 py-12">
          <EmptyState
            title="Select a brand"
            description="Analytics are scoped to the active brand."
          />
        </div>
      </AppPage>
    );
  }

  const { campaigns, totals } = await listBrandCampaignMetrics(
    ctx.activeBrandId,
  );

  return (
    <AppPage
      eyebrow="Insights"
      title="Analytics"
      description="Logged campaign metrics for the active brand. Add post URLs and views from the campaign workspace."
      width="wide"
      className="w-full max-w-none"
    >
      <div className="w-full space-y-7">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--woosh-blue)]/[0.06]" />
            <p className="text-sm font-medium text-[var(--woosh-dull)]/75">
              Reach
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--woosh-navy)]">
              {totals.reach.toLocaleString()}
            </p>
            <div className="mt-4 h-1 w-10 rounded-full bg-[var(--woosh-blue)]" />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--woosh-blue)]/[0.06]" />
            <p className="text-sm font-medium text-[var(--woosh-dull)]/75">
              Views
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--woosh-navy)]">
              {totals.views.toLocaleString()}
            </p>
            <div className="mt-4 h-1 w-10 rounded-full bg-[var(--woosh-blue)]" />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--woosh-teal)]/[0.09]" />
            <p className="text-sm font-medium text-[var(--woosh-dull)]/75">
              Impressions
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--woosh-navy)]">
              {totals.impressions.toLocaleString()}
            </p>
            <div className="mt-4 h-1 w-10 rounded-full bg-[var(--woosh-teal)]" />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--woosh-blue)]/[0.06]" />
            <p className="text-sm font-medium text-[var(--woosh-dull)]/75">
              Engagement
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--woosh-navy)]">
              {totals.engagement.toLocaleString()}
            </p>
            <div className="mt-4 h-1 w-10 rounded-full bg-[var(--woosh-blue)]" />
          </div>
        </section>

        {campaigns.some((c) => c.metrics.length) ? (
          <Panel title="Recent metrics">
            <ul className="divide-y divide-[var(--woosh-border)]">
              {campaigns.flatMap((c) =>
                c.metrics.slice(0, 3).map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--woosh-blue)]/[0.07] text-[var(--woosh-blue)]">
                        <span className="text-sm font-bold">↗</span>
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-semibold text-[var(--woosh-navy)]">
                          {c.title}
                        </p>
                        <p className="mt-1 break-words text-xs leading-5 text-[var(--woosh-dull)]/65">
                          {m.source} · {new Date(m.capturedAt).toLocaleString()}
                          {typeof m.raw === "object" &&
                          m.raw &&
                          "postUrl" in m.raw
                            ? ` · ${String((m.raw as { postUrl?: string }).postUrl)}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center sm:justify-end">
                      <Badge tone="teal">
                        {(m.views ?? m.reach ?? 0).toLocaleString()} views/reach
                      </Badge>
                    </div>
                  </li>
                )),
              )}
            </ul>
          </Panel>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--woosh-border)] bg-white px-6 py-12">
            <EmptyState
              title="No metrics yet"
              description="Open a campaign and log a live post URL with views to populate this page."
            />
          </div>
        )}
      </div>
    </AppPage>
  );
}
