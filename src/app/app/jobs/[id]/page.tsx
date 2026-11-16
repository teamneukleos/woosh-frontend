
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Handshake,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  getBrief,
  markInvitationViewed,
} from "@/domains/marketplace/briefs";
import {
  acceptOfferAction,
  applyToBriefAction,
  counterOfferAction,
  declineInvitationAction,
  withdrawApplicationAction,
} from "@/app/actions";
import { BackLink } from "@/components/ui/back-link";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Button } from "@/components/ui/button";
import { Input, TextArea, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { WorkStatus } from "@/components/work/work-status";
import { TermDetails } from "@/components/ui/term-details";
import { splitFee } from "@/domains/payments";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const { id } = await params;
  const brief = await getBrief(id, session.user.id);
  if (!brief) notFound();

  await markInvitationViewed({
    briefId: brief.id,
    creatorProfileId: ctx.creatorProfile.id,
    actorUserId: session.user.id,
  });

  const myApp = brief.applications.find(
    (a) => a.creatorProfileId === ctx.creatorProfile!.id,
  );

  const myInvite = brief.invitations.find(
    (invitation) =>
      invitation.creatorProfileId === ctx.creatorProfile!.id,
  );

  const latestOffer = myApp?.offers[0];
  const offerSplit = latestOffer
    ? splitFee(Number(latestOffer.amount))
    : null;

  const canRespondToOffer =
    ["OPEN", "COUNTERED"].includes(latestOffer?.status ?? "") &&
    latestOffer?.createdById !== session.user.id;

  const canWithdraw = ["APPLIED", "SHORTLISTED"].includes(
    myApp?.status ?? "",
  );

  const canDeclineInvitation =
    myInvite && ["SENT", "VIEWED"].includes(myInvite.status);

  return (
    <AppPage
      eyebrow={`${brief.brand.name} · Opportunity`}
      title={brief.title}
      description={brief.description}
      width="wide"
    >
      <div className="space-y-5">
        <BackLink href="/app/jobs">Jobs</BackLink>

        <Panel className="overflow-hidden border-[var(--woosh-border)] p-0">
          <div className="border-b border-[var(--woosh-border)] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--woosh-blue)]/8 px-3 py-1.5 text-xs font-semibold text-[var(--woosh-blue)]">
                <Sparkles className="size-3.5" />
                Brand opportunity
              </span>

              <WorkStatus
                status={myApp?.status ?? myInvite?.status ?? brief.status}
                dueAt={brief.applicationDeadline}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/60 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <Banknote className="size-4" />
                  Compensation
                </div>
                <p className="mt-2 text-lg font-semibold text-[var(--woosh-navy)]">
                  {brief.rateAmount != null
                    ? `${Number(brief.rateAmount).toLocaleString()} ${brief.currency}`
                    : brief.rateMode.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs capitalize text-[var(--text-muted)]">
                  {brief.rateMode.replaceAll("_", " ").toLowerCase()}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/60 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <CalendarDays className="size-4" />
                  Application deadline
                </div>
                <p className="mt-2 text-lg font-semibold text-[var(--woosh-navy)]">
                  {brief.applicationDeadline
                    ? new Date(brief.applicationDeadline).toLocaleDateString(
                        "en",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "Not specified"}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Check the deadline before applying
                </p>
              </div>
            </div>

            {brief.channels.length ? (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Required channels
                </p>
                <div className="flex flex-wrap gap-2">
                  {brief.channels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-lg border border-[var(--woosh-border)] bg-white px-3 py-1.5 text-xs font-medium capitalize text-[var(--woosh-navy)]"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

           {brief.eligibility || brief.rights || brief.timing ? (
              <div className="space-y-6 border-b border-[var(--woosh-border)] p-5 sm:p-6">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="size-4 text-[var(--woosh-blue)]" />
                  <h2 className="text-sm font-semibold text-[var(--woosh-navy)]">
                    Brief requirements
                  </h2>
                </div>

                <div className="grid gap-5">
                  {brief.eligibility ? (
                    <section>
                      <h3 className="mb-2 text-sm font-semibold text-[var(--woosh-navy)]">
                        Eligibility
                      </h3>
                      <TermDetails
                        value={brief.eligibility}
                        fallback="Open to matching creators."
                      />
                    </section>
                  ) : null}

                  {brief.rights ? (
                    <section>
                      <h3 className="mb-2 text-sm font-semibold text-[var(--woosh-navy)]">
                        Usage rights
                      </h3>
                      <TermDetails
                        value={brief.rights}
                        fallback="As agreed in the campaign conversation."
                      />
                    </section>
                  ) : null}

                  {brief.timing ? (
                    <section>
                      <h3 className="mb-2 text-sm font-semibold text-[var(--woosh-navy)]">
                        Timing
                      </h3>
                      <TermDetails
                        value={brief.timing}
                        fallback="See the application deadline above."
                      />
                    </section>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-[var(--woosh-mist)]/35 p-5 sm:p-6">
            {myApp ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-[var(--woosh-blue)]" />
                      <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                        Your application
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Track your application and respond to any offers below.
                    </p>
                  </div>

                  <WorkStatus status={myApp.status} />
                </div>

                {latestOffer ? (
                  <div className="rounded-xl border border-[var(--woosh-border)] bg-white p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          <Handshake className="size-4" />
                          Latest offer
                        </div>
                        <p className="mt-2 text-xl font-semibold text-[var(--woosh-navy)]">
                          {Number(latestOffer.amount).toLocaleString()}{" "}
                          {latestOffer.currency}
                        </p>
                      </div>

                      <span className="rounded-full bg-[var(--woosh-mist)] px-3 py-1 text-xs font-semibold text-[var(--woosh-navy)]">
                        {latestOffer.status}
                      </span>
                    </div>

                    {offerSplit ? (
                      <div className="mt-4 grid gap-3 border-t border-[var(--woosh-border)] pt-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Woosh platform fee
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--woosh-navy)]">
                            {offerSplit.platformFee.toLocaleString()}{" "}
                            {latestOffer.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Estimated creator net
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[var(--woosh-navy)]">
                            {offerSplit.net.toLocaleString()}{" "}
                            {latestOffer.currency}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {canRespondToOffer ? (
                      <div className="mt-5 grid gap-3 border-t border-[var(--woosh-border)] pt-4 sm:flex sm:flex-wrap sm:items-end">
                        <ActionForm
                          action={acceptOfferAction}
                          successTitle="Offer accepted"
                        >
                          <input
                            type="hidden"
                            name="offerId"
                            value={latestOffer.id}
                          />
                          <Button type="submit" size="sm">
                            Accept offer
                          </Button>
                        </ActionForm>

                        <ActionForm
                          action={counterOfferAction}
                          successTitle="Counter-offer sent"
                          className="grid min-w-0 flex-1 gap-2 sm:flex sm:items-end"
                        >
                          <input
                            type="hidden"
                            name="applicationId"
                            value={myApp.id}
                          />
                          <div className="min-w-0 flex-1">
                            <Label>
                              Counter amount
                              <Input
                                name="amount"
                                type="number"
                                min={1}
                                required
                                placeholder="Enter amount"
                              />
                            </Label>
                          </div>
                          <Button type="submit" size="sm" variant="secondary">
                            Send counter
                          </Button>
                        </ActionForm>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--woosh-border)] bg-white p-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Your application has been submitted. There are no offers
                      to respond to yet.
                    </p>
                  </div>
                )}

                {canWithdraw ? (
                  <ActionForm
                    action={withdrawApplicationAction}
                    successTitle="Application withdrawn"
                    className="grid gap-2 border-t border-[var(--woosh-border)] pt-4 sm:flex sm:flex-wrap sm:items-center"
                  >
                    <input
                      type="hidden"
                      name="applicationId"
                      value={myApp.id}
                    />
                    <Input
                      name="reason"
                      placeholder="Reason for withdrawing (optional)"
                    />
                    <Button type="submit" size="sm" variant="ghost">
                      Withdraw application
                    </Button>
                  </ActionForm>
                ) : null}
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-[var(--woosh-blue)]" />
                    <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                      Interested in this opportunity?
                    </h2>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    Send your application to the brand. Share your proposed
                    rate and let them know when you're available.
                  </p>
                </div>

                <ActionForm
                  action={applyToBriefAction}
                  successTitle="Application submitted"
                  className="grid gap-4"
                >
                  <input type="hidden" name="briefId" value={brief.id} />

                  {brief.rateMode !== "FIXED_NON_NEGOTIABLE" ? (
                    <Label>
                      Proposed rate
                      <Input
                        name="proposedRate"
                        type="number"
                        placeholder="Your rate"
                      />
                    </Label>
                  ) : null}

                  <Label>
                    Availability
                    <TextArea
                      name="availabilityNote"
                      placeholder="When can you deliver?"
                      rows={3}
                    />
                  </Label>

                  <Button type="submit" className="w-full sm:w-fit">
                    Submit application
                    <ArrowUpRight className="ml-1 size-4" />
                  </Button>
                </ActionForm>

                {canDeclineInvitation ? (
                  <ActionForm
                    action={declineInvitationAction}
                    successTitle="Invitation declined"
                    className="grid gap-2 border-t border-[var(--woosh-border)] pt-4 sm:flex sm:flex-wrap sm:items-center"
                  >
                    <input
                      type="hidden"
                      name="invitationId"
                      value={myInvite.id}
                    />
                    <Input
                      name="reason"
                      placeholder="Reason (optional)"
                    />
                    <Button type="submit" variant="ghost" size="sm">
                      Decline invitation
                    </Button>
                  </ActionForm>
                ) : null}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </AppPage>
  );
}
