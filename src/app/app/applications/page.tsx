import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listJobsForCreator } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { withdrawApplicationAction } from "@/app/actions";

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the dashboard home, work, invitations and jobs pages)
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

/** Company-logo style marker, the way LinkedIn identifies the employer. */
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

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const jobs = await listJobsForCreator(ctx.creatorProfile.id, "applied");

  const apps = jobs.flatMap((job) =>
    job.myApplication
      ? [
          {
            id: job.myApplication.id,
            briefId: job.id,
            status: job.myApplication.status,
            proposedRate: job.myApplication.proposedRate ?? null,
            currency: job.myApplication.currency ?? job.currency,
            brief: {
              title: job.title,
              brand: job.brand,
              applicationDeadline: job.applicationDeadline
                ? new Date(job.applicationDeadline)
                : null,
            },
            offers: [] as Array<{ amount: number; currency: string }>,
          },
        ]
      : [],
  );

  return (
    <AppPage
      eyebrow="Your pipeline"
      title="Applications"
      description="Keep track of the opportunities you've applied for and where each one stands."
    >
      {apps.length ? (
        /* One list with hairline dividers, like LinkedIn's "Applied" tab,
           instead of a separate lifting card per application. */
        <section
          aria-label="Your applications"
          className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                Your applications
              </h2>
              <span className="rounded-full bg-[var(--woosh-blue)]/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--woosh-blue)]">
                {apps.length}
              </span>
            </div>

            <Link
              href="/app/jobs"
              className="group inline-flex items-center gap-0.5 text-sm font-semibold text-[var(--woosh-blue)]"
            >
              Explore more jobs
              <Glyph
                icon={ChevronRight}
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ul className="divide-y divide-[var(--woosh-border)]">
            {apps.map((app) => (
              <li
                key={app.id}
                className="p-5 transition-colors hover:bg-[#faf9f7] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <BrandAvatar name={app.brief.brand.name} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <Link
                          href={`/app/jobs/${app.briefId}`}
                          className="block"
                        >
                          <h3 className="break-words text-base font-semibold leading-snug text-[var(--woosh-navy)] transition-colors hover:text-[var(--woosh-blue)] hover:underline hover:underline-offset-4 sm:text-lg">
                            {app.brief.title}
                          </h3>
                        </Link>

                        <p className="mt-1 text-sm font-medium text-[var(--woosh-grey)]">
                          {app.brief.brand.name}
                        </p>
                      </div>

                      <div className="sm:shrink-0">
                        <WorkStatus
                          status={app.status}
                          dueAt={app.brief.applicationDeadline}
                        />
                      </div>
                    </div>

                    {/* Key details on one line, like the metadata under a
                        LinkedIn job title, instead of two shaded tiles. */}
                    <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-[var(--woosh-grey)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Glyph
                          icon={Banknote}
                          size={16}
                          className="text-[var(--text-muted)]"
                        />
                        Proposed rate:
                        <span className="font-semibold tabular-nums text-[var(--woosh-navy)]">
                          {app.proposedRate != null
                            ? `${Number(app.proposedRate).toLocaleString()} ${app.currency}`
                            : "Not specified"}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Glyph
                          icon={CalendarDays}
                          size={16}
                          className="text-[var(--text-muted)]"
                        />
                        Deadline:
                        <span className="font-semibold text-[var(--woosh-navy)]">
                          {app.brief.applicationDeadline
                            ? app.brief.applicationDeadline.toLocaleDateString(
                                "en",
                                {
                                  timeZone: "Africa/Lagos",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "No deadline"}
                        </span>
                      </span>
                    </p>

                    {app.offers[0] ? (
                      <p className="mt-3">
                        <span className="inline-flex items-center rounded-full bg-[#0de3af]/15 px-3 py-1 text-sm font-semibold tabular-nums text-[#087d62]">
                          Offer: {Number(app.offers[0].amount).toLocaleString()}{" "}
                          {app.offers[0].currency}
                        </span>
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={`/app/jobs/${app.briefId}`}
                        className="group inline-flex items-center gap-0.5 text-sm font-semibold text-[var(--woosh-blue)]"
                      >
                        View application
                        <Glyph
                          icon={ChevronRight}
                          size={16}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </Link>

                      {["APPLIED", "SHORTLISTED"].includes(app.status) ? (
                        <ActionForm
                          action={withdrawApplicationAction}
                          successTitle="Application withdrawn"
                          className="flex flex-col gap-2 sm:flex-row sm:items-center"
                        >
                          <input
                            type="hidden"
                            name="applicationId"
                            value={app.id}
                          />
                          <Input
                            name="reason"
                            placeholder="Reason (optional)"
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            Withdraw application
                          </Button>
                        </ActionForm>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Browse open jobs and apply to get on a brand’s shortlist."
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