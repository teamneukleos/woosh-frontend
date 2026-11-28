import { Skeleton } from "@/components/ui/skeleton";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

/**
 * Loading state for the briefs list (/app/briefs) only. The (list) route group keeps
 * this boundary off /app/briefs/new and /app/briefs/[id], which still use
 * app/app/loading.tsx. Reuses the shared Table shell so borders, header tint, padding
 * and row dividers match the loaded page.
 *
 * The workspace is not known here, so the table uses the brand layout (Title, Status,
 * Applications, Open); platform operations see an extra Brand column once loaded.
 */
const PULSE = "motion-reduce:animate-none";

// Varied title widths so the rows read as real content.
const TITLE_WIDTHS = ["w-48", "w-36", "w-56", "w-40", "w-44", "w-32"];

export default function BriefsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full flex-col gap-6"
    >
      <span className="sr-only">Loading briefs…</span>
      <div aria-hidden="true" className="flex w-full flex-col gap-6">
        {/* Page header: eyebrow, title, description + "New brief" action */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <Skeleton className={`my-0.5 h-3 w-14 ${PULSE}`} />
            <Skeleton className={`mt-1.5 h-6 w-24 ${PULSE}`} />
            <Skeleton className={`mt-2.5 h-4 w-72 max-w-full ${PULSE}`} />
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
            <Skeleton className={`h-10 w-28 ${PULSE}`} />
          </div>
        </div>

        {/* Briefs table */}
        <Table>
          <THead>
            <TR>
              {/* Title, Status, Applications, (Open) — 11px header labels */}
              <TH>
                <Skeleton className={`my-[2px] h-2.5 w-10 ${PULSE}`} />
              </TH>
              <TH>
                <Skeleton className={`my-[2px] h-2.5 w-12 ${PULSE}`} />
              </TH>
              <TH>
                <Skeleton className={`my-[2px] h-2.5 w-20 ${PULSE}`} />
              </TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {TITLE_WIDTHS.map((width, index) => (
              <TR key={index}>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 ${width} max-w-full ${PULSE}`} />
                </TD>
                <TD>
                  {/* Status badge (~22px) */}
                  <Skeleton className={`h-[22px] w-16 rounded-[var(--radius-sm)] ${PULSE}`} />
                </TD>
                <TD>
                  <Skeleton className={`my-[3px] h-3.5 w-6 ${PULSE}`} />
                </TD>
                <TD>
                  {/* "Open" link */}
                  <Skeleton className={`my-[3px] h-3.5 w-10 ${PULSE}`} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
