import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Layers, Mail, MessageSquare, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCreatorWorkHub } from "@/domains/work/hub";
import { EmptyState } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input, Label, Select } from "@/components/ui/field";
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

const KIND_ICON: Record<string, LucideIcon> = {
  invitation: Mail,
  application: FileText,
  deliverable: Layers,
};

type WorkItem = Awaited<ReturnType<typeof getCreatorWorkHub>>["active"][number];

function WorkCard({ item, muted = false }: { item: WorkItem; muted?: boolean }) {
  const offerSplit =
    item.kind === "application" && item.offer
      ? splitFee(item.offer.amount)
      : null;

  const hasActions =
    (item.kind === "invitation" && item.actionRequired) ||
    (item.kind === "application" && !!item.offer?.incoming) ||
    (item.kind === "application" &&
      ["APPLIED", "SHORTLISTED"].includes(item.status)) ||
    (item.kind === "deliverable" &&
      item.status === "NOT_STARTED") ||
    (item.kind === "deliverable" &&
      ["IN_PROGRESS", "REVISION_REQUESTED", "APPROVED", "SCHEDULED"].includes(
        item.status,
      ));

  const kindLabel =
    item.kind === "deliverable"
      ? item.campaignTitle
      : item.kind === "application"
        ? "Application"
        : "Invitation";

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)] ${
        muted ? "opacity-80" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <Glyph
            icon={KIND_ICON[item.kind] ?? Layers}
            className="mt-1 text-[#9b9da3]"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              {item.actionRequired ? (
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-[var(--woosh-blue)]"
                />
              ) : null}
              <span className="truncate">{kindLabel}</span>
            </p>
            <Link
              href={item.href}
              className="mt-1 block text-[0.9375rem] font-semibold text-[var(--woosh-navy)] transition-colors hover:text-[var(--woosh-blue)] sm:text-base"
            >
              {item.title}
            </Link>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {item.brandName}
            </p>
          </div>
        </div>
        <WorkStatus
          status={item.status}
          dueAt={item.dueAt}
          overdue={item.kind === "deliverable" ? item.overdue : false}
        />
      </div>

      {item.kind === "deliverable" && item.latestSubmission?.reviewNotes ? (
        <div className="mx-5 mb-4 flex items-start gap-3 rounded-xl bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning)] sm:mx-6">
          <Glyph icon={MessageSquare} size={16} className="mt-0.5" />
          <p className="min-w-0">
            <strong>Brand feedback:</strong>{" "}
            {item.latestSubmission.reviewNotes}
          </p>
        </div>
      ) : null}
      {item.kind === "application" && item.offer && offerSplit ? (
        <p className="mx-5 mb-4 text-sm text-[var(--text-secondary)] sm:mx-6">
          Gross {item.offer.amount.toLocaleString()} {item.offer.currency} ·
          Woosh platform fee {offerSplit.platformFee.toLocaleString()} · your
          estimated net {offerSplit.net.toLocaleString()}
        </p>
      ) : null}

      {hasActions ? (
        <div className="flex flex-wrap gap-2 border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-3.5 sm:px-6">
          {item.kind === "invitation" && item.actionRequired ? (
            <>
              <ButtonLink href={item.href}>Review and apply</ButtonLink>
              <ActionForm
                action={declineInvitationAction}
                successTitle="Invitation declined"
                className="grid w-full min-w-0 gap-2 sm:flex"
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
                  Accept {item.offer.amount.toLocaleString()}{" "}
                  {item.offer.currency}
                </Button>
              </ActionForm>
              <ActionForm
                action={counterOfferAction}
                successTitle="Counter-offer sent"
                className="grid w-full min-w-0 gap-2 sm:flex sm:flex-wrap"
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
              className="grid w-full min-w-0 gap-2 sm:flex sm:flex-wrap"
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
          [
            "IN_PROGRESS",
            "REVISION_REQUESTED",
            "APPROVED",
            "SCHEDULED",
          ].includes(item.status) ? (
            <ButtonLink href={item.href} variant="secondary">
              Open campaign workspace
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function GroupHeading({ title, count }: { title: string; count: number }) {
  return (
    <h2 className="flex items-baseline gap-2 text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
      {title}
      <span className="text-sm font-medium tabular-nums text-[var(--text-muted)]">
        {count}
      </span>
    </h2>
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

  const needsAction = hub.active.filter((item) => item.actionRequired);
  const inProgress = hub.active.filter((item) => !item.actionRequired);

  const summary = [
    {
      label: "Needs action",
      value: hub.counts.actionRequired,
      note: "Waiting on you",
      highlight: hub.counts.actionRequired > 0,
    },
    {
      label: "Invitations",
      value: hub.counts.invitations,
      note: "To respond to",
    },
    {
      label: "Offers",
      value: hub.counts.offers,
      note: "To review",
    },
    {
      label: "Overdue",
      value: hub.counts.overdue,
      note: "Past their deadline",
      highlight: hub.counts.overdue > 0,
      href: "/app/work?deadline=overdue",
    },
  ];

  return (
    <AppPage
      eyebrow="Creator work hub"
      title="Your work"
      description="Invitations, offers, deliverables and deadlines in one place."
    >
      <div className="w-full space-y-6">
        <section
          aria-label="At a glance"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4"
        >
          {summary.map((cell) => {
            const body = (
              <>
                <p className="text-sm font-medium text-[var(--text-muted)]">
                  {cell.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)]">
                  {cell.value}
                </p>
                <p
                  className={`text-xs font-medium ${
                    cell.highlight
                      ? "text-[var(--woosh-blue)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {cell.note}
                </p>
              </>
            );
            return cell.href ? (
              <Link
                key={cell.label}
                href={cell.href}
                className="flex min-w-0 flex-col gap-3 bg-white p-5 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none"
              >
                {body}
              </Link>
            ) : (
              <div
                key={cell.label}
                className="flex min-w-0 flex-col gap-3 bg-white p-5"
              >
                {body}
              </div>
            );
          })}
        </section>

        <div className="rounded-2xl border border-[var(--woosh-border)] bg-white px-5 py-4 shadow-[var(--shadow-soft)] sm:px-6">
          <form
            className="grid w-full gap-3 sm:grid-cols-[1fr_1fr_auto]"
            method="get"
          >
            <Label>
              Status
              <Select name="status" defaultValue={params.status ?? ""}>
                <option value="">All active statuses</option>
                <option value="SENT">Invited</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REVISION_REQUESTED">Revision requested</option>
                <option value="APPROVED">Approved</option>
              </Select>
            </Label>
            <Label>
              Deadline
              <Select name="deadline" defaultValue={deadline ?? ""}>
                <option value="">Any deadline</option>
                <option value="overdue">Overdue</option>
                <option value="7-days">Next 7 days</option>
                <option value="30-days">Next 30 days</option>
              </Select>
            </Label>
            <Button type="submit" variant="secondary" className="self-end">
              Filter
            </Button>
          </form>
        </div>

        {hub.active.length ? (
          <>
            {needsAction.length ? (
              <section className="grid gap-3">
                <GroupHeading title="Needs action" count={needsAction.length} />
                {needsAction.map((item) => (
                  <WorkCard key={`${item.kind}:${item.id}`} item={item} />
                ))}
              </section>
            ) : null}
            {inProgress.length ? (
              <section className="grid gap-3">
                <GroupHeading
                  title={needsAction.length ? "In progress" : "Active work"}
                  count={inProgress.length}
                />
                {inProgress.map((item) => (
                  <WorkCard key={`${item.kind}:${item.id}`} item={item} />
                ))}
              </section>
            ) : null}
          </>
        ) : (
          <section className="grid gap-3">
            <GroupHeading title="Active work" count={0} />
            <EmptyState
              title="You’re caught up"
              description="Browse jobs while you wait for new invitations or feedback."
              action={
                <Link
                  href="/app/jobs"
                  className="font-semibold text-[var(--woosh-blue)]"
                >
                  Browse jobs
                </Link>
              }
            />
          </section>
        )}

        {hub.completed.length ? (
          <section className="grid gap-3">
            <GroupHeading title="History" count={hub.completed.length} />
            {hub.completed.map((item) => (
              <WorkCard key={`${item.kind}:${item.id}`} item={item} muted />
            ))}
          </section>
        ) : null}
      </div>
    </AppPage>
  );
}