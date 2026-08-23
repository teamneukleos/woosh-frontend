import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listDisputesForUser } from "@/domains/payments/disputes";
import { resolvePaymentDisputeAction } from "@/app/actions";
import { BackLink } from "@/components/ui/back-link";
import { Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Select, TextArea } from "@/components/ui/field";

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const [{ id }, ctx, disputes] = await Promise.all([
    params,
    getWorkspaceContext(session.user.id),
    listDisputesForUser(session.user.id),
  ]);
  const dispute = disputes.find((row) => row.id === id);
  if (!dispute) notFound();
  return (
    <AppPage
        eyebrow={dispute.category.replaceAll("_", " ")}
        title={dispute.subject}
        description={`${dispute.obligation.participant.campaign.title} · ${dispute.obligation.participant.campaign.brand.name}`}
        actions={<StatusBadge status={dispute.status} />}
        width="narrow"
    >
      <BackLink href="/app/disputes">Disputes</BackLink>
      <Panel title="Issue">
        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--woosh-dull)]">
          {dispute.description}
        </p>
        {dispute.requestedResolution ? (
          <p className="mt-4 text-sm"><strong>Requested:</strong> {dispute.requestedResolution}</p>
        ) : null}
        {dispute.resolution ? (
          <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--woosh-teal)]/10 p-4 text-sm">
            <strong>Platform resolution:</strong> {dispute.resolution}
          </div>
        ) : null}
      </Panel>
      {ctx?.user.isPlatformAdmin && ["OPEN", "UNDER_REVIEW"].includes(dispute.status) ? (
        <Panel title="Resolve dispute">
          <ActionForm action={resolvePaymentDisputeAction} successTitle="Dispute resolved" className="grid gap-3">
            <input type="hidden" name="disputeId" value={dispute.id} />
            <Select name="resolutionType" required>
              <option value="RELEASE_PAYOUT">Release creator payout</option>
              <option value="REFUND_BRAND">Refund brand wallet</option>
            </Select>
            <TextArea name="resolution" required minLength={10} rows={4} placeholder="Document the decision and supporting evidence" />
            <Button type="submit" className="w-fit">Resolve</Button>
          </ActionForm>
        </Panel>
      ) : null}
    </AppPage>
  );
}
