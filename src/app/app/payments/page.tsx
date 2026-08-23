import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/db";
import { getWalletBalance } from "@/domains/payments/wallet";
import { paystackConfigured } from "@/lib/paystack";
import { walletTopUpAction, markPaidAction } from "@/app/actions";
import { Panel, EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/field";
import { Select, TextArea } from "@/components/ui/field";
import { hasPermission } from "@/lib/permissions";
import Link from "next/link";
import { createPaymentDisputeAction } from "@/app/actions";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ funded?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ctx = await getWorkspaceContext(session.user.id);
  if (!ctx || ctx.kind === "creator") redirect("/app");

  const [params] = await Promise.all([searchParams]);
  const brandId = ctx.activeBrandId;
  const wallet = brandId ? await getWalletBalance(brandId) : null;

  const obligations = brandId
    ? await prisma.paymentObligation.findMany({
        where: { participant: { campaign: { brandId } } },
        include: {
          participant: {
            include: {
              creator: true,
              campaign: true,
            },
          },
          transactions: { orderBy: { createdAt: "desc" } },
          disputes: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];
  const [ledger, documents] = brandId
    ? await Promise.all([
        prisma.ledgerTransaction.findMany({
          where: {
            metadata: { path: ["brandId"], equals: brandId },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.financialDocument.findMany({
          where: { brandId },
          orderBy: { generatedAt: "desc" },
          take: 24,
        }),
      ])
    : [[], []];

  const committed = obligations
    .filter((o) =>
      ["COMMITTED", "APPROVED", "PROCESSING", "PAID"].includes(o.status),
    )
    .reduce((sum, o) => sum + Number(o.grossAmount), 0);
  const paid = obligations
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + Number(o.netAmount), 0);

  const canPay =
    ctx.user.isPlatformAdmin ||
    (ctx.membership &&
      hasPermission(ctx.membership.role, "payments.approve", {
        canApprovePayments: ctx.membership.canApprovePayments,
      }));

  return (
    <AppPage
        eyebrow={ctx.kind === "agency" ? "Finance" : "Payments"}
        title={ctx.kind === "agency" ? "Finance" : "Payments"}
        description="Put Naira on the wallet before you pick anyone. We take 0%. Paystack processing is theirs."
    >
      {params.funded === "1" ? (
        <Panel className="border-[var(--woosh-teal)]/40 bg-[var(--woosh-teal)]/10">
          Wallet funding was verified successfully.
        </Panel>
      ) : params.funded === "error" ? (
        <Panel className="border-[var(--danger)]/15 bg-[var(--danger-soft)] text-[var(--danger)]">
          Woosh could not verify that wallet payment. No balance was credited.
        </Panel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Wallet"
          value={`₦${(wallet?.balance ?? 0).toLocaleString()}`}
          hint={paystackConfigured() ? "Paystack" : "Test mode"}
        />
        <Stat
          label="Committed"
          value={`₦${committed.toLocaleString()}`}
          hint="Gross creator fees"
        />
        <Stat
          label="Paid out"
          value={`₦${paid.toLocaleString()}`}
          hint="Net to creators"
        />
        <Stat
          label="Open items"
          value={String(obligations.filter((o) => o.status !== "PAID").length)}
          hint="Across release and payout"
        />
      </div>

      <Panel title="Top up wallet">
        <ActionForm action={walletTopUpAction} successTitle="Wallet updated">
          <div className="flex flex-wrap items-end gap-3">
            <Label className="min-w-0 w-full sm:w-auto sm:min-w-[12rem]">
              Amount (NGN)
              <Input
                name="amount"
                type="number"
                min={1000}
                step={1000}
                defaultValue={100000}
                required
              />
            </Label>
            <Button type="submit">
              {paystackConfigured() ? "Pay with Paystack" : "Add funds (test)"}
            </Button>
          </div>
        </ActionForm>
        <p className="mt-3 text-xs text-[var(--woosh-dull)]/65">
          Accepting a creator reserves the creator rate from this wallet. Woosh platform fee is 0%.
        </p>
      </Panel>

      {obligations.length ? (
        <Table>
          <THead>
            <TR>
              <TH>Campaign</TH>
              <TH>Creator</TH>
              <TH>Gross</TH>
              <TH>Net</TH>
              <TH>Release</TH>
              <TH>Status</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {obligations.map((o) => (
              <TR key={o.id}>
                <TD>{o.participant.campaign.title}</TD>
                <TD>{o.participant.creator.displayName}</TD>
                <TD>
                  {Number(o.grossAmount).toLocaleString()} {o.currency}
                </TD>
                <TD>{Number(o.netAmount).toLocaleString()}</TD>
                <TD>{o.availableAt ? o.availableAt.toLocaleString("en-NG") : "After completion"}</TD>
                <TD>
                  <StatusBadge status={o.status} />
                </TD>
                <TD>
                  {canPay && o.status === "FAILED" ? (
                    <ActionForm
                      action={markPaidAction}
                      successTitle="Payout initiated"
                    >
                      <input type="hidden" name="obligationId" value={o.id} />
                      <Button type="submit" size="sm" variant="secondary">
                        Retry payout
                      </Button>
                    </ActionForm>
                  ) : (
                    <Link href={`/app/disputes`} className="text-sm font-semibold text-[var(--woosh-blue)]">
                      {o.disputes.some((d) => ["OPEN", "UNDER_REVIEW"].includes(d.status)) ? "View dispute" : "Support"}
                    </Link>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      ) : (
        <EmptyState
          title="No payment obligations yet"
          description="Accept creators (with funded wallet) and approve deliverables to create ledger entries."
        />
      )}

      {obligations.some((item) => ["APPROVED", "FAILED"].includes(item.status)) ? (
        <Panel title="Payment support" description="Opening a dispute freezes automatic payout while Woosh reviews the issue.">
          <ActionForm action={createPaymentDisputeAction} successTitle="Dispute opened" className="grid max-w-2xl gap-3">
            <Select name="obligationId" required>
              <option value="">Select campaign payment</option>
              {obligations.filter((item) => ["APPROVED", "FAILED"].includes(item.status)).map((item) => (
                <option key={item.id} value={item.id}>{item.participant.campaign.title} · {item.participant.creator.displayName}</option>
              ))}
            </Select>
            <Select name="category" required>
              <option value="CONTENT_APPROVAL">Content approval</option>
              <option value="PAYMENT_AMOUNT">Payment amount</option>
              <option value="PAYOUT_DELAY">Payout delay</option>
              <option value="CANCELLATION">Cancellation</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input name="subject" required minLength={3} placeholder="Issue summary" />
            <TextArea name="description" required minLength={20} rows={3} placeholder="Explain the issue and include relevant campaign details" />
            <Button type="submit" variant="secondary" className="w-fit">Open dispute</Button>
          </ActionForm>
        </Panel>
      ) : null}

      <Panel title="Wallet and payment ledger" description="Immutable funding, commitment, payout and refund entries.">
        {ledger.length ? (
          <ul className="grid gap-2 text-sm">
            {ledger.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--woosh-border)] py-2 last:border-0">
                <span>{entry.type.replaceAll("_", " ")} · {entry.provider}</span>
                <span className="font-semibold">{Number(entry.amount).toLocaleString()} {entry.currency} · {entry.status}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-[var(--woosh-dull)]/70">No ledger activity yet.</p>}
      </Panel>

      <Panel title="Receipts">
        {documents.length ? (
          <ul className="grid gap-2">
            {documents.map((document) => (
              <li key={document.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] px-4 py-3">
                <span className="font-semibold">{document.documentNumber}</span>
                <a href={`/api/financial-documents/${document.id}`} className="font-semibold text-[var(--woosh-blue)]">Download PDF</a>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-[var(--woosh-dull)]/70">Receipts are generated after successful creator payouts.</p>}
      </Panel>
    </AppPage>
  );
}
