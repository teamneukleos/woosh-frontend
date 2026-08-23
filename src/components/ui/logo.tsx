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
  adaptive = false,
  size = "md",
}: {
  href?: string;
  className?: string;
  /** White wordmark for dark / navy surfaces */
  light?: boolean;
  /** Swap wordmark with html.light / html.dark — no hydration flash */
  adaptive?: boolean;
  size?: keyof typeof sizes;
}) {
  const dim = sizes[size];

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center", className)}
      aria-label="Woosh home"
    >
      {adaptive ? (
        <span className="relative inline-flex items-center" style={{ height: dim.height }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/woosh-wordmark-light.png"
            alt=""
            width={dim.width}
            height={dim.height}
            className="mkt-logo-on-dark w-auto"
            style={{ height: dim.height }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/woosh-wordmark-dark.png"
            alt=""
            width={dim.width}
            height={dim.height}
            className="mkt-logo-on-light w-auto"
            style={{ height: dim.height }}
          />
        </span>
      ) : (
        <Image
          src={
            light
              ? "/brand/woosh-wordmark-light.png"
              : "/brand/woosh-wordmark-dark.png"
          }
          alt="Woosh"
          width={dim.width}
          height={dim.height}
          className="w-auto"
          style={{ height: dim.height }}
          priority
        />
      )}
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
