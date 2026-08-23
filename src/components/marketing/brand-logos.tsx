const brands = [
  { name: "Coca-Cola", src: "/marketing/brands/cocacola.svg" },
  { name: "Kellogg’s", src: "/marketing/brands/kelloggs.svg" },
  { name: "Unilever", src: "/marketing/brands/unilever.svg" },
  { name: "Pepsi", src: "/marketing/brands/pepsi.svg" },
  { name: "Nike", src: "/marketing/brands/nike.svg" },
  { name: "Adidas", src: "/marketing/brands/adidas.svg" },
  { name: "Netflix", src: "/marketing/brands/netflix.svg" },
  { name: "Spotify", src: "/marketing/brands/spotify.svg" },
  { name: "Samsung", src: "/marketing/brands/samsung.svg" },
  { name: "Heineken", src: "/marketing/brands/heineken.svg" },
  { name: "Red Bull", src: "/marketing/brands/redbull.svg" },
  { name: "MTN", src: "/marketing/brands/mtn.svg" },
  { name: "GTBank", src: "/marketing/brands/gtbank.svg" },
] as const;

function Row() {
  const loop = [...brands, ...brands];
  return (
    <div className="mkt-logo-mask mkt-marquee-mask overflow-hidden">
      <ul
        className="mkt-marquee mkt-logo-track flex items-center gap-12 pr-12 md:gap-16 md:pr-16"
        aria-hidden
      >
        {loop.map((brand, i) => (
          <li key={`${brand.name}-${i}`} className="flex h-10 shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.src}
              alt=""
              className="h-8 w-auto max-w-[8.5rem] object-contain opacity-55 grayscale brightness-0 invert transition duration-300 hover:opacity-100"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BrandLogos() {
  return (
    <section
      aria-label="Brand marks"
      className="border-t border-white/10 bg-black py-14 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{The category}"}</p>
        <h2 className="font-display mt-3 max-w-xl text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.15] text-white">
          The names the feed already knows
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/45">
          Category marks at the scale this product is built for — not a list of
          Woosh customers. The work is Nigerian. The ambition is not small.
        </p>
      </div>
      <div className="mt-10">
        <Row />
      </div>
      <ul className="sr-only">
        {brands.map((brand) => (
          <li key={brand.name}>{brand.name}</li>
        ))}
      </ul>
    </section>
  );
}
