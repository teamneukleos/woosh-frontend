import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCampaignsForUser } from "@/domains/campaign/deliverables";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";

// Shared column template so the header, rows and totals line up (desktop only).
const COLUMNS =
  "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_6rem_minmax(0,1.4fr)] md:items-center md:gap-4";

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const campaigns = await listCampaignsForUser(session.user.id);

  return (
    <AppPage
      eyebrow="Execution"
      title="Campaigns"
      description="Active workspaces for accepted creators and deliverables."
    >
      {campaigns.length ? (
        <Panel className="overflow-hidden p-0">
          {/* Column headers */}
          <div
            aria-hidden="true"
            className={`hidden border-b border-[var(--woosh-navy)]/10 bg-[var(--woosh-navy)]/[0.03] px-5 py-2.5 text-xs font-medium text-[var(--woosh-dull)]/70 ${COLUMNS}`}
          >
            <span>Campaign</span>
            <span>Brand</span>
            <span className="text-right">Deliverables</span>
            <span>Status</span>
          </div>

          <ul className="divide-y divide-[var(--woosh-navy)]/10">
            {campaigns.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/app/campaigns/${c.id}`}
                  className={`flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-[var(--woosh-navy)]/[0.03] focus-visible:bg-[var(--woosh-navy)]/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--woosh-navy)] ${COLUMNS}`}
                >
                  <p className="truncate font-semibold text-[var(--woosh-navy)]">
                    {c.title}
                  </p>
                  <p className="truncate text-sm text-[var(--woosh-dull)]/70">
                    {c.brand.name}
                  </p>
                  <p className="text-sm tabular-nums text-[var(--woosh-dull)]/70 md:text-right md:text-[var(--woosh-navy)]">
                    <span>{c.deliverables.length}</span>
                    <span className="md:hidden"> deliverables</span>
                  </p>
                  <div>
                    <WorkStatus
                      status={c.status}
                      dueAt={
                        c.deliverables
                          .filter((deliverable) => deliverable.dueAt)
                          .sort(
                            (a, b) => a.dueAt!.getTime() - b.dueAt!.getTime(),
                          )[0]?.dueAt
                      }
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Totals row */}
          <div
            className={`hidden border-t border-[var(--woosh-navy)]/10 bg-[var(--woosh-navy)]/[0.03] px-5 py-3 text-sm font-medium text-[var(--woosh-navy)] ${COLUMNS}`}
          >
            <span>
              {campaigns.length}{" "}
              {campaigns.length === 1 ? "campaign" : "campaigns"}
            </span>
            <span />
            <span className="text-right tabular-nums">
              {campaigns.reduce((sum, c) => sum + c.deliverables.length, 0)}
            </span>
            <span />
          </div>
        </Panel>
      ) : (
        <EmptyState
          title="No campaigns yet"
          description="Accept an application to open a campaign workspace."
        />
      )}
    </AppPage>
  );
}