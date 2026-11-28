import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the creator applications page (/app/applications) only. The
 * applications segment has no child routes, so this boundary applies to this page alone;
 * other /app pages keep app/app/loading.tsx. Sizes mirror page.tsx to limit layout shift.
 */
const PULSE = "motion-reduce:animate-none";

function WorkStatusPlaceholder() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* StatusBadge (~22px) + deadline text-sm */}
      <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
      <Skeleton className={`h-3.5 w-24 ${PULSE}`} />
    </div>
  );
}

function TrackPlaceholder() {
  // Applied → Shortlisted → Accepted: step dot, label, connector line.
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((step) => (
        <div
          key={step}
          className="flex min-w-0 flex-1 items-center gap-2 last:flex-none"
        >
          <Skeleton className={`size-5 shrink-0 rounded-full ${PULSE}`} />
          <Skeleton className={`my-0.5 h-3 w-16 ${PULSE}`} />
          {step < 2 ? (
            <span className="h-px min-w-3 flex-1 bg-[var(--woosh-border)]" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AppCardPlaceholder() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            {/* Brand mark, size-12 */}
            <Skeleton className={`size-12 shrink-0 rounded-xl ${PULSE}`} />
            <div className="min-w-0">
              {/* Brief title text-[0.9375rem] / sm:text-lg, brand name text-sm */}
              <Skeleton
                className={`my-[3px] h-4 w-56 max-w-full sm:my-1 sm:h-5 sm:w-72 ${PULSE}`}
              />
              <Skeleton className={`mt-[5px] mb-[3px] h-3.5 w-28 max-w-full ${PULSE}`} />
            </div>
          </div>
          <WorkStatusPlaceholder />
        </div>

        {/* Proposal: label text-xs, amount text-lg with wallet icon */}
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          <div>
            <Skeleton className={`my-0.5 h-3 w-20 ${PULSE}`} />
            <div className="mt-1 flex h-7 items-center gap-2">
              <Skeleton className={`size-4 shrink-0 ${PULSE}`} />
              <Skeleton className={`h-5 w-24 ${PULSE}`} />
            </div>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="mt-6 border-t border-[var(--woosh-border)] pt-5">
          <TrackPlaceholder />
        </div>
      </div>

      {/* Footer: View brief link + Withdraw (h-9) */}
      <div className="mt-auto flex items-center justify-between gap-3 rounded-b-2xl border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-3 sm:px-6">
        <Skeleton className={`my-0.5 h-4 w-20 ${PULSE}`} />
        <Skeleton className={`h-9 w-24 rounded-lg ${PULSE}`} />
      </div>
    </div>
  );
}

function ClosedRowPlaceholder() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
      {/* Brand mark, size-10 */}
      <Skeleton className={`size-10 shrink-0 rounded-xl ${PULSE}`} />
      <div className="min-w-0 flex-1">
        {/* Brief title text-sm, brand name text-sm */}
        <Skeleton className={`my-[3px] h-3.5 w-48 max-w-full ${PULSE}`} />
        <Skeleton className={`mt-[5px] mb-[3px] h-3.5 w-28 max-w-full ${PULSE}`} />
      </div>
      <div className="hidden shrink-0 sm:block">
        <WorkStatusPlaceholder />
      </div>
      {/* Chevron, 16px */}
      <Skeleton className={`size-4 shrink-0 ${PULSE}`} />
    </div>
  );
}

export default function ApplicationsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading applications…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-12 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-36 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-96 max-w-full ${PULSE}`} />
        </div>

        <div className="w-full space-y-6">
          {/* Application summary: label text-sm + value text-3xl, gap-2 */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex min-w-0 flex-col gap-2 bg-white p-5">
                <Skeleton className={`my-[3px] h-3.5 w-24 max-w-full ${PULSE}`} />
                <Skeleton className={`my-1 h-7 w-10 ${PULSE}`} />
              </div>
            ))}
          </div>

          {/* Your applications + count */}
          <div className="space-y-3">
            <Skeleton className={`my-[3px] h-4 w-36 ${PULSE}`} />
            <div className="grid gap-4">
              <AppCardPlaceholder />
              <AppCardPlaceholder />
            </div>
          </div>

          {/* Closed */}
          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--woosh-border)] px-5 py-3.5 sm:px-6">
              <Skeleton className={`my-[3px] h-4 w-16 ${PULSE}`} />
              <Skeleton className={`h-3.5 w-4 ${PULSE}`} />
            </div>
            <div className="divide-y divide-[var(--woosh-border)]">
              <ClosedRowPlaceholder />
              <ClosedRowPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
