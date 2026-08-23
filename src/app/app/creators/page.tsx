import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listDiscovery } from "@/domains/creator/prospects";
import {
  createProspectAction,
  expressInterestAction,
  toggleSaveCreatorAction,
} from "@/app/actions";
import type { SocialChannel } from "@/generated/prisma/client";
import { AppPage, DataToolbar } from "@/components/ui/app-page";
import { Panel, EmptyState } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { CategoryPicker } from "@/components/ui/taxonomy-pickers";
import { FilterChips } from "@/components/ui/filter-chips";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatHandle } from "@/lib/handle";
import { ChannelMark } from "@/components/ui/social-icon";
import { VerifiedCheck } from "@/components/ui/verified-check";
import { ActionForm } from "@/components/ui/action-form";
import {
  CREATOR_CATEGORIES,
  LANGUAGES,
  SOCIAL_CHANNELS,
} from "@/lib/taxonomy";
import { prisma } from "@/lib/db";

function qs(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    channel?: string;
    type?: string;
    category?: string;
    minFollowers?: string;
    minEngagement?: string;
    minAverageViews?: string;
    maxRate?: string;
    country?: string;
    city?: string;
    language?: string;
    ageBand?: string;
    gender?: string;
    sort?: "newest" | "followers" | "engagement" | "views" | "price";
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");

  const params = await searchParams;
  const items = await listDiscovery({
    q: params.q,
    channel: params.channel as SocialChannel | undefined,
    category: params.category,
    claimedOnly: params.type === "claimed",
    prospectOnly: params.type === "prospect",
    country: params.country,
    city: params.city,
    language: params.language,
    ageBand: params.ageBand,
    gender: params.gender,
    minFollowers: params.minFollowers
      ? Number(params.minFollowers)
      : undefined,
    minEngagement: params.minEngagement
      ? Number(params.minEngagement)
      : undefined,
    minAverageViews: params.minAverageViews
      ? Number(params.minAverageViews)
      : undefined,
    maxRate: params.maxRate ? Number(params.maxRate) : undefined,
    sort: params.sort,
  });
  const savedItems = ctx.organisation
    ? await prisma.creatorListItem.findMany({
        where: {
          list: { organisationId: ctx.organisation.id },
          creatorProfileId: { not: null },
        },
        select: { creatorProfileId: true },
      })
    : [];
  const savedIds = new Set(
    savedItems.map((item) => item.creatorProfileId).filter(Boolean),
  );

  const base = {
    q: params.q,
    channel: params.channel,
    category: params.category,
    city: params.city,
    country: params.country,
    language: params.language,
    ageBand: params.ageBand,
    gender: params.gender,
    minFollowers: params.minFollowers,
    minEngagement: params.minEngagement,
    minAverageViews: params.minAverageViews,
    maxRate: params.maxRate,
    sort: params.sort,
  };

  return (
    <AppPage
      eyebrow="Discovery"
      title="Creators"
      description="Claimed creators show live metrics only after social connect. Prospects may show ops estimates — labelled unverified."
    >
      <FilterChips
        active={params.type ?? ""}
        items={[
          {
            label: "All",
            value: "",
            href: `/app/creators${qs({ ...base, type: undefined })}`,
          },
          {
            label: "Claimed",
            value: "claimed",
            href: `/app/creators${qs({ ...base, type: "claimed" })}`,
          },
          {
            label: "Prospects",
            value: "prospect",
            href: `/app/creators${qs({ ...base, type: "prospect" })}`,
          },
        ]}
      />

      <DataToolbar>
        <form className="flex w-full flex-wrap items-end gap-3">
          <Label className="min-w-0 flex-1 basis-full sm:basis-40">
            Search
            <Input
              name="q"
              defaultValue={params.q}
              placeholder="Handle or name"
            />
          </Label>
          <Label className="min-w-0 w-full sm:w-auto sm:min-w-[140px]">
            Channel
            <Select name="channel" defaultValue={params.channel ?? ""}>
              <option value="">All</option>
              {SOCIAL_CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label className="min-w-0 w-full sm:w-auto sm:min-w-[160px]">
            Category
            <Select name="category" defaultValue={params.category ?? ""}>
              <option value="">All</option>
              {CREATOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Label>
          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>
          <details className="group w-full rounded-[var(--radius-control)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)]/55">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--woosh-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-ring)]">
              Advanced filters
              <span
                aria-hidden="true"
                className="text-[var(--woosh-blue)] transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="grid gap-3 border-t border-[var(--woosh-border)] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Label>
            Min followers
            <Input
              name="minFollowers"
              type="number"
              min={0}
              defaultValue={params.minFollowers}
            />
          </Label>
          <Label>
            Country
            <Input
              name="country"
              defaultValue={params.country}
              placeholder="NG"
            />
          </Label>
          <Label>
            City
            <Input name="city" defaultValue={params.city} />
          </Label>
          <Label>
            Language
            <Select name="language" defaultValue={params.language ?? ""}>
              <option value="">All</option>
              {LANGUAGES.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </Select>
          </Label>
          <Label>
            Age band
            <Select name="ageBand" defaultValue={params.ageBand ?? ""}>
              <option value="">All opted-in</option>
              <option value="18-24">18–24</option>
              <option value="25-34">25–34</option>
              <option value="35-44">35–44</option>
              <option value="45+">45+</option>
            </Select>
          </Label>
          <Label>
            Gender
            <Select name="gender" defaultValue={params.gender ?? ""}>
              <option value="">All opted-in</option>
              <option>Woman</option>
              <option>Man</option>
              <option>Non-binary</option>
              <option>Self-described</option>
            </Select>
          </Label>
          <Label>
            Min ER %
            <Input
              name="minEngagement"
              type="number"
              min={0}
              step="0.1"
              defaultValue={params.minEngagement}
            />
          </Label>
          <Label>
            Min avg views
            <Input
              name="minAverageViews"
              type="number"
              min={0}
              defaultValue={params.minAverageViews}
            />
          </Label>
          <Label>
            Max rate
            <Input
              name="maxRate"
              type="number"
              min={0}
              defaultValue={params.maxRate}
            />
          </Label>
          <Label>
            Sort
            <Select name="sort" defaultValue={params.sort ?? "newest"}>
              <option value="newest">Newest</option>
              <option value="followers">Followers</option>
              <option value="engagement">Engagement</option>
              <option value="views">Average views</option>
              <option value="price">Price low to high</option>
            </Select>
          </Label>
            </div>
          </details>
          {params.type ? (
            <input type="hidden" name="type" value={params.type} />
          ) : null}
        </form>
      </DataToolbar>

      <Panel
        title="Add prospect by handle"
        description="Ops estimate optional and never shown as verified. After claim, creator must connect the channel."
      >
        <ActionForm
          action={createProspectAction}
          successTitle="Prospect added"
          className="grid gap-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Label>
              Channel
              <Select name="channel" required defaultValue="INSTAGRAM">
                {SOCIAL_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Label>
            <Label>
              Handle
              <Input name="handle" required placeholder="@handle" />
            </Label>
          </div>
          <CategoryPicker options={CREATOR_CATEGORIES} />
          <Label>
            Follower estimate (ops only, optional)
            <Input
              name="followerEstimate"
              type="number"
              placeholder="Leave blank if unknown"
            />
          </Label>
          <Button type="submit" variant="secondary" className="w-fit">
            Add prospect
          </Button>
        </ActionForm>
      </Panel>

      {items.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={`${item.type}-${item.id}`}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
            >
              {item.portfolioThumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.portfolioThumbnail}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="h-20 bg-gradient-to-br from-[var(--woosh-navy)] to-[var(--woosh-blue)]" />
              )}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    name={item.displayName}
                    src={item.avatarUrl}
                    size="lg"
                    className="-mt-9"
                  />
                  <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Link
                    href={`/app/creators/${item.id}?type=${item.type}`}
                    className="inline-flex min-w-0 max-w-full items-center gap-1.5 font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                  >
                    <span className="truncate">{item.displayName}</span>
                    {item.verified ? <VerifiedCheck /> : null}
                  </Link>
                  <StatusBadge
                    status={item.type === "prospect" ? "UNCLAIMED" : "CLAIMED"}
                  />
                </div>
                <p className="truncate text-sm font-medium text-[var(--woosh-navy)]">
                  {formatHandle(item.handle) ?? "No handle"}
                </p>
                <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-[var(--woosh-dull)]/70">
                  {item.channel ? (
                    <ChannelMark channel={item.channel} size="sm" />
                  ) : null}
                  {item.locationCity ? ` · ${item.locationCity}` : ""}
                  {item.categories.length
                    ? ` · ${item.categories.slice(0, 2).join(", ")}`
                    : ""}
                  {item.type === "prospect" && item.followerEstimate
                    ? ` · ~${item.followerEstimate.toLocaleString()} est.`
                    : ""}
                </p>
                  </div>
                </div>
                {item.type === "claimed" && item.metrics?.length ? (
                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/60 p-3 text-xs">
                    <div>
                      <dt className="text-[var(--woosh-dull)]/55">Followers</dt>
                      <dd className="font-semibold text-[var(--woosh-navy)]">
                        {Math.max(
                          ...item.metrics.map((metric) => metric.followers ?? 0),
                        ).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--woosh-dull)]/55">Best ER</dt>
                      <dd className="font-semibold text-[var(--woosh-navy)]">
                        {Math.max(
                          ...item.metrics.map(
                            (metric) => metric.engagementRate ?? 0,
                          ),
                        ).toFixed(1)}
                        %
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--woosh-dull)]/55">From</dt>
                      <dd className="font-semibold text-[var(--woosh-navy)]">
                        {item.startingRate
                          ? `${item.rateCurrency} ${item.startingRate.toLocaleString()}`
                          : "Ask"}
                      </dd>
                    </div>
                  </dl>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.type === "claimed" ? (
                    <ActionForm
                      action={toggleSaveCreatorAction}
                      successTitle={
                        savedIds.has(item.id) ? "Creator removed" : "Creator saved"
                      }
                    >
                      <input
                        type="hidden"
                        name="creatorProfileId"
                        value={item.id}
                      />
                      <input
                        type="hidden"
                        name="saved"
                        value={savedIds.has(item.id) ? "1" : "0"}
                      />
                      <Button type="submit" size="sm" variant="secondary">
                        {savedIds.has(item.id) ? "Saved" : "Save"}
                      </Button>
                    </ActionForm>
                  ) : null}
                  <ActionForm
                    action={expressInterestAction}
                    successTitle="Interest sent"
                  >
                  <input
                    type="hidden"
                      name="brandId"
                      value={ctx.activeBrandId ?? ""}
                  />
                    {item.type === "prospect" ? (
                      <input type="hidden" name="prospectId" value={item.id} />
                    ) : (
                      <input
                        type="hidden"
                        name="creatorProfileId"
                        value={item.id}
                      />
                    )}
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!ctx.activeBrandId}
                    >
                      Interested
                    </Button>
                  </ActionForm>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No creators match"
          description="Try another filter, or add a prospect by handle."
        />
      )}
    </AppPage>
  );
}
