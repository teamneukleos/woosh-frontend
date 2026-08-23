import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/cn";

export function Deadline({
  value,
  className,
  overdue = false,
}: {
  value?: Date | null;
  className?: string;
  overdue?: boolean;
}) {
  if (!value) return <span className={cn("text-sm text-[var(--woosh-dull)]/60", className)}>No deadline</span>;
  return (
    <time
      dateTime={value.toISOString()}
      className={cn(
        "text-sm font-medium",
        overdue ? "text-[var(--danger)]" : "text-[var(--woosh-dull)]/75",
        className,
      )}
    >
      {overdue ? "Overdue · " : "Due "}
      {value.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </time>
  );
}

export function WorkStatus({
  status,
  dueAt,
  overdue,
}: {
  status: string;
  dueAt?: Date | null;
  overdue?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status={status} />
      <Deadline value={dueAt} overdue={overdue} />
    </div>
  );
}
