import { notFound, redirect } from "next/navigation";
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

  return (
    <AppPage
      eyebrow={brief.brand.name}
      title={brief.title}
      description={brief.description}
      width="narrow"
    >
      <BackLink href="/app/jobs">Jobs</BackLink>
      <Panel>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-1.5 font-medium text-[var(--woosh-navy)]">
            {brief.rateAmount != null
              ? `${Number(brief.rateAmount).toLocaleString()} ${brief.currency}`
              : brief.rateMode.replaceAll("_", " ")}
          </span>
          <span className="rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-1.5 text-[var(--woosh-dull)]">
            {brief.rateMode.replaceAll("_", " ").toLowerCase()}
          </span>
          {brief.channels.length ? (
            <span className="rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-1.5 text-[var(--woosh-dull)]">
              {brief.channels.join(", ")}
            </span>
          ) : null}
        </div>
        <div className="mt-4">
          <WorkStatus
            status={myApp?.status ?? myInvite?.status ?? brief.status}
            dueAt={brief.applicationDeadline}
          />
        </div>

        {brief.eligibility || brief.rights || brief.timing ? (
          <div className="mt-6 grid gap-6">
            {brief.eligibility ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-[var(--woosh-navy)]">
                  Eligibility
                </h2>
                <TermDetails
                  value={brief.eligibility}
                  fallback="Open to matching creators."
                />
              </section>
            ) : null}
            {brief.rights ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-[var(--woosh-navy)]">
                  Usage rights
                </h2>
                <TermDetails
                  value={brief.rights}
                  fallback="As agreed in the campaign conversation."
                />
              </section>
            ) : null}
            {brief.timing ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold text-[var(--woosh-navy)]">
                  Timing
                </h2>
                <TermDetails
                  value={brief.timing}
                  fallback="See the application deadline above."
                />
              </section>
            ) : null}
          </div>
        ) : null}

        {myApp ? (
          <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--woosh-teal)]/40 bg-[var(--woosh-teal)]/10 p-4">
            <p className="font-semibold text-[var(--woosh-navy)]">
              Application: {myApp.status}
            </p>
            {myApp.offers[0] ? (
              <div className="mt-3">
                <p className="text-sm text-[var(--woosh-dull)]">
                  Offer: {Number(myApp.offers[0].amount).toLocaleString()}{" "}
                  {myApp.offers[0].currency} ({myApp.offers[0].status})
                </p>
                {offerSplit ? (
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/75">
                    Woosh platform fee {offerSplit.platformFee.toLocaleString()}{" "}
                    {myApp.offers[0].currency} · estimated creator net{" "}
                    {offerSplit.net.toLocaleString()}{" "}
                    {myApp.offers[0].currency}
                  </p>
                ) : null}
                {["OPEN", "COUNTERED"].includes(myApp.offers[0].status) &&
                myApp.offers[0].createdById !== session.user.id ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                  <ActionForm
                    action={acceptOfferAction}
                    successTitle="Offer accepted"
                  >
                    <input
                      type="hidden"
                      name="offerId"
                      value={myApp.offers[0].id}
                    />
                    <Button type="submit" size="sm">
                      Accept offer
                    </Button>
                  </ActionForm>
                  <ActionForm
                    action={counterOfferAction}
                    successTitle="Counter-offer sent"
                    className="grid w-full min-w-0 gap-2 sm:flex sm:gap-2"
                  >
                    <input
                      type="hidden"
                      name="applicationId"
                      value={myApp.id}
                    />
                    <Input
                      name="amount"
                      type="number"
                      min={1}
                      required
                      placeholder="Counter amount"
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      Counter
                    </Button>
                  </ActionForm>
                  </div>
                ) : null}
              </div>
            ) : null}
            {["APPLIED", "SHORTLISTED"].includes(myApp.status) ? (
              <ActionForm
                action={withdrawApplicationAction}
                successTitle="Application withdrawn"
                className="mt-4 grid w-full gap-2 sm:flex sm:flex-wrap"
              >
                <input
                  type="hidden"
                  name="applicationId"
                  value={myApp.id}
                />
                <Input name="reason" placeholder="Reason (optional)" />
                <Button type="submit" size="sm" variant="ghost">
                  Withdraw application
                </Button>
              </ActionForm>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
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
                rows={2}
              />
            </Label>
            <Button type="submit" className="w-full sm:w-fit">
              Apply
            </Button>
          </ActionForm>
          {myInvite && ["SENT", "VIEWED"].includes(myInvite.status) ? (
            <ActionForm
              action={declineInvitationAction}
              successTitle="Invitation declined"
              className="grid gap-2 border-t border-[var(--woosh-border)] pt-4 sm:flex sm:flex-wrap"
            >
              <input
                type="hidden"
                name="invitationId"
                value={myInvite.id}
              />
              <Input name="reason" placeholder="Reason (optional)" />
              <Button type="submit" variant="ghost">
                Decline invitation
              </Button>
            </ActionForm>
          ) : null}
          </div>
        )}
      </Panel>
    </AppPage>
  );
}
