import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the creator invitations page (/app/invitations) only. The invitations
 * segment has no child routes, so this boundary applies to this page alone; other /app
 * pages keep app/app/loading.tsx. Sizes mirror page.tsx so content does not jump.
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

function InviteCardPlaceholder() {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Brand mark, size-12 */}
            <Skeleton className={`size-12 shrink-0 rounded-xl ${PULSE}`} />
            <div className="min-w-0">
              {/* Brand name text-sm, "invited you to apply" text-xs */}
              <Skeleton className={`my-[3px] h-3.5 w-28 max-w-full ${PULSE}`} />
              <Skeleton className={`my-0.5 h-3 w-24 max-w-full ${PULSE}`} />
            </div>
          </div>
          <WorkStatusPlaceholder />
        </div>

        {/* Brief title text-xl */}
        <Skeleton className={`mt-6 mb-1 h-5 w-3/4 ${PULSE}`} />

        {/* Message preview bubble */}
        <div className="mt-4 rounded-2xl rounded-tl-md bg-[#f4f5f7] px-4 py-3">
          <Skeleton className={`my-[5px] h-3.5 w-full ${PULSE}`} />
          <Skeleton className={`my-[5px] h-3.5 w-2/3 ${PULSE}`} />
        </div>
      </div>

      {/* Footer: Review button (sm) + decline icon button */}
      <div className="mt-auto flex items-center justify-between gap-3 rounded-b-2xl border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-4 sm:px-6">
        <Skeleton className={`h-8 w-20 ${PULSE}`} />
        <Skeleton className={`size-9 rounded-lg ${PULSE}`} />
      </div>
    </div>
  );
}

function PastRowPlaceholder() {
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

export default function InvitationsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading invitations…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-12 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-32 ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-72 max-w-full ${PULSE}`} />
        </div>

        <div className="w-full space-y-6">
          {/* Invitation summary: label text-sm + value text-3xl, gap-2 */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex min-w-0 flex-col gap-2 bg-white p-5">
                <Skeleton className={`my-[3px] h-3.5 w-28 max-w-full ${PULSE}`} />
                <Skeleton className={`my-1 h-7 w-10 ${PULSE}`} />
              </div>
            ))}
          </div>

          {/* Waiting for your reply */}
          <div className="space-y-3">
            <Skeleton className={`my-[3px] h-4 w-44 ${PULSE}`} />
            <div className="grid gap-4 lg:grid-cols-2">
              <InviteCardPlaceholder />
              <InviteCardPlaceholder />
            </div>
          </div>

          {/* Earlier invitations */}
          <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--woosh-border)] px-5 py-3.5 sm:px-6">
              <Skeleton className={`my-[3px] h-4 w-36 ${PULSE}`} />
              <Skeleton className={`h-3.5 w-4 ${PULSE}`} />
            </div>
            <div className="divide-y divide-[var(--woosh-border)]">
              <PastRowPlaceholder />
              <PastRowPlaceholder />
              <PastRowPlaceholder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
