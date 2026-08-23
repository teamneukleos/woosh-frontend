import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCampaignsForUser } from "@/domains/campaign/deliverables";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const campaigns = await listCampaignsForUser(session.user.id);

  return (
    <AppPage
        eyebrow="Execution"
        title="Campaigns"
        description="Active workspaces for accepted creators and deliverables."
    >
      {campaigns.length ? (
        <ul className="grid gap-3">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Panel className="transition hover:border-[var(--woosh-navy)]/20">
              <Link
                href={`/app/campaigns/${c.id}`}
                className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-semibold text-[var(--woosh-navy)]">
                    {c.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                    {c.brand.name} · {c.deliverables.length} deliverables
                  </p>
                </div>
                <WorkStatus
                  status={c.status}
                  dueAt={
                    c.deliverables
                      .filter((deliverable) => deliverable.dueAt)
                      .sort(
                        (a, b) =>
                          a.dueAt!.getTime() - b.dueAt!.getTime(),
                      )[0]?.dueAt
                  }
                />
              </Link>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No campaigns yet"
          description="Accept an application to open a campaign workspace."
        />
      )}
    </AppPage>
  );
}
