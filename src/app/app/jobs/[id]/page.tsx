
import { notFound, redirect } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Share2,
  ShieldCheck,
  Tag,
  UserCheck,
  type LucideIcon,
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
import { AppPage } from "@/components/ui/app-page";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input, TextArea, Label } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { WorkStatus } from "@/components/work/work-status";
import { TermDetails } from "@/components/ui/term-details";
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

function humanize(value: string) {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const RATE_LABELS: Record<string, string> = {
  FIXED_NON_NEGOTIABLE: "Fixed (non-negotiable)",
  FIXED_NEGOTIABLE: "Fixed (negotiable)",
  RANGE_NEGOTIABLE: "Range negotiable",
  DELIVERABLE_BASED: "Priced by deliverable",
  CREATOR_BUNDLE: "Creator bundle",
};

const CHANNEL_LABELS: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
};

function rateLabel(mode: string) {
  return RATE_LABELS[mode] ?? humanize(mode);
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailBlock({
  icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-6 sm:px-7 lg:px-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--surface-subtle)]">
          <Glyph icon={icon} size={17} className="text-[var(--text-muted)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--woosh-navy)]">
          {title}
        </h3>
      </div>
      <div className="pl-0 sm:pl-12">{children}</div>
    </section>
  );
}

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

  const summary: { label: string; value: string; icon: LucideIcon }[] = [
    {
      label: "Compensation",
      icon: Banknote,
      value:
        brief.rateAmount != null
          ? `${Number(brief.rateAmount).toLocaleString()} ${brief.currency}`
          : rateLabel(brief.rateMode),
    },
    { label: "Rate type", icon: Tag, value: rateLabel(brief.rateMode) },
    ...(brief.channels.length
      ? [
          {
            label: "Channels",
            icon: Share2,
            value: brief.channels
              .map((channel) => CHANNEL_LABELS[channel] ?? humanize(channel))
              .join(", "),
          },
        ]
      : []),
    {
      label: "Apply by",
      icon: CalendarDays,
      value: brief.applicationDeadline
        ? formatDate(brief.applicationDeadline)
        : "No deadline",
    },
  ];

  const hasDetails = Boolean(brief.eligibility || brief.rights || brief.timing);

  return (
    <AppPage
      eyebrow={brief.brand.name}
      title={brief.title}
      description={brief.description}
      width="wide"
      className="w-full !max-w-none gap-7"
    >
      <BackLink href="/app/jobs">Jobs</BackLink>

      <section
        aria-label="Brief summary"
        className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summary.map((item, index) => (
          <div
            key={item.label}
            className={`relative min-w-0 rounded-2xl border p-5 sm:p-6 ${
              index === 0
                ? "border-[var(--woosh-teal)]/30 bg-[var(--woosh-teal)]/[0.06]"
                : "border-[var(--woosh-border)] bg-white"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] sm:text-sm">
              <Glyph
                icon={item.icon}
                size={15}
                className={index === 0 ? "text-[var(--woosh-teal)]" : ""}
              />
              {item.label}
            </div>
            <p
              className={`mt-3 break-words font-semibold tracking-tight text-[var(--woosh-navy)] ${
                index === 0
                  ? "text-xl sm:text-2xl"
                  : "text-base sm:text-lg"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <div className="grid w-full items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] 2xl:gap-8">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="border-b border-[var(--woosh-border)] px-5 py-5 sm:px-7 lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Campaign overview
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--woosh-navy)] sm:text-xl">
                Brief details
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                Everything you need to know about this opportunity and what the
                brand expects from creators.
              </p>
            </div>

            {hasDetails ? (
              <div className="divide-y divide-[var(--woosh-border)]">
                {brief.eligibility ? (
                  <DetailBlock icon={UserCheck} title="Eligibility">
                    <TermDetails
                      value={brief.eligibility}
                      fallback="Open to matching creators."
                    />
                  </DetailBlock>
                ) : null}

                {brief.rights ? (
                  <DetailBlock icon={ShieldCheck} title="Usage rights">
                    <TermDetails
                      value={brief.rights}
                      fallback="As agreed in the campaign conversation."
                    />
                  </DetailBlock>
                ) : null}

                {brief.timing ? (
                  <DetailBlock icon={CalendarDays} title="Timing">
                    <TermDetails
                      value={brief.timing}
                      fallback="See the application deadline above."
                    />
                  </DetailBlock>
                ) : null}
              </div>
            ) : (
              <div className="px-5 py-12 text-center sm:px-8">
                <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[var(--surface-subtle)]">
                  <Glyph
                    icon={AlertCircle}
                    size={20}
                    className="text-[var(--text-muted)]"
                  />
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  No additional requirements were listed for this brief.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="order-first min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)] xl:sticky xl:top-6 xl:order-none">
          <div className="border-b border-[var(--woosh-border)] bg-[var(--surface-subtle)]/50 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]">
                  Next step
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--woosh-navy)]">
                  Your application
                </h2>
              </div>
              <WorkStatus
                status={myApp?.status ?? myInvite?.status ?? brief.status}
                dueAt={brief.applicationDeadline}
              />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {ctx.creatorProfile.marketplaceStatus !== "PUBLISHED" && !myApp ? (
              <div className="grid gap-4">
                <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning-soft)] p-4">
                  <div className="flex items-start gap-3">
                    <Glyph
                      icon={AlertCircle}
                      size={20}
                      className="mt-0.5 text-[var(--warning)]"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-strong)]">
                        Complete your profile first
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        You can review this invitation, but your profile needs
                        to be 100% complete and Active before you can apply.
                      </p>
                      <div className="mt-4">
                        <ButtonLink
                          href="/app/profile"
                          variant="secondary"
                          size="sm"
                        >
                          Complete profile
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </div>

                {myInvite && ["SENT", "VIEWED"].includes(myInvite.status) ? (
                  <ActionForm
                    action={declineInvitationAction}
                    successTitle="Invitation declined"
                    className="grid gap-3 border-t border-[var(--woosh-border)] pt-4"
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
            ) : myApp ? (
              <div className="grid gap-4">
                <div className="rounded-xl border border-[var(--woosh-teal)]/30 bg-[var(--woosh-teal)]/[0.06] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    Application status
                  </p>
                  <p className="mt-1 font-semibold text-[var(--woosh-navy)]">
                    {humanize(String(myApp.status))}
                  </p>

                  {myApp.offers[0] ? (
                    <div className="mt-4 border-t border-[var(--woosh-teal)]/20 pt-3">
                      <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                        Offer:{" "}
                        {Number(myApp.offers[0].amount).toLocaleString()}{" "}
                        {myApp.offers[0].currency}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {humanize(String(myApp.offers[0].status))}
                      </p>
                      {offerSplit ? (
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                          Woosh platform fee{" "}
                          {offerSplit.platformFee.toLocaleString()}{" "}
                          {myApp.offers[0].currency} · estimated creator net{" "}
                          {offerSplit.net.toLocaleString()}{" "}
                          {myApp.offers[0].currency}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {myApp.offers[0] &&
                ["OPEN", "COUNTERED"].includes(myApp.offers[0].status ?? "") &&
                myApp.offers[0].createdById !== session.user.id ? (
                  <div className="grid gap-3">
                    <ActionForm
                      action={acceptOfferAction}
                      successTitle="Offer accepted"
                    >
                      <input
                        type="hidden"
                        name="offerId"
                        value={myApp.offers[0].id}
                      />
                      <Button type="submit" size="sm" className="w-full">
                        Accept offer
                      </Button>
                    </ActionForm>

                    <ActionForm
                      action={counterOfferAction}
                      successTitle="Counter-offer sent"
                      className="grid w-full min-w-0 gap-2"
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

                {["APPLIED", "SHORTLISTED"].includes(myApp.status) ? (
                  <ActionForm
                    action={withdrawApplicationAction}
                    successTitle="Application withdrawn"
                    className="grid w-full gap-2 border-t border-[var(--woosh-border)] pt-4"
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
              <div className="grid gap-5">
                <div>
                  <h3 className="font-semibold text-[var(--woosh-navy)]">
                    Interested in this opportunity?
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Share your proposed rate and availability with the brand.
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
                      rows={4}
                    />
                  </Label>

                  <Button type="submit" className="w-full">
                    Apply for this brief
                  </Button>
                </ActionForm>

                {myInvite && ["SENT", "VIEWED"].includes(myInvite.status) ? (
                  <ActionForm
                    action={declineInvitationAction}
                    successTitle="Invitation declined"
                    className="grid gap-2 border-t border-[var(--woosh-border)] pt-4"
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
          </div>
        </aside>
      </div>
    </AppPage>
  );
}
