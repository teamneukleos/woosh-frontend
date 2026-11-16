import { notFound, redirect } from "next/navigation";
import {
  CalendarDays,
  FileCheck2,
  MessageSquareText,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCampaign } from "@/domains/campaign/deliverables";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/panel";
import { CampaignHeader } from "@/components/work/campaign-header";
import { DeliverableWorkCard } from "@/components/work/deliverable-work-card";
import { CampaignConversation } from "@/components/work/campaign-conversation";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { TermDetails } from "@/components/ui/term-details";

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the rest of the dashboard)
   - Thin strokes, icons sit directly on the surface, no tinted tiles.
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

/** One cell of the campaign summary strip. */
function SummaryCell({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4 bg-[var(--woosh-surface)] p-5">
      <Glyph icon={icon} size={20} className="text-[var(--text-muted)]" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--woosh-grey)]">{label}</p>
        <p className="mt-1 break-words text-2xl font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  const { id } = await params;
  const campaign = await getCampaign(id, session.user.id);

  if (!campaign) notFound();

  const isCreator = ctx?.kind === "creator";
  const participant = isCreator
    ? campaign.participants.find(
        (row) => row.creatorProfileId === ctx.creatorProfile?.id,
      )
    : campaign.participants[0];

  if (!participant) notFound();

  return (
    <AppPage
      eyebrow={`${campaign.brand.name} · Campaign workspace`}
      title={campaign.title}
      description={
        isCreator
          ? "Your collaboration workspace. Manage deliverables, track progress and stay in touch with the brand."
          : `Campaign workspace for ${participant.creator.displayName}. Review deliverables and coordinate the collaboration.`
      }
      actions={<StatusBadge status={campaign.status} />}
      className="gap-7"
      width="wide"
    >
      <BackLink href={isCreator ? "/app/work" : "/app/campaigns"}>
        {isCreator ? "Work hub" : "Campaigns"}
      </BackLink>

      <CampaignHeader
        creatorName={participant.creator.displayName}
        agreedRate={Number(participant.agreedRate)}
        currency={participant.currency}
        termsAcceptedAt={participant.termsAcceptedAt}
      />

      {/* One connected summary strip instead of two separate boxes, like the
          summary row at the top of a campaign in Ads Manager */}
      <section
        aria-label="Campaign summary"
        className="grid gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] sm:grid-cols-2"
      >
        <SummaryCell
          icon={FileCheck2}
          label="Total deliverables"
          value={campaign.deliverables.length}
        />
        <SummaryCell
          icon={Wallet}
          label="Agreed compensation"
          value={`${Number(participant.agreedRate).toLocaleString()} ${participant.currency}`}
        />
      </section>

      {campaign.brief.rights || campaign.brief.timing ? (
        <Panel
          title="Campaign terms"
          description="The agreed usage rights and timing from the original brief."
        >
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
            <section className="min-w-0 lg:pr-6">
              <div className="mb-3 flex items-center gap-2">
                <Glyph
                  icon={ShieldCheck}
                  size={18}
                  className="text-[var(--text-muted)]"
                />
                <h3 className="text-sm font-semibold text-[var(--woosh-navy)]">
                  Usage rights
                </h3>
              </div>
              <TermDetails
                value={campaign.brief.rights}
                fallback="As agreed in the campaign conversation."
              />
            </section>

            <section className="min-w-0 border-t border-[var(--woosh-border)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="mb-3 flex items-center gap-2">
                <Glyph
                  icon={CalendarDays}
                  size={18}
                  className="text-[var(--text-muted)]"
                />
                <h3 className="text-sm font-semibold text-[var(--woosh-navy)]">
                  Timing
                </h3>
              </div>
              <TermDetails
                value={campaign.brief.timing}
                fallback="Use the deliverable deadlines below."
              />
            </section>
          </div>
        </Panel>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--woosh-navy)] sm:text-xl">
              Deliverables
            </h2>
            <p className="mt-1 text-sm text-[var(--woosh-grey)]">
              {isCreator
                ? "Only work assigned to you is shown here."
                : "Review submissions and move each item through approval."}
            </p>
          </div>

          <p className="text-sm font-medium tabular-nums text-[var(--woosh-grey)]">
            {campaign.deliverables.length}{" "}
            {campaign.deliverables.length === 1
              ? "deliverable"
              : "deliverables"}
          </p>
        </div>

        {campaign.deliverables.length ? (
          <div className="grid gap-4">
            {campaign.deliverables.map((deliverable) => (
              <DeliverableWorkCard
                key={deliverable.id}
                deliverable={deliverable}
                isCreator={isCreator}
                termsAccepted={Boolean(participant.termsAcceptedAt)}
                campaignParticipantId={participant.id}
                campaignId={campaign.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No assigned deliverables"
            description="The brand needs to assign work before production can start."
          />
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-surface)] shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 border-b border-[var(--woosh-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <Glyph
              icon={MessageSquareText}
              size={20}
              className="mt-0.5 text-[var(--text-muted)]"
            />
            <div>
              <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                Campaign conversation
              </h2>
              <p className="mt-0.5 text-sm text-[var(--woosh-grey)]">
                Your space for updates, questions and collaboration.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-[#12141a]/[0.05] px-3 py-1 text-xs font-medium text-[var(--woosh-grey)]">
            {isCreator ? "You · Brand team" : `You · ${participant.creator.displayName}`}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          <CampaignConversation
            campaignId={campaign.id}
            conversation={campaign.conversations[0]}
            currentUserId={session.user.id}
          />
        </div>
      </section>
    </AppPage>
  );
}