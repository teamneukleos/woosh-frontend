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

  return (
    <AppPage
        eyebrow="Insights"
        title="Analytics"
        description="Logged campaign metrics for the active brand. Add post URLs and views from the campaign workspace."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Reach" value={totals.reach.toLocaleString()} />
        <Stat label="Views" value={totals.views.toLocaleString()} />
        <Stat
          label="Impressions"
          value={totals.impressions.toLocaleString()}
        />
        <Stat
          label="Engagement"
          value={totals.engagement.toLocaleString()}
        />
      </div>

      {campaigns.some((c) => c.metrics.length) ? (
        <Panel title="Recent metrics">
          <ul className="space-y-4">
            {campaigns.flatMap((c) =>
              c.metrics.slice(0, 3).map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--woosh-border)] pb-3 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-[var(--woosh-navy)]">
                      {c.title}
                    </p>
                    <p className="text-xs text-[var(--woosh-dull)]/65">
                      {m.source} · {m.capturedAt.toLocaleString()}
                      {typeof m.raw === "object" &&
                      m.raw &&
                      "postUrl" in m.raw
                        ? ` · ${String((m.raw as { postUrl?: string }).postUrl)}`
                        : ""}
                    </p>
                  </div>
                  <Badge tone="teal">
                    {(m.views ?? m.reach ?? 0).toLocaleString()} views/reach
                  </Badge>
                </li>
              )),
            )}
          </ul>
        </Panel>
      ) : (
        <EmptyState
          title="No metrics yet"
          description="Open a campaign and log a live post URL with views to populate this page."
        />
      )}
    </AppPage>
  );
}
