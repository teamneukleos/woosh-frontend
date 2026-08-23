import { cn } from "@/lib/cn";

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol className={cn("-mx-1 flex gap-2 overflow-x-auto pb-1", className)}>
      {steps.map((step, index) => {
        const active = index === current;
        const done = index < current;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium",
              active && "bg-[var(--woosh-navy)] text-white",
              done && "bg-[var(--surface-sunken)] text-[var(--text-strong)]",
              !active &&
                !done &&
                "bg-[var(--woosh-mist)] text-[var(--text-muted)]",
            )}
          >
            <span
              className={cn(
                "inline-flex size-4 items-center justify-center rounded-[3px] text-[10px]",
                active ? "bg-white/15" : "bg-black/8",
              )}
            >
              {index + 1}
            </span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}
