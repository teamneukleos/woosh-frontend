import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  getClaimedCreator,
  getProspect,
} from "@/domains/creator/prospects";
import { inviteToBriefAction, toggleSaveCreatorAction } from "@/app/actions";
import { listBriefsForBrand } from "@/domains/marketplace/briefs";
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
import { Avatar } from "@/components/ui/avatar";
import { ApiError } from "@/lib/api";
import {
  formatCompact,
  formatEngagement,
} from "@/lib/discovery-stats";

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
        width="narrow"
        className="max-w-2xl"
      >
        <BackLink href="/app/creators">Creators</BackLink>
        <Panel
          title="Shortlist"
          description="Save them to your roster. They are not notified until you invite them to a brief."
        >
          <ActionForm
            action={toggleSaveCreatorAction}
            successTitle={
              prospect.saved ? "Removed from shortlist" : "Creator shortlisted"
            }
          >
            <input type="hidden" name="prospectId" value={prospect.id} />
            <input type="hidden" name="saved" value={prospect.saved ? "1" : "0"} />
            <Button type="submit" variant="secondary">
              {prospect.saved ? "Shortlisted" : "Shortlist"}
            </Button>
          </ActionForm>
        </Panel>
        <Panel>
          <div className="flex items-start gap-3">
            <Avatar
              name={prospect.displayName || prospect.handle}
              src={prospect.avatarUrl}
              size="lg"
            />
            <div>
              <ChannelMark channel={prospect.channel} />
              {prospect.website ? (
                <p className="mt-2 truncate text-sm text-[var(--woosh-blue)]">
                  {prospect.website}
                </p>
              ) : null}
            </div>
          </div>
          {prospect.biography ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--woosh-dull)]">
              {prospect.biography}
            </p>
          ) : null}
          {prospect.categories.length ? (
            <p className="mt-3 text-sm text-[var(--woosh-dull)]/70">
              {prospect.categories.join(" · ")}
            </p>
          ) : null}
          <dl className="mt-4 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/70 p-3 sm:grid-cols-4">
            {[
              {
                label: "Followers",
                value: formatCompact(prospect.followers ?? prospect.followerEstimate),
              },
              {
                label: "Engagement",
                value: formatEngagement(prospect.engagementRate),
              },
              {
                label: "Avg likes",
                value: formatCompact(prospect.averageLikes),
              },
              {
                label: "Posts",
                value: prospect.mediaCount?.toLocaleString() ?? "—",
              },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[0.65rem] uppercase tracking-[0.04em] text-[var(--woosh-dull)]/55">
                  {stat.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-[var(--woosh-navy)]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[0.6875rem] text-[var(--text-muted)]">
            {prospect.metricSampleSize
              ? `Engagement is (avg likes + avg comments) ÷ followers from ${prospect.metricSampleSize} recent posts. Not verified until they connect.`
              : "Metrics appear after Graph enrich. Not verified until they connect."}
          </p>
        </Panel>
        {prospect.recentPosts?.length ? (
          <Panel
            title="Recent posts"
            description="Last three posts from Instagram. Opens on Instagram."
          >
            <ul className="grid grid-cols-3 gap-2">
              {prospect.recentPosts.slice(0, 3).map((post) => {
                const inner = (
                  <>
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center p-2 text-center text-xs text-[var(--text-muted)]">
                        {post.mediaType === "VIDEO" ? "Video" : "Post"}
                      </span>
                    )}
                    {post.likeCount != null ? (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[0.65rem] text-white">
                        {formatCompact(post.likeCount)}
                      </span>
                    ) : null}
                  </>
                );
                return (
                  <li key={post.id}>
                    {post.permalink ? (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--woosh-mist)]"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[var(--woosh-mist)]">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
        ) : null}
        {briefs.length ? (
          <Panel
            title="Invite to brief"
            description="They get a claim email with the brief summary. They must finish profile setup before they can take the work."
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
                <TextArea name="message" rows={2} placeholder="Optional note" />
              </Label>
              <Button type="submit" className="w-fit">
                Send invitation
              </Button>
            </ActionForm>
          </Panel>
        ) : (
          <Panel
            title="Invite to brief"
            description="Publish a brief first. Unclaimed accounts are invited to a brief, not pinged on their own."
          >
            <ButtonLink href="/app/briefs/new" variant="secondary">
              New brief
            </ButtonLink>
          </Panel>
        )}
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
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

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
      className="max-w-6xl"
    >
      <BackLink href="/app/creators">Creators</BackLink>
      <CreatorIntel profile={profile} />
      <Panel
        title="Shortlist"
        description="Save them to your roster. They are not notified until you invite them to a brief."
      >
        <ActionForm
          action={toggleSaveCreatorAction}
          successTitle={saved ? "Removed from shortlist" : "Creator shortlisted"}
        >
          <input type="hidden" name="creatorProfileId" value={raw.id} />
          <input type="hidden" name="saved" value={saved ? "1" : "0"} />
          <Button type="submit" variant="secondary">
            {saved ? "Shortlisted" : "Shortlist"}
          </Button>
        </ActionForm>
      </Panel>

      {briefs.length ? (
        <Panel
          title="Invite to brief"
          description="This is what notifies the creator. The invite includes the brief title and summary."
        >
          <ActionForm
            action={inviteToBriefAction}
            successTitle="Invitation sent"
            className="grid gap-3"
          >
            <input type="hidden" name="creatorProfileId" value={raw.id} />
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
      ) : (
        <Panel
          title="Invite to brief"
          description="Publish a brief first. Creators are only notified when you invite them to one."
        >
          <ButtonLink href="/app/briefs/new" variant="secondary">
            New brief
          </ButtonLink>
        </Panel>
      )}
    </AppPage>
  );
}
