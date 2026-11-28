import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the disputes list (/app/disputes) only. The (list) route group keeps
 * this boundary off the dispute detail page (/app/disputes/[id]), which still uses
 * app/app/loading.tsx. Reuses Panel so card borders and padding match page.tsx.
 */
const PULSE = "motion-reduce:animate-none";

// Varied widths so the cards read as real content.
const CARDS = [
  { subject: "w-64", meta: "w-52" },
  { subject: "w-48", meta: "w-60" },
  { subject: "w-56", meta: "w-44" },
];

export default function DisputesLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading disputes…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-28 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-28 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-96 max-w-full ${PULSE}`} />
          {/* The description wraps to a second line on narrow screens */}
          <Skeleton className={`mt-2 h-4 w-1/2 sm:hidden ${PULSE}`} />
        </div>

        {/* Dispute cards */}
        <div className="grid gap-3">
          {CARDS.map((card, index) => (
            <Panel key={index} className="bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Subject (font-semibold, text-base) */}
                  <Skeleton className={`my-1 h-4 ${card.subject} max-w-full ${PULSE}`} />
                  {/* Campaign title · category (text-sm, mt-1) */}
                  <Skeleton className={`mt-[7px] mb-[3px] h-3.5 ${card.meta} max-w-full ${PULSE}`} />
                </div>
                {/* Status badge */}
                <Skeleton className={`h-[22px] w-20 shrink-0 rounded-[var(--radius-sm)] ${PULSE}`} />
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
