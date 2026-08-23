import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

const sizes = {
  sm: { width: 88, height: 24 },
  md: { width: 120, height: 33 },
  lg: { width: 168, height: 46 },
} as const;

export function Logo({
  href = "/",
  className,
  light = false,
  size = "md",
}: {
  href?: string;
  className?: string;
  /** White wordmark for dark / navy surfaces */
  light?: boolean;
  size?: keyof typeof sizes;
}) {
  const dim = sizes[size];
  const src = light
    ? "/brand/woosh-wordmark-light.png"
    : "/brand/woosh-wordmark-dark.png";

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center", className)}
      aria-label="Woosh home"
    >
      <Image
        src={src}
        alt="Woosh"
        width={dim.width}
        height={dim.height}
        className="w-auto"
        style={{ height: dim.height }}
        priority
      />
    </Link>
  );
}

export function WooshMark({
  light = false,
  className,
  size = 28,
}: {
  light?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src={light ? "/brand/woosh-w-light.png" : "/brand/woosh-w-dark.png"}
      alt=""
      width={size}
      height={size}
      className={cn("h-auto w-auto", className)}
      aria-hidden
    />
  );
}
