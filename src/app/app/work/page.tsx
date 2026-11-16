import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Inbox,
  Layers3,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getCreatorWorkHub } from "@/domains/work/hub";
import { EmptyState } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/field";
import { AppPage } from "@/components/ui/app-page";
import { ActionForm } from "@/components/ui/action-form";
import { WorkStatus } from "@/components/work/work-status";
import {
  acceptCampaignTermsAction,
  acceptOfferAction,
  counterOfferAction,
  declineInvitationAction,
  startDeliverableAction,
  withdrawApplicationAction,
} from "@/app/actions";
import { splitFee } from "@/domains/payments";

type WorkItem = Awaited<ReturnType<typeof getCreatorWorkHub>>["active"][number];

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the dashboard home)
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
   Filter options (same values the page already accepted)
   ───────────────────────────────────────────────────────────────────────────── */

const STATUS_OPTIONS = [
  { value: "", label: "All active" },
  { value: "SENT", label: "Invited" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "REVISION_REQUESTED", label: "Revision requested" },
  { value: "APPROVED", label: "Approved" },
] as const;

const DEADLINE_OPTIONS = [
  { value: "", label: "Any deadline" },
  { value: "overdue", label: "Overdue" },
  { value: "7-days", label: "Next 7 days" },
  { value: "30-days", label: "Next 30 days" },
] as const;

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

const KIND_ICON: Record<WorkItem["kind"], LucideIcon> = {
  deliverable: Layers3,
  application: BriefcaseBusiness,
  invitation: Inbox,
};

/** Company-logo style marker, the way job boards identify the employer. */
function BrandAvatar({ name }: { name: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f3f0] text-sm font-semibold text-[#12141a]"
    >
      {initials(name)}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  activeValue,
}: {
  label: string;
  options: { value: string; label: string; href: string }[];
  activeValue: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b6d73]">
        {label}
      </p>

      {/* Chips on small screens, a vertical filter list on wide screens */}
      <div className="flex flex-wrap gap-2 xl:flex-col xl:gap-1">
        {options.map((option) => {
          const active = option.value === activeValue;

          return (
            <Link
              key={option.value || "all"}
              href={option.href}
              aria-current={active ? "true" : undefined}
              className={`inline-flex items-center justify-between gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors xl:w-full xl:rounded-lg xl:border-transparent xl:px-3 xl:py-2 ${
                active
                  ? "border-[#12141a] bg-[#12141a] text-white xl:bg-[#12141a]/[0.06] xl:text-[#12141a]"
                  : "border-[var(--woosh-border)] bg-white text-[#3a3c42] hover:bg-[#faf9f7] xl:bg-transparent"
              }`}
            >
              {option.label}
              {active ? (
                <Glyph
                  icon={Check}
                  size={14}
                  className="hidden text-[#12141a] xl:block"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function WorkCard({ item }: { item: WorkItem }) {
  const offerSplit =
    item.kind === "application" && item.offer
      ? splitFee(item.offer.amount)
      : null;

  const kindLabel =
    item.kind === "deliverable"
      ? item.campaignTitle
      : item.kind === "application"
        ? "Application"
        : "Invitation";

  const KindIcon = KIND_ICON[item.kind];

  const isOverdue = item.kind === "deliverable" && item.overdue;

  // Border tone carries urgency: red for overdue, blue for "needs you".
  const tone = isOverdue
    ? "border-[#d92d20]/25 hover:border-[#d92d20]/40"
    : item.actionRequired
      ? "border-[#003af4]/25 hover:border-[#003af4]/40"
      : "border-[var(--woosh-border)] hover:border-[#003af4]/25";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-[var(--shadow-soft)] transition-colors ${tone}`}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-start gap-4">
            <BrandAvatar name={item.brandName} />

            <div className="min-w-0 flex-1">
              <Link
                href={item.href}
                className="block break-words text-base font-semibold tracking-tight text-[#12141a] transition hover:text-[#003af4] hover:underline hover:underline-offset-4"
              >
                {item.title}
              </Link>

              <p className="mt-0.5 text-sm text-[#6b6d73]">{item.brandName}</p>

              <span className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#12141a]/[0.05] px-2.5 py-1 text-xs font-medium text-[#3a3c42]">
                <Glyph icon={KindIcon} size={14} className="text-[#8a8c92]" />
                <span className="truncate">{kindLabel}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:max-w-[45%] sm:justify-end">
            {item.actionRequired ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#003af4]/[0.07] px-2.5 py-1 text-[11px] font-semibold text-[#003af4]">
                <span className="size-1.5 rounded-full bg-[#003af4]" />
                Action required
              </span>
            ) : null}

            <WorkStatus
              status={item.status}
              dueAt={item.dueAt}
              overdue={item.kind === "deliverable" ? item.overdue : false}
            />
          </div>
        </div>

        {item.kind === "deliverable" && item.latestSubmission?.reviewNotes ? (
          <div className="rounded-xl border border-[#9a6700]/15 bg-[#9a6700]/[0.06] px-4 py-3 text-sm leading-6 text-[#805500]">
            <strong>Brand feedback:</strong>{" "}
            {item.latestSubmission.reviewNotes}
          </div>
        ) : null}

        {item.kind === "application" && item.offer && offerSplit ? (
          <dl className="grid grid-cols-3 divide-x divide-[var(--woosh-border)] rounded-xl bg-[#f4f3f0] py-3">
            <div className="px-4">
              <dt className="text-[11px] font-medium text-[#6b6d73]">
                Gross offer
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-[#12141a]">
                {item.offer.amount.toLocaleString()} {item.offer.currency}
              </dd>
            </div>
            <div className="px-4">
              <dt className="text-[11px] font-medium text-[#6b6d73]">
                Platform fee
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-[#12141a]">
                {offerSplit.platformFee.toLocaleString()}
              </dd>
            </div>
            <div className="px-4">
              <dt className="text-[11px] font-medium text-[#6b6d73]">
                Estimated net
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-[#087d62]">
                {offerSplit.net.toLocaleString()}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      {/* Actions live in their own footer, like "Apply" on a job board.
          `empty:hidden` removes the bar when an item has no actions. */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-4 empty:hidden sm:px-6">
        {item.kind === "invitation" && item.actionRequired ? (
          <>
            <ButtonLink href={item.href}>Review and apply</ButtonLink>

            <ActionForm
              action={declineInvitationAction}
              successTitle="Invitation declined"
              className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto"
            >
              <input type="hidden" name="invitationId" value={item.id} />
              <Input name="reason" placeholder="Reason (optional)" />
              <Button type="submit" variant="ghost">
                Decline
              </Button>
            </ActionForm>
          </>
        ) : null}

        {item.kind === "application" && item.offer?.incoming ? (
          <>
            <ActionForm
              action={acceptOfferAction}
              successTitle="Offer accepted"
            >
              <input type="hidden" name="offerId" value={item.offer.id} />
              <Button type="submit">
                Accept {item.offer.amount.toLocaleString()} {item.offer.currency}
              </Button>
            </ActionForm>

            <ActionForm
              action={counterOfferAction}
              successTitle="Counter-offer sent"
              className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto"
            >
              <input type="hidden" name="applicationId" value={item.id} />
              <Input
                name="amount"
                type="number"
                min={1}
                required
                aria-label="Counter-offer amount"
                placeholder="Counter amount"
              />
              <Button type="submit" variant="secondary">
                Counter
              </Button>
            </ActionForm>
          </>
        ) : null}

        {item.kind === "application" &&
        ["APPLIED", "SHORTLISTED"].includes(item.status) ? (
          <ActionForm
            action={withdrawApplicationAction}
            successTitle="Application withdrawn"
            className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto"
          >
            <input type="hidden" name="applicationId" value={item.id} />
            <Input name="reason" placeholder="Reason (optional)" />
            <Button type="submit" variant="ghost">
              Withdraw
            </Button>
          </ActionForm>
        ) : null}

        {item.kind === "deliverable" &&
        !item.termsAccepted &&
        item.status === "NOT_STARTED" ? (
          <ActionForm
            action={acceptCampaignTermsAction}
            successTitle="Campaign terms accepted"
          >
            <input type="hidden" name="campaignId" value={item.campaignId} />
            <input
              type="hidden"
              name="campaignParticipantId"
              value={item.campaignParticipantId}
            />
            <Button type="submit">Accept terms</Button>
          </ActionForm>
        ) : null}

        {item.kind === "deliverable" &&
        item.termsAccepted &&
        item.status === "NOT_STARTED" ? (
          <ActionForm
            action={startDeliverableAction}
            successTitle="Work started"
          >
            <input type="hidden" name="deliverableId" value={item.id} />
            <Button type="submit">Start work</Button>
          </ActionForm>
        ) : null}

        {item.kind === "deliverable" &&
        ["IN_PROGRESS", "REVISION_REQUESTED", "APPROVED", "SCHEDULED"].includes(
          item.status,
        ) ? (
          <ButtonLink href={item.href} variant="secondary">
            Open campaign workspace
            <Glyph icon={ChevronRight} size={16} className="ml-0.5" />
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; deadline?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  const deadline =
    params.deadline === "overdue" ||
    params.deadline === "7-days" ||
    params.deadline === "30-days"
      ? params.deadline
      : undefined;

  const hub = await getCreatorWorkHub(session.user.id, {
    status: params.status || undefined,
    deadline,
  });

  const metrics = [
    {
      label: "Needs action",
      count: hub.counts.actionRequired,
      tone: "accent" as const,
    },
    {
      label: "Invitations",
      count: hub.counts.invitations,
      tone: "default" as const,
    },
    {
      label: "Offers",
      count: hub.counts.offers,
      tone: "default" as const,
    },
    {
      label: "Overdue",
      count: hub.counts.overdue,
      tone: "danger" as const,
    },
  ];

  /* ── Presentation-only: filter links use the same query params the old
        GET form submitted, so the page and hub call behave identically. ── */

  const currentStatus = params.status ?? "";
  const currentDeadline = deadline ?? "";
  const filtersActive = Boolean(currentStatus || currentDeadline);

  const hrefFor = (next: { status?: string; deadline?: string }) => {
    const query = new URLSearchParams();
    const status = "status" in next ? next.status : currentStatus;
    const due = "deadline" in next ? next.deadline : currentDeadline;

    if (status) query.set("status", status);
    if (due) query.set("deadline", due);

    const qs = query.toString();
    return qs ? `/app/work?${qs}` : "/app/work";
  };

  const statusOptions = STATUS_OPTIONS.map((option) => ({
    ...option,
    href: hrefFor({ status: option.value }),
  }));

  const deadlineOptions = DEADLINE_OPTIONS.map((option) => ({
    ...option,
    href: hrefFor({ deadline: option.value }),
  }));

  return (
    <AppPage
      eyebrow="CREATOR WORKSPACE"
      title="Your work"
      description="Manage invitations, negotiate offers and keep every deliverable moving."
    >
      <div className="space-y-6">
        {/* One connected strip instead of four separate boxes */}
        <section
          aria-label="Work summary"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] sm:grid-cols-4"
        >
          {metrics.map((metric) => {
            const valueTone =
              metric.count > 0 && metric.tone === "accent"
                ? "text-[#003af4]"
                : metric.count > 0 && metric.tone === "danger"
                  ? "text-[#d92d20]"
                  : "text-[#12141a]";

            return (
              <div key={metric.label} className="bg-white p-5">
                <p className="text-sm font-medium text-[#6b6d73]">
                  {metric.label}
                </p>
                <p
                  className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${valueTone}`}
                >
                  {metric.count}
                </p>
              </div>
            );
          })}
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
          {/* Filters: chips on mobile, a sticky filter panel on desktop */}
          <aside
            aria-label="Filters"
            className="space-y-5 xl:sticky xl:top-6 xl:rounded-2xl xl:border xl:border-[var(--woosh-border)] xl:bg-white xl:p-4 xl:shadow-[var(--shadow-soft)]"
          >
            <FilterGroup
              label="Status"
              options={statusOptions}
              activeValue={currentStatus}
            />

            <FilterGroup
              label="Deadline"
              options={deadlineOptions}
              activeValue={currentDeadline}
            />

            {filtersActive ? (
              <Link
                href="/app/work"
                className="inline-flex text-sm font-semibold text-[#003af4] hover:underline hover:underline-offset-4"
              >
                Clear filters
              </Link>
            ) : null}
          </aside>

          <div className="min-w-0 space-y-8">
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b6d73]">
                    Your pipeline
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#12141a]">
                    Active work
                  </h2>
                </div>
                <span className="text-sm font-medium text-[#6b6d73] tabular-nums">
                  {hub.active.length}{" "}
                  {hub.active.length === 1 ? "result" : "results"}
                </span>
              </div>

              {hub.active.length ? (
                <div className="grid gap-4">
                  {hub.active.map((item) => (
                    <WorkCard key={`${item.kind}:${item.id}`} item={item} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={
                    filtersActive
                      ? "No work matches these filters"
                      : "You're all caught up"
                  }
                  description={
                    filtersActive
                      ? "Try a different status or deadline, or clear the filters to see everything."
                      : "Browse available jobs while you wait for new invitations or feedback."
                  }
                  action={
                    <Link
                      href={filtersActive ? "/app/work" : "/app/jobs"}
                      className="group inline-flex items-center gap-0.5 font-semibold text-[var(--woosh-blue)]"
                    >
                      {filtersActive ? "Clear filters" : "Browse jobs"}
                      <Glyph
                        icon={ChevronRight}
                        size={16}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  }
                />
              )}
            </section>

            {hub.completed.length ? (
              <section className="space-y-4 border-t border-[var(--woosh-border)] pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b6d73]">
                      Past activity
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#12141a]">
                      Work history
                    </h2>
                  </div>
                  <span className="text-sm font-medium text-[#6b6d73] tabular-nums">
                    {hub.completed.length} completed
                  </span>
                </div>

                <div className="grid gap-4">
                  {hub.completed.map((item) => (
                    <WorkCard key={`${item.kind}:${item.id}`} item={item} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </AppPage>
  );
}