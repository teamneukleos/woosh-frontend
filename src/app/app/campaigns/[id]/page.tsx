import { notFound, redirect } from "next/navigation";
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

      {campaign.brief.rights || campaign.brief.timing ? (
        <Panel
          title="Campaign terms"
          description="The agreed usage rights and timing from the brief."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h3 className="mb-3 font-semibold text-[var(--woosh-navy)]">Usage rights</h3>
              <TermDetails
                value={campaign.brief.rights}
                fallback="As agreed in the campaign conversation."
              />
            </section>
            <section>
              <h3 className="mb-3 font-semibold text-[var(--woosh-navy)]">Timing</h3>
              <TermDetails
                value={campaign.brief.timing}
                fallback="Use the deliverable deadlines below."
              />
            </section>
          </div>
        </Panel>
      ) : null}

      <section className="grid gap-4">
        <div>
          <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">
            Deliverable checklist
          </h2>
          <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
            {isCreator
              ? "Only work assigned to you is shown here."
              : "Review submissions and move each item through approval."}
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
