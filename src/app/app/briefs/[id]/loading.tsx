import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the brief detail page (/app/briefs/[id]) only. The [id] segment has
 * no child routes, so the briefs list (/app/briefs, its own (list) boundary) and
 * /app/briefs/new are unaffected. Sizes mirror page.tsx, Panel and BriefInvitePanel.
 */
const PULSE = "motion-reduce:animate-none";

// Panel (default variant): rounded surface, border, white, p-4.
const PANEL =
  "rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white p-4";

function FieldPlaceholder({
  labelWidth,
  control = "select",
}: {
  labelWidth: string;
  control?: "select" | "textarea";
}) {
  // Label (text-[0.8125rem]) above a Select (h-11, sm:h-9) or TextArea (min-h-28).
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Skeleton className={`my-1 h-3 ${labelWidth} ${PULSE}`} />
      <Skeleton
        className={`w-full rounded-[var(--radius-control)] ${
          control === "textarea" ? "h-28" : "h-11 sm:h-9"
        } ${PULSE}`}
      />
    </div>
  );
}

function ApplicantPlaceholder() {
  return (
    <div className={PANEL}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Avatar md (40px) */}
          <Skeleton className={`size-10 shrink-0 rounded-full ${PULSE}`} />
          <div>
            {/* Name text-base, handle text-sm (mt-1) */}
            <Skeleton className={`my-1 h-4 w-36 ${PULSE}`} />
            <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-24 ${PULSE}`} />
            {/* Status badge + proposed rate (mt-2) */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Skeleton className={`h-[22px] w-20 rounded-[var(--radius-sm)] ${PULSE}`} />
              <Skeleton className={`h-3.5 w-28 ${PULSE}`} />
            </div>
            {/* Followers · ER · from rate (text-xs, mt-2) */}
            <Skeleton className={`mt-2.5 mb-0.5 h-3 w-48 max-w-full ${PULSE}`} />
          </div>
        </div>
        {/* Shortlist / Decline / Accept (Button size sm, h-8) */}
        <div className="flex min-w-0 flex-wrap gap-2">
          <Skeleton className={`h-8 w-20 ${PULSE}`} />
          <Skeleton className={`h-8 w-16 ${PULSE}`} />
          <Skeleton className={`h-8 w-16 ${PULSE}`} />
        </div>
      </div>
      {/* Counter amount input + Counter button */}
      <div className="mt-4 grid min-w-0 gap-2 sm:flex sm:flex-wrap">
        <Skeleton
          className={`h-11 w-full max-w-[180px] rounded-[var(--radius-control)] sm:h-9 ${PULSE}`}
        />
        <Skeleton className={`h-8 w-20 ${PULSE}`} />
      </div>
    </div>
  );
}

export default function BriefDetailLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading brief…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: brand name, brief title, description + status badge */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-24 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-64 max-w-full ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-[32rem] max-w-full ${PULSE}`} />
            <Skeleton className={`mt-2 h-4 w-2/3 ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
          </div>
        </div>

        {/* "← Briefs" back link */}
        <Skeleton className={`my-[3px] h-3.5 w-16 ${PULSE}`} />

        {/* Summary panel: rate, channels, distribution pills + primary action */}
        <div className={PANEL}>
          <div className="flex flex-wrap gap-3">
            <Skeleton className={`h-8 w-28 rounded-[var(--radius-md)] ${PULSE}`} />
            <Skeleton className={`h-8 w-36 rounded-[var(--radius-md)] ${PULSE}`} />
            <Skeleton className={`h-8 w-24 rounded-[var(--radius-md)] ${PULSE}`} />
          </div>
          <Skeleton className={`mt-6 h-10 w-32 ${PULSE}`} />
        </div>

        {/* Invite creators panel */}
        <div className={PANEL}>
          <div className="mb-4">
            <Skeleton className={`my-[3px] h-4 w-32 ${PULSE}`} />
            <Skeleton className={`mt-[7px] mb-[3px] h-3.5 w-80 max-w-full ${PULSE}`} />
          </div>
          <div className="grid gap-3">
            <FieldPlaceholder labelWidth="w-14" />
            <FieldPlaceholder labelWidth="w-16" control="textarea" />
            <Skeleton className={`h-10 w-36 ${PULSE}`} />
          </div>
        </div>

        {/* Applicants pipeline */}
        <div>
          <Skeleton className={`my-[3px] h-4 w-40 ${PULSE}`} />
          <div className="mt-4 grid gap-4">
            <ApplicantPlaceholder />
            <ApplicantPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
