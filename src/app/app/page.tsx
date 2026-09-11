import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getCreatorWorkHub } from "@/domains/work/hub";
import { listBriefsForBrand, listJobsForCreator } from "@/domains/marketplace/briefs";
import { countUnreadNotifications } from "@/domains/identity/notifications";
import { Panel } from "@/components/ui/panel";
import { ButtonLink } from "@/components/ui/button-link";
import { AppPage } from "@/components/ui/app-page";

export default async function AppHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx) redirect("/login");

  if (ctx.kind === "agency" && ctx.brands.length === 0) {
    redirect("/app/onboarding");
  }
  if (
    ctx.kind === "creator" &&
    ctx.creatorProfile?.marketplaceStatus === "DRAFT"
  ) {
    redirect("/app/onboarding");
  }

  const attention: { label: string; href: string; hint: string }[] = [];

  if (ctx.kind === "creator" && ctx.creatorProfile) {
    const [hub, jobs, unread] = await Promise.all([
      getCreatorWorkHub(session.user.id),
      listJobsForCreator(ctx.creatorProfile.id),
      countUnreadNotifications(),
    ]);
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
  } else if (ctx.activeBrandId) {
    const briefs = await listBriefsForBrand(ctx.activeBrandId);
    const pendingApps = briefs.reduce(
      (sum, brief) => sum + (brief._count?.applications ?? 0),
      0,
    );
    const drafts = briefs.filter((brief) => brief.status === "DRAFT").length;
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

  return (
    <AppPage
      eyebrow="Workspace"
      title={`Welcome${session.user.name ? `, ${session.user.name}` : ""}`}
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
      <Panel
        title="What is waiting on you?"
        description="The next moves that actually move the brief."
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {attention.map((item) => (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                className="group flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-[var(--surface-base)] px-4 py-3.5 transition hover:bg-[var(--surface-sunken)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
              >
                <span>
                  <span className="font-semibold text-[var(--woosh-navy)] group-hover:text-[var(--woosh-blue)]">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--text-secondary)]">
                    {item.hint}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[var(--woosh-blue)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </li>
          ))}
        </ul>
        {!attention.length ? (
          <p className="text-sm text-[var(--woosh-dull)]/70">
            You&apos;re caught up. Explore creators or publish a brief.
          </p>
        ) : null}
      </Panel>
    </AppPage>
  );
}
