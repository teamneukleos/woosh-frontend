import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/panel";

/** Standard app page scaffold: header + optional toolbar + body. */
export function AppPage({
  eyebrow,
  title,
  description,
  actions,
  toolbar,
  children,
  className,
  width = "default",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide";
}) {
  const widths = {
    narrow: "mx-auto w-full max-w-3xl",
    default: "w-full",
    wide: "mx-auto w-full max-w-[90rem]",
  };

  return (
    <div className={cn("woosh-page-enter flex flex-col gap-6", widths[width], className)}>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />
      {toolbar ? <div>{toolbar}</div> : null}
      {children}
    </div>
  );
}

/** Search + filters row for list pages. */
export function DataToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-end gap-2.5 rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white p-3 [&>form]:min-w-0 [&>form]:w-full [&>*]:min-w-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
