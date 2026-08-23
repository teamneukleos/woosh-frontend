"use client";

import { cn } from "@/lib/cn";

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
