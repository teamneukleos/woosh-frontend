import Link from "next/link";
import { redirect } from "next/navigation";
import { Banknote, ChevronRight, type LucideIcon } from "lucide-react";

import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listJobsForCreator } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { FilterChips } from "@/components/ui/filter-chips";

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the dashboard home, work and invitations pages)
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Company-logo style marker, the way job boards identify the employer. */
function BrandAvatar({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#f4f3f0] text-sm font-semibold text-[var(--woosh-navy)] sm:size-14 sm:text-base"
    >
      {initials(name)}
    </div>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const { tab } = await searchParams;
  const jobs = await listJobsForCreator(ctx.creatorProfile.id, tab);

  const sectionLabel =
    tab === "invited"
      ? "Your invitations"
      : tab === "applied"
        ? "Your applications"
        : "Available opportunities";

  return (
    <AppPage
      eyebrow="Opportunities"
      title="Find your next collaboration"
      description="Explore brand briefs matched to your channels, category, location and rates."
      width="wide"
      className="w-full max-w-none"
      toolbar={
        <FilterChips
          active={tab ?? ""}
          items={[
            { value: "", label: "All open", href: "/app/jobs" },
            {
              value: "invited",
              label: "Invited",
              href: "/app/jobs?tab=invited",
            },
            {
              value: "applied",
              label: "Applied",
              href: "/app/jobs?tab=applied",
            },
          ]}
        />
      }
    >
      <div className="w-full">
        {jobs.length ? (
          /* One results list with hairline dividers, like a job-board search
             page, instead of a grid of separate lifting cards. */
          <section
            aria-label={sectionLabel}
            className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                {sectionLabel}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] tabular-nums">
                {jobs.length}{" "}
                {jobs.length === 1 ? "opportunity" : "opportunities"} found
              </p>
            </div>

            <ul className="divide-y divide-[var(--woosh-border)]">
              {jobs.map((job) => (
                <li key={job.id} className="min-w-0">
                  <Link
                    href={`/app/jobs/${job.id}`}
                    className="group flex items-start gap-4 px-5 py-5 outline-none transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woosh-blue)] sm:px-6"
                  >
                    <BrandAvatar name={job.brand.name} />

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-base font-semibold leading-snug text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)] group-hover:underline group-hover:underline-offset-4 sm:text-lg">
                        {job.title}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                        {job.brand.name}
                      </p>

                      {/* Pay chip, the way Indeed shows salary under the title */}
                      <p className="mt-3">
                        {job.rateAmount != null ? (
                          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#12141a]/[0.05] px-3 py-1 text-sm">
                            <Glyph
                              icon={Banknote}
                              size={14}
                              className="text-[var(--text-muted)]"
                            />
                            <span className="break-words font-semibold tabular-nums text-[var(--woosh-navy)]">
                              {`${Number(job.rateAmount).toLocaleString()} ${job.currency}`}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">
                              proposed rate
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                            <Glyph
                              icon={Banknote}
                              size={14}
                              className="text-[var(--text-muted)]"
                            />
                            Compensation not specified
                          </span>
                        )}
                      </p>
                    </div>

                    <Glyph
                      icon={ChevronRight}
                      size={18}
                      className="mt-1 hidden text-[#c2c4c9] transition group-hover:translate-x-0.5 group-hover:text-[var(--woosh-blue)] sm:block"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <EmptyState
            title={
              tab === "invited"
                ? "No invitations yet"
                : tab === "applied"
                  ? "No applications yet"
                  : "No opportunities right now"
            }
            description="Relevant brand opportunities will appear here when they're available. Keep your creator profile and connected channels up to date."
            action={
              tab ? (
                <Link
                  href="/app/jobs"
                  className="group inline-flex items-center gap-0.5 font-semibold text-[var(--woosh-blue)]"
                >
                  View all open
                  <Glyph
                    icon={ChevronRight}
                    size={16}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>
              ) : undefined
            }
          />
        )}
      </div>
    </AppPage>
  );
}