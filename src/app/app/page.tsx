import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Compass,
  Eye,
  Heart,
  Layers3,
  Megaphone,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCreatorWorkHub } from "@/domains/work/hub";
import {
  listBriefsForBrand,
  listJobsForCreator,
} from "@/domains/marketplace/briefs";
import { listCampaignsForUser } from "@/domains/campaign/deliverables";
import { listCreatorEarnings } from "@/domains/payments/ledger";
import { listBrandCampaignMetrics } from "@/domains/analytics";
import { countUnreadNotifications } from "@/domains/identity/notifications";
import { hasPermission } from "@/lib/permissions";
import { ButtonLink } from "@/components/ui/button-link";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";

type CreatorWorkItem = Awaited<
  ReturnType<typeof getCreatorWorkHub>
>["active"][number];

type CreatorCampaign = Awaited<
  ReturnType<typeof listCampaignsForUser>
>[number];

type BrandBrief = Awaited<
  ReturnType<typeof listBriefsForBrand>
>[number];

type BrandAnalytics = Awaited<
  ReturnType<typeof listBrandCampaignMetrics>
>;

type AttentionItem = {
  label: string;
  href: string;
  hint: string;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Formatting helpers (presentation only)
   ───────────────────────────────────────────────────────────────────────────── */

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1,234 stays readable; 1,200,000 becomes 1.2M. */
function formatCount(value: number) {
  return value >= 10_000
    ? compactNumber.format(value)
    : value.toLocaleString("en-NG");
}

/** Always show Lagos time, regardless of where the server runs. */
function formatWhen(value: Date | string) {
  return new Date(value).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  DRAFT: "Draft",
  PENDING_MODERATION: "Pending review",
};

/** OPEN → Open, PENDING_MODERATION → Pending review, anything else → Sentence case. */
function humanizeStatus(status: string) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  const text = status.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system
   - One wrapper so every icon shares the same stroke, sizing and a11y handling.
   - Thin strokes (SF Symbols / Airbnb feel): 1.5 regular, 1.25 for large,
     decorative icons such as empty states.
   - Icons sit directly on the surface. No tinted tiles or circles behind them.
   - Navigation affordance is always a small chevron, never a diagonal arrow.
   ───────────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────────────
   Layout primitives
   - Lists live inside ONE bordered container with hairline dividers, instead of
     a separate bordered card per row. Fewer edges, calmer page.
   ───────────────────────────────────────────────────────────────────────────── */

const ROW_BASE =
  "group flex min-w-0 items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none";

function ListGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-[var(--woosh-border)] overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      {children}
    </div>
  );
}

function RowChevron({ className = "" }: { className?: string }) {
  return (
    <Glyph
      icon={ChevronRight}
      size={16}
      className={`text-[#c2c4c9] transition group-hover:translate-x-0.5 ${className}`}
    />
  );
}

function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b6d73]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#12141a] sm:text-xl">
          {title}
        </h2>
      </div>

      {href && linkLabel ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-0.5 text-sm font-semibold text-[#003af4]"
        >
          {linkLabel}
          <Glyph
            icon={ChevronRight}
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}

type Stat = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href: string;
  description?: string;
};

/** One connected strip of metrics. Cells are divided by hairlines, not boxed. */
function StatStrip({ stats }: { stats: Stat[] }) {
  const columns =
    stats.length >= 4
      ? "grid-cols-2 xl:grid-cols-4"
      : stats.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div
      className={`grid gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] ${columns}`}
    >
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="group flex min-w-0 flex-col justify-between gap-5 bg-white p-5 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none"
        >
          <div className="flex items-center justify-between gap-3">
            <Glyph icon={stat.icon} size={20} className="text-[#8a8c92]" />
            <RowChevron />
          </div>

          <div>
            <p className="text-sm font-medium text-[#6b6d73]">{stat.label}</p>
            <p className="mt-1 break-words text-2xl font-semibold tracking-tight tabular-nums text-[#12141a] sm:text-3xl">
              {stat.value}
            </p>
            {stat.description ? (
              <p className="mt-1.5 text-xs leading-5 text-[#6b6d73]">
                {stat.description}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  href,
  linkLabel,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--woosh-border)] bg-white px-5 py-9 text-center">
      <Glyph
        icon={icon}
        size={32}
        weight="light"
        className="mx-auto text-[#b9bbc0]"
      />
      <h3 className="mt-3 text-sm font-semibold text-[#12141a]">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#6b6d73]">
        {body}
      </p>
      {href && linkLabel ? (
        <Link
          href={href}
          className="group mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-[#003af4]"
        >
          {linkLabel}
          <Glyph
            icon={ChevronRight}
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}

/** "Needs your attention" lives at the top of every role's page. */
function AttentionCard({
  items,
  emptyTitle = "You're all caught up",
  emptyBody = "Nothing needs your attention right now.",
  emptyHref,
  emptyLinkLabel,
}: {
  items: AttentionItem[];
  emptyTitle?: string;
  emptyBody?: string;
  emptyHref?: string;
  emptyLinkLabel?: string;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--woosh-border)] px-5 py-3.5">
        <h2 className="text-sm font-semibold text-[#12141a]">
          Needs your attention
        </h2>
        {items.length > 0 ? (
          <span className="rounded-full bg-[#003af4]/[0.07] px-2.5 py-0.5 text-[11px] font-semibold text-[#003af4] tabular-nums">
            {items.length}
          </span>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-[var(--woosh-border)]">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={ROW_BASE}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#12141a] transition group-hover:text-[#003af4]">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-[#6b6d73]">
                  {item.hint}
                </span>
              </span>
              <RowChevron />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <Glyph
            icon={CheckCircle2}
            size={32}
            weight="light"
            className="text-[#b9bbc0]"
          />
          <p className="mt-3 text-sm font-semibold text-[#12141a]">
            {emptyTitle}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#6b6d73]">
            {emptyBody}
          </p>
          {emptyHref && emptyLinkLabel ? (
            <Link
              href={emptyHref}
              className="group mt-4 inline-flex items-center gap-0.5 text-sm font-semibold text-[#003af4]"
            >
              {emptyLinkLabel}
              <Glyph
                icon={ChevronRight}
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Rows (no card chrome of their own; they sit inside <ListGroup>)
   ───────────────────────────────────────────────────────────────────────────── */

function WorkRow({ item }: { item: CreatorWorkItem }) {
  return (
    <Link
      href={item.href}
      className={`${ROW_BASE} flex-col items-stretch sm:flex-row sm:items-center`}
    >
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-[#12141a] transition group-hover:text-[#003af4]">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-[#6b6d73]">{item.brandName}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:shrink-0 sm:justify-end">
        {item.actionRequired ? (
          <span className="rounded-full bg-[#003af4]/[0.07] px-2.5 py-1 text-[11px] font-semibold text-[#003af4]">
            Action needed
          </span>
        ) : null}

        <WorkStatus status={item.status} dueAt={item.dueAt} />

        <RowChevron className="hidden sm:block" />
      </div>
    </Link>
  );
}

function CampaignRow({ campaign }: { campaign: CreatorCampaign }) {
  const nextDeadline = campaign.deliverables
    .filter((deliverable) => deliverable.dueAt)
    .sort((a, b) => a.dueAt!.getTime() - b.dueAt!.getTime())[0]?.dueAt;

  const count = campaign.deliverables.length;

  return (
    <Link
      href={`/app/campaigns/${campaign.id}`}
      className={`${ROW_BASE} flex-col items-stretch sm:flex-row sm:items-center`}
    >
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-[#12141a] transition group-hover:text-[#003af4]">
          {campaign.title}
        </p>
        <p className="mt-0.5 text-xs text-[#6b6d73]">
          {campaign.brand.name} · {count} deliverable{count === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex min-w-0 items-center justify-between gap-3 sm:shrink-0 sm:justify-end">
        <div className="min-w-0">
          <WorkStatus status={campaign.status} dueAt={nextDeadline} />
        </div>
        <RowChevron />
      </div>
    </Link>
  );
}

function BriefRow({ brief }: { brief: BrandBrief }) {
  const status = String(brief.status);
  const applications = brief._count?.applications ?? 0;

  const statusTone =
    status === "OPEN"
      ? "bg-[#0de3af]/15 text-[#087d62]"
      : status === "DRAFT" || status === "PENDING_MODERATION"
        ? "bg-[#9a6700]/[0.09] text-[#9a6700]"
        : "bg-[#12141a]/[0.06] text-[#6b6d73]";

  return (
    <Link
      href={`/app/briefs/${brief.id}`}
      className={`${ROW_BASE} flex-col items-stretch sm:flex-row sm:items-center`}
    >
      <div className="min-w-0">
        <h3 className="break-words text-sm font-semibold text-[#12141a] transition group-hover:text-[#003af4]">
          {brief.title}
        </h3>
        <p className="mt-0.5 text-xs text-[#6b6d73]">
          {applications} application{applications === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}
        >
          {humanizeStatus(status)}
        </span>
        <RowChevron />
      </div>
    </Link>
  );
}

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx) redirect("/login");

  if (
    (ctx.kind === "agency" || ctx.kind === "brand") &&
    ctx.brands.length === 0
  ) {
    redirect("/app/onboarding");
  }

  if (
    ctx.kind === "creator" &&
    ctx.creatorProfile?.marketplaceStatus === "DRAFT"
  ) {
    redirect("/app/onboarding");
  }

  const attention: {
    label: string;
    href: string;
    hint: string;
  }[] = [];

  let creatorOverview: {
    actionRequired: number;
    openJobs: number;
    unread: number;
    activeCampaigns: number;
    availableEarnings: number;
    processingEarnings: number;
  } | null = null;

  let creatorActivity: CreatorWorkItem[] = [];
  let creatorCampaigns: CreatorCampaign[] = [];

  let brandBriefs: BrandBrief[] | null = null;
  let brandCampaigns: CreatorCampaign[] = [];
  let brandAnalytics: BrandAnalytics | null = null;

  if (ctx.kind === "creator" && ctx.creatorProfile) {
    const [hub, jobs, unread, campaigns, earnings] = await Promise.all([
      getCreatorWorkHub(session.user.id),
      listJobsForCreator(ctx.creatorProfile.id),
      countUnreadNotifications(),
      listCampaignsForUser(session.user.id),
      listCreatorEarnings(ctx.creatorProfile.id),
    ]);

    const now = new Date();

    const availableEarnings = earnings
      .filter(
        (item) =>
          item.status === "APPROVED" &&
          !!item.availableAt &&
          item.availableAt <= now,
      )
      .reduce((total, item) => total + Number(item.netAmount), 0);

    const processingEarnings = earnings
      .filter((item) => item.status === "PROCESSING")
      .reduce((total, item) => total + Number(item.netAmount), 0);

    creatorOverview = {
      actionRequired: hub.counts.actionRequired,
      openJobs: jobs.length,
      unread,
      activeCampaigns: campaigns.length,
      availableEarnings,
      processingEarnings,
    };

    creatorActivity = hub.active.slice(0, 4);
    creatorCampaigns = campaigns.slice(0, 3);

    if (hub.counts.actionRequired > 0) {
      attention.push({
        label: "Work needs your attention",
        href: "/app/work",
        hint: `${hub.counts.actionRequired} item${hub.counts.actionRequired === 1 ? "" : "s"} waiting for you`,
      });
    }

    if (unread > 0) {
      attention.push({
        label:
          unread === 1
            ? "1 unread notification"
            : `${unread} unread notifications`,
        href: "/app/notifications",
        hint: "There are updates waiting in your inbox",
      });
    }
  } else if (ctx.activeBrandId) {
    const canViewBrandAnalytics =
      ctx.user.isPlatformAdmin ||
      Boolean(
        ctx.membership &&
          hasPermission(ctx.membership.role, "analytics.view"),
      );

    const [briefs, campaigns, analytics] = await Promise.all([
      listBriefsForBrand(ctx.activeBrandId),
      listCampaignsForUser(session.user.id),
      canViewBrandAnalytics
        ? listBrandCampaignMetrics(ctx.activeBrandId)
        : Promise.resolve(null),
    ]);

    brandBriefs = briefs;
    brandCampaigns = campaigns;
    brandAnalytics = analytics;

    const pendingApps = briefs.reduce(
      (sum, brief) => sum + (brief._count?.applications ?? 0),
      0,
    );

    const drafts = briefs.filter(
      (brief) => brief.status === "DRAFT",
    ).length;

    attention.push(
      {
        label: "New applications",
        href: "/app/briefs",
        hint: `${pendingApps} waiting for review`,
      },
      {
        label: "Draft briefs",
        href: "/app/briefs",
        hint: `${drafts} not published yet`,
      },
      {
        label: "Find creators",
        href: "/app/creators",
        hint: "Search claimed + unclaimed supply",
      },
    );
  }

  if (ctx.user.isPlatformAdmin) {
    attention.push({
      label: "Moderation queue",
      href: "/app/admin",
      hint: "Approve briefs and seed prospects",
    });
  }

  const isCreator = ctx.kind === "creator" && creatorOverview !== null;

  const openBriefs =
    brandBriefs?.filter((brief) => brief.status === "OPEN").length ?? 0;

  const totalApplications =
    brandBriefs?.reduce(
      (total, brief) => total + (brief._count?.applications ?? 0),
      0,
    ) ?? 0;

  const recentBriefs = brandBriefs?.slice(0, 4) ?? [];
  const recentBrandCampaigns = brandCampaigns.slice(0, 3);

  /* ── Presentation-only derived values ─────────────────────────────────── */

  // "Find creators" is an action, not something waiting on the user. It lives in
  // the page header for brands and agencies, so it is not repeated in the list.
  const attentionItems = attention.filter(
    (item) => item.href !== "/app/creators",
  );

  const firstName = session.user.name?.split(" ")[0];

  const eyebrow = isCreator
    ? "CREATOR WORKSPACE"
    : ctx.kind === "agency"
      ? "AGENCY WORKSPACE"
      : "BRAND WORKSPACE";

  return (
    <AppPage
      eyebrow={eyebrow}
      title={`Welcome${firstName ? `, ${firstName}` : ""}`}
      description={
        ctx.activeBrand
          ? `${ctx.kind === "agency" ? "Active client" : "Active brand"}: ${ctx.activeBrand.name}`
          : isCreator
            ? "Your creative business, all in one place."
            : "Add the first brand. Then the work starts."
      }
      actions={
        isCreator ? (
          <ButtonLink href="/app/work">Open work hub</ButtonLink>
        ) : brandBriefs ? (
          <div className="flex items-center gap-4">
            <Link
              href="/app/creators"
              className="text-sm font-semibold text-[#003af4] transition hover:text-[#174cff]"
            >
              Find creators
            </Link>
            <ButtonLink href="/app/briefs/new">New brief</ButtonLink>
          </div>
        ) : (
          <ButtonLink href="/app/creators">Find creators</ButtonLink>
        )
      }
      width="wide"
      className="w-full max-w-none"
    >
      {isCreator && creatorOverview ? (
        <div className="w-full space-y-8">
          {/* Earnings + what needs you, side by side at the top */}
          <section className="grid items-stretch gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="flex min-h-[200px] flex-col justify-between rounded-2xl bg-[#12141a] p-6 text-white shadow-[0_16px_40px_rgba(18,20,26,0.12)] sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-white/60">
                  <Glyph icon={Wallet} size={16} className="text-white/50" />
                  Available earnings
                </div>
                <p className="mt-4 break-words text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl lg:text-5xl">
                  {formatNaira(creatorOverview.availableEarnings)}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Approved funds ready for payout
                </p>
              </div>

              <div className="mt-7">
                <Link
                  href="/app/earnings"
                  className="group inline-flex min-h-10 items-center justify-center gap-1 rounded-lg bg-white py-2.5 pl-4 pr-3 text-sm font-semibold text-[#12141a] transition hover:bg-[#0de3af]"
                >
                  View earnings
                  <Glyph
                    icon={ChevronRight}
                    size={16}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>

            <AttentionCard
              items={attentionItems}
              emptyBody="Nothing is waiting on you. Browse open briefs to find your next collaboration."
              emptyHref="/app/jobs"
              emptyLinkLabel="Explore opportunities"
            />
          </section>

          <StatStrip
            stats={[
              {
                label: "Open opportunities",
                value: creatorOverview.openJobs,
                icon: Compass,
                href: "/app/jobs",
                description: "Briefs you can apply to",
              },
              {
                label: "Active campaigns",
                value: creatorOverview.activeCampaigns,
                icon: Layers3,
                href: "/app/campaigns",
                description: "Your campaign workspaces",
              },
              {
                label: "Processing",
                value: formatNaira(creatorOverview.processingEarnings),
                icon: Clock,
                href: "/app/earnings",
                description: "Payments being processed",
              },
            ]}
          />

          <section className="grid items-start gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0 space-y-4">
              <SectionHeading
                title="Your work"
                href="/app/work"
                linkLabel="View work hub"
              />

              {creatorActivity.length > 0 ? (
                <ListGroup>
                  {creatorActivity.map((item) => (
                    <WorkRow key={`${item.kind}:${item.id}`} item={item} />
                  ))}
                </ListGroup>
              ) : (
                <EmptyState
                  icon={ClipboardCheck}
                  title="No active work yet"
                  body="Invitations, offers and deliverables will show up here."
                  href="/app/jobs"
                  linkLabel="Explore opportunities"
                />
              )}
            </div>

            <div className="min-w-0 space-y-4">
              <SectionHeading
                title="Your campaigns"
                href="/app/campaigns"
                linkLabel="View all"
              />

              {creatorCampaigns.length > 0 ? (
                <ListGroup>
                  {creatorCampaigns.map((campaign) => (
                    <CampaignRow key={campaign.id} campaign={campaign} />
                  ))}
                </ListGroup>
              ) : (
                <EmptyState
                  icon={Layers3}
                  title="Your campaigns will appear here"
                  body="Accept an application to open a campaign workspace and manage its deliverables."
                />
              )}
            </div>
          </section>
        </div>
      ) : brandBriefs ? (
        <div className="w-full space-y-8">
          <AttentionCard
            items={attentionItems}
            emptyBody="No new applications or drafts need a decision."
          />

          <StatStrip
            stats={[
              {
                label: "Open briefs",
                value: openBriefs,
                icon: BriefcaseBusiness,
                href: "/app/briefs",
                description: "Open for applications",
              },
              {
                label: "Applications",
                value: totalApplications,
                icon: ClipboardCheck,
                href: "/app/briefs",
                description: "Across your briefs",
              },
              {
                label: "Campaigns",
                value: brandCampaigns.length,
                icon: Layers3,
                href: "/app/campaigns",
                description: "Active campaign workspaces",
              },
            ]}
          />

          <section className="grid items-start gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0 space-y-4">
              <SectionHeading
                title="Recent briefs"
                href="/app/briefs"
                linkLabel="View all briefs"
              />

              {recentBriefs.length > 0 ? (
                <ListGroup>
                  {recentBriefs.map((brief) => (
                    <BriefRow key={brief.id} brief={brief} />
                  ))}
                </ListGroup>
              ) : (
                <EmptyState
                  icon={BriefcaseBusiness}
                  title="No briefs yet"
                  body="Create your first brief to open applications."
                  href="/app/briefs/new"
                  linkLabel="Create a brief"
                />
              )}
            </div>

            <div className="min-w-0 space-y-4">
              <SectionHeading
                title="Your campaigns"
                href="/app/campaigns"
                linkLabel="View all"
              />

              {recentBrandCampaigns.length > 0 ? (
                <ListGroup>
                  {recentBrandCampaigns.map((campaign) => (
                    <CampaignRow key={campaign.id} campaign={campaign} />
                  ))}
                </ListGroup>
              ) : (
                <EmptyState
                  icon={Layers3}
                  title="No campaigns yet"
                  body="Accept an application to open a campaign workspace."
                />
              )}
            </div>
          </section>

          {brandAnalytics ? (
            <section className="space-y-4">
              <SectionHeading
                title="Campaign performance"
                href="/app/analytics"
                linkLabel="View analytics"
              />

              <StatStrip
                stats={[
                  {
                    label: "Reach",
                    value: formatCount(brandAnalytics.totals.reach),
                    icon: Users,
                    href: "/app/analytics",
                    description: "Total logged reach",
                  },
                  {
                    label: "Views",
                    value: formatCount(brandAnalytics.totals.views),
                    icon: Eye,
                    href: "/app/analytics",
                    description: "Total logged views",
                  },
                  {
                    label: "Impressions",
                    value: formatCount(brandAnalytics.totals.impressions),
                    icon: Megaphone,
                    href: "/app/analytics",
                    description: "Total logged impressions",
                  },
                  {
                    label: "Engagement",
                    value: formatCount(brandAnalytics.totals.engagement),
                    icon: Heart,
                    href: "/app/analytics",
                    description: "Total logged engagement",
                  },
                ]}
              />

              {brandAnalytics.campaigns.some(
                (campaign) => campaign.metrics.length,
              ) ? (
                <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--woosh-border)] px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-[#12141a]">
                        Recent metrics
                      </p>
                      <p className="mt-0.5 text-xs text-[#6b6d73]">
                        Latest logged campaign performance
                      </p>
                    </div>
                    <Link
                      href="/app/analytics"
                      className="group inline-flex items-center gap-0.5 text-xs font-semibold text-[#003af4]"
                    >
                      View all
                      <Glyph
                        icon={ChevronRight}
                        size={14}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>

                  <ul className="divide-y divide-[var(--woosh-border)]">
                    {brandAnalytics.campaigns.flatMap((campaign) =>
                      campaign.metrics.slice(0, 2).map((metric) => (
                        <li
                          key={metric.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#12141a]">
                              {campaign.title}
                            </p>
                            <p className="mt-0.5 text-xs text-[#6b6d73]">
                              {metric.source} · {formatWhen(metric.capturedAt)}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-[#0de3af]/15 px-3 py-1 text-xs font-semibold tabular-nums text-[#087d62]">
                            {formatCount(metric.views ?? metric.reach ?? 0)}{" "}
                            {metric.views != null ? "views" : "reach"}
                          </span>
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              ) : (
                <EmptyState
                  icon={Compass}
                  title="No metrics yet"
                  body="Open a campaign and log a live post URL with views to populate this page."
                  href="/app/analytics"
                  linkLabel="View analytics"
                />
              )}
            </section>
          ) : null}
        </div>
      ) : (
        <div className="w-full">
          <AttentionCard items={attentionItems} />
        </div>
      )}
    </AppPage>
  );
}