import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Mail,
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
import { declineInvitationAction } from "@/app/actions";
import { ButtonLink } from "@/components/ui/button-link";

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the dashboard home and work page)
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

/** Brand marker, the way an inbox row shows who the invite is from. */
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

export default async function InvitationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const jobs = await listJobsForCreator(ctx.creatorProfile.id, "invited");

  const invites = jobs.flatMap((job) =>
    job.myInvitation
      ? [
          {
            id: job.myInvitation.id,
            briefId: job.id,
            status: job.myInvitation.status,
            message: job.myInvitation.message,
            brief: {
              title: job.title,
              brand: job.brand,
              applicationDeadline: job.applicationDeadline
                ? new Date(job.applicationDeadline)
                : null,
            },
          },
        ]
      : [],
  );

  const actionableCount = invites.filter((inv) =>
    ["SENT", "VIEWED"].includes(inv.status),
  ).length;

  return (
    <AppPage
      eyebrow="Opportunities"
      title="Brand invitations"
      description="Discover brands that want to work with you. Review their invitations and decide which opportunities to pursue."
      width="wide"
      className="w-full max-w-none"
    >
      <div className="w-full">
        {invites.length ? (
          /* One inbox container with hairline dividers, like LinkedIn's
             invitation manager, instead of a separate card per invite. */
          <section
            aria-label="Invitations"
            className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                  Invitations
                </h2>
                <span className="rounded-full bg-[var(--woosh-blue)]/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--woosh-blue)]">
                  {invites.length}
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)]">
                {actionableCount
                  ? `${actionableCount} ${actionableCount === 1 ? "invitation needs" : "invitations need"} your attention`
                  : "You're all caught up"}
              </p>
            </div>

            <ul className="divide-y divide-[var(--woosh-border)]">
              {invites.map((inv) => {
                const canRespond = ["SENT", "VIEWED"].includes(inv.status);

                return (
                  <li
                    key={inv.id}
                    className="p-5 transition-colors hover:bg-[#faf9f7] sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <BrandAvatar name={inv.brief.brand.name} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <Link
                              href={`/app/jobs/${inv.briefId}`}
                              className="inline-flex max-w-full items-center gap-2"
                            >
                              {canRespond ? (
                                <span
                                  aria-hidden="true"
                                  className="size-2 shrink-0 rounded-full bg-[var(--woosh-blue)]"
                                />
                              ) : null}
                              <h3 className="break-words text-base font-semibold leading-snug text-[var(--woosh-navy)] transition-colors hover:text-[var(--woosh-blue)] hover:underline hover:underline-offset-4 sm:text-lg">
                                {inv.brief.title}
                              </h3>
                            </Link>

                            <p className="mt-1 text-sm font-medium text-[var(--text-secondary)]">
                              {inv.brief.brand.name}
                            </p>

                            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                              <span className="inline-flex items-center gap-1.5">
                                <Glyph
                                  icon={Mail}
                                  size={14}
                                  className="text-[var(--text-muted)]"
                                />
                                Direct invitation
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Glyph
                                  icon={CalendarDays}
                                  size={14}
                                  className="text-[var(--text-muted)]"
                                />
                                {inv.brief.applicationDeadline
                                  ? `Apply by ${inv.brief.applicationDeadline.toLocaleDateString(
                                      "en",
                                      {
                                        timeZone: "Africa/Lagos",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}`
                                  : "No application deadline"}
                              </span>
                            </p>
                          </div>

                          <div className="shrink-0 self-start">
                            <WorkStatus
                              status={inv.status}
                              dueAt={inv.brief.applicationDeadline}
                            />
                          </div>
                        </div>

                        {inv.message ? (
                          <div className="mt-4 border-l-2 border-[var(--woosh-border)] pl-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                              Message from the brand
                            </p>
                            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--woosh-navy)]">
                              {inv.message}
                            </p>
                          </div>
                        ) : null}

                        <div className="mt-5">
                          {canRespond ? (
                            <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
                              <ButtonLink
                                href={`/app/jobs/${inv.briefId}`}
                                size="sm"
                                className="w-full justify-center lg:w-auto"
                              >
                                Review invitation
                                <Glyph
                                  icon={ChevronRight}
                                  size={16}
                                  className="ml-0.5"
                                />
                              </ButtonLink>

                              <ActionForm
                                action={declineInvitationAction}
                                successTitle="Invitation declined"
                                className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:w-auto"
                              >
                                <input
                                  type="hidden"
                                  name="invitationId"
                                  value={inv.id}
                                />
                                <Input
                                  name="reason"
                                  placeholder="Reason (optional)"
                                  className="w-full sm:w-48"
                                />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  Decline
                                </Button>
                              </ActionForm>
                            </div>
                          ) : (
                            <Link
                              href={`/app/jobs/${inv.briefId}`}
                              className="group inline-flex items-center gap-0.5 text-sm font-semibold text-[var(--woosh-blue)]"
                            >
                              View invitation
                              <Glyph
                                icon={ChevronRight}
                                size={16}
                                className="transition group-hover:translate-x-0.5"
                              />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <EmptyState
            title="No invitations yet"
            description="When brands invite you to collaborate on a brief, their invitations will appear here."
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
      </div>
    </AppPage>
  );
}