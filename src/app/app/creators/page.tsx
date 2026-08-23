import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  ensureCatalogProspects,
  listDiscovery,
} from "@/domains/creator/prospects";
import { createProspectAction } from "@/app/actions";
import type { SocialChannel } from "@/generated/prisma/client";
import { AppPage, DataToolbar } from "@/components/ui/app-page";
import { Panel, EmptyState } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { CategoryPicker } from "@/components/ui/taxonomy-pickers";
import { ActionForm } from "@/components/ui/action-form";
import { CreatorDiscoveryCard } from "@/components/creator/creator-discovery-card";
import {
  CREATOR_CATEGORIES,
  LANGUAGES,
  SOCIAL_CHANNELS,
} from "@/lib/taxonomy";
import { DISCOVERY_CITIES } from "@/lib/discovery-catalog";
import { prisma } from "@/lib/db";

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

  await ensureCatalogProspects();

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
    sort: params.sort ?? "followers",
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

  return (
    <AppPage
      eyebrow="Find"
      title="Creators"
      description="Search claimed and unclaimed creators. Filters are dropdowns — platform, niche, city, reach."
      width="wide"
    >
      <DataToolbar>
        <form className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Label className="xl:col-span-2">
            Search
            <Input
              name="q"
              defaultValue={params.q}
              placeholder="Name or handle"
            />
          </Label>
          <Label>
            Status
            <Select name="type" defaultValue={params.type ?? ""}>
              <option value="">All creators</option>
              <option value="claimed">Claimed</option>
              <option value="prospect">Unclaimed</option>
            </Select>
          </Label>
          <Label>
            Platform
            <Select name="channel" defaultValue={params.channel ?? ""}>
              <option value="">All platforms</option>
              {SOCIAL_CHANNELS.map((channel) => (
                <option key={channel.value} value={channel.value}>
                  {channel.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Category
            <Select name="category" defaultValue={params.category ?? ""}>
              <option value="">All niches</option>
              {CREATOR_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            City
            <Select name="city" defaultValue={params.city ?? ""}>
              <option value="">All cities</option>
              {DISCOVERY_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Followers
            <Select
              name="minFollowers"
              defaultValue={params.minFollowers ?? ""}
            >
              <option value="">Any reach</option>
              <option value="10000">10k+</option>
              <option value="50000">50k+</option>
              <option value="100000">100k+</option>
              <option value="250000">250k+</option>
            </Select>
          </Label>
          <Label>
            Sort
            <Select name="sort" defaultValue={params.sort ?? "followers"}>
              <option value="followers">Most followers</option>
              <option value="engagement">Highest engagement</option>
              <option value="views">Highest avg views</option>
              <option value="newest">Newest</option>
              <option value="price">Price low to high</option>
            </Select>
          </Label>
          <details className="sm:col-span-2 lg:col-span-4 xl:col-span-6">
            <summary className="cursor-pointer text-sm font-medium text-[var(--woosh-blue)]">
              More filters
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Label>
                Country
                <Input
                  name="country"
                  defaultValue={params.country}
                  placeholder="NG"
                />
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
            </div>
          </details>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Apply
            </Button>
          </div>
        </form>
      </DataToolbar>

      <p className="text-sm text-[var(--text-secondary)]">
        {items.length} creator{items.length === 1 ? "" : "s"}
      </p>

      {items.length ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <CreatorDiscoveryCard
                item={item}
                saved={savedIds.has(item.id)}
                activeBrandId={ctx.activeBrandId}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No creators match"
          description="Clear a filter or add someone by handle."
        />
      )}

      <details className="rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[var(--woosh-navy)]">
          Add a prospect by handle
        </summary>
        <Panel
          title="Unclaimed handle"
          description="Optional follower estimate stays labelled unverified until they claim and connect."
          className="border-0 shadow-none"
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
                  {SOCIAL_CHANNELS.map((channel) => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
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
              Follower estimate
              <Input
                name="followerEstimate"
                type="number"
                placeholder="Optional"
              />
            </Label>
            <Button type="submit" variant="secondary" className="w-fit">
              Add prospect
            </Button>
          </ActionForm>
        </Panel>
      </details>
    </AppPage>
  );
}
