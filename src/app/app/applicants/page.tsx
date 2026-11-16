import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listBrandApplications } from "@/domains/marketplace/briefs";
import { AppPage } from "@/components/ui/app-page";
import { EmptyState, Panel } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";

function statusTone(status: string) {
  if (status === "SHORTLISTED") return "blue" as const;
  if (status === "APPLIED") return "teal" as const;
  return "muted" as const;
}

export default async function ApplicantsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");
  if (!ctx.activeBrandId) redirect("/app/onboarding");

  const applications = await listBrandApplications(ctx.activeBrandId);

  return (
    <AppPage
      eyebrow="Demand"
      title="Applications"
      description={`Creators who applied to ${ctx.activeBrand?.name} briefs.`}
    >
      {applications.length ? (
        <ul className="grid gap-3">
          {applications.map((application) => (
            <li key={application.id}>
              <Panel>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar
                      name={application.creator.displayName}
                      src={
                        application.creator.avatarStatus === "APPROVED"
                          ? application.creator.avatarUrl
                          : null
                      }
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/app/creators/${application.creator.id}`}
                        className="font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                      >
                        {application.creator.displayName}
                      </Link>
                      <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                        Applied to{" "}
                        <Link
                          href={`/app/briefs/${application.brief.id}`}
                          className="font-medium text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                        >
                          {application.brief.title}
                        </Link>
                        {application.proposedRate != null
                          ? ` · ${Number(application.proposedRate).toLocaleString()} ${application.currency}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Badge tone={statusTone(application.status)}>
                    {application.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <div className="mt-4">
                  <ButtonLink
                    href={`/app/briefs/${application.brief.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Open brief
                  </ButtonLink>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="There is no active application"
          description="When a creator applies to one of this brand’s briefs, they show up here."
        />
      )}
    </AppPage>
  );
}
