"use client";

import { cn } from "@/lib/cn";
import { avatarSources, initials } from "@/lib/image-fallback";
import { useImageFallback } from "@/components/ui/use-image-fallback";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

/**
 * Creator/user avatar. Falls back from the stored photo (which may be a missing or expired
 * Instagram link) to a generated cartoon avatar, and to initials if neither loads.
 */
export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { src: current, attach, onError } = useImageFallback(avatarSources(name, src));
  const shape = cn(
    "rounded-full object-cover object-center ring-2 ring-white",
    sizes[size],
    className,
  );

  if (!current) {
    return (
      <span
        role="img"
        aria-label={name}
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-[var(--woosh-mist)] font-semibold text-[var(--woosh-navy)]",
          shape,
        )}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={current}
      ref={attach}
      src={current}
      alt={name}
      onError={onError}
      className={shape}
    />
  );
}
