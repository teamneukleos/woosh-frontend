
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
import { ChevronRight, type LucideIcon } from "lucide-react";

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
      className="w-full max-w-none"
    >
      <div className="w-full min-w-0 space-y-5">
        <DataToolbar className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-4 shadow-[var(--shadow-soft)] md:p-5">
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

        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--woosh-navy)]">
                Discover creators
              </h2>
              <p className="mt-1 text-xs tabular-nums text-[var(--text-muted)]">
                {items.length} creator{items.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {items.length ? (
            <ul className="grid min-w-0 grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((item) => (
                <li key={`${item.type}-${item.id}`} className="min-w-0">
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
            <div className="rounded-2xl border border-[var(--woosh-border)] bg-white px-5 py-10">
              <EmptyState
                title="No creators match"
                description="Clear a filter or add someone by handle."
              />
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7] [&::-webkit-details-marker]:hidden sm:px-6">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                  Add a prospect by handle
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Add a creator who hasn't joined yet.
                </p>
              </div>

              <Glyph
                icon={ChevronRight}
                size={18}
                className="text-[#c2c4c9] transition-transform group-open:rotate-90"
              />
            </summary>

            <div className="border-t border-[var(--woosh-border)] bg-[#faf9f7] p-4 sm:p-6">
              <Panel
                title="Unclaimed handle"
                description="Optional follower estimate stays labelled unverified until they claim and connect."
                className="border-0 bg-transparent p-0 shadow-none"
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

                  <div className="border-t border-[var(--woosh-border)] pt-4">
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full sm:w-fit"
                    >
                      Add prospect
                    </Button>
                  </div>
                </ActionForm>
              </Panel>
            </div>
          </details>
        </section>
      </div>
    </AppPage>
  );
}
