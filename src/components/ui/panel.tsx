import { cn } from "@/lib/cn";
import { Inbox } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="woosh-eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 break-words text-[1.375rem] font-medium leading-tight tracking-[-0.02em] text-[var(--text-strong)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-xl break-words text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function Panel({
  children,
  className,
  title,
  description,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  variant?: "default" | "muted" | "flush" | "brand";
}) {
  const variants = {
    default: "border-[var(--woosh-border)] bg-white p-4",
    muted: "border-[var(--woosh-border)] bg-[var(--surface-sunken)] p-4",
    flush: "overflow-hidden border-[var(--woosh-border)] bg-white",
    brand:
      "border-transparent bg-[var(--woosh-navy)] p-5 text-white sm:p-5",
  };

  return (
    <section
      className={cn(
        "rounded-[var(--radius-surface)] border transition-colors duration-200",
        variants[variant],
        className,
      )}
    >
      {title ? (
        <div className="mb-4">
          <h2
            className={cn(
              "text-[0.9375rem] font-semibold tracking-[-0.015em]",
              variant === "brand"
                ? "text-white"
                : "text-[var(--woosh-navy)]",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mt-1 text-sm",
                variant === "brand"
                  ? "text-white/65"
                  : "text-[var(--text-secondary)]",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white px-6 py-12 text-center">
      <span className="mx-auto mb-4 grid size-10 place-items-center rounded-[var(--radius-md)] bg-[var(--surface-sunken)] text-[var(--text-muted)]">
        <Inbox aria-hidden="true" className="size-5" strokeWidth={1.7} />
      </span>
      <p className="font-semibold tracking-[-0.01em] text-[var(--text-strong)]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
