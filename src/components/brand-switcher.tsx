"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Active brand"
      name="brandId"
      key={activeBrandId ?? "none"}
      defaultValue={activeBrandId ?? ""}
      disabled={pending || brands.length < 2}
      onChange={(event) => {
        const brandId = event.currentTarget.value;
        if (!brandId || brandId === activeBrandId) return;
        const formData = new FormData();
        formData.set("brandId", brandId);
        startTransition(async () => {
          await switchBrandAction(formData);
          router.refresh();
        });
      }}
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border-white/15 bg-white/10 py-1.5 pl-2.5 pr-8 text-sm font-medium shadow-none",
        className ?? "text-[var(--text-strong)]",
      )}
    >
      {brands.map((brand) => (
        <option key={brand.id} value={brand.id} className="text-[var(--text-strong)]">
          {brand.name}
        </option>
      ))}
    </Select>
  );
}
