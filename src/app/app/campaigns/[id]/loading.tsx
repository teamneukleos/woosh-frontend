import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the campaign workspace (/app/campaigns/[id]) only. The [id] segment
 * has no child routes, and the campaigns list has its own (list) boundary. Mirrors
 * page.tsx: CampaignHeader, summary stats, campaign terms, DeliverableWorkCard and
 * CampaignConversation, with the same spacing and breakpoints.
 */
const PULSE = "motion-reduce:animate-none";
// Placeholders on tinted or dark surfaces need a lighter fill to stay visible.
const ON_MIST = "bg-white/80";
const ON_NAVY = "bg-white/15";

function WorkStatusPlaceholder() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className={`h-[22px] w-20 rounded-[var(--radius-sm)] ${PULSE}`} />
      <Skeleton className={`h-3.5 w-24 ${PULSE}`} />
    </div>
  );
}

function DeliverablePlaceholder({ withAction = false }: { withAction?: boolean }) {
  // DeliverableWorkCard: Panel (p-4) with title, channel, status, requirements, actions.
  return (
    <div className="rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className={`my-1 h-4 w-44 max-w-full ${PULSE}`} />
          <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-24 ${PULSE}`} />
        </div>
        <WorkStatusPlaceholder />
      </div>
      {/* Requirements box */}
      <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--woosh-mist)]/65 px-4 py-3">
        <Skeleton className={`my-[3px] h-2.5 w-20 ${ON_MIST} ${PULSE}`} />
        <Skeleton className={`mt-[9px] mb-[5px] h-3.5 w-full ${ON_MIST} ${PULSE}`} />
        <Skeleton className={`my-[5px] h-3.5 w-2/3 ${ON_MIST} ${PULSE}`} />
      </div>
      {/* Submission / review action (varies by role and state) */}
      {withAction ? <Skeleton className={`mt-5 h-10 w-36 ${PULSE}`} /> : null}
    </div>
  );
}

export default function CampaignDetailLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-7"
    >
      <span className="sr-only">Loading campaign…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-7">
        {/* Page header: brand name, campaign title, "Campaign workspace for …" + status */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-24 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-64 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-72 max-w-full ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
          </div>
        </div>

        {/* "← Campaigns" / "← Work hub" */}
        <Skeleton className={`my-[3px] h-3.5 w-24 ${PULSE}`} />

        {/* Commercial summary (Panel variant="brand", navy) */}
        <div className="rounded-[var(--radius-surface)] border border-transparent bg-[var(--woosh-navy)] p-5">
          <div className="mb-4">
            <Skeleton className={`my-[3px] h-4 w-40 ${ON_NAVY} ${PULSE}`} />
            <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-56 max-w-full ${ON_NAVY} ${PULSE}`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Agreed rate, Terms, Support */}
            {["w-20", "w-12", "w-14"].map((width, index) => (
              <div key={index}>
                <Skeleton className={`my-0.5 h-3 ${width} ${ON_NAVY} ${PULSE}`} />
                <Skeleton className={`mt-2 mb-1 h-4 w-32 max-w-full ${ON_NAVY} ${PULSE}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Campaign summary: Deliverables, Next deadline */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-border)] shadow-[var(--shadow-soft)] sm:grid-cols-2">
          {["w-24", "w-28"].map((width, index) => (
            <div key={index} className="flex min-w-0 flex-col gap-3 bg-white p-5">
              <Skeleton className={`my-[3px] h-3.5 ${width} ${PULSE}`} />
              <Skeleton className={`my-1 h-6 w-28 max-w-full sm:h-7 ${PULSE}`} />
              <Skeleton className={`-mt-1 mb-0.5 h-3 w-32 max-w-full ${PULSE}`} />
            </div>
          ))}
        </div>

        {/* Campaign terms: Usage rights | Timing */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <Skeleton className={`my-1 h-4 w-36 ${PULSE}`} />
            <Skeleton className={`mt-[9px] mb-[5px] h-3.5 w-80 max-w-full ${PULSE}`} />
          </div>
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2 lg:gap-0">
            {[0, 1].map((side) => (
              <div
                key={side}
                className={
                  side === 0
                    ? "min-w-0 lg:pr-6"
                    : "min-w-0 border-t border-[var(--woosh-border)] pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
                }
              >
                {/* 18px icon + heading */}
                <div className="mb-3 flex items-center gap-2">
                  <Skeleton className={`size-[18px] shrink-0 ${PULSE}`} />
                  <Skeleton className={`my-[3px] h-3.5 w-24 ${PULSE}`} />
                </div>
                {/* TermDetails: two sunken term tiles */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[0, 1].map((tile) => (
                    <div
                      key={tile}
                      className="rounded-[var(--radius-control)] bg-[var(--surface-sunken)] px-4 py-3"
                    >
                      <Skeleton className={`my-[3px] h-2.5 w-16 ${ON_MIST} ${PULSE}`} />
                      <Skeleton className={`mt-[9px] mb-[5px] h-3.5 w-24 max-w-full ${ON_MIST} ${PULSE}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverable checklist */}
        <div className="grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {/* Heading text-lg / sm:text-xl, description text-sm */}
              <Skeleton className={`my-1 h-5 w-48 ${PULSE}`} />
              <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-72 max-w-full ${PULSE}`} />
            </div>
            <Skeleton className={`my-[3px] h-3.5 w-24 ${PULSE}`} />
          </div>
          <DeliverablePlaceholder withAction />
          <DeliverablePlaceholder />
        </div>

        {/* Campaign messages (Panel variant="flush") */}
        <div className="overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white">
          <div className="mb-4">
            <Skeleton className={`my-[3px] h-4 w-36 ${PULSE}`} />
            <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-80 max-w-full ${PULSE}`} />
          </div>
          <div className="flex max-h-[28rem] min-h-64 flex-col">
            <div className="min-h-0 flex-1 bg-[var(--surface-sunken)]/70 px-4 py-4" />
            {/* Composer: textarea + send icon button */}
            <div className="flex items-end gap-2 border-t border-[var(--woosh-border)] bg-white p-3 sm:p-4">
              <Skeleton
                className={`h-11 min-w-0 flex-1 rounded-[var(--radius-control)] ${PULSE}`}
              />
              <Skeleton className={`size-10 shrink-0 ${PULSE}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
