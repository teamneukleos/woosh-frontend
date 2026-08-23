import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  getClaimedCreator,
  getProspect,
} from "@/domains/creator/prospects";
import { expressInterestAction, inviteToBriefAction } from "@/app/actions";
import { BackLink } from "@/components/ui/back-link";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextArea, Label, Select } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { prisma } from "@/lib/db";
import { CreatorIntel } from "@/components/creator/creator-intel";
import { ChannelMark } from "@/components/ui/social-icon";
import { recordAnalyticsEvent } from "@/domains/analytics/events";

export default async function CreatorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");

  const { id } = await params;
  const { type } = await searchParams;
  const isProspect = type === "prospect";

  if (isProspect) {
    const prospect = await getProspect(id);
    if (!prospect) notFound();

    return (
      <AppPage
        eyebrow="Creator discovery"
        title={prospect.displayName || `@${prospect.handle}`}
        description={`${prospect.channel} · @${prospect.handle}${
          prospect.locationCity ? ` · ${prospect.locationCity}` : ""
        }`}
        actions={<Badge tone="teal">Unclaimed prospect</Badge>}
        width="narrow"
        className="max-w-2xl"
      >
        <BackLink href="/app/creators">Creators</BackLink>
        <Panel>
          <ChannelMark channel={prospect.channel} />
          {prospect.categories.length ? (
            <p className="mt-3 text-sm text-[var(--woosh-dull)]/70">
              {prospect.categories.join(" · ")}
            </p>
          ) : null}
          {prospect.followerEstimate ? (
            <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--woosh-mist)] px-3 py-2 text-sm text-[var(--woosh-dull)]">
              ~{prospect.followerEstimate.toLocaleString()} followers
              <span className="ml-1 text-xs">(estimate, unverified)</span>
            </p>
          ) : null}
          <ActionForm
            action={expressInterestAction}
            successTitle="Invitation sent"
            className="mt-6 flex flex-col gap-3"
          >
            <input type="hidden" name="prospectId" value={prospect.id} />
            <input
              type="hidden"
              name="brandId"
              value={ctx.activeBrandId ?? ""}
            />
            <Label>
              Invite message
              <TextArea
                name="message"
                placeholder="Optional note to the creator"
                rows={3}
              />
            </Label>
            <Button
              type="submit"
              disabled={!ctx.activeBrandId}
              className="w-fit"
            >
              Invite to claim
            </Button>
          </ActionForm>
        </Panel>
      </AppPage>
    );
  }

  const profile = await getClaimedCreator(id, {
    userId: session.user.id,
    brandId: ctx.activeBrandId,
    isAdmin: ctx.user.isPlatformAdmin,
  });
  if (!profile) notFound();
  await recordAnalyticsEvent({
    eventType: "PROFILE_VIEW",
    actorUserId: session.user.id,
    organisationId: ctx.organisation?.id,
    brandId: ctx.activeBrandId ?? undefined,
    creatorProfileId: profile.id,
    dedupePerDay: true,
  });

  const briefs = ctx.activeBrandId
    ? await prisma.brief.findMany({
        where: {
          brandId: ctx.activeBrandId,
          status: { in: ["OPEN", "SELECTING"] },
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
      })
    : [];
  const collaboration = ctx.activeBrandId
    ? await prisma.campaignParticipant.aggregate({
        where: {
          creatorProfileId: profile.id,
          campaign: { brandId: ctx.activeBrandId },
        },
        _count: { _all: true },
        _sum: { agreedRate: true },
      })
    : null;

  return (
    <AppPage
      eyebrow="Discovery"
      title="Storefront"
      description="Performance, portfolio, rates and collaboration history."
      width="wide"
      className="max-w-6xl"
    >
      <BackLink href="/app/creators">Creators</BackLink>
      <CreatorIntel profile={profile} />
      {collaboration?._count._all ? (
        <Panel title="Your collaboration history">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="woosh-eyebrow">
                Campaigns together
              </dt>
              <dd className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)]">
                {collaboration._count._all}
              </dd>
            </div>
            <div>
              <dt className="woosh-eyebrow">
                Agreed creator spend
              </dt>
              <dd className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[var(--woosh-navy)]">
                NGN{" "}
                {Number(
                  collaboration._sum.agreedRate ?? 0,
                ).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Panel>
      ) : null}
      <Panel title="Work with this creator">
        <ActionForm
          action={expressInterestAction}
          successTitle="Interest recorded"
          className="flex flex-wrap gap-3"
        >
          <input type="hidden" name="creatorProfileId" value={profile.id} />
          <input type="hidden" name="brandId" value={ctx.activeBrandId ?? ""} />
          <Button type="submit" disabled={!ctx.activeBrandId}>
            Interested
          </Button>
        </ActionForm>
      </Panel>

      {briefs.length ? (
        <Panel title="Invite to brief">
          <ActionForm
            action={inviteToBriefAction}
            successTitle="Invitation sent"
            className="grid gap-3"
          >
            <input type="hidden" name="creatorProfileId" value={profile.id} />
            <Label>
              Brief
              <Select name="briefId" required defaultValue={briefs[0]?.id}>
                {briefs.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              Message
              <TextArea name="message" rows={2} placeholder="Optional note" />
            </Label>
            <Button type="submit" className="w-fit">
              Send invitation
            </Button>
          </ActionForm>
        </Panel>
      ) : null}
    </AppPage>
  );
}
