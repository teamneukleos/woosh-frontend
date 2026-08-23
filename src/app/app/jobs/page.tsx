import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listJobsForCreator } from "@/domains/marketplace/briefs";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { FilterChips } from "@/components/ui/filter-chips";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const { tab } = await searchParams;
  const jobs = await listJobsForCreator(ctx.creatorProfile.id, tab);

  return (
    <AppPage
        eyebrow="Opportunities"
        title="Jobs"
        description="Open briefs ranked to your channels, category, location and rates."
        toolbar={
          <FilterChips
            active={tab ?? ""}
            items={[
              { value: "", label: "All open", href: "/app/jobs" },
              { value: "invited", label: "Invited", href: "/app/jobs?tab=invited" },
              { value: "applied", label: "Applied", href: "/app/jobs?tab=applied" },
            ]}
          />
        }
    >

      {jobs.length ? (
        <ul className="grid gap-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Panel className="transition hover:border-[var(--woosh-navy)]/20">
                <Link href={`/app/jobs/${job.id}`} className="block">
                <p className="break-words font-semibold text-[var(--woosh-navy)]">
                  {job.title}
                </p>
                <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                  {job.brand.name}
                  {job.rateAmount != null
                    ? ` · ${Number(job.rateAmount).toLocaleString()} ${job.currency}`
                    : ""}
                </p>
                </Link>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No jobs right now"
          description="Open jobs appear here ranked against your connected channels, category and rates."
        />
      )}
    </AppPage>
  );
}
