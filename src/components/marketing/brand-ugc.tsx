const clips = [
  {
    brand: "Coca-Cola",
    logo: "/marketing/brands/cocacola.svg",
    kind: "Voiceover",
    id: "7655027964823817492",
    handle: "chikethecreator_",
    city: "Lagos",
    gif: "/marketing/ugc/01.gif",
  },
  {
    brand: "Kellogg’s",
    logo: "/marketing/brands/kelloggs.svg",
    kind: "Unboxing",
    id: "7636483102990224660",
    handle: "chikethecreator_",
    city: "Lagos",
    gif: "/marketing/ugc/02.gif",
  },
  {
    brand: "Nike",
    logo: "/marketing/brands/nike.svg",
    kind: "Meta ad",
    id: "7606666611654659335",
    handle: "taaooma",
    city: "Nigeria",
    gif: "/marketing/ugc/03.gif",
  },
  {
    brand: "Pepsi",
    logo: "/marketing/brands/pepsi.svg",
    kind: "Testimonial",
    id: "7618652913115712789",
    handle: "seeelagos1",
    city: "Lagos",
    gif: "/marketing/ugc/04.gif",
  },
  {
    brand: "MTN",
    logo: "/marketing/brands/mtn.svg",
    kind: "Story",
    id: "7634315493175758100",
    handle: "seeelagos1",
    city: "Lagos",
    gif: "/marketing/ugc/05.gif",
  },
  {
    brand: "Heineken",
    logo: "/marketing/brands/heineken.svg",
    kind: "UGC",
    id: "7449420697010507014",
    handle: "seeelagos1",
    city: "Lekki",
    gif: "/marketing/ugc/06.gif",
  },
  {
    brand: "Spotify",
    logo: "/marketing/brands/spotify.svg",
    kind: "Voiceover",
    id: "7652859583915920661",
    handle: "seeelagos1",
    city: "Lagos",
    gif: "/marketing/ugc/07.gif",
  },
  {
    brand: "Samsung",
    logo: "/marketing/brands/samsung.svg",
    kind: "Unboxing",
    id: "7606411286628289813",
    handle: "therealnasboi",
    city: "Nigeria",
    gif: "/marketing/ugc/08.gif",
  },
] as const;

function Flag() {
  return (
    <svg viewBox="0 0 9 6" className="h-2.5 w-[0.95rem] shrink-0 rounded-sm" aria-hidden>
      <rect width="9" height="6" fill="#008751" />
      <rect x="3" width="3" height="6" fill="#fff" />
    </svg>
  );
}

function Clip({
  clip,
  offset,
}: {
  clip: (typeof clips)[number];
  offset: number;
}) {
  const href = `https://www.tiktok.com/@${clip.handle}/video/${clip.id}`;

  return (
    <article className="w-[15.5rem] shrink-0 sm:w-[16.25rem]">
      <div className="overflow-hidden rounded-[1.25rem] bg-[#14161f] shadow-[0_6px_16px_rgb(0_0_0_/_0.22)]">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block aspect-[9/16] overflow-hidden bg-black"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clip.gif}
            alt={`${clip.kind} style UGC clip from ${clip.city}`}
            width={270}
            height={480}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

          <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full bg-white/95 px-2 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={clip.logo} alt="" className="size-4 object-contain" />
            <span className="truncate text-[0.68rem] font-semibold text-black">
              {clip.brand}
            </span>
          </div>

          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white px-2 py-0.5 text-[0.6rem] font-medium text-black">
            {clip.kind}
          </span>
          <span className="mkt-ugc-bar absolute inset-x-3 bottom-[0.35rem] h-0.5 overflow-hidden rounded-full bg-white/25">
            <span
              className="mkt-ugc-bar-fill block h-full bg-white"
              style={{ animationDelay: `${offset * -0.8}s` }}
            />
          </span>
        </a>

        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-[0.8rem] font-medium text-white hover:underline"
            >
              @{clip.handle}
            </a>
            <p className="flex items-center gap-1 text-[0.62rem] text-white/45">
              <svg viewBox="0 0 16 16" className="size-3 shrink-0" aria-hidden>
                <path
                  fill="currentColor"
                  d="M8 1.5a4.4 4.4 0 0 0-4.4 4.4c0 3.2 4.4 8.1 4.4 8.1s4.4-4.9 4.4-8.1A4.4 4.4 0 0 0 8 1.5Zm0 6A1.6 1.6 0 1 1 8 4.3 1.6 1.6 0 0 1 8 7.5Z"
                />
              </svg>
              {clip.city} · TikTok Nigeria
            </p>
          </div>
          <Flag />
        </div>
      </div>
    </article>
  );
}

export function BrandUgc() {
  const loop = [...clips, ...clips];
  return (
    <section className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{The feed}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          The culture is already moving.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-mkt-subtle">
          Nigeria&apos;s creators are shaping conversations across TikTok,
          Instagram, Facebook and YouTube. From food and fashion to tech,
          finance, events and travel, there is a creator for almost every corner
          of culture. We&apos;re making it easier to connect with them.
        </p>

        <div className="mkt-ugc-mask mkt-marquee-mask mt-12 overflow-hidden">
          <div className="mkt-marquee mkt-ugc-track flex items-stretch gap-4 pr-4">
            {loop.map((clip, i) => (
              <Clip key={`${clip.gif}-${i}`} clip={clip} offset={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
