import Link from "next/link";

export function AudienceClose({
  title,
  lede,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  lede: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-t border-mkt-border bg-mkt-panel py-16 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="max-w-xl">
          <h2 className="font-display text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-mkt-muted">{lede}</p>
        </div>
        <div className="flex flex-wrap gap-3">
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
    </section>
  );
}
