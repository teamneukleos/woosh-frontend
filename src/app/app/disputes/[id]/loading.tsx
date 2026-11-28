import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the dispute detail page (/app/disputes/[id]) only. The [id] segment
 * has no child routes, and the disputes list keeps its own (list) boundary. Mirrors
 * page.tsx: narrow AppPage, back link and the Issue panel. The admin-only "Resolve
 * dispute" form is not shown, since most viewers never see it.
 */
const PULSE = "motion-reduce:animate-none";

export default function DisputeDetailLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
    >
      <span className="sr-only">Loading dispute…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: category, subject, "Campaign · Brand" + status badge */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-28 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-72 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-60 max-w-full ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-[22px] w-24 rounded-[var(--radius-sm)] ${PULSE}`} />
          </div>
        </div>

        {/* "← Disputes" */}
        <Skeleton className={`my-[3px] h-3.5 w-20 ${PULSE}`} />

        {/* Issue panel: title, description (text-sm leading-6), requested resolution */}
        <Panel>
          <div className="mb-4">
            <Skeleton className={`my-[3px] h-4 w-14 ${PULSE}`} />
          </div>
          <Skeleton className={`my-[5px] h-3.5 w-full ${PULSE}`} />
          <Skeleton className={`my-[5px] h-3.5 w-full ${PULSE}`} />
          <Skeleton className={`my-[5px] h-3.5 w-3/4 ${PULSE}`} />
          <Skeleton className={`mt-[19px] mb-[3px] h-3.5 w-1/2 ${PULSE}`} />
        </Panel>
      </div>
    </div>
  );
}
