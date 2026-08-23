"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export type FilterChip = {
  label: string;
  value: string;
  href?: string;
};

export function FilterChips({
  items,
  active,
  className,
  param = "filter",
}: {
  items: FilterChip[];
  active?: string;
  className?: string;
  /** Query param name when items use href-less mode via search params in parent */
  param?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-1",
        className,
      )}
      role="list"
      aria-label="Filters"
    >
      {items.map((item) => {
        const isActive = (active ?? "") === item.value;
        const classNames = cn(
          "inline-flex shrink-0 items-center rounded-[var(--radius-sm)] border px-2.5 py-1 text-[0.8125rem] font-medium transition",
          isActive
            ? "border-transparent bg-[var(--woosh-navy)] text-white"
            : "border-[var(--woosh-border)] bg-white text-[var(--woosh-navy)] hover:bg-[var(--surface-sunken)]",
        );
        if (item.href) {
          return (
            <Link
              key={item.value || "all"}
              href={item.href}
              className={classNames}
              role="listitem"
              aria-current={isActive ? "true" : undefined}
            >
              {item.label}
            </Link>
          );
        }
        return (
          <span
            key={item.value || "all"}
            className={classNames}
            role="listitem"
            data-param={param}
          >
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
