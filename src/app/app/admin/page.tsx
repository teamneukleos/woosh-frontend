import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  listPendingBriefs,
  listProspects,
  listUsers,
  listOrganisations,
  listCreatorModeration,
} from "@/domains/trust/admin";
import { AdminOps } from "@/components/admin/admin-ops";
import { listDisputesForUser } from "@/domains/payments/disputes";
import { AppPage } from "@/components/ui/app-page";
import { listFailedWebhookEvents } from "@/domains/payments/webhooks";
import { Panel } from "@/components/ui/panel";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { replayPaystackWebhookAction } from "@/app/actions";

export default async function AppAdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.user.isPlatformAdmin) redirect("/app");

  const [pending, prospects, users, organisations, creatorModeration, disputes, failedWebhooks] = await Promise.all([
    listPendingBriefs(),
    listProspects(),
    listUsers(),
    listOrganisations(),
    listCreatorModeration(),
    listDisputesForUser(session.user.id),
    listFailedWebhookEvents(),
  ]);

  const adminCount = users.filter((u) => u.isPlatformAdmin).length;

  return (
    <AppPage
      eyebrow="Platform"
      title="Ops console"
      description="Clear moderation, verify organisations, resolve disputes and manage platform access."
      width="wide"
    >
      <AdminOps
        pending={pending}
        prospectCount={prospects.length}
        users={users}
        adminCount={adminCount}
        organisations={organisations}
        creatorModeration={creatorModeration}
        disputes={disputes.map((dispute) => ({
          id: dispute.id,
          subject: dispute.subject,
          status: dispute.status,
          category: dispute.category,
          campaignTitle: dispute.obligation.participant.campaign.title,
          creatorName: dispute.obligation.participant.creator.displayName,
          responseDueAt: dispute.responseDueAt,
        }))}
      />
      <Panel
        title="Failed provider webhooks"
        description="Inspect and replay Paystack events after correcting the underlying provider or data issue."
      >
        {failedWebhooks.length ? (
          <Table>
            <THead>
              <TR>
                <TH>Event</TH>
                <TH>Reference</TH>
                <TH>Error</TH>
                <TH>Received</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {failedWebhooks.map((event) => (
                <TR key={event.id}>
                  <TD className="font-semibold">{event.eventType}</TD>
                  <TD>{event.reference ?? "—"}</TD>
                  <TD className="max-w-sm text-[var(--danger)]">
                    {event.error}
                  </TD>
                  <TD>{event.createdAt.toLocaleString("en-NG")}</TD>
                  <TD>
                    <ActionForm
                      action={replayPaystackWebhookAction}
                      successTitle="Webhook replayed"
                    >
                      <input type="hidden" name="eventId" value={event.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        Replay
                      </Button>
                    </ActionForm>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            No failed Paystack events are waiting for replay.
          </p>
        )}
      </Panel>
    </AppPage>
  );
}
