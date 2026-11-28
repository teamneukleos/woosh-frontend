import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  DISCOVERY_PAGE_SIZE,
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
import { Pagination } from "@/components/ui/pagination";
import { CREATOR_CATEGORIES, SOCIAL_CHANNELS } from "@/lib/taxonomy";

type CreatorsSearch = {
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
  page?: string;
};

function creatorsListHref(params: CreatorsSearch, page: number) {
  const query = new URLSearchParams();
  const keys = [
    "q",
    "channel",
    "type",
    "category",
    "minFollowers",
    "minEngagement",
    "minAverageViews",
    "maxRate",
    "country",
    "city",
    "language",
    "ageBand",
    "gender",
    "sort",
  ] as const;
  for (const key of keys) {
    const value = params[key];
    if (value) query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/app/creators?${qs}` : "/app/creators";
}

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams: Promise<CreatorsSearch>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listDiscovery({
    q: params.q,
    channel: params.channel as SocialChannel | undefined,
    category: params.category,
    claimedOnly: params.type === "claimed",
    prospectOnly: params.type === "prospect",
    savedOnly: params.type === "saved",
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
    page,
    pageSize: DISCOVERY_PAGE_SIZE,
  });
  const items = result.items;
  const from = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const to = Math.min(result.page * result.pageSize, result.total);

  return (
    <AppPage
      eyebrow="Find"
      title="Creators"
      description="Shortlist people to review later. Invite them to a brief when you want them notified."
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
          type={params.type}
        />
      </DataToolbar>

      <p className="text-sm text-[var(--text-secondary)]">
        {result.total
          ? `Showing ${from}-${to} of ${result.total} creator${result.total === 1 ? "" : "s"}`
          : "0 creators"}
      </p>

      {items.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <CreatorDiscoveryCard
                item={item}
                saved={Boolean(item.saved)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={
            params.type === "saved"
              ? "No shortlisted creators"
              : "No creators match"
          }
          description={
            params.type === "saved"
              ? "Shortlist a claimed creator or an unclaimed handle. They stay here until you invite them to a brief."
              : "No Graph-backed creators in the database yet. Run the Instagram enrich job or add a handle."
          }
        />
      )}

      <Pagination
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        hrefForPage={(nextPage) => creatorsListHref(params, nextPage)}
      />

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
