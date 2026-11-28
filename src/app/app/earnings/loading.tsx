import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the creator earnings page (/app/earnings) only. The earnings segment
 * has no child routes, so other /app pages keep app/app/loading.tsx. Layout, breakpoints
 * and sizes mirror page.tsx so content does not jump when it streams in.
 */
const PULSE = "motion-reduce:animate-none";

function SectionPlaceholder({
  titleWidth,
  description = false,
  aside,
  children,
}: {
  titleWidth: string;
  description?: boolean;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          {/* Section title text-base (24px line) */}
          <Skeleton className={`my-1 h-4 ${titleWidth} max-w-full ${PULSE}`} />
          {/* Description text-sm leading-6, max-w-2xl; it wraps to two lines */}
          {description ? (
            <div className="mt-1 max-w-2xl">
              <Skeleton className={`my-1 h-4 w-full ${PULSE}`} />
              <Skeleton className={`my-1 h-4 w-2/5 ${PULSE}`} />
            </div>
          ) : null}
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

function FieldPlaceholder({ className = "" }: { className?: string }) {
  // Label (text-[0.8125rem]) above a control (h-11, sm:h-9).
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Skeleton className={`my-1 h-3 w-24 ${PULSE}`} />
      <Skeleton
        className={`h-11 w-full rounded-[var(--radius-control)] sm:h-9 ${PULSE}`}
      />
    </div>
  );
}

// Earnings overview: note placeholders tinted like the real notes (Paid is green).
const STATS = [
  { label: "w-28", note: "w-40", tone: "" },
  { label: "w-20", note: "w-36", tone: "" },
  { label: "w-10", note: "w-32", tone: "bg-[#087d62]/15" },
  { label: "w-28", note: "w-44", tone: "" },
];

function PaymentPlaceholder({ details = false }: { details?: boolean }) {
  return (
    <div className="space-y-4 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {/* Campaign title text-base, brand text-sm */}
          <Skeleton className={`my-1 h-4 w-56 max-w-full ${PULSE}`} />
          <Skeleton className={`mt-[5px] mb-[3px] h-3.5 w-28 max-w-full ${PULSE}`} />
        </div>
        {/* Stage label + status badge */}
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className={`h-3.5 w-24 ${PULSE}`} />
          <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
        </div>
      </div>

      {/* Gross, Platform fee, Your net, Release / Released / Paid */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] md:grid-cols-4">
        {["w-10", "w-20", "w-14", "w-14"].map((width, index) => (
          <div key={index} className="min-w-0 bg-white p-4">
            <Skeleton className={`my-0.5 h-3 ${width} ${PULSE}`} />
            <Skeleton className={`mt-2.5 mb-1 h-4 w-24 max-w-full ${PULSE}`} />
          </div>
        ))}
      </div>

      {/* Collapsed "Payout attempts" disclosure */}
      {details ? (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--woosh-border)] pt-4">
          <Skeleton className={`my-[3px] h-3.5 w-28 ${PULSE}`} />
          <Skeleton className={`size-4 shrink-0 ${PULSE}`} />
        </div>
      ) : null}
    </div>
  );
}

function DocumentRowPlaceholder() {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {/* File icon, 22px */}
        <Skeleton className={`size-[22px] shrink-0 ${PULSE}`} />
        <div className="min-w-0">
          {/* Document number text-sm / sm:text-base, type · date text-sm */}
          <Skeleton
            className={`my-[3px] h-3.5 w-40 max-w-full sm:my-1 sm:h-4 ${PULSE}`}
          />
          <Skeleton className={`mt-[5px] mb-[3px] h-3.5 w-44 max-w-full ${PULSE}`} />
        </div>
      </div>
      {/* Download PDF link: icon + label */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Skeleton className={`size-4 ${PULSE}`} />
        <Skeleton className={`my-[3px] h-3.5 w-24 ${PULSE}`} />
      </div>
    </div>
  );
}

export default function EarningsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading earnings…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-24 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-56 max-w-full ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-[34rem] max-w-full ${PULSE}`} />
          {/* The description wraps to a second line on narrow screens */}
          <Skeleton className={`mt-2 h-4 w-1/2 sm:hidden ${PULSE}`} />
        </div>

        <div className="w-full space-y-6">
          {/* Earnings overview: Pending release, Processing, Paid, Needs attention */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={index}
                className="flex min-h-[132px] min-w-0 flex-col gap-3 bg-white p-5"
              >
                <Skeleton className={`my-[3px] h-3.5 ${stat.label} max-w-full ${PULSE}`} />
                <Skeleton className={`my-1 h-6 w-24 max-w-full sm:h-7 ${PULSE}`} />
                <Skeleton
                  className={`-mt-1 mb-0.5 h-3 ${stat.note} max-w-full ${stat.tone} ${PULSE}`}
                />
              </div>
            ))}
          </div>

          {/* Verified payout account */}
          <SectionPlaceholder titleWidth="w-48" description>
            <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-2 xl:gap-0">
              <div className="min-w-0 xl:pr-6">
                {/* Verified account card: bank icon, name, bank · ••••1234, check */}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--woosh-border)] p-4 sm:p-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <Skeleton className={`size-[22px] shrink-0 ${PULSE}`} />
                    <div className="min-w-0">
                      <Skeleton className={`my-1 h-4 w-40 max-w-full ${PULSE}`} />
                      <Skeleton
                        className={`mt-[5px] mb-[3px] h-3.5 w-48 max-w-full ${PULSE}`}
                      />
                    </div>
                  </div>
                  <span className="size-[1.125rem] shrink-0 rounded-full bg-[var(--woosh-blue)]/20" />
                </div>
              </div>

              {/* Bank select, account number input, Verify account button */}
              <div className="min-w-0 border-t border-[var(--woosh-border)] pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldPlaceholder />
                  <FieldPlaceholder />
                  <Skeleton className={`h-10 w-32 sm:col-span-2 ${PULSE}`} />
                </div>
              </div>
            </div>
          </SectionPlaceholder>

          {/* Payment timeline + payment count */}
          <SectionPlaceholder
            titleWidth="w-36"
            aside={<Skeleton className={`my-[3px] h-3.5 w-20 ${PULSE}`} />}
          >
            <div className="divide-y divide-[var(--woosh-border)]">
              <PaymentPlaceholder details />
              <PaymentPlaceholder />
              <PaymentPlaceholder />
            </div>
          </SectionPlaceholder>

          {/* Statements and receipts */}
          <SectionPlaceholder titleWidth="w-48">
            <div className="border-b border-[var(--woosh-border)] p-5 sm:p-6">
              {/* Year, Month, Generate monthly statement */}
              <div className="flex flex-wrap items-end gap-4">
                <FieldPlaceholder className="w-44" />
                <FieldPlaceholder className="w-44" />
                <Skeleton className={`h-10 w-52 ${PULSE}`} />
              </div>
            </div>
            <div className="divide-y divide-[var(--woosh-border)]">
              <DocumentRowPlaceholder />
              <DocumentRowPlaceholder />
              <DocumentRowPlaceholder />
            </div>
          </SectionPlaceholder>
        </div>
      </div>
    </div>
  );
}
