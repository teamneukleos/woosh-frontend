"use client";

import { useTransition } from "react";
import { switchBrandAction } from "@/app/actions";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";

export function BrandSwitcher({
  brands,
  activeBrandId,
  className,
}: {
  brands: { id: string; name: string }[];
  activeBrandId?: string | null;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form action={switchBrandAction} className="flex items-center gap-2">
      <label className="sr-only" htmlFor="brandId">
        Active brand
      </label>
      <Select
        id="brandId"
        name="brandId"
        defaultValue={activeBrandId ?? ""}
        disabled={pending}
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (form) startTransition(() => form.requestSubmit());
        }}
        className={cn(
          "h-9 w-full min-w-0 rounded-lg border-transparent bg-transparent py-1.5 pl-2.5 pr-8 text-sm font-medium shadow-none",
          className ?? "text-[var(--text-strong)]",
        )}
      >
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Select>
    </form>
  );
}
