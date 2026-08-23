"use client";

import { cn } from "@/lib/cn";

export function FileDropzone({
  label = "Drop a file or click to upload",
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--woosh-navy)]/25 bg-[var(--woosh-mist)]/40 px-4 py-8 text-center transition hover:border-[var(--woosh-blue)]/40 hover:bg-[var(--woosh-mist)]/70",
        className,
      )}
    >
      <span className="text-sm font-semibold text-[var(--woosh-navy)]">
        {label}
      </span>
      {hint ? (
        <span className="mt-1 text-xs text-[var(--woosh-dull)]/65">{hint}</span>
      ) : null}
      <input type="file" className="sr-only" {...props} />
    </label>
  );
}
