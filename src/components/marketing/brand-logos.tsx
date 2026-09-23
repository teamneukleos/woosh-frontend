const partners = [
  "Neukleos",
  "Image and Time",
  "Connect Marketing",
  "Haier Thermocool",
  "The Legend Hotel",
] as const;

function Row() {
  const loop = [...partners, ...partners, ...partners];
  return (
    <div className="mkt-logo-mask mkt-marquee-mask overflow-hidden">
      <ul
        className="mkt-marquee mkt-logo-track flex items-center gap-12 pr-12 md:gap-16 md:pr-16"
        aria-hidden
      >
        {loop.map((name, i) => (
          <li key={`${name}-${i}`} className="flex h-10 shrink-0 items-center">
            <span className="whitespace-nowrap text-sm font-semibold tracking-[-0.02em] text-mkt-muted md:text-base">
              {name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrandLogos() {
  return (
    <section
      aria-label="Brands and agencies we've worked with"
      className="border-t border-mkt-border bg-mkt-bg py-14 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{Partners}"}</p>
        <h2 className="font-display mt-3 max-w-xl text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.15] text-mkt-fg">
          Brands and agencies we&apos;ve worked with
        </h2>
      </div>
      <div className="mt-10">
        <Row />
      </div>
      <ul className="sr-only">
        {partners.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}
