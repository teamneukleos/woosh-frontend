import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { listCampaignsForUser } from "@/domains/campaign/deliverables";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the dashboard home, work, jobs, invitations and
   applications pages)
   - Thin strokes, icons sit directly on the surface, chevrons for navigation.
   ───────────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────────────
   Presentation helpers
   ───────────────────────────────────────────────────────────────────────────── */

// One column template shared by the header, every row and the totals footer
// so the columns always line up, like Ads Manager.
const COLUMNS =
  "md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_16px] md:items-center md:gap-4";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

function BrandAvatar({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f4f3f0] text-xs font-semibold text-[var(--woosh-navy)]"
    >
      {initials(name)}
    </div>
  );
}

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const campaigns = await listCampaignsForUser(session.user.id);

  const totalDeliverables = campaigns.reduce(
    (total, campaign) => total + campaign.deliverables.length,
    0,
  );

  return (
    <AppPage
      eyebrow="Your workspaces"
      title="Campaigns"
      description="Manage your active brand collaborations, deliverables and campaign timelines."
    >
      {campaigns.length ? (
        /* A campaign table with aligned columns and a totals row, the way
           Facebook Ads Manager lists campaigns, instead of a grid of cards. */
        <section
          aria-label="Your campaigns"
          className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
              Your campaigns
            </h2>
            <p className="text-sm text-[var(--woosh-grey)] tabular-nums">
              {campaigns.length} active{" "}
              {campaigns.length === 1 ? "workspace" : "workspaces"}
            </p>
          </div>

          {/* Column headers (desktop only) */}
          <div
            aria-hidden="true"
            className={`hidden border-b border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--woosh-grey)] sm:px-6 ${COLUMNS}`}
          >
            <span>Campaign</span>
            <span>Status</span>
            <span>Deliverables</span>
            <span>Next deadline</span>
            <span />
          </div>

          <ul className="divide-y divide-[var(--woosh-border)]">
            {campaigns.map((c) => {
              const nextDeadline = c.deliverables
                .filter((deliverable) => deliverable.dueAt)
                .sort(
                  (a, b) =>
                    a.dueAt!.getTime() - b.dueAt!.getTime(),
                )[0]?.dueAt;

              return (
                <li key={c.id}>
                  <Link
                    href={`/app/campaigns/${c.id}`}
                    className={`group flex flex-col gap-3 px-5 py-4 outline-none transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woosh-blue)] sm:px-6 ${COLUMNS}`}
                  >
                    {/* Campaign */}
                    <div className="flex min-w-0 items-center gap-3">
                      <BrandAvatar name={c.brand.name} />
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)] group-hover:underline group-hover:underline-offset-4 sm:text-base">
                          {c.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--woosh-grey)] sm:text-sm">
                          {c.brand.name}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex min-w-0 items-center justify-between gap-3 md:block">
                      <span className="text-xs text-[var(--woosh-grey)] md:hidden">
                        Status
                      </span>
                      <div className="min-w-0">
                        <WorkStatus status={c.status} dueAt={nextDeadline} />
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-xs text-[var(--woosh-grey)] md:hidden">
                        Deliverables
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-[var(--woosh-navy)]">
                        {c.deliverables.length}
                      </span>
                    </div>

                    {/* Next deadline */}
                    <div className="flex items-center justify-between gap-3 md:block">
                      <span className="text-xs text-[var(--woosh-grey)] md:hidden">
                        Next deadline
                      </span>
                      <span className="text-sm text-[var(--woosh-navy)]">
                        {nextDeadline
                          ? nextDeadline.toLocaleDateString("en", {
                              timeZone: "Africa/Lagos",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "No deadline"}
                      </span>
                    </div>

                    <Glyph
                      icon={ChevronRight}
                      size={16}
                      className="hidden text-[#c2c4c9] transition group-hover:translate-x-0.5 group-hover:text-[var(--woosh-blue)] md:block"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Totals row, like the results footer in Ads Manager */}
          <div
            className={`flex items-center justify-between gap-3 border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-3 text-sm font-semibold text-[var(--woosh-navy)] sm:px-6 ${COLUMNS}`}
          >
            <span>
              Total · {campaigns.length}{" "}
              {campaigns.length === 1 ? "campaign" : "campaigns"}
            </span>
            <span className="hidden md:block" />
            <span className="tabular-nums">
              {totalDeliverables}
              <span className="font-normal text-[var(--woosh-grey)] md:hidden">
                {" "}
                {totalDeliverables === 1 ? "deliverable" : "deliverables"}
              </span>
            </span>
            <span className="hidden md:block" />
            <span className="hidden md:block" />
          </div>
        </section>
      ) : (
        <EmptyState
          title="No campaigns yet"
          description="Accept an application to open a campaign workspace."
          action={
            <Link
              href="/app/jobs"
              className="group inline-flex items-center gap-0.5 font-semibold text-[var(--woosh-blue)]"
            >
              Browse jobs
              <Glyph
                icon={ChevronRight}
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          }
        />
      )}
    </AppPage>
  );
}