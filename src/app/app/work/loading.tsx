import { Skeleton } from "@/components/ui/skeleton";
import { StatCardsSkeleton } from "@/components/ui/stat-cards-skeleton";

/**
 * Loading state for the creator work hub (/app/work) only. The work segment has no child
 * routes, so this boundary applies to this page alone; other /app pages keep
 * app/app/loading.tsx. Sizes mirror page.tsx so content does not jump when it streams in.
 */
const PULSE = "motion-reduce:animate-none";

function FieldPlaceholder() {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {/* Label text-[0.8125rem] (~20px line) */}
      <Skeleton className={`my-1 h-3 w-16 ${PULSE}`} />
      {/* Select: h-11, sm:h-9 */}
      <Skeleton
        className={`h-11 w-full rounded-[var(--radius-control)] sm:h-9 ${PULSE}`}
      />
    </div>
  );
}

function WorkCardPlaceholder({ actions = false }: { actions?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          {/* Work type icon (18px) */}
          <Skeleton className={`mt-1 size-[18px] shrink-0 ${PULSE}`} />
          <div className="min-w-0">
            {/* Kind label text-xs, title text-base, brand text-sm */}
            <Skeleton className={`my-0.5 h-3 w-20 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-4 w-52 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-2 h-3.5 w-28 max-w-full ${PULSE}`} />
          </div>
        </div>
        {/* Status badge + deadline */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className={`h-[22px] w-20 rounded-[var(--radius-sm)] ${PULSE}`} />
          <Skeleton className={`h-3.5 w-24 ${PULSE}`} />
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-2 border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-3.5 sm:px-6">
          <Skeleton className={`h-10 w-36 ${PULSE}`} />
          <Skeleton className={`h-10 w-24 ${PULSE}`} />
        </div>
      ) : null}
    </div>
  );
}

function SectionPlaceholder({
  headingWidth,
  cards,
}: {
  headingWidth: string;
  cards: boolean[];
}) {
  return (
    <div className="grid gap-3">
      <Skeleton className={`my-[3px] h-4 ${headingWidth} ${PULSE}`} />
      {cards.map((actions, index) => (
        <WorkCardPlaceholder key={index} actions={actions} />
      ))}
    </div>
  );
}

export default function WorkLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading your work…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description */}
        <div className="min-w-0 max-w-2xl">
          <Skeleton className={`my-0.5 h-3 w-28 ${PULSE}`} />
          <Skeleton className={`mt-1.5 h-6 w-36 max-w-full ${PULSE}`} />
          <Skeleton className={`mt-2.5 h-4 w-96 max-w-full ${PULSE}`} />
        </div>

        <div className="w-full space-y-6">
          <StatCardsSkeleton count={4} />

          <div className="rounded-2xl border border-[var(--woosh-border)] bg-white px-5 py-4 shadow-[var(--shadow-soft)] sm:px-6">
            <div className="grid w-full gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <FieldPlaceholder />
              <FieldPlaceholder />
              <Skeleton className={`h-10 w-full self-end sm:w-20 ${PULSE}`} />
            </div>
          </div>

          <SectionPlaceholder headingWidth="w-28" cards={[true, false]} />
          <SectionPlaceholder headingWidth="w-24" cards={[false, false]} />
        </div>
      </div>
    </div>
  );
}
