import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileText,
  Layers,
  Layers3,
  Mail,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCreatorWorkHub } from "@/domains/work/hub";
import {
  listBrandApplications,
  listBriefsForBrand,
  listJobsForCreator,
} from "@/domains/marketplace/briefs";
import { countUnreadNotifications } from "@/domains/identity/notifications";
import { listCreatorEarnings } from "@/domains/payments/ledger";
import { ButtonLink } from "@/components/ui/button-link";
import { AppPage } from "@/components/ui/app-page";

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

const ITEM_ICONS: Record<string, LucideIcon> = {
  "/app/notifications": Bell,
  "/app/work": ClipboardCheck,
  "/app/jobs": Compass,
  "/app/earnings": Wallet,
  "/app/applicants": Users,
  "/app/briefs": BriefcaseBusiness,
  "/app/creators": Search,
  "/app/admin": ShieldCheck,
};

type Stat = {
  label: string;
  value: number | string;
  href: string;
  note: string;
  highlight?: boolean;
};

type AttentionRow = {
  label: string;
  href: string;
  hint: string;
};

type PreviewRow = {
  id: string;
  title: string;
  sub: string;
  meta?: string | null;
  due?: string | null;
  href: string;
};

type PipelineRow = {
  label: string;
  href: string;
  icon: LucideIcon;
  count: number;
  note: string;
  highlight?: boolean;
};

type CreatorView = {
  unread: number;
  needs: PreviewRow[];
  jobs: PreviewRow[];
  pipeline: PipelineRow[];
  available: number;
  releasing: number;
};

type BrandView = {
  needs: AttentionRow[];
  recent: PreviewRow[];
  pipeline: PipelineRow[];
};

const KIND_LABEL: Record<string, string> = {
  invitation: "Invitation",
  application: "Application",
  deliverable: "Deliverable",
};

function humanize(value: string) {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDue(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  });
}

function naira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

function Panel({
  title,
  description,
  href,
  linkLabel = "View all",
  className = "",
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="shrink-0 pt-0.5 text-sm font-medium text-[var(--woosh-blue)] transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:underline"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)] sm:px-6">
      {children}
    </p>
  );
}

function PreviewList({ rows, empty }: { rows: PreviewRow[]; empty: string }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-[var(--woosh-border)]">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={row.href}
            className="group flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none sm:px-6"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)]">
                {row.title}
              </span>
              <span className="mt-0.5 block truncate text-sm text-[var(--text-secondary)]">
                {row.sub}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              {row.meta || row.due ? (
                <span className="hidden text-right sm:block">
                  {row.meta ? (
                    <span className="block text-xs font-medium text-[var(--text-strong)]">
                      {row.meta}
                    </span>
                  ) : null}
                  {row.due ? (
                    <span className="block text-xs text-[var(--text-muted)]">
                      {row.due}
                    </span>
                  ) : null}
                </span>
              ) : null}
              <Glyph
                icon={ChevronRight}
                size={16}
                className="text-[#c2c4c9] transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PipelineList({ rows }: { rows: PipelineRow[] }) {
  return (
    <ul className="divide-y divide-[var(--woosh-border)]">
      {rows.map((row) => (
        <li key={row.label}>
          <Link
            href={row.href}
            className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none sm:px-6"
          >
            <span className="flex min-w-0 items-center gap-4">
              <Glyph icon={row.icon} size={18} className="text-[#9b9da3]" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)]">
                  {row.label}
                </span>
                <span
                  className={`mt-0.5 block text-sm ${
                    row.highlight
                      ? "text-[var(--woosh-blue)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {row.note}
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-lg font-semibold tabular-nums text-[var(--woosh-navy)]">
                {row.count}
              </span>
              <Glyph
                icon={ChevronRight}
                size={16}
                className="text-[#c2c4c9] transition group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function AttentionList({ rows }: { rows: AttentionRow[] }) {
  return (
    <ul className="divide-y divide-[var(--woosh-border)]">
      {rows.map((item) => {
        const icon = ITEM_ICONS[item.href] ?? Layers3;

        return (
          <li key={item.href + item.label}>
            <Link
              href={item.href}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none sm:px-6"
            >
              <span className="flex min-w-0 items-center gap-4">
                <Glyph icon={icon} size={18} className="text-[#9b9da3]" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--woosh-navy)] transition-colors group-hover:text-[var(--woosh-blue)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-6 text-[var(--text-secondary)]">
                    {item.hint}
                  </span>
                </span>
              </span>
              <Glyph
                icon={ChevronRight}
                size={16}
                className="text-[#c2c4c9] transition group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        );
      })}
    </ul>
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

  const attention: { label: string; href: string; hint: string }[] = [];
  const stats: Stat[] = [];
  let creatorView: CreatorView | null = null;
  let brandView: BrandView | null = null;

  if (ctx.kind === "creator" && ctx.creatorProfile) {
    const [hub, jobs, unread, earnings] = await Promise.all([
      getCreatorWorkHub(session.user.id),
      listJobsForCreator(ctx.creatorProfile.id),
      countUnreadNotifications(),
      listCreatorEarnings(ctx.creatorProfile.id),
    ]);
    const now = new Date();
    const available = earnings
      .filter(
        (item) =>
          item.status === "APPROVED" &&
          !!item.availableAt &&
          item.availableAt <= now,
      )
      .reduce((total, item) => total + Number(item.netAmount), 0);
    const releasing = earnings
      .filter(
        (item) =>
          item.status === "APPROVED" &&
          !!item.availableAt &&
          item.availableAt > now,
      )
      .reduce((total, item) => total + Number(item.netAmount), 0);
    if (unread > 0) {
      attention.push({
        label:
          unread === 1
            ? "1 unread notification"
            : `${unread} unread notifications`,
        href: "/app/notifications",
        hint: `${unread} waiting in your inbox`,
      });
    }
    attention.push(
      {
        label: "Work that needs you",
        href: "/app/work",
        hint: `${hub.counts.actionRequired} action${hub.counts.actionRequired === 1 ? "" : "s"} waiting`,
      },
      {
        label: "Open jobs",
        href: "/app/jobs",
        hint: `${jobs.length} briefs accepting applications`,
      },
      {
        label: "Earnings",
        href: "/app/earnings",
        hint: "Rates and payout status",
      },
    );
    stats.push(
      {
        label: "Available earnings",
        value: naira(available),
        href: "/app/earnings",
        note: "Ready for automatic payout",
      },
      {
        label: "Needs action",
        value: hub.counts.actionRequired,
        href: "/app/work",
        note: "Waiting on you",
        highlight: hub.counts.actionRequired > 0,
      },
      {
        label: "Open jobs",
        value: jobs.length,
        href: "/app/jobs",
        note: "Accepting applications",
      },
      {
        label: "Invitations",
        value: hub.counts.invitations,
        href: "/app/invitations",
        note: "Waiting for your reply",
        highlight: hub.counts.invitations > 0,
      },
    );

    const activeOf = (kind: string) =>
      hub.active.filter((item) => item.kind === kind).length;

    creatorView = {
      unread,
      available,
      releasing,
      needs: hub.active
        .filter((item) => item.actionRequired)
        .slice(0, 4)
        .map((item) => ({
          id: `${item.kind}-${item.id}`,
          title: item.title,
          sub: `${item.brandName} · ${KIND_LABEL[item.kind] ?? item.kind}`,
          meta: humanize(item.status),
          due: formatDue(item.dueAt),
          href: item.href,
        })),
      jobs: jobs.slice(0, 4).map((job) => ({
        id: job.id,
        title: job.title,
        sub: job.brand?.name ?? "",
        due: formatDue(job.applicationDeadline),
        href: `/app/jobs/${job.id}`,
      })),
      pipeline: [
        {
          label: "Invitations",
          href: "/app/invitations",
          icon: Mail,
          count: activeOf("invitation"),
          note:
            hub.counts.invitations > 0
              ? `${hub.counts.invitations} to respond to`
              : "Nothing to respond to",
          highlight: hub.counts.invitations > 0,
        },
        {
          label: "Applications",
          href: "/app/applications",
          icon: FileText,
          count: activeOf("application"),
          note:
            hub.counts.offers > 0
              ? `${hub.counts.offers} offer${hub.counts.offers === 1 ? "" : "s"} to review`
              : "Awaiting brand decision",
          highlight: hub.counts.offers > 0,
        },
        {
          label: "Campaigns",
          href: "/app/campaigns",
          icon: Layers,
          count: activeOf("deliverable"),
          note:
            hub.counts.overdue > 0
              ? `${hub.counts.overdue} overdue`
              : "Deliverables in progress",
          highlight: hub.counts.overdue > 0,
        },
      ],
    };
  } else if (ctx.activeBrandId) {
    const [briefs, applications] = await Promise.all([
      listBriefsForBrand(ctx.activeBrandId),
      listBrandApplications(ctx.activeBrandId),
    ]);
    const drafts = briefs.filter((brief) => brief.status === "DRAFT").length;
    const openBriefs = briefs.filter((brief) => brief.status === "OPEN").length;
    attention.push(
      {
        label: "New applications",
        href: "/app/applicants",
        hint:
          applications.length === 1
            ? "1 waiting for review"
            : `${applications.length} waiting for review`,
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
    stats.push(
      {
        label: "New applications",
        value: applications.length,
        href: "/app/applicants",
        note: "Waiting for review",
        highlight: applications.length > 0,
      },
      {
        label: "Draft briefs",
        value: drafts,
        href: "/app/briefs",
        note: "Not published yet",
      },
      {
        label: "Open briefs",
        value: openBriefs,
        href: "/app/briefs",
        note: "Accepting applications",
      },
    );

    const needs: AttentionRow[] = [];
    if (applications.length > 0) {
      needs.push({
        label: "New applications",
        href: "/app/applicants",
        hint:
          applications.length === 1
            ? "1 waiting for review"
            : `${applications.length} waiting for review`,
      });
    }
    if (drafts > 0) {
      needs.push({
        label: "Draft briefs",
        href: "/app/briefs",
        hint: `${drafts} not published yet`,
      });
    }

    brandView = {
      needs,
      recent: briefs.slice(0, 4).map((brief) => {
        const count = brief._count?.applications ?? 0;
        return {
          id: brief.id,
          title: brief.title,
          sub: `${count} application${count === 1 ? "" : "s"}`,
          meta: humanize(String(brief.status)),
          href: `/app/briefs/${brief.id}`,
        };
      }),
      pipeline: [
        {
          label: "Applications",
          href: "/app/applicants",
          icon: Users,
          count: applications.length,
          note:
            applications.length > 0
              ? "Waiting for review"
              : "No new applications",
          highlight: applications.length > 0,
        },
        {
          label: "Open briefs",
          href: "/app/briefs",
          icon: Layers,
          count: openBriefs,
          note: "Accepting applications",
        },
        {
          label: "Draft briefs",
          href: "/app/briefs",
          icon: FileText,
          count: drafts,
          note: drafts > 0 ? "Not published yet" : "No drafts",
        },
      ],
    };
  }

  if (ctx.user.isPlatformAdmin) {
    attention.push({
      label: "Moderation queue",
      href: "/app/admin",
      hint: "Approve briefs and seed prospects",
    });
  }

  const adminItems = attention.filter((item) => item.href === "/app/admin");

  const listItems = creatorView ? adminItems : brandView ? [] : attention;

  const brandNeeds = brandView ? [...brandView.needs, ...adminItems] : [];

  const firstName = session.user.name?.split(" ")[0];

  const statColumns =
    stats.length >= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-3";

  return (
    <AppPage
      eyebrow={
        ctx.kind === "creator"
          ? "CREATOR WORKSPACE"
          : ctx.kind === "agency"
            ? "AGENCY WORKSPACE"
            : "BRAND WORKSPACE"
      }
      title={`Welcome${firstName ? `, ${firstName}` : ""}`}
      description={
        ctx.activeBrand
          ? `Active brand: ${ctx.activeBrand.name}`
          : ctx.kind === "creator"
            ? "Jobs, campaigns, earnings — your seat."
            : "Add the first brand. Then the work starts."
      }
      actions={
        ctx.kind === "creator" ? (
          <ButtonLink href="/app/work">Open work hub</ButtonLink>
        ) : (
          <ButtonLink href="/app/creators">Find creators</ButtonLink>
        )
      }
    >
      <div className="w-full space-y-6">
        {creatorView && creatorView.unread > 0 ? (
          <Link
            href="/app/notifications"
            className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--woosh-border)] bg-white px-4 py-3 text-sm transition-colors hover:bg-[#faf9f7] focus-visible:outline-none focus-visible:bg-[#faf9f7]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Glyph icon={Bell} size={16} className="text-[#9b9da3]" />
              <span className="truncate text-[var(--text-secondary)]">
                {creatorView.unread === 1
                  ? "1 unread notification"
                  : `${creatorView.unread} unread notifications`}
              </span>
            </span>
            <Glyph
              icon={ChevronRight}
              size={16}
              className="text-[#c2c4c9] transition group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}

        {stats.length ? (
          <section
            aria-label="At a glance"
            className={`grid gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] ${statColumns}`}
          >
            {stats.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="group flex min-w-0 flex-col gap-3 bg-white p-5 transition-colors hover:bg-[#faf9f7] focus-visible:bg-[#faf9f7] focus-visible:outline-none"
              >
                <p className="text-sm font-medium text-[var(--text-muted)]">
                  {stat.label}
                </p>
                <p className="break-words text-3xl font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)]">
                  {stat.value}
                </p>
                <p
                  className={`text-xs font-medium ${
                    stat.highlight
                      ? "text-[var(--woosh-blue)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {stat.note}
                </p>
              </Link>
            ))}
          </section>
        ) : null}

        {creatorView ? (
          <div className="grid gap-6 lg:grid-cols-5">
            <Panel
              title="Needs your attention"
              description="Deliverables, invitations and offers waiting on you."
              href="/app/work"
              className="lg:col-span-3"
            >
              <PreviewList
                rows={creatorView.needs}
                empty="You're caught up. Nothing needs you right now."
              />
            </Panel>

            <Panel
              title="Earnings"
              description="Paid out automatically once released."
              href="/app/earnings"
              linkLabel="Open earnings"
              className="lg:col-span-2"
            >
              <ul className="divide-y divide-[var(--woosh-border)]">
                <li className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <span>
                    <span className="block text-sm font-semibold text-[var(--woosh-navy)]">
                      Available now
                    </span>
                    <span className="mt-0.5 block text-sm text-[var(--text-secondary)]">
                      Approved and ready
                    </span>
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-[var(--woosh-navy)]">
                    {naira(creatorView.available)}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <span>
                    <span className="block text-sm font-semibold text-[var(--woosh-navy)]">
                      Releasing soon
                    </span>
                    <span className="mt-0.5 block text-sm text-[var(--text-secondary)]">
                      Approved, not yet released
                    </span>
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-[var(--text-secondary)]">
                    {naira(creatorView.releasing)}
                  </span>
                </li>
              </ul>
            </Panel>

            <Panel
              title="Open jobs"
              description="Newest briefs accepting applications."
              href="/app/jobs"
              linkLabel="Browse jobs"
              className="lg:col-span-3"
            >
              <PreviewList
                rows={creatorView.jobs}
                empty="No open jobs right now. Check back soon."
              />
            </Panel>

            <Panel
              title="Your pipeline"
              description="Where your work stands."
              className="lg:col-span-2"
            >
              <PipelineList rows={creatorView.pipeline} />
            </Panel>
          </div>
        ) : null}

        {brandView ? (
          <div className="grid gap-6 lg:grid-cols-5">
            <Panel
              title="Needs your attention"
              description="Applications and drafts waiting on you."
              href="/app/applicants"
              linkLabel="Review applications"
              className="lg:col-span-3"
            >
              {brandNeeds.length ? (
                <AttentionList rows={brandNeeds} />
              ) : (
                <Empty>You&apos;re caught up. Nothing needs you right now.</Empty>
              )}
            </Panel>

            <Panel
              title="Find creators"
              description="Search claimed and unclaimed creators."
              href="/app/creators"
              linkLabel="Open discovery"
              className="lg:col-span-2"
            >
              <AttentionList
                rows={[
                  {
                    label: "Creator discovery",
                    href: "/app/creators",
                    hint: "Search claimed + unclaimed supply",
                  },
                ]}
              />
            </Panel>

            <Panel
              title="Recent briefs"
              description="Your latest briefs and where they stand."
              href="/app/briefs"
              linkLabel="View all briefs"
              className="lg:col-span-3"
            >
              <PreviewList
                rows={brandView.recent}
                empty="No briefs yet. Create your first brief to open applications."
              />
            </Panel>

            <Panel
              title="Your pipeline"
              description="Where your hiring stands."
              className="lg:col-span-2"
            >
              <PipelineList rows={brandView.pipeline} />
            </Panel>
          </div>
        ) : null}

        {(!creatorView && !brandView) || listItems.length ? (
          <section className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                What is waiting on you?
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                The next moves that actually move the brief.
              </p>
            </div>

            {listItems.length ? (
              <AttentionList rows={listItems} />
            ) : (
              <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)] sm:px-6">
                You&apos;re caught up. Explore creators or publish a brief.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </AppPage>
  );
}