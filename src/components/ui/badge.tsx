import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "blue" | "teal" | "navy" | "muted" | "warn" | "danger";
  className?: string;
};

const tones = {
  blue: "border-[var(--woosh-blue)]/10 bg-[var(--accent-soft)] text-[var(--woosh-blue)]",
  teal: "border-[var(--success)]/10 bg-[var(--success-soft)] text-[var(--success)]",
  navy: "border-black/[0.06] bg-black/[0.055] text-[var(--text-strong)]",
  muted: "border-black/[0.05] bg-[var(--surface-sunken)] text-[var(--text-secondary)]",
  warn: "border-[var(--warning)]/10 bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "border-[var(--danger)]/10 bg-[var(--danger-soft)] text-[var(--danger)]",
};

export function Badge({ children, tone = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.01em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
