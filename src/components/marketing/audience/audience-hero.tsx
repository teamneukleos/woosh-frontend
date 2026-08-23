import Link from "next/link";
import { cn } from "@/lib/cn";

export function AudienceHero({
  kicker,
  title,
  lede,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  layout = "split",
  children,
}: {
  kicker: string;
  title: string;
  lede: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  layout?: "split" | "stacked" | "workspace";
  children?: React.ReactNode;
}) {
  const copy = (
    <div className="min-w-0">
      <p className="mkt-kicker">{kicker}</p>
      <h1 className="font-display mt-4 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.03em] text-white">
        {title}
      </h1>
      <p className="mt-5 max-w-xl text-[0.9375rem] leading-7 text-white/58 md:text-base">
        {lede}
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link href={primaryHref} className="mkt-cta mkt-cta-primary">
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="mkt-cta mkt-cta-ghost">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );

  const inner =
    layout === "stacked" ? (
      <header className="mx-auto max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
        {copy}
        {children ? <div className="mt-12">{children}</div> : null}
      </header>
    ) : (
      <header
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10 lg:grid-cols-2 lg:gap-14",
          layout === "workspace" && "lg:items-stretch",
        )}
      >
        {copy}
        {children ? <div className="min-w-0">{children}</div> : null}
      </header>
    );

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div aria-hidden className="mkt-pattern absolute inset-0 -z-10 opacity-80" />
      {inner}
    </section>
  );
}
