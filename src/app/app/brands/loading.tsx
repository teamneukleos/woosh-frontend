import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the brands page (/app/brands) only. The brands segment has no child
 * routes, so other /app pages keep app/app/loading.tsx. Sizes mirror page.tsx
 * (PageHeader, Panel, brand rows) so content does not jump when it streams in.
 */
const PULSE = "motion-reduce:animate-none";

// The first row stands in for the active brand (tinted row + Active badge).
const ROWS = [
  { active: true, name: "w-36", industry: "w-24" },
  { active: false, name: "w-44", industry: "w-28" },
  { active: false, name: "w-32", industry: "w-20" },
  { active: false, name: "w-40", industry: "w-32" },
];

function BrandRowPlaceholder({
  active,
  name,
  industry,
}: {
  active: boolean;
  name: string;
  industry: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        active ? "bg-[var(--woosh-navy)]/[0.04]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Brand initial, h-10 w-10 rounded-xl */}
        <Skeleton className={`size-10 shrink-0 rounded-xl ${PULSE}`} />
        <div className="min-w-0">
          {/* Brand name text-base (+ Active badge), industry text-sm */}
          <div className="flex items-center gap-2">
            <Skeleton className={`my-1 h-4 ${name} max-w-full ${PULSE}`} />
            {active ? (
              <Skeleton
                className={`h-[22px] w-14 shrink-0 rounded-[var(--radius-sm)] bg-[var(--woosh-teal)]/15 ${PULSE}`}
              />
            ) : null}
          </div>
          <Skeleton className={`mt-[5px] mb-[3px] h-3.5 ${industry} max-w-full ${PULSE}`} />
        </div>
      </div>

      {/* "Switch to brand" + "Briefs" (Button size sm, h-8) */}
      <div className="flex shrink-0 gap-2">
        <Skeleton className={`h-8 w-32 ${PULSE}`} />
        <Skeleton className={`h-8 w-16 ${PULSE}`} />
      </div>
    </div>
  );
}

export default function BrandsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading brands…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description + "Add brand" action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-20 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-24 ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-[30rem] max-w-full ${PULSE}`} />
            {/* The description wraps to a second line on narrow screens */}
            <Skeleton className={`mt-2 h-4 w-1/2 sm:hidden ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-10 w-28 ${PULSE}`} />
          </div>
        </div>

        {/* Brands panel: Panel (default) with p-0 + overflow-hidden */}
        <div className="overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white">
          {/* Brand count strip, text-xs */}
          <div className="border-b border-[var(--woosh-navy)]/10 bg-[var(--woosh-navy)]/[0.03] px-5 py-2.5">
            <Skeleton className={`my-0.5 h-3 w-16 ${PULSE}`} />
          </div>
          <div className="divide-y divide-[var(--woosh-navy)]/10">
            {ROWS.map((row, index) => (
              <BrandRowPlaceholder key={index} {...row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
