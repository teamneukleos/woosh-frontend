import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

/**
 * Loading state for the brand/agency payments page (/app/payments) only. The payments
 * segment has no child routes, so other /app pages keep app/app/loading.tsx. Reuses
 * Panel and Table so borders, padding and dividers match; sizes mirror page.tsx, Stat
 * and WalletFundPanel (card method, its default view).
 */
const PULSE = "motion-reduce:animate-none";

function PanelHeading({
  titleWidth,
  description = false,
}: {
  titleWidth: string;
  description?: boolean;
}) {
  // Panel title (text-[0.9375rem]) + optional description (text-sm, mt-1), mb-4.
  return (
    <div className="mb-4">
      <Skeleton className={`my-[3px] h-4 ${titleWidth} ${PULSE}`} />
      {description ? (
        <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-80 max-w-full ${PULSE}`} />
      ) : null}
    </div>
  );
}

function ControlPlaceholder({ height = "h-11 sm:h-9" }: { height?: string }) {
  return (
    <Skeleton className={`w-full rounded-[var(--radius-control)] ${height} ${PULSE}`} />
  );
}

// Payment obligations: Campaign, Creator, Gross, Net, Release, Status, (action).
const HEADINGS = ["w-16", "w-14", "w-10", "w-8", "w-14", "w-12"];
const ROWS = [
  { campaign: "w-36", creator: "w-24" },
  { campaign: "w-28", creator: "w-28" },
  { campaign: "w-40", creator: "w-20" },
  { campaign: "w-32", creator: "w-24" },
];

export default function PaymentsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading payments…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-16 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-32 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-[34rem] max-w-full ${PULSE}`} />
          {/* The description wraps to a second line on narrow screens */}
          <Skeleton className={`mt-2 h-4 w-1/2 sm:hidden ${PULSE}`} />
        </div>

        {/* Payment summary: Wallet, Committed, Paid out, Open items (Stat cards) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["w-12", "w-16", "w-14", "w-16"].map((width, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white p-4"
            >
              <Skeleton className={`my-0.5 h-3 ${width} ${PULSE}`} />
              <Skeleton className={`mt-2.5 mb-1 h-6 w-24 max-w-full ${PULSE}`} />
              <Skeleton className={`mt-1.5 mb-0.5 h-3 w-28 max-w-full ${PULSE}`} />
            </div>
          ))}
        </div>

        {/* Top up wallet: Card / Bank transfer, amount + Add funds, helper copy */}
        <Panel>
          <PanelHeading titleWidth="w-28" />
          <div className="flex gap-2">
            <Skeleton className={`h-8 w-14 rounded-full ${PULSE}`} />
            <Skeleton className={`h-8 w-28 rounded-full ${PULSE}`} />
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:min-w-[12rem]">
              <Skeleton className={`my-1 h-3 w-24 ${PULSE}`} />
              <ControlPlaceholder />
            </div>
            <Skeleton className={`h-10 w-28 ${PULSE}`} />
          </div>
          <Skeleton className={`mt-3.5 mb-0.5 h-3 w-96 max-w-full ${PULSE}`} />
          {/* Page footnote (text-xs), wraps to two lines */}
          <Skeleton className={`mt-3.5 mb-0.5 h-3 w-full max-w-2xl ${PULSE}`} />
          <Skeleton className={`my-0.5 h-3 w-1/2 ${PULSE}`} />
        </Panel>

        {/* Payment obligations */}
        <Table>
          <THead>
            <TR>
              {HEADINGS.map((width, index) => (
                <TH key={index}>
                  <Skeleton className={`my-[2px] h-2.5 ${width} ${PULSE}`} />
                </TH>
              ))}
              <TH />
            </TR>
          </THead>
          <TBody>
            {ROWS.map((row, index) => (
              <TR key={index}>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 ${row.campaign} ${PULSE}`} />
                </TD>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 ${row.creator} ${PULSE}`} />
                </TD>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 w-20 ${PULSE}`} />
                </TD>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 w-14 ${PULSE}`} />
                </TD>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 w-28 ${PULSE}`} />
                </TD>
                <TD>
                  <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
                </TD>
                <TD>
                  {/* "Support" / "View dispute" / Retry payout */}
                  <Skeleton className={`my-[3px] h-3.5 w-14 ${PULSE}`} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>

        {/* Payment support (shown when an approved or failed payment exists) */}
        <Panel>
          <PanelHeading titleWidth="w-32" description />
          <div className="grid max-w-2xl gap-3">
            <ControlPlaceholder />
            <ControlPlaceholder />
            <ControlPlaceholder />
            <ControlPlaceholder height="h-28" />
            <Skeleton className={`h-10 w-32 ${PULSE}`} />
          </div>
        </Panel>

        {/* Wallet and payment ledger */}
        <Panel>
          <PanelHeading titleWidth="w-52" description />
          <div className="grid gap-2">
            {["w-40", "w-32", "w-44"].map((width, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--woosh-border)] py-2 last:border-0"
              >
                <Skeleton className={`my-[3px] h-3.5 ${width} ${PULSE}`} />
                <Skeleton className={`my-[3px] h-3.5 w-36 ${PULSE}`} />
              </div>
            ))}
          </div>
        </Panel>

        {/* Receipts */}
        <Panel>
          <PanelHeading titleWidth="w-20" />
          <div className="grid gap-2">
            {["w-32", "w-28"].map((width, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--woosh-border)] px-4 py-3"
              >
                <Skeleton className={`my-1 h-4 ${width} ${PULSE}`} />
                <Skeleton className={`my-1 h-4 w-24 ${PULSE}`} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
