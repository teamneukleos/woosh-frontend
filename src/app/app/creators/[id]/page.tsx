
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  getClaimedCreator,
  getProspect,
} from "@/domains/creator/prospects";
import {
  inviteToBriefAction,
  toggleSaveCreatorAction,
} from "@/app/actions";
import { listBriefsForBrand } from "@/domains/marketplace/briefs";
import { InterestButton } from "@/components/creator/interest-button";
import { BackLink } from "@/components/ui/back-link";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { TextArea, Label, Select } from "@/components/ui/field";
import { ActionForm } from "@/components/ui/action-form";
import { CreatorIntel } from "@/components/creator/creator-intel";
import { ChannelMark } from "@/components/ui/social-icon";
import { ApiError } from "@/lib/api";

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
    let prospect;

    try {
      prospect = await getProspect(id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }

    const alreadyInterested = Boolean(prospect.interested);
    const briefs = ctx.activeBrandId
      ? (await listBriefsForBrand(ctx.activeBrandId)).filter((brief) =>
          ["DRAFT", "PENDING_MODERATION", "OPEN", "SELECTING"].includes(
            brief.status,
          ),
        )
      : [];

    return (
      <AppPage
        eyebrow="Creator discovery"
        title={prospect.displayName || `@${prospect.handle}`}
        description={`${prospect.channel} · @${prospect.handle}${
          prospect.locationCity ? ` · ${prospect.locationCity}` : ""
        }`}
        actions={<Badge tone="teal">Unclaimed prospect</Badge>}
        width="wide"
        className="w-full max-w-none"
      >
        <div className="w-full space-y-5">
          <BackLink href="/app/creators">Creators</BackLink>

          <Panel className="w-full">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] md:gap-10">
              <div className="min-w-0">
                <ChannelMark channel={prospect.channel} />

                {prospect.categories.length ? (
                  <div className="mt-6 border-t border-[var(--woosh-border)] pt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {prospect.categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full border border-[var(--woosh-border)] bg-[var(--woosh-mist)] px-3 py-1.5 text-sm text-[var(--woosh-navy)]"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col gap-5 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/50 p-4 md:p-5">
                {prospect.followerEstimate ? (
                  <p className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white px-4 py-3 text-sm text-[var(--woosh-dull)]">
                    ~{prospect.followerEstimate.toLocaleString()} followers
                    <span className="ml-1 text-xs">
                      (estimate, unverified)
                    </span>
                  </p>
                ) : null}

                <InterestButton
                  interested={alreadyInterested}
                  activeBrandId={ctx.activeBrandId}
                  prospectId={prospect.id}
                  className="flex flex-col gap-3"
                >
                  <Label>
                    Invite message
                    <TextArea
                      name="message"
                      placeholder="Optional note to the creator"
                      rows={3}
                    />
                  </Label>
                </InterestButton>

                <div className="border-t border-[var(--woosh-border)] pt-4">
                  <p className="mb-3 text-sm font-medium text-[var(--woosh-navy)]">
                    Shortlist
                  </p>
                  <ActionForm
                    action={toggleSaveCreatorAction}
                    successTitle={
                      prospect.saved
                        ? "Removed from shortlist"
                        : "Creator shortlisted"
                    }
                  >
                    <input
                      type="hidden"
                      name="prospectId"
                      value={prospect.id}
                    />
                    <input
                      type="hidden"
                      name="saved"
                      value={prospect.saved ? "1" : "0"}
                    />
                    <Button type="submit" variant="secondary">
                      {prospect.saved ? "Shortlisted" : "Shortlist"}
                    </Button>
                  </ActionForm>
                </div>
              </div>
            </div>
          </Panel>

          {briefs.length ? (
            <Panel
              title="Invite to brief"
              description="They receive a claim email with the brief summary and must complete profile setup before taking the work."
            >
              <ActionForm
                action={inviteToBriefAction}
                successTitle="Invitation sent"
                className="grid gap-3"
              >
                <input type="hidden" name="prospectId" value={prospect.id} />

                <Label>
                  Brief
                  <Select name="briefId" required defaultValue={briefs[0]?.id}>
                    {briefs.map((brief) => (
                      <option key={brief.id} value={brief.id}>
                        {brief.title}
                      </option>
                    ))}
                  </Select>
                </Label>

                <Label>
                  Message
                  <TextArea
                    name="message"
                    rows={2}
                    placeholder="Optional note"
                  />
                </Label>

                <Button type="submit" className="w-fit">
                  Send invitation
                </Button>
              </ActionForm>
            </Panel>
          ) : (
            <Panel
              title="Invite to brief"
              description="Create a brief first. Unclaimed creators are invited through a brief."
            >
              <ButtonLink href="/app/briefs/new" variant="secondary">
                New brief
              </ButtonLink>
            </Panel>
          )}
        </div>
      </AppPage>
    );
  }

  let raw;

  try {
    raw = await getClaimedCreator(id, {
      userId: session.user.id,
      brandId: ctx.activeBrandId,
      isAdmin: ctx.user.isPlatformAdmin,
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    ) {
      notFound();
    }
    throw error;
  }

  const alreadyInterested = Boolean(raw.interested);
  const saved = Boolean(raw.saved);

  const briefs = ctx.activeBrandId
    ? (await listBriefsForBrand(ctx.activeBrandId)).filter((brief) =>
        ["OPEN", "SELECTING"].includes(brief.status),
      )
    : [];

  const profile = {
    displayName: raw.displayName,
    bio: raw.bio,
    avatarUrl: null,
    avatarStatus: "PENDING",
    coverUrl: null,
    coverStatus: "PENDING",
    verifiedAt: raw.verified ? new Date() : null,
    websiteUrl: null,
    locationCountry: raw.locationCountry,
    locationState: null,
    locationCity: raw.locationCity,
    categories: raw.categories,
    languages: raw.languages,
    availabilityNotes: null,
    socialAccounts: raw.socialAccounts.map((account, index) => ({
      id: `${raw.id}-${account.channel}-${index}`,
      channel: account.channel,
      handle: account.handle,
      lastRefreshedAt: account.metrics?.capturedAt
        ? new Date(account.metrics.capturedAt)
        : null,
      snapshots: account.metrics
        ? [
            {
              followers: account.metrics.followers,
              engagementRate: account.metrics.engagementRate,
              averageViews: account.metrics.averageViews,
              audienceGeo: null,
              audienceAge: null,
              audienceGender: null,
              source: account.metrics.source,
              capturedAt: new Date(account.metrics.capturedAt),
            },
          ]
        : [],
    })),
    portfolioItems: (raw.portfolio ?? []).map((item) => ({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      description: item.description ?? null,
      brandName: item.brandName ?? null,
      campaignType: item.campaignType ?? null,
      url: item.url,
    })),
    ratePackages: raw.ratePackages.map((rate) => ({
      ...rate,
      description: rate.description ?? null,
      turnaroundDays: rate.turnaroundDays ?? null,
      revisions: rate.revisions ?? 1,
      usageRights: rate.usageRights ?? null,
    })),
  };

  return (
    <AppPage
      eyebrow="Discovery"
      title="Storefront"
      description="Performance, portfolio, rates and collaboration history."
      width="wide"
      className="w-full max-w-none"
    >
      <div className="w-full space-y-5">
        <BackLink href="/app/creators">Creators</BackLink>

        <div className="w-full min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white">
          <CreatorIntel profile={profile} />
        </div>

        <div
          className={`grid gap-5 ${
            briefs.length ? "lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          <Panel title="Work with this creator" className="h-full">
            <InterestButton
              interested={alreadyInterested}
              activeBrandId={ctx.activeBrandId}
              creatorProfileId={raw.id}
            />

            <div className="mt-4 border-t border-[var(--woosh-border)] pt-4">
              <p className="mb-3 text-sm font-medium text-[var(--woosh-navy)]">
                Shortlist
              </p>
              <ActionForm
                action={toggleSaveCreatorAction}
                successTitle={
                  saved ? "Removed from shortlist" : "Creator shortlisted"
                }
              >
                <input
                  type="hidden"
                  name="creatorProfileId"
                  value={raw.id}
                />
                <input
                  type="hidden"
                  name="saved"
                  value={saved ? "1" : "0"}
                />
                <Button type="submit" variant="secondary">
                  {saved ? "Shortlisted" : "Shortlist"}
                </Button>
              </ActionForm>
            </div>
          </Panel>

          {briefs.length ? (
            <Panel title="Invite to brief" className="h-full">
              <ActionForm
                action={inviteToBriefAction}
                successTitle="Invitation sent"
                className="grid gap-3"
              >
                <input type="hidden" name="creatorProfileId" value={raw.id} />

                <Label>
                  Brief
                  <Select name="briefId" required defaultValue={briefs[0]?.id}>
                    {briefs.map((brief) => (
                      <option key={brief.id} value={brief.id}>
                        {brief.title}
                      </option>
                    ))}
                  </Select>
                </Label>

                <Label>
                  Message
                  <TextArea
                    name="message"
                    rows={2}
                    placeholder="Optional note"
                  />
                </Label>

                <Button type="submit" className="w-fit">
                  Send invitation
                </Button>
              </ActionForm>
            </Panel>
          ) : (
            <Panel title="Invite to brief" className="h-full">
              <p className="mb-4 text-sm text-[var(--text-secondary)]">
                Publish a brief first. Creators are only notified when you
                invite them to one.
              </p>
              <ButtonLink href="/app/briefs/new" variant="secondary">
                New brief
              </ButtonLink>
            </Panel>
          )}
        </div>
      </div>
    </AppPage>
  );
}
