"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export type ThreadListItem = {
  id: string;
  title: string;
  counterpart: string;
  kindLabel: string;
  preview: string;
  when: string;
  unread: boolean;
};

export function ThreadList({
  items,
  activeId,
}: {
  items: ThreadListItem[];
  activeId?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.title} ${item.counterpart} ${item.preview}`
        .toLowerCase()
        .includes(needle),
    );
  }, [items, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[var(--woosh-border)] p-3">
        <label className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <span className="sr-only">Search conversations</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search threads"
            className="h-10 w-full rounded-[var(--radius-control)] border border-[var(--woosh-border)] bg-[var(--surface-sunken)] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--woosh-blue)] focus:bg-white focus:shadow-[var(--shadow-focus)]"
          />
        </label>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {filtered.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <Link
                href={`/app/messages?c=${item.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex gap-3 rounded-[var(--radius-md)] px-2.5 py-2.5 transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
                  active
                    ? "bg-[var(--accent-soft)]"
                    : "hover:bg-[var(--surface-sunken)]",
                )}
              >
                <span className="relative mt-0.5 shrink-0">
                  <Avatar name={item.counterpart} size="sm" />
                  {item.unread ? (
                    <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--woosh-blue)] ring-2 ring-white" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm text-[var(--text-strong)]",
                        item.unread ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.title}
                    </span>
                    <time className="shrink-0 text-[0.6875rem] text-[var(--text-muted)]">
                      {item.when}
                    </time>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <Badge tone="muted" className="shrink-0 px-1.5 py-0">
                      {item.kindLabel}
                    </Badge>
                    <span className="truncate text-xs text-[var(--text-muted)]">
                      {item.preview}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        {!filtered.length ? (
          <li className="px-3 py-8 text-center text-sm text-[var(--text-muted)]">
            {items.length ? "No matching threads." : "No threads yet."}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
