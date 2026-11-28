import { Skeleton } from "@/components/ui/skeleton";

// Each placeholder occupies its text's line-height, so the card keeps the loaded size:
// label text-sm (20px), value text-3xl (36px), note text-xs (16px), p-5, gap-3.
const LINE = "motion-reduce:animate-none";

/** Placeholder for the dashboard "At a glance" stat cards: 4 (creator) or 3 (brand). */
export function StatCardsSkeleton({ count }: { count: 3 | 4 }) {
  const columns =
    count >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3";
  return (
    <div
      aria-hidden="true"
      className={`grid gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] ${columns}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex min-w-0 flex-col gap-3 bg-white p-5">
          <Skeleton className={`my-[3px] h-3.5 w-24 max-w-full ${LINE}`} />
          <Skeleton className={`my-1 h-7 w-16 max-w-full ${LINE}`} />
          <Skeleton className={`my-0.5 h-3 w-32 max-w-full ${LINE}`} />
        </div>
      ))}
    </div>
  );
}
