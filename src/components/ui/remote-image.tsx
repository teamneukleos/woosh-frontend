"use client";

import type { ReactNode } from "react";
import { useImageFallback } from "@/components/ui/use-image-fallback";

/** An external image (e.g. an Instagram post thumbnail) that shows `fallback` if it fails. */
export function RemoteImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const { src: current, attach, onError } = useImageFallback([src]);
  if (!current) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={current}
      ref={attach}
      src={current}
      alt={alt}
      onError={onError}
      className={className}
    />
  );
}
