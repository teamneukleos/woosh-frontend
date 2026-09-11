import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  ensureCatalogProspects,
  listDiscovery,
} from "@/domains/creator/prospects";
import { createProspectAction } from "@/app/actions";
import type { SocialChannel } from "@/lib/enums";
import { AppPage, DataToolbar } from "@/components/ui/app-page";
import { Panel, EmptyState } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { CategoryPicker } from "@/components/ui/taxonomy-pickers";
import { ActionForm } from "@/components/ui/action-form";
import { CreatorDiscoveryCard } from "@/components/creator/creator-discovery-card";
import { CreatorDiscoveryFilters } from "@/components/creator/creator-discovery-filters";
import { CREATOR_CATEGORIES, SOCIAL_CHANNELS } from "@/lib/taxonomy";

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

  return (
    <AppPage
      eyebrow="Find"
      title="Creators"
      description="Search by platform, niche, city and reach."
      width="wide"
    >
      <DataToolbar className="p-4 md:p-5">
        <CreatorDiscoveryFilters
          q={params.q}
          channel={params.channel}
          category={params.category}
          city={params.city}
          minFollowers={params.minFollowers}
          sort={params.sort}
          country={params.country}
          language={params.language}
          minEngagement={params.minEngagement}
          minAverageViews={params.minAverageViews}
        />
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
                saved={Boolean(item.saved)}
                interested={Boolean(item.interested)}
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
