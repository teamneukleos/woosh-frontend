import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCardsSkeleton } from "@/components/ui/stat-cards-skeleton";
import { ACTIVE_BRAND_COOKIE } from "@/lib/brand-cookie";

/**
 * Loading state for the dashboard overview only (/app). The (overview) route group keeps
 * this boundary off the other /app pages, which still use app/app/loading.tsx.
 */
export default async function OverviewLoading() {
  // No data is known yet; an active-brand cookie is a cheap hint for the brand layout.
  const jar = await cookies();
  const count = jar.has(ACTIVE_BRAND_COOKIE) ? 3 : 4;

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading your dashboard…</span>
      <div aria-hidden="true" className="min-w-0 max-w-2xl">
        <Skeleton className="h-3 w-32 motion-reduce:animate-none" />
        <Skeleton className="mt-2 h-6 w-48 max-w-full motion-reduce:animate-none" />
        <Skeleton className="mt-3 h-4 w-64 max-w-full motion-reduce:animate-none" />
      </div>
      <StatCardsSkeleton count={count} />
    </div>
  );
}
