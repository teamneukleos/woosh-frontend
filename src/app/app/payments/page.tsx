
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import { getWalletBalance } from "@/domains/payments/wallet";
import { listBrandPayments } from "@/domains/payments/ledger";
import { listBrandDocuments } from "@/domains/payments/documents";
import { markPaidAction } from "@/app/actions";
import { WalletFundPanel } from "@/components/payments/wallet-fund";
import { Panel, EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Stat } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";
import { ActionForm } from "@/components/ui/action-form";
import { Input } from "@/components/ui/field";
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

  const obligations = brandId ? await listBrandPayments(brandId) : [];
  const documents = brandId ? await listBrandDocuments(brandId) : [];

  const ledger = obligations.flatMap((item) =>
    item.transactions.map((entry) => ({
      id: entry.id,
      type: entry.type,
      provider: entry.provider,
      amount: entry.amount,
      currency: entry.currency,
      status: entry.status,
    })),
  );

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
      description="Put money on the wallet before you pick anyone. We take 0%. Paystack processing is theirs."
      width="wide"
      className="w-full max-w-none"
    >
      <div className="w-full space-y-7">
        {params.funded === "1" ? (
          <Panel className="border-[var(--woosh-teal)]/40 bg-[var(--woosh-teal)]/10">
            Wallet funding was verified successfully.
          </Panel>
        ) : params.funded === "error" ? (
          <Panel className="border-[var(--danger)]/15 bg-[var(--danger-soft)] text-[var(--danger)]">
            Woosh could not verify that wallet payment. No balance was credited.
          </Panel>
        ) : null}

        {/* Financial overview */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--woosh-blue)]/20 bg-[var(--woosh-blue)]/[0.045] p-5 shadow-sm">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[var(--woosh-blue)]/[0.07]" />
            <div className="relative">
              <Stat
                label="Wallet"
                value={`₦${(wallet?.balance ?? 0).toLocaleString()}`}
                hint="NGN wallet"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <Stat
              label="Committed"
              value={`₦${committed.toLocaleString()}`}
              hint="Gross creator fees"
            />
          </div>

          <div className="rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <Stat
              label="Paid out"
              value={`₦${paid.toLocaleString()}`}
              hint="Net to creators"
            />
          </div>

          <div className="rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-sm">
            <Stat
              label="Open items"
              value={String(obligations.filter((o) => o.status !== "PAID").length)}
              hint="Across release and payout"
            />
          </div>
        </section>

        {/* Wallet funding */}
        <section className="w-full">
          <Panel
            title="Top up wallet"
            className="overflow-hidden"
          >
            {canPay ? (
              <WalletFundPanel
                canPay={canPay}
                brandName={ctx.activeBrand?.name ?? "this brand"}
                initialDva={wallet?.dva ?? null}
                defaultName={ctx.user.name}
                defaultPhone={ctx.user.phone ?? null}
              />
            ) : (
              <p className="text-sm text-[var(--woosh-dull)]/70">
                You can view this wallet. A teammate with payment permission can
                add funds.
              </p>
            )}

            <p className="mt-5 border-t border-[var(--woosh-border)] pt-4 text-xs leading-6 text-[var(--woosh-dull)]/65">
              Card uses Paystack Checkout. Bank transfer uses a dedicated NUBAN
              for this brand only. Accepting a creator reserves the creator rate
              from this wallet. Woosh platform fee is 0%.
            </p>
          </Panel>
        </section>

        {/* Payment obligations */}
        <section className="w-full">
          {obligations.length ? (
            <div className="w-full overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--woosh-border)] px-5 py-4 md:px-6">
                <div className="h-1 w-12 rounded-full bg-[var(--woosh-blue)]" />
              </div>

              <div className="w-full overflow-x-auto">
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
                        <TD className="font-semibold text-[var(--woosh-navy)]">
                          {o.participant.campaign.title}
                        </TD>
                        <TD>{o.participant.creator.displayName}</TD>
                        <TD>
                          <span className="font-medium tabular-nums">
                            {Number(o.grossAmount).toLocaleString()} {o.currency}
                          </span>
                        </TD>
                        <TD>
                          <span className="font-medium tabular-nums">
                            {Number(o.netAmount).toLocaleString()}
                          </span>
                        </TD>
                        <TD>
                          {o.availableAt
                            ? o.availableAt.toLocaleString("en-NG")
                            : "After completion"}
                        </TD>
                        <TD>
                          <StatusBadge status={o.status} />
                        </TD>
                        <TD>
                          {canPay && o.status === "FAILED" ? (
                            <ActionForm
                              action={markPaidAction}
                              successTitle="Payout initiated"
                            >
                              <input
                                type="hidden"
                                name="obligationId"
                                value={o.id}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="secondary"
                              >
                                Retry payout
                              </Button>
                            </ActionForm>
                          ) : (
                            <Link
                              href="/app/disputes"
                              className="inline-flex rounded-lg px-3 py-2 text-sm font-semibold text-[var(--woosh-blue)] transition-colors hover:bg-[var(--woosh-blue)]/5"
                            >
                              {o.disputes.some((d) =>
                                ["OPEN", "UNDER_REVIEW"].includes(d.status),
                              )
                                ? "View dispute"
                                : "Support"}
                            </Link>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--woosh-border)] bg-white p-5 md:p-8">
              <EmptyState
                title="No payment obligations yet"
                description="Accept creators (with funded wallet) and approve deliverables to create ledger entries."
              />
            </div>
          )}
        </section>

        {/* Payment support */}
        {obligations.some((item) =>
          ["APPROVED", "FAILED"].includes(item.status),
        ) ? (
          <Panel
            title="Payment support"
            description="Opening a dispute freezes automatic payout while Woosh reviews the issue."
          >
            <ActionForm
              action={createPaymentDisputeAction}
              successTitle="Dispute opened"
              className="grid w-full gap-4 md:grid-cols-2"
            >
              <Select name="obligationId" required>
                <option value="">Select campaign payment</option>
                {obligations
                  .filter((item) =>
                    ["APPROVED", "FAILED"].includes(item.status),
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.participant.campaign.title} ·{" "}
                      {item.participant.creator.displayName}
                    </option>
                  ))}
              </Select>

              <Select name="category" required>
                <option value="CONTENT_APPROVAL">Content approval</option>
                <option value="PAYMENT_AMOUNT">Payment amount</option>
                <option value="PAYOUT_DELAY">Payout delay</option>
                <option value="CANCELLATION">Cancellation</option>
                <option value="OTHER">Other</option>
              </Select>

              <div className="md:col-span-2">
                <Input
                  name="subject"
                  required
                  minLength={3}
                  placeholder="Issue summary"
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  name="description"
                  required
                  minLength={20}
                  rows={3}
                  placeholder="Explain the issue and include relevant campaign details"
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" variant="secondary" className="w-fit">
                  Open dispute
                </Button>
              </div>
            </ActionForm>
          </Panel>
        ) : null}

        {/* Ledger and receipts */}
        <section className="grid w-full gap-5 xl:grid-cols-2">
          <Panel
            title="Wallet and payment ledger"
            description="Immutable funding, commitment, payout and refund entries."
          >
            {ledger.length ? (
              <ul className="grid gap-0 text-sm">
                {ledger.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--woosh-border)] py-4 first:pt-0 last:border-0 last:pb-0"
                  >
                    <span className="text-[var(--woosh-dull)]">
                      {entry.type.replaceAll("_", " ")} · {entry.provider}
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--woosh-navy)]">
                      {Number(entry.amount).toLocaleString()} {entry.currency} ·{" "}
                      {entry.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--woosh-dull)]/70">
                No ledger activity yet.
              </p>
            )}
          </Panel>

          <Panel title="Receipts">
            {documents.length ? (
              <ul className="grid gap-3">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-mist)]/40 px-4 py-4"
                  >
                    <span className="font-semibold text-[var(--woosh-navy)]">
                      {document.documentNumber}
                    </span>
                    <a
                      href={`/api/financial-documents/${document.id}`}
                      className="font-semibold text-[var(--woosh-blue)] hover:underline"
                    >
                      Download PDF
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--woosh-dull)]/70">
                Receipts are generated after successful creator payouts.
              </p>
            )}
          </Panel>
        </section>
      </div>
    </AppPage>
  );
}
