import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { listCreatorEarnings } from "@/domains/payments/ledger";
import { listCreatorDocuments } from "@/domains/payments/documents";
import { listPayoutBanks } from "@/domains/payments/payout-account";
import { api } from "@/lib/api";
import {
  createCreatorStatementAction,
  createPaymentDisputeAction,
  savePayoutAccountAction,
} from "@/app/actions";
import { AppPage } from "@/components/ui/app-page";
import { EmptyState, Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedCheck } from "@/components/ui/verified-check";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Select, TextArea } from "@/components/ui/field";
import { Stat } from "@/components/ui/stat";

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx?.creatorProfile) redirect("/app");
  const [earnings, payout, banks, documents] = await Promise.all([
    listCreatorEarnings(ctx.creatorProfile.id),
    api<{
      id: string;
      bankCode?: string | null;
      bankName: string | null;
      accountName: string | null;
      accountNumberLast4: string | null;
      verifiedAt: string | null;
    } | null>("/creators/me/payout-account"),
    listPayoutBanks(),
    listCreatorDocuments(),
  ]);
  const sum = (statuses: string[]) =>
    earnings
      .filter((item) => statuses.includes(item.status))
      .reduce((total, item) => total + Number(item.netAmount), 0);
  const now = new Date();
  const previousMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );
  const available = earnings
    .filter(
      (item) =>
        item.status === "APPROVED" &&
        !!item.availableAt &&
        item.availableAt <= now,
    )
    .reduce((total, item) => total + Number(item.netAmount), 0);

  return (
    <AppPage
      eyebrow="Creator finance"
      title="Earnings and payouts"
      description="Track secured earnings, the 72-hour release window, bank transfers and payment documents."
    >
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Available" value={`₦${available.toLocaleString()}`} hint="Ready for automatic payout" />
        <Stat label="Processing" value={`₦${sum(["PROCESSING"]).toLocaleString()}`} hint="With payout provider" />
        <Stat label="In dispute" value={`₦${sum(["DISPUTED"]).toLocaleString()}`} hint="Temporarily frozen" />
        <Stat label="Lifetime paid" value={`₦${sum(["PAID"]).toLocaleString()}`} hint="Net creator earnings" />
      </section>

      <Panel
        title="Verified payout account"
        description="Woosh resolves your NUBAN account with Paystack. Full account numbers are encrypted and never displayed."
        className="bg-white"
      >
        {payout?.verifiedAt ? (
          <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--woosh-teal)]/10 p-4">
            <p className="flex items-center gap-1.5 font-semibold text-[var(--woosh-navy)]">
              <span>{payout.accountName}</span>
              <VerifiedCheck label="Verified payout account" />
            </p>
            <p className="mt-1 text-sm text-[var(--woosh-dull)]/75">
              {payout.bankName || payout.bankCode} · ••••••
              {payout.accountNumberLast4}
            </p>
          </div>
        ) : (
          <p className="mb-4 text-sm text-[var(--warning)]">
            Add and verify an account before earnings can be released.
          </p>
        )}
        <ActionForm
          action={savePayoutAccountAction}
          successTitle="Payout account verified"
          className="grid max-w-xl gap-3 sm:grid-cols-2"
        >
          <Label>
            Bank
            <Select name="bankCode" required defaultValue={payout?.bankCode ?? ""}>
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </Select>
          </Label>
          <Label>
            Account number
            <Input
              name="accountNumber"
              inputMode="numeric"
              pattern="[0-9]{10}"
              minLength={10}
              maxLength={10}
              required
              placeholder="10-digit NUBAN"
            />
          </Label>
          <Button type="submit" className="w-fit sm:col-span-2">
            Verify account
          </Button>
        </ActionForm>
      </Panel>

      <section className="grid gap-4">
        <h2 className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[var(--woosh-navy)]">Payment timeline</h2>
        {earnings.length ? (
          earnings.map((item) => {
            const openDispute = item.disputes?.some((dispute) =>
              ["OPEN", "UNDER_REVIEW"].includes(dispute.status),
            );
            return (
              <Panel key={item.id} className="bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/app/campaigns/${item.participant.campaignId}`} className="font-semibold text-[var(--woosh-navy)] hover:text-[var(--woosh-blue)]">
                      {item.participant.campaign.title}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--woosh-dull)]/70">
                      {item.participant.campaign.brand.name}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-[var(--woosh-dull)]/60">Gross</dt><dd className="font-semibold">{Number(item.grossAmount).toLocaleString()} {item.currency}</dd></div>
                  <div><dt className="text-[var(--woosh-dull)]/60">Platform fee</dt><dd>{Number(item.platformFee).toLocaleString()} {item.currency}</dd></div>
                  <div><dt className="text-[var(--woosh-dull)]/60">Your net</dt><dd className="font-semibold">{Number(item.netAmount).toLocaleString()} {item.currency}</dd></div>
                  <div><dt className="text-[var(--woosh-dull)]/60">Expected release</dt><dd>{item.availableAt ? item.availableAt.toLocaleString("en-NG") : "After campaign completion"}</dd></div>
                </dl>
                {item.failureReason ? (
                  <p className="mt-3 rounded-[var(--radius-control)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                    {item.failureReason}
                  </p>
                ) : null}
                {item.transactions.length ? (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-[var(--woosh-blue)]">Payout attempts</summary>
                    <ul className="mt-2 grid gap-2 text-sm">
                      {item.transactions.filter((row) => row.type === "PAYOUT").map((row) => (
                        <li key={row.id}>{row.createdAt.toLocaleString("en-NG")} · {row.status} · {row.providerReference || row.provider}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                {!openDispute && ["APPROVED", "FAILED"].includes(item.status) ? (
                  <details className="mt-4 border-t border-[var(--woosh-border)] pt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-[var(--woosh-navy)]">Raise a payment dispute</summary>
                    <ActionForm action={createPaymentDisputeAction} successTitle="Dispute opened" className="mt-3 grid gap-3">
                      <input type="hidden" name="obligationId" value={item.id} />
                      <Select name="category" required>
                        <option value="PAYMENT_AMOUNT">Payment amount</option>
                        <option value="PAYOUT_DELAY">Payout delay</option>
                        <option value="CONTENT_APPROVAL">Content approval</option>
                        <option value="CANCELLATION">Cancellation</option>
                        <option value="OTHER">Other</option>
                      </Select>
                      <Input name="subject" required minLength={3} placeholder="Issue summary" />
                      <TextArea name="description" required minLength={20} rows={3} placeholder="Explain the issue and desired outcome" />
                      <Input name="requestedResolution" placeholder="Requested resolution (optional)" />
                      <Button type="submit" variant="secondary" className="w-fit">Open dispute</Button>
                    </ActionForm>
                  </details>
                ) : null}
              </Panel>
            );
          })
        ) : (
          <EmptyState title="No earnings yet" description="Secured campaign earnings will appear here." />
        )}
      </section>

      <Panel title="Statements and receipts" className="bg-white">
        <ActionForm action={createCreatorStatementAction} successTitle="Statement generated" className="mb-4 flex flex-wrap items-end gap-3">
          <Label>Year<Input name="year" type="number" defaultValue={previousMonth.getUTCFullYear()} min={2020} max={now.getFullYear()} /></Label>
          <Label>Month<Input name="month" type="number" defaultValue={previousMonth.getUTCMonth() + 1} min={1} max={12} /></Label>
          <Button type="submit" variant="secondary">Generate monthly statement</Button>
        </ActionForm>
        {documents.length ? (
          <ul className="grid gap-2">
            {documents.map((document) => (
              <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] px-4 py-3">
                <div><p className="font-semibold">{document.documentNumber}</p><p className="text-sm text-[var(--woosh-dull)]/65">{document.type.replaceAll("_", " ")} · {new Date(document.generatedAt).toLocaleDateString("en-NG")}</p></div>
                <a href={`/api/financial-documents/${document.id}`} className="font-semibold text-[var(--woosh-blue)]">Download PDF</a>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-[var(--woosh-dull)]/70">Generate your first monthly statement.</p>}
      </Panel>
    </AppPage>
  );
}
