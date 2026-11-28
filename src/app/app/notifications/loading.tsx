import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for /app/notifications only. The notifications segment has no child
 * routes, so other /app pages keep app/app/loading.tsx. Sizes mirror page.tsx
 * (PageHeader, Panel, NotificationRow) so content does not jump when it streams in.
 */
const PULSE = "motion-reduce:animate-none";

// Representative mix of unread (blue tint, open hint, dot) and read rows.
const ROWS = [
  { unread: true, twoLines: true },
  { unread: true, twoLines: false },
  { unread: false, twoLines: true },
  { unread: true, twoLines: false },
  { unread: false, twoLines: false },
  { unread: false, twoLines: true },
];

function NotificationRowPlaceholder({
  unread,
  twoLines,
}: {
  unread: boolean;
  twoLines: boolean;
}) {
  return (
    <div
      className={`flex w-full items-start gap-3 px-5 py-4 ${
        unread ? "bg-[var(--woosh-blue)]/[0.06]" : ""
      }`}
    >
      {/* Bell icon circle, h-9 w-9 */}
      <Skeleton className={`size-9 shrink-0 rounded-full ${PULSE}`} />
      <div className="min-w-0 flex-1">
        {/* Title text-base (24px line) */}
        <Skeleton className={`my-1 h-4 w-1/2 max-w-xs ${PULSE}`} />
        {/* Body text-sm (20px lines), mt-0.5 */}
        <Skeleton className={`mt-[5px] mb-[3px] h-3.5 w-11/12 max-w-lg ${PULSE}`} />
        {twoLines ? (
          <Skeleton className={`my-[3px] h-3.5 w-2/3 max-w-sm ${PULSE}`} />
        ) : null}
        {/* "Open" / "Mark read" hint on unread rows, mt-1.5 */}
        {unread ? (
          <Skeleton className={`mt-[9px] mb-[3px] h-3.5 w-12 ${PULSE}`} />
        ) : null}
      </div>
      {/* Unread dot */}
      {unread ? (
        <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--woosh-blue)]/30" />
      ) : null}
    </div>
  );
}

export default function NotificationsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading notifications…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description + "Mark all read" action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-12 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-40 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-[34rem] max-w-full ${PULSE}`} />
            {/* The description wraps to a second line on narrow screens */}
            <Skeleton className={`mt-2 h-4 w-2/3 sm:hidden ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-10 w-32 ${PULSE}`} />
          </div>
        </div>

        {/* Notifications list: Panel (default) with p-0 + overflow-hidden */}
        <div className="overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white">
          <div className="divide-y divide-[var(--woosh-navy)]/10">
            {ROWS.map((row, index) => (
              <NotificationRowPlaceholder key={index} {...row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
