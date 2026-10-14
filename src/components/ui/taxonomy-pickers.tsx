"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export function CategoryPicker({
  name = "categories",
  options,
  defaultSelected = [],
  className,
}: {
  name?: string;
  options: readonly string[];
  defaultSelected?: string[];
  className?: string;
}) {
  return (
    <fieldset className={cn("grid gap-2", className)}>
      <legend className="mb-1 text-sm font-medium text-[var(--woosh-navy)]">
        Categories
      </legend>
      <p className="text-xs text-[var(--woosh-dull)]/65">
        Select all that apply. Do not type free-form tags.
      </p>
      <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white px-2.5 py-2 text-sm text-[var(--woosh-navy)] hover:border-[var(--woosh-blue)]/35"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={defaultSelected.includes(option)}
              className="accent-[var(--woosh-blue)]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LanguagePicker({
  name = "languages",
  options,
  defaultSelected = [],
}: {
  name?: string;
  options: readonly string[];
  defaultSelected?: string[];
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium text-[var(--woosh-navy)]">
        Languages
      </legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white px-2.5 py-2 text-sm"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={defaultSelected.includes(option)}
              className="accent-[var(--woosh-blue)]"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TaxonomyDropdown({
  name,
  label,
  options,
  defaultSelected = [],
  placeholder = "Select…",
}: {
  name: string;
  label: string;
  options: readonly string[];
  defaultSelected?: string[];
  placeholder?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(() =>
    defaultSelected.filter((value) => options.includes(value)),
  );

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(option: string) {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  return (
    <div ref={rootRef} className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--text-secondary)]">
        {label}
      </span>
      {selected.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
      <div className="relative">
        <button
          type="button"
          className="flex h-11 min-w-0 w-full items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--woosh-border)] bg-white px-3 text-left text-base outline-none transition duration-150 hover:border-[rgb(20_20_18_/_0.22)] focus-visible:border-[var(--woosh-blue)] focus-visible:shadow-[var(--shadow-focus)] sm:h-9 sm:text-[0.875rem]"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={cn(
              "min-w-0 truncate",
              selected.length
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-muted)]",
            )}
          >
            {summary}
          </span>
          <Icon
            icon={ChevronDown}
            className={cn(
              "size-4 text-[var(--text-secondary)] transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--woosh-border)] bg-white p-1 shadow-[var(--shadow-raised)]"
          >
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <li key={option} role="option" aria-selected={checked}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-[calc(var(--radius-md)-4px)] px-2.5 py-2 text-sm text-[var(--text-strong)] hover:bg-black/[0.045]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option)}
                      className="accent-[var(--woosh-blue)]"
                    />
                    <span>{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
