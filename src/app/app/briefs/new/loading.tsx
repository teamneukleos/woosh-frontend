import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the new brief page (/app/briefs/new) only. The new segment has no
 * child routes, so /app/briefs (its (list) boundary) and /app/briefs/[id] keep their own
 * loading files. Mirrors BriefComposer on its first step ("Basics"), which is always
 * the step shown when the page opens.
 */
const PULSE = "motion-reduce:animate-none";

function FieldPlaceholder({
  labelWidth,
  className = "",
  control = "h-11 sm:h-9",
}: {
  labelWidth: string;
  className?: string;
  control?: string;
}) {
  // Label (text-[0.8125rem]) above a control (Input/Select h-11, sm:h-9).
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Skeleton className={`my-1 h-3 ${labelWidth} ${PULSE}`} />
      <Skeleton
        className={`w-full rounded-[var(--radius-control)] ${control} ${PULSE}`}
      />
    </div>
  );
}

const STEP_LABELS = ["w-14", "w-24", "w-8", "w-16"];

export default function NewBriefLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading new brief…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description + Cancel (Button sm) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-14 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-32 ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-96 max-w-full ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-8 w-20 ${PULSE}`} />
          </div>
        </div>

        <div className="grid w-full items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Step rail (lg+): Basics (current), Commercial, Fit, Review */}
          <div className="hidden rounded-2xl border border-[var(--woosh-border)] bg-white p-4 shadow-[var(--shadow-soft)] lg:block">
            <div className="space-y-1">
              {STEP_LABELS.map((width, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-xl px-3 py-3 ${
                    index === 0 ? "bg-[#12141a]/[0.05]" : ""
                  }`}
                >
                  <Skeleton className={`mt-0.5 size-6 shrink-0 rounded-full ${PULSE}`} />
                  <div className="min-w-0 flex-1">
                    {/* Step name text-sm, hint text-xs leading-5 */}
                    <Skeleton className={`my-[3px] h-3.5 ${width} ${PULSE}`} />
                    <Skeleton className={`mt-1.5 mb-1 h-3 w-full ${PULSE}`} />
                    <Skeleton className={`my-1 h-3 w-full ${PULSE}`} />
                    <Skeleton className={`my-1 h-3 w-1/2 ${PULSE}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 space-y-4">
            {/* Mobile/tablet progress: step name, "Step 1 of 4", 25% bar */}
            <div className="lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className={`my-[3px] h-3.5 w-14 ${PULSE}`} />
                <Skeleton className={`my-0.5 h-3 w-16 ${PULSE}`} />
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#12141a]/[0.06]">
                <Skeleton className={`h-full w-1/4 rounded-full ${PULSE}`} />
              </div>
            </div>

            {/* Composer card */}
            <div className="overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]">
              {/* Step header (lg+): "Step 1 of 4", step title, hint */}
              <div className="hidden border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6 lg:block">
                <Skeleton className={`my-[3px] h-2.5 w-20 ${PULSE}`} />
                <Skeleton className={`mt-2 mb-1 h-5 w-24 ${PULSE}`} />
                <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-96 max-w-full ${PULSE}`} />
              </div>

              {/* Basics: Title, Description (rows=7), Distribution + helper text */}
              <div className="p-5 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldPlaceholder labelWidth="w-10" className="sm:col-span-2" />
                  <FieldPlaceholder
                    labelWidth="w-20"
                    className="sm:col-span-2"
                    control="h-[190px]"
                  />
                  <FieldPlaceholder labelWidth="w-20" />
                  <div className="sm:pt-7">
                    <Skeleton className={`my-[5px] h-3.5 w-full ${PULSE}`} />
                    <Skeleton className={`my-[5px] h-3.5 w-full ${PULSE}`} />
                    <Skeleton className={`my-[5px] h-3.5 w-1/2 ${PULSE}`} />
                  </div>
                </div>
              </div>

              {/* Footer: Continue (full width on mobile, right-aligned from sm) */}
              <div className="flex flex-col-reverse gap-2 border-t border-[var(--woosh-border)] bg-[#faf9f7] px-5 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:px-6">
                <Skeleton className={`h-10 w-full sm:w-24 ${PULSE}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
