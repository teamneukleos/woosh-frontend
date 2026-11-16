
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listBriefsForBrand } from "@/domains/marketplace/briefs";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";

function statusTone(status: string) {
  if (status === "OPEN") return "teal" as const;
  if (status === "DRAFT" || status === "PENDING_MODERATION")
    return "warn" as const;
  return "muted" as const;
}

function readableStatus(status: string) {
  if (status === "PENDING_MODERATION") return "Pending review";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function BriefsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");
  if (!ctx.activeBrandId) redirect("/app/onboarding");

  const briefs = await listBriefsForBrand(ctx.activeBrandId);

  return (
    <AppPage
      eyebrow="Demand"
      title="Briefs"
      description={`Campaigns for ${ctx.activeBrand?.name}.`}
      actions={<ButtonLink href="/app/briefs/new">New brief</ButtonLink>}
      width="wide"
      className="w-full max-w-none"
    >
      {briefs.length ? (
        <section className="w-full overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                All briefs
              </p>
              <p className="mt-1 text-xs tabular-nums text-[var(--text-muted)]">
                {briefs.length} {briefs.length === 1 ? "brief" : "briefs"}
              </p>
            </div>
          </div>

          <div className="hidden grid-cols-[minmax(0,1fr)_180px_150px_90px] items-center gap-4 border-b border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] sm:grid sm:px-6">
            <span>Title</span>
            <span>Status</span>
            <span>Applications</span>
            <span className="text-right"> </span>
          </div>

          <ul className="divide-y divide-[var(--woosh-border)]">
            {briefs.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/app/briefs/${b.id}`}
                  className="group grid min-w-0 grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-[#faf9f7] sm:grid-cols-[minmax(0,1fr)_180px_150px_90px] sm:items-center sm:gap-4 sm:px-6"
                >
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-[var(--woosh-navy)] hover:underline hover:underline-offset-4">
                      {b.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-[var(--text-muted)] sm:hidden">
                      Title
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:block">
                    <span className="text-[11px] text-[var(--text-muted)] sm:hidden">
                      Status
                    </span>
                    <Badge tone={statusTone(b.status)}>
                      {readableStatus(b.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:block">
                    <span className="text-[11px] text-[var(--text-muted)] sm:hidden">
                      Applications
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-[var(--woosh-navy)]">
                      {b._count.applications}
                    </span>
                  </div>

                  <div className="hidden justify-end sm:flex">
                    <ChevronRight
                      size={16}
                      strokeWidth={1.5}
                      className="text-[#c2c4c9] transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="w-full rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-8">
          <EmptyState
            title="No briefs yet"
            description="Create your first brief to open applications."
            action={<ButtonLink href="/app/briefs/new">New brief</ButtonLink>}
          />
        </div>
      )}
    </AppPage>
  );
}
