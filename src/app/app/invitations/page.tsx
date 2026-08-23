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
import { declineInvitationAction } from "@/app/actions";
import { ButtonLink } from "@/components/ui/button-link";

export default async function InvitationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");

  const invites = await prisma.briefInvitation.findMany({
    where: { creatorProfileId: ctx.creatorProfile.id },
    include: {
      brief: { include: { brand: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppPage
        eyebrow="Jobs"
        title="Invitations"
        description="Direct invites from brands and agencies."
    >
      {invites.length ? (
        <ul className="grid gap-3">
          {invites.map((inv) => (
            <li key={inv.id}>
              <Panel>
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                <div className="min-w-0">
                  <Link
                    href={`/app/jobs/${inv.briefId}`}
                    className="font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]"
                  >
                    {inv.brief.title}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                    {inv.brief.brand.name}
                    {inv.message ? ` · ${inv.message}` : ""}
                  </p>
                </div>
                <WorkStatus
                  status={inv.status}
                  dueAt={inv.brief.applicationDeadline}
                />
              </div>
              {["SENT", "VIEWED"].includes(inv.status) ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <ButtonLink href={`/app/jobs/${inv.briefId}`} size="sm">
                    Review
                  </ButtonLink>
                  <ActionForm
                    action={declineInvitationAction}
                    successTitle="Invitation declined"
                    className="grid w-full min-w-0 gap-2 sm:flex"
                  >
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <Input name="reason" placeholder="Reason (optional)" />
                    <Button type="submit" variant="ghost" size="sm">
                      Decline
                    </Button>
                  </ActionForm>
                </div>
              ) : null}
              </Panel>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No invitations"
          description="When brands invite you to a brief, they show up here."
        />
      )}
    </AppPage>
  );
}
