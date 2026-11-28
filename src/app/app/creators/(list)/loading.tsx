import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the brand-side creators directory (/app/creators) only. The (list)
 * route group keeps this boundary off the creator detail page (/app/creators/[id]),
 * which still uses app/app/loading.tsx. Sizes mirror page.tsx, CreatorDiscoveryFilters
 * and CreatorDiscoveryCard so content does not jump when it streams in.
 */
const PULSE = "motion-reduce:animate-none";

function FieldPlaceholder({ labelWidth = "w-16" }: { labelWidth?: string }) {
  // Label (text-[0.8125rem]) above a control (h-11, sm:h-9).
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Skeleton className={`my-1 h-3 ${labelWidth} ${PULSE}`} />
      <Skeleton
        className={`h-11 w-full rounded-[var(--radius-control)] sm:h-9 ${PULSE}`}
      />
    </div>
  );
}

function CreatorCardPlaceholder() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          {/* Avatar lg (56px, round) */}
          <Skeleton className={`size-14 shrink-0 rounded-full ${PULSE}`} />
          <div className="min-w-0 flex-1">
            {/* Name text-base, handle text-sm */}
            <Skeleton className={`my-1 h-4 w-3/4 ${PULSE}`} />
            <Skeleton className={`my-[3px] h-3.5 w-1/2 ${PULSE}`} />
            {/* Platform icons (20px), mt-1.5 */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <Skeleton className={`size-5 rounded-full ${PULSE}`} />
              <Skeleton className={`size-5 rounded-full ${PULSE}`} />
            </div>
            {/* City · categories text-xs, mt-1 */}
            <Skeleton className={`mt-1.5 mb-0.5 h-3 w-2/3 ${PULSE}`} />
          </div>
        </div>

        {/* Stats strip: Followers, ER, Likes, Views */}
        <div className="mt-4 grid grid-cols-4 gap-x-1 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/70 px-2 py-2.5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex min-w-0 flex-col items-center px-1">
              <Skeleton className={`h-3.5 w-8 max-w-full bg-white ${PULSE}`} />
              <Skeleton className={`mt-[7px] mb-[3px] h-2 w-9 max-w-full bg-white ${PULSE}`} />
            </div>
          ))}
        </div>
        {/* "Live from the connected app." / "Estimate until they connect." */}
        <Skeleton className={`mt-[11px] mb-[3px] h-2.5 w-36 max-w-full ${PULSE}`} />

        {/* Shortlist button (sm) + View link */}
        <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:flex-wrap">
          <Skeleton className={`h-8 w-full sm:w-24 ${PULSE}`} />
          <div className="flex h-10 w-full items-center justify-center px-2 sm:h-8 sm:w-auto">
            <Skeleton className={`h-3.5 w-9 ${PULSE}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex w-full max-w-[90rem] flex-col gap-6"
    >
      <span className="sr-only">Loading creators…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-10 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-28 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-[34rem] max-w-full ${PULSE}`} />
          {/* The description wraps to a second line on narrow screens */}
          <Skeleton className={`mt-2 h-4 w-1/2 sm:hidden ${PULSE}`} />
        </div>

        {/* Filters toolbar (DataToolbar p-4 md:p-5) */}
        <div className="min-w-0 rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white p-4 md:p-5">
          <div className="flex w-full min-w-0 flex-col gap-4">
            {/* Search */}
            <FieldPlaceholder labelWidth="w-14" />
            {/* Type, Platform, Category, City, Followers, Sort */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {["w-10", "w-16", "w-16", "w-10", "w-20", "w-10"].map((width, index) => (
                <FieldPlaceholder key={index} labelWidth={width} />
              ))}
            </div>
            {/* Collapsed "More filters" */}
            <div className="rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)]/40 px-3 py-2.5">
              <Skeleton className={`my-[3px] h-3.5 w-24 ${PULSE}`} />
            </div>
          </div>
        </div>

        {/* "Showing 1-100 of N creators" */}
        <Skeleton className={`my-[3px] h-3.5 w-48 ${PULSE}`} />

        {/* Creator grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <CreatorCardPlaceholder key={index} />
          ))}
        </div>

        {/* Collapsed "Add a prospect by handle" */}
        <div className="rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white px-5 py-4">
          <Skeleton className={`my-[3px] h-3.5 w-44 ${PULSE}`} />
        </div>
      </div>
    </div>
  );
}
