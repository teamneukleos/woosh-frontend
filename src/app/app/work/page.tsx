import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCreatorWorkHub } from "@/domains/work/hub";
import { EmptyState, Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input, Label, Select } from "@/components/ui/field";
import { AppPage, DataToolbar } from "@/components/ui/app-page";
import { Stat } from "@/components/ui/stat";
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

function WorkCard({ item }: { item: WorkItem }) {
  const offerSplit =
    item.kind === "application" && item.offer
      ? splitFee(item.offer.amount)
      : null;
  return (
    <Panel
      className={
        item.actionRequired
          ? "relative border-[var(--woosh-blue)]/25 before:absolute before:inset-y-5 before:left-0 before:w-1 before:rounded-r-full before:bg-[var(--woosh-teal)]"
          : undefined
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="woosh-eyebrow">
            {item.kind === "deliverable"
              ? item.campaignTitle
              : item.kind === "application"
                ? "Application"
                : "Invitation"}
          </p>
          <Link
            href={item.href}
            className="mt-1 block font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
          >
            {item.title}
          </Link>
          <p className="mt-1 text-sm text-[var(--woosh-dull)]/75">
            {item.brandName}
          </p>
        </div>
        <WorkStatus
          status={item.status}
          dueAt={item.dueAt}
          overdue={item.kind === "deliverable" ? item.overdue : false}
        />
      </div>

      {item.kind === "deliverable" && item.latestSubmission?.reviewNotes ? (
        <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning)]">
          <strong>Brand feedback:</strong> {item.latestSubmission.reviewNotes}
        </div>
      ) : null}
      {item.kind === "application" && item.offer && offerSplit ? (
        <p className="mt-3 text-sm text-[var(--woosh-dull)]/75">
          Gross {item.offer.amount.toLocaleString()} {item.offer.currency} ·
          Woosh platform fee {offerSplit.platformFee.toLocaleString()} · your
          estimated net {offerSplit.net.toLocaleString()}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {item.kind === "invitation" && item.actionRequired ? (
          <>
            <ButtonLink href={item.href}>
              Review and apply
            </ButtonLink>
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
                Accept {item.offer.amount.toLocaleString()} {item.offer.currency}
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
            <input
              type="hidden"
              name="campaignId"
              value={item.campaignId}
            />
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
          </ButtonLink>
        ) : null}
      </div>
    </Panel>
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

  return (
    <AppPage
      eyebrow="Creator work hub"
      title="Your work"
      description="Invitations, offers, deliverables and deadlines in one place."
    >
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Needs action", hub.counts.actionRequired],
          ["Invitations", hub.counts.invitations],
          ["Offers", hub.counts.offers],
          ["Overdue", hub.counts.overdue],
        ].map(([label, count]) => (
          <Stat
            key={String(label)}
            label={String(label)}
            value={String(count)}
            tone={label === "Needs action" ? "accent" : "default"}
          />
        ))}
      </section>

      <DataToolbar>
        <form className="grid w-full gap-3 sm:grid-cols-[1fr_1fr_auto]" method="get">
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
      </DataToolbar>

      <section className="grid gap-4">
        <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
          Active work
        </h2>
        {hub.active.length ? (
          hub.active.map((item) => <WorkCard key={`${item.kind}:${item.id}`} item={item} />)
        ) : (
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
        )}
      </section>

      {hub.completed.length ? (
        <section className="grid gap-3">
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
            History
          </h2>
          {hub.completed.map((item) => (
            <WorkCard key={`${item.kind}:${item.id}`} item={item} />
          ))}
        </section>
      ) : null}
    </AppPage>
  );
}
