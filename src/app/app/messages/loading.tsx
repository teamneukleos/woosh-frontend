import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for /app/messages when the page is first entered. The messages segment
 * has no child routes, so other /app pages keep app/app/loading.tsx.
 *
 * Switching conversations (?c=) does not show this again: Next.js keys the page segment
 * without search params, so this boundary is not remounted. The conversation panel has
 * its own Suspense boundary (ThreadLoading) for that case.
 */
const PULSE = "motion-reduce:animate-none";

function ThreadRowPlaceholder() {
  return (
    <div className="flex gap-3 rounded-[var(--radius-md)] px-2.5 py-2.5">
      {/* Avatar sm (32px) */}
      <Skeleton className={`mt-0.5 size-8 shrink-0 rounded-full ${PULSE}`} />
      <div className="min-w-0 flex-1">
        {/* Title text-sm + time */}
        <div className="flex items-center gap-2">
          <Skeleton className={`my-[3px] h-3.5 w-3/5 ${PULSE}`} />
          <Skeleton className={`ml-auto h-2.5 w-8 shrink-0 ${PULSE}`} />
        </div>
        {/* Kind badge + preview text-xs */}
        <div className="mt-0.5 flex items-center gap-1.5">
          <Skeleton className={`h-[18px] w-14 shrink-0 rounded-[var(--radius-sm)] ${PULSE}`} />
          <Skeleton className={`h-3 w-2/3 ${PULSE}`} />
        </div>
      </div>
    </div>
  );
}

export default function MessagesLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-4"
    >
      <span className="sr-only">Loading messages…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-4">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-12 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-32 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-96 max-w-full ${PULSE}`} />
        </div>

        {/* Messaging container: inbox + (desktop) conversation panel */}
        <div className="grid min-h-[min(36rem,calc(100dvh-12rem))] overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)] md:min-h-[calc(100dvh-10rem)] lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col border-[var(--woosh-border)] bg-white lg:border-r">
            {/* Inbox header + thread count */}
            <div className="flex items-center justify-between border-b border-[var(--woosh-border)] px-4 py-3 sm:px-5">
              <Skeleton className={`my-[3px] h-3.5 w-12 ${PULSE}`} />
              <Skeleton className={`my-0.5 h-3 w-14 ${PULSE}`} />
            </div>
            {/* Search field */}
            <div className="border-b border-[var(--woosh-border)] p-3">
              <Skeleton className={`h-10 w-full rounded-[var(--radius-control)] ${PULSE}`} />
            </div>
            {/* Conversation rows */}
            <div className="p-1.5">
              {Array.from({ length: 6 }, (_, index) => (
                <ThreadRowPlaceholder key={index} />
              ))}
            </div>
          </div>

          {/* Conversation panel (lg and up; below lg the page shows one pane at a time) */}
          <div className="hidden min-h-0 flex-col bg-[var(--surface-sunken)]/70 lg:flex">
            <div className="flex items-center gap-3 border-b border-[var(--woosh-border)] bg-white px-3 py-3 sm:px-4">
              <Skeleton className={`size-9 shrink-0 rounded-full ${PULSE}`} />
              <Skeleton className={`size-8 shrink-0 rounded-full ${PULSE}`} />
              <div className="min-w-0 flex-1">
                <Skeleton className={`my-[3px] h-3.5 w-48 max-w-full ${PULSE}`} />
                <Skeleton className={`my-0.5 h-3 w-28 max-w-full ${PULSE}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
