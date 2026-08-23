import { flattenTerms } from "@/lib/format-record";

export function TermDetails({
  value,
  fallback,
}: {
  value: unknown;
  fallback: string;
}) {
  const items = flattenTerms(value);
  if (!items.length) {
    return (
      <p className="text-sm leading-6 text-[var(--text-secondary)]">{fallback}</p>
    );
  }
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={`${item.label}:${item.value}`}
          className="rounded-[var(--radius-control)] bg-[var(--surface-sunken)] px-4 py-3"
        >
          <dt className="woosh-eyebrow">{item.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium leading-6 text-[var(--woosh-navy)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
