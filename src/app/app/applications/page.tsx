import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { WorkStatus } from "@/components/work/work-status";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { withdrawApplicationAction } from "@/app/actions";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const apps = await prisma.application.findMany({
    where: { creatorProfileId: ctx.creatorProfile.id },
    include: {
      brief: { include: { brand: true } },
      offers: {
        where: { status: { in: ["OPEN", "COUNTERED"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppPage
        eyebrow="Jobs"
        title="Applications"
        description="Everything you’ve applied to, with current pipeline status."
    >
      {apps.length ? (
        <ul className="grid gap-3">
          {apps.map((app) => (
            <li key={app.id}>
              <Panel>
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div className="min-w-0">
                  <Link
                    href={`/app/jobs/${app.briefId}`}
                    className="font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                  >
                    {app.brief.title}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                    {app.brief.brand.name}
                    {app.proposedRate != null
                      ? ` · proposed ${Number(app.proposedRate).toLocaleString()} ${app.currency}`
                      : ""}
                    {app.offers[0]
                      ? ` · offer ${Number(app.offers[0].amount).toLocaleString()} ${app.offers[0].currency}`
                      : ""}
                  </p>
                </div>
                <WorkStatus
                  status={app.status}
                  dueAt={app.brief.applicationDeadline}
                />
              </div>
              {["APPLIED", "SHORTLISTED"].includes(app.status) ? (
                <ActionForm
                  action={withdrawApplicationAction}
                  successTitle="Application withdrawn"
                  className="mt-4 flex flex-wrap gap-2"
                >
                  <input type="hidden" name="applicationId" value={app.id} />
                  <Input name="reason" placeholder="Reason (optional)" />
                  <Button type="submit" variant="ghost" size="sm">
                    Withdraw
                  </Button>
                </ActionForm>
              ) : null}
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No applications yet"
          description="Browse open jobs and apply to get on a brand’s shortlist."
        />
      )}
    </AppPage>
  );
}
