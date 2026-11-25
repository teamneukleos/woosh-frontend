import { notFound, redirect } from "next/navigation";
import { CalendarDays, ShieldCheck, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCampaign } from "@/domains/campaign/deliverables";
import { BackLink } from "@/components/ui/back-link";
import { EmptyState } from "@/components/ui/panel";
import { CampaignHeader } from "@/components/work/campaign-header";
import { DeliverableWorkCard } from "@/components/work/deliverable-work-card";
import { CampaignConversation } from "@/components/work/campaign-conversation";
import { AppPage } from "@/components/ui/app-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { TermDetails } from "@/components/ui/term-details";

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

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 bg-white p-5">
      <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      <p className="break-words text-2xl font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)] sm:text-3xl">
        {value}
      </p>
      {note ? (
        <p className="-mt-1.5 text-xs font-medium text-[var(--text-muted)]">
          {note}
        </p>
      ) : null}
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

  const nextDeadline = campaign.deliverables
    .filter((deliverable) => deliverable.dueAt)
    .sort((a, b) => a.dueAt!.getTime() - b.dueAt!.getTime())[0]?.dueAt;

  return (
    <AppPage
      eyebrow={campaign.brand.name}
      title={campaign.title}
      description={`Campaign workspace for ${participant.creator.displayName}`}
      actions={<StatusBadge status={campaign.status} />}
      className="gap-7"
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

      <section
        aria-label="Campaign summary"
        className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] sm:grid-cols-2"
      >
        <StatCell
          label="Deliverables"
          value={campaign.deliverables.length}
          note={isCreator ? "Assigned to you" : "In this workspace"}
        />
        <StatCell
          label="Next deadline"
          value={nextDeadline ? formatDate(nextDeadline) : "No deadline"}
          note={nextDeadline ? "Earliest open due date" : "Nothing scheduled"}
        />
      </section>

      {campaign.brief.rights || campaign.brief.timing ? (
        <Section
          title="Campaign terms"
          description="The agreed usage rights and timing from the brief."
        >
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2 lg:gap-0">
            <div className="min-w-0 lg:pr-6">
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
            </div>
            <div className="min-w-0 border-t border-[var(--woosh-border)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
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
            </div>
          </div>
        </Section>
      ) : null}

      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--woosh-navy)] sm:text-xl">
              Deliverable checklist
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {isCreator
                ? "Only work assigned to you is shown here."
                : "Review submissions and move each item through approval."}
            </p>
          </div>
          <p className="text-sm font-medium tabular-nums text-[var(--text-secondary)]">
            {campaign.deliverables.length}{" "}
            {campaign.deliverables.length === 1
              ? "deliverable"
              : "deliverables"}
          </p>
        </div>
        {campaign.deliverables.length ? (
          campaign.deliverables.map((deliverable) => (
            <DeliverableWorkCard
              key={deliverable.id}
              deliverable={deliverable}
              isCreator={isCreator}
              termsAccepted={Boolean(participant.termsAcceptedAt)}
              campaignParticipantId={participant.id}
              campaignId={campaign.id}
            />
          ))
        ) : (
          <EmptyState
            title="No assigned deliverables"
            description="The brand needs to assign work before production can start."
          />
        )}
      </section>

      <CampaignConversation
        campaignId={campaign.id}
        conversation={campaign.conversations[0]}
        currentUserId={session.user.id}
      />
    </AppPage>
  );
}