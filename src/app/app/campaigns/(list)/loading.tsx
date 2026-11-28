import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the campaigns list (/app/campaigns) only. The (list) route group
 * keeps this boundary off the campaign workspace (/app/campaigns/[id]), which still uses
 * app/app/loading.tsx. Reuses Panel and the page's column template so the header, rows
 * and totals line up with the loaded page.
 */
const PULSE = "motion-reduce:animate-none";

// Same column template as page.tsx: rows stack below md, four columns from md.
const COLUMNS =
  "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_6rem_minmax(0,1.4fr)] md:items-center md:gap-4";

// Varied widths so the rows read as real content.
const ROWS = [
  { title: "w-56", brand: "w-24" },
  { title: "w-44", brand: "w-32" },
  { title: "w-64", brand: "w-20" },
  { title: "w-40", brand: "w-28" },
  { title: "w-52", brand: "w-24" },
];

function CampaignRowPlaceholder({ title, brand }: { title: string; brand: string }) {
  return (
    <div className={`flex flex-col gap-2 px-5 py-4 ${COLUMNS}`}>
      {/* Campaign title text-base */}
      <Skeleton className={`my-1 h-4 ${title} max-w-full ${PULSE}`} />
      {/* Brand name text-sm */}
      <Skeleton className={`my-[3px] h-3.5 ${brand} max-w-full ${PULSE}`} />
      {/* Deliverables: "3 deliverables" on mobile, right-aligned count from md */}
      <Skeleton className={`my-[3px] h-3.5 w-24 md:ml-auto md:w-6 ${PULSE}`} />
      {/* WorkStatus: status badge + deadline */}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
        <Skeleton className={`h-3.5 w-24 ${PULSE}`} />
      </div>
    </div>
  );
}

export default function CampaignsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading campaigns…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-16 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-36 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-[26rem] max-w-full ${PULSE}`} />
        </div>

        <Panel className="overflow-hidden p-0">
          {/* Column headers (md+): Campaign, Brand, Deliverables, Status */}
          <div
            className={`hidden border-b border-[var(--woosh-navy)]/10 bg-[var(--woosh-navy)]/[0.03] px-5 py-2.5 ${COLUMNS}`}
          >
            <Skeleton className={`my-0.5 h-3 w-16 ${PULSE}`} />
            <Skeleton className={`my-0.5 h-3 w-10 ${PULSE}`} />
            <Skeleton className={`my-0.5 ml-auto h-3 w-20 ${PULSE}`} />
            <Skeleton className={`my-0.5 h-3 w-12 ${PULSE}`} />
          </div>

          <div className="divide-y divide-[var(--woosh-navy)]/10">
            {ROWS.map((row, index) => (
              <CampaignRowPlaceholder key={index} {...row} />
            ))}
          </div>

          {/* Totals row (md+): campaign count + deliverables total */}
          <div
            className={`hidden border-t border-[var(--woosh-navy)]/10 bg-[var(--woosh-navy)]/[0.03] px-5 py-3 ${COLUMNS}`}
          >
            <Skeleton className={`my-[3px] h-3.5 w-24 ${PULSE}`} />
            <span />
            <Skeleton className={`my-[3px] ml-auto h-3.5 w-6 ${PULSE}`} />
            <span />
          </div>
        </Panel>
      </div>
    </div>
  );
}
