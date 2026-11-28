import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the creator jobs list (/app/jobs) only. The (list) route group keeps
 * this boundary off the brief detail page (/app/jobs/[id]), which still uses
 * app/app/loading.tsx. Sizes mirror page.tsx so content does not jump when it streams in.
 *
 * The active tab is not known here, so one layout serves All open, Invited and Applied:
 * the featured card only renders on All open and collapses away on the filtered tabs.
 */
const PULSE = "motion-reduce:animate-none";

function RatePlaceholder({ large = false }: { large?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* Wallet icon (18px large, 16px small) + amount (text-xl / text-base) */}
      <Skeleton
        className={`shrink-0 ${large ? "size-[18px]" : "size-4"} ${PULSE}`}
      />
      <Skeleton
        className={`${large ? "my-1 h-5 w-28" : "my-1 h-4 w-20"} ${PULSE}`}
      />
    </span>
  );
}

function FeaturedJobPlaceholder() {
  return (
    <div className="rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7">
      {/* "Top match for you" (text-sm) */}
      <Skeleton className={`mt-[3px] mb-[23px] h-3.5 w-32 ${PULSE}`} />
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {/* Brand mark, size-14 */}
          <Skeleton className={`size-14 shrink-0 rounded-xl ${PULSE}`} />
          <div className="min-w-0">
            {/* Title text-xl / sm:text-2xl, brand text-sm, tag pill */}
            <Skeleton
              className={`my-1 h-5 w-60 max-w-full sm:h-6 sm:w-80 ${PULSE}`}
            />
            <Skeleton className={`mt-2 h-3.5 w-28 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-3 h-6 w-20 rounded-full ${PULSE}`} />
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-6 md:justify-end">
          <RatePlaceholder large />
          {/* "View brief" + chevron */}
          <Skeleton className={`h-4 w-20 ${PULSE}`} />
        </div>
      </div>
    </div>
  );
}

function JobCardPlaceholder() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--woosh-border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        {/* Brand mark, size-11 + tag pill */}
        <Skeleton className={`size-11 shrink-0 rounded-xl ${PULSE}`} />
        <Skeleton className={`h-6 w-16 rounded-full ${PULSE}`} />
      </div>
      {/* Title text-base, brand text-sm */}
      <Skeleton className={`mt-5 h-4 w-3/4 ${PULSE}`} />
      <Skeleton className={`mt-2.5 h-3.5 w-1/2 ${PULSE}`} />
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--woosh-border)] pt-4">
        <span className="mt-4">
          <RatePlaceholder />
        </span>
        {/* "View" + chevron */}
        <Skeleton className={`mt-4 h-4 w-12 ${PULSE}`} />
      </div>
    </div>
  );
}

export default function JobsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading jobs…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-24 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-20 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-[26rem] max-w-full ${PULSE}`} />
        </div>

        {/* Filter chips: All open, Invited, Applied */}
        <div className="-mx-1 flex flex-nowrap gap-2 overflow-hidden px-1 pb-1">
          <Skeleton className={`h-7 w-[4.5rem] rounded-[var(--radius-sm)] ${PULSE}`} />
          <Skeleton className={`h-7 w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
          <Skeleton className={`h-7 w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
        </div>

        <div className="w-full space-y-6">
          <FeaturedJobPlaceholder />

          <div className="space-y-3">
            {/* Section heading + count */}
            <Skeleton className={`my-[3px] h-4 w-28 ${PULSE}`} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <JobCardPlaceholder />
              <JobCardPlaceholder />
              <JobCardPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
