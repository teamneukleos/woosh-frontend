import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  Download,
  FileText,
  Landmark,
  type LucideIcon,
} from "lucide-react";
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
import { EmptyState } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerifiedCheck } from "@/components/ui/verified-check";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Select, TextArea } from "@/components/ui/field";

const STROKE = { light: 1.25, regular: 1.5 } as const;

function Glyph({
  icon: Icon,
  size = 18,
  weight = "regular",
  className = "",
}: {
  icon: LucideIcon;
  size?: number;
  weight?: keyof typeof STROKE;
  className?: string;
}) {
  return (
    <Icon
      size={size}
      strokeWidth={STROKE[weight]}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function humanize(value: string) {
  const text = value.toLowerCase().replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Section({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function StatCell({
  label,
  value,
  note,
  noteClassName = "text-[var(--text-muted)]",
}: {
  label: string;
  value: string;
  note?: string;
  noteClassName?: string;
}) {
  return (
    <div className="flex min-h-[132px] min-w-0 flex-col justify-between bg-white p-5">
      <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
      <div>
        <p className="break-words text-2xl font-semibold tracking-tight tabular-nums text-[var(--woosh-navy)] sm:text-3xl">
          {value}
        </p>
        {note ? (
          <p className={`mt-1.5 text-xs font-medium ${noteClassName}`}>
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Disclosure({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group border-t border-[var(--woosh-border)] pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[var(--woosh-navy)] [&::-webkit-details-marker]:hidden">
        {summary}
        <Glyph
          icon={ChevronDown}
          size={16}
          className="text-[var(--text-muted)] transition-transform group-open:rotate-180"
        />
      </summary>
      {children}
    </details>
  );
}

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

  const overviewStats = [
    {
      label: "Processing",
      value: `₦${sum(["PROCESSING"]).toLocaleString()}`,
      hint: "With payout provider",
      accent: "default",
    },
    {
      label: "In dispute",
      value: `₦${sum(["DISPUTED"]).toLocaleString()}`,
      hint: "Temporarily frozen",
      accent: "warning",
    },
    {
      label: "Lifetime paid",
      value: `₦${sum(["PAID"]).toLocaleString()}`,
      hint: "Net creator earnings",
      accent: "default",
    },
  ];

  return (
    <AppPage
      eyebrow="Creator finance"
      title="Earnings and payouts"
      description="Track secured earnings, the 72-hour release window, bank transfers and payment documents."
      width="wide"
      className="w-full max-w-none gap-7"
    >
      <div className="w-full space-y-6">
        <section
          aria-label="Earnings overview"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] xl:grid-cols-4"
        >
          <StatCell
            label="Available"
            value={`₦${available.toLocaleString()}`}
            note="Ready for automatic payout"
            noteClassName="text-[#087d62]"
          />
          {overviewStats.map((stat) => (
            <StatCell
              key={stat.label}
              label={stat.label}
              value={stat.value}
              note={stat.hint}
              noteClassName={
                stat.accent === "warning"
                  ? "text-[var(--warning)]"
                  : "text-[var(--text-muted)]"
              }
            />
          ))}
        </section>

        <Section
          title="Verified payout account"
          description="Woosh resolves your NUBAN account with Paystack. Full account numbers are encrypted and never displayed."
        >
          <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-2 xl:gap-0">
            <div className="min-w-0 xl:pr-6">
              {payout?.verifiedAt ? (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--woosh-border)] p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <Glyph
                      icon={Landmark}
                      size={22}
                      className="text-[var(--text-muted)]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-[var(--woosh-navy)]">
                        {payout.accountName}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">
                        {payout.bankName || payout.bankCode} · ••••••
                        {payout.accountNumberLast4}
                      </p>
                    </div>
                  </div>
                  <VerifiedCheck label="Verified payout account" />
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/[0.05] p-4 sm:p-5">
                  <Glyph
                    icon={AlertCircle}
                    size={20}
                    className="mt-0.5 text-[var(--warning)]"
                  />
                  <p className="text-sm leading-6 text-[var(--warning)]">
                    Add and verify an account before earnings can be released.
                  </p>
                </div>
              )}
            </div>

            <div className="min-w-0 border-t border-[var(--woosh-border)] pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
              <ActionForm
                action={savePayoutAccountAction}
                successTitle="Payout account verified"
                className="grid gap-4 sm:grid-cols-2"
              >
                <Label>
                  Bank
                  <Select
                    name="bankCode"
                    required
                    defaultValue={payout?.bankCode ?? ""}
                  >
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
            </div>
          </div>
        </Section>

        <Section
          title="Payment timeline"
          aside={
            <span className="text-sm tabular-nums text-[var(--text-secondary)]">
              {earnings.length} {earnings.length === 1 ? "payment" : "payments"}
            </span>
          }
        >
          {earnings.length ? (
            <ul className="divide-y divide-[var(--woosh-border)]">
              {earnings.map((item) => {
                const openDispute = item.disputes?.some((dispute) =>
                  ["OPEN", "UNDER_REVIEW"].includes(dispute.status),
                );

                return (
                  <li key={item.id} className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <Link
                          href={`/app/campaigns/${item.participant.campaignId}`}
                          className="block truncate text-base font-semibold text-[var(--woosh-navy)] transition-colors hover:text-[var(--woosh-blue)] hover:underline hover:underline-offset-4"
                        >
                          {item.participant.campaign.title}
                        </Link>
                        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                          {item.participant.campaign.brand.name}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] md:grid-cols-4">
                      <div className="min-w-0 bg-white p-4">
                        <dt className="text-xs font-medium text-[var(--text-muted)]">
                          Gross
                        </dt>
                        <dd className="mt-1.5 break-words text-base font-semibold tabular-nums text-[var(--woosh-navy)]">
                          {Number(item.grossAmount).toLocaleString()}{" "}
                          {item.currency}
                        </dd>
                      </div>

                      <div className="min-w-0 bg-white p-4">
                        <dt className="text-xs font-medium text-[var(--text-muted)]">
                          Platform fee
                        </dt>
                        <dd className="mt-1.5 break-words text-base font-semibold tabular-nums text-[var(--woosh-navy)]">
                          {Number(item.platformFee).toLocaleString()}{" "}
                          {item.currency}
                        </dd>
                      </div>

                      <div className="min-w-0 bg-white p-4">
                        <dt className="text-xs font-medium text-[var(--text-muted)]">
                          Your net
                        </dt>
                        <dd className="mt-1.5 break-words text-base font-semibold tabular-nums text-[var(--woosh-blue)]">
                          {Number(item.netAmount).toLocaleString()}{" "}
                          {item.currency}
                        </dd>
                      </div>

                      <div className="min-w-0 bg-white p-4">
                        <dt className="text-xs font-medium text-[var(--text-muted)]">
                          Expected release
                        </dt>
                        <dd className="mt-1.5 text-sm font-semibold leading-6 text-[var(--woosh-navy)]">
                          {item.availableAt
                            ? formatDateTime(item.availableAt)
                            : "After campaign completion"}
                        </dd>
                      </div>
                    </dl>

                    {item.failureReason ? (
                      <div className="flex items-start gap-2.5 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
                        <Glyph
                          icon={AlertCircle}
                          size={18}
                          className="mt-0.5"
                        />
                        <p>{item.failureReason}</p>
                      </div>
                    ) : null}

                    {item.transactions.length ? (
                      <Disclosure summary="Payout attempts">
                        <ul className="mt-3 divide-y divide-[var(--woosh-border)] text-sm text-[var(--text-secondary)]">
                          {item.transactions
                            .filter((row) => row.type === "PAYOUT")
                            .map((row) => (
                              <li key={row.id} className="py-2.5">
                                {formatDateTime(row.createdAt)} ·{" "}
                                {humanize(String(row.status))} ·{" "}
                                {row.providerReference || row.provider}
                              </li>
                            ))}
                        </ul>
                      </Disclosure>
                    ) : null}

                    {!openDispute &&
                    ["APPROVED", "FAILED"].includes(item.status) ? (
                      <Disclosure summary="Raise a payment dispute">
                        <ActionForm
                          action={createPaymentDisputeAction}
                          successTitle="Dispute opened"
                          className="mt-4 grid gap-3"
                        >
                          <input
                            type="hidden"
                            name="obligationId"
                            value={item.id}
                          />

                          <Select name="category" required>
                            <option value="PAYMENT_AMOUNT">Payment amount</option>
                            <option value="PAYOUT_DELAY">Payout delay</option>
                            <option value="CONTENT_APPROVAL">Content approval</option>
                            <option value="CANCELLATION">Cancellation</option>
                            <option value="OTHER">Other</option>
                          </Select>

                          <Input
                            name="subject"
                            required
                            minLength={3}
                            placeholder="Issue summary"
                          />

                          <TextArea
                            name="description"
                            required
                            minLength={20}
                            rows={3}
                            placeholder="Explain the issue and desired outcome"
                          />

                          <Input
                            name="requestedResolution"
                            placeholder="Requested resolution (optional)"
                          />

                          <Button
                            type="submit"
                            variant="secondary"
                            className="w-fit"
                          >
                            Open dispute
                          </Button>
                        </ActionForm>
                      </Disclosure>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5 sm:p-6">
              <EmptyState
                title="No earnings yet"
                description="Secured campaign earnings will appear here."
              />
            </div>
          )}
        </Section>

        <Section title="Statements and receipts">
          <div className="border-b border-[var(--woosh-border)] p-5 sm:p-6">
            <ActionForm
              action={createCreatorStatementAction}
              successTitle="Statement generated"
              className="flex flex-wrap items-end gap-4"
            >
              <Label>
                Year
                <Input
                  name="year"
                  type="number"
                  defaultValue={previousMonth.getUTCFullYear()}
                  min={2020}
                  max={now.getFullYear()}
                />
              </Label>

              <Label>
                Month
                <Input
                  name="month"
                  type="number"
                  defaultValue={previousMonth.getUTCMonth() + 1}
                  min={1}
                  max={12}
                />
              </Label>

              <Button type="submit" variant="secondary">
                Generate monthly statement
              </Button>
            </ActionForm>
          </div>

          {documents.length ? (
            <ul className="divide-y divide-[var(--woosh-border)]">
              {documents.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Glyph
                      icon={FileText}
                      size={22}
                      className="text-[var(--text-muted)]"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--woosh-navy)] sm:text-base">
                        {document.documentNumber}
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        {document.type.replaceAll("_", " ")} ·{" "}
                        {formatDate(document.generatedAt)}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/api/financial-documents/${document.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--woosh-blue)] transition-colors hover:text-[var(--woosh-navy)]"
                  >
                    <Glyph icon={Download} size={16} />
                    Download PDF
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-[var(--text-secondary)] sm:px-6">
              Generate your first monthly statement.
            </p>
          )}
        </Section>
      </div>
    </AppPage>
  );
}