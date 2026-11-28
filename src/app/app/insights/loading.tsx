import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the creator insights page (/app/insights) only. The insights segment
 * has no child routes, so other /app pages keep app/app/loading.tsx. Layout, breakpoints
 * and sizes mirror page.tsx so content does not jump when it streams in.
 */
const PULSE = "motion-reduce:animate-none";

// Same column templates as page.tsx: stacked below md, aligned columns from md.
const CHANNEL_COLUMNS =
  "md:grid md:grid-cols-[minmax(0,1.8fr)_repeat(4,minmax(0,1fr))] md:items-center md:gap-4";
const CAMPAIGN_COLUMNS =
  "md:grid md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] md:items-center md:gap-4";

function SectionPlaceholder({
  titleWidth,
  children,
}: {
  titleWidth: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
        {/* Section title text-base (24px line) */}
        <Skeleton className={`my-1 h-4 ${titleWidth} ${PULSE}`} />
      </div>
      {children}
    </div>
  );
}

function ColumnHeadings({ columns, widths }: { columns: string; widths: string[] }) {
  // Desktop-only header strip (11px uppercase labels).
  return (
    <div
      className={`hidden border-b border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-2.5 sm:px-6 ${columns}`}
    >
      {widths.map((width, index) => (
        <Skeleton key={index} className={`my-[3px] h-2.5 ${width} ${PULSE}`} />
      ))}
    </div>
  );
}

function MetricCell() {
  // TableCell: label + value side by side on mobile, value only in its column from md.
  return (
    <div className="flex items-center justify-between gap-3 md:block">
      <Skeleton className={`my-0.5 h-3 w-16 md:hidden ${PULSE}`} />
      <Skeleton className={`my-[3px] h-3.5 w-14 ${PULSE}`} />
    </div>
  );
}

function ChannelRowPlaceholder() {
  return (
    <div className={`flex flex-col gap-3 px-5 py-4 sm:px-6 ${CHANNEL_COLUMNS}`}>
      <div className="min-w-0">
        {/* ChannelMark: 20px icon + channel name */}
        <div className="flex items-center gap-1.5">
          <Skeleton className={`size-5 shrink-0 rounded-full ${PULSE}`} />
          <Skeleton className={`h-3 w-16 ${PULSE}`} />
        </div>
        {/* @handle text-sm, mt-1.5 */}
        <Skeleton className={`mt-[9px] mb-[3px] h-3.5 w-28 max-w-full ${PULSE}`} />
        {/* Updated · source text-xs, mt-0.5 */}
        <Skeleton className={`mt-1 mb-0.5 h-3 w-40 max-w-full ${PULSE}`} />
      </div>
      <MetricCell />
      <MetricCell />
      <MetricCell />
      <MetricCell />
    </div>
  );
}

function CampaignRowPlaceholder() {
  return (
    <div className={`flex flex-col gap-3 px-5 py-4 sm:px-6 ${CAMPAIGN_COLUMNS}`}>
      <div className="min-w-0">
        {/* Campaign title text-sm / sm:text-base */}
        <Skeleton
          className={`my-[3px] h-3.5 w-48 max-w-full sm:my-1 sm:h-4 sm:w-56 ${PULSE}`}
        />
        {/* Brand · status text-xs, mt-0.5 */}
        <Skeleton className={`mt-1 mb-0.5 h-3 w-32 max-w-full ${PULSE}`} />
      </div>
      <MetricCell />
      <MetricCell />
      <MetricCell />
    </div>
  );
}

// Opportunity funnel: label width, value width, bar fill width (narrowing like a funnel).
const FUNNEL = [
  { label: "w-20", value: "w-8", bar: "w-full" },
  { label: "w-24", value: "w-8", bar: "w-3/4" },
  { label: "w-24", value: "w-6", bar: "w-1/2" },
  { label: "w-16", value: "w-6", bar: "w-1/4" },
];

// Earnings: Available is emphasised (text-xl), Lifetime has the subtle tinted row.
const EARNINGS = [
  { label: "w-16", value: "my-1 h-5 w-28" },
  { label: "w-20", value: "my-1 h-4 w-20" },
  { label: "w-10", value: "my-1 h-4 w-20" },
  { label: "w-16", value: "my-1 h-4 w-24" },
];

export default function InsightsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading insights…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-14 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-28 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-[36rem] max-w-full ${PULSE}`} />
          {/* The description wraps to a second line on narrow screens */}
          <Skeleton className={`mt-2 h-4 w-1/2 sm:hidden ${PULSE}`} />
        </div>

        {/* Filter chips: 7 days, 30 days, 90 days */}
        <div className="-mx-1 flex flex-nowrap gap-2 overflow-hidden px-1 pb-1">
          <Skeleton className={`h-7 w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
          <Skeleton className={`h-7 w-[4.5rem] rounded-[var(--radius-sm)] ${PULSE}`} />
          <Skeleton className={`h-7 w-[4.5rem] rounded-[var(--radius-sm)] ${PULSE}`} />
        </div>

        <div className="w-full space-y-6">
          {/* Overview: Followers, Profile views, Saves, MTD earnings */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex min-h-[132px] min-w-0 flex-col gap-3 bg-white p-5"
              >
                <Skeleton className={`my-[3px] h-3.5 w-24 max-w-full ${PULSE}`} />
                <Skeleton
                  className={`my-1 h-6 w-20 max-w-full sm:h-7 ${PULSE}`}
                />
                {/* Only Followers carries a growth note */}
                {index === 0 ? (
                  <Skeleton className={`-mt-1 mb-0.5 h-3 w-28 max-w-full ${PULSE}`} />
                ) : null}
              </div>
            ))}
          </div>

          {/* Channel performance */}
          <SectionPlaceholder titleWidth="w-44">
            <ColumnHeadings
              columns={CHANNEL_COLUMNS}
              widths={["w-16", "w-16", "w-12", "w-20", "w-16"]}
            />
            <div className="divide-y divide-[var(--woosh-border)]">
              <ChannelRowPlaceholder />
              <ChannelRowPlaceholder />
              <ChannelRowPlaceholder />
            </div>
          </SectionPlaceholder>

          {/* Opportunity funnel + Earnings: side by side from lg */}
          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
            <SectionPlaceholder titleWidth="w-40">
              <div className="divide-y divide-[var(--woosh-border)]">
                {FUNNEL.map((row, index) => (
                  <div key={index} className="px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <Skeleton className={`h-3.5 ${row.label} ${PULSE}`} />
                      <Skeleton className={`my-1 h-5 ${row.value} ${PULSE}`} />
                    </div>
                    {/* Progress track (h-1.5) with a pulsing fill */}
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#12141a]/[0.06]">
                      <Skeleton className={`h-full rounded-full ${row.bar} ${PULSE}`} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionPlaceholder>

            <SectionPlaceholder titleWidth="w-24">
              <div className="divide-y divide-[var(--woosh-border)]">
                {EARNINGS.map((row, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between gap-3 px-5 py-4 sm:px-6 ${
                      index === EARNINGS.length - 1 ? "bg-[#faf9f7]" : ""
                    }`}
                  >
                    <Skeleton className={`h-3.5 ${row.label} ${PULSE}`} />
                    <Skeleton className={`${row.value} ${PULSE}`} />
                  </div>
                ))}
              </div>
            </SectionPlaceholder>
          </div>

          {/* Campaign performance */}
          <SectionPlaceholder titleWidth="w-48">
            <ColumnHeadings
              columns={CAMPAIGN_COLUMNS}
              widths={["w-20", "w-12", "w-12", "w-20"]}
            />
            <div className="divide-y divide-[var(--woosh-border)]">
              <CampaignRowPlaceholder />
              <CampaignRowPlaceholder />
              <CampaignRowPlaceholder />
            </div>
          </SectionPlaceholder>
        </div>
      </div>
    </div>
  );
}
