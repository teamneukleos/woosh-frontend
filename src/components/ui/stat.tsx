import { cn } from "@/lib/cn";

export function Stat({
  label,
  value,
  hint,
  className,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
  tone?: "default" | "accent" | "brand";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-surface)] border p-4",
        tone === "default" && "border-[var(--woosh-border)] bg-white",
        tone === "accent" &&
          "border-[var(--woosh-blue)]/12 bg-[var(--accent-soft)]",
        tone === "brand" && "border-transparent bg-[var(--woosh-navy)] text-white",
        className,
      )}
    >
      <p
        className={cn(
          "text-[0.75rem] font-semibold tracking-[-0.005em]",
          tone === "brand" ? "text-white/55" : "text-[var(--text-muted)]",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-semibold tracking-[-0.03em]",
          tone === "brand" ? "text-white" : "text-[var(--text-strong)]",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "brand" ? "text-white/60" : "text-[var(--text-secondary)]",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
