import { marketingCast } from "@/components/marketing/cast";

const quotes = [
  {
    quote:
      "I stopped chasing invoices in WhatsApp. The money showed up before I even said yes.",
    name: marketingCast.ada.name,
    role: "Creator · Lagos",
    src: marketingCast.ada.src,
  },
  {
    quote:
      "We shortlisted in a day. The follower count came from TikTok — not somebody’s notes app.",
    name: marketingCast.seyi.name,
    role: "Brand lead · Palm Cola",
    src: marketingCast.seyi.src,
  },
  {
    quote:
      "Switching two client brands without mixing wallets is the whole agency job. Woosh just… does it.",
    name: marketingCast.amaka.name,
    role: "Agency producer · Abuja",
    src: marketingCast.amaka.src,
  },
  {
    quote:
      "Draft, notes, revision, approved — all on the campaign. My group chat can rest.",
    name: marketingCast.kelechi.name,
    role: "Creator · Abuja",
    src: marketingCast.kelechi.src,
  },
  {
    quote:
      "Fund, accept, 72 hours, Paystack. I can finally tell finance what happened to the money.",
    name: marketingCast.tolu.name,
    role: "Finance · Lagos brand",
    src: marketingCast.tolu.src,
  },
  {
    quote:
      "They invited me off a prospect handle. I claimed, connected YouTube, and the brief was waiting.",
    name: marketingCast.tomiwa.name,
    role: "Creator · Ibadan",
    src: marketingCast.tomiwa.src,
  },
];

function Card({
  quote,
  name,
  role,
  src,
}: (typeof quotes)[number]) {
  return (
    <figure className="mkt-lift w-[min(22rem,80vw)] shrink-0 rounded-[1.25rem] bg-mkt-raised p-5 backdrop-blur-md">
      <p className="text-[0.9375rem] leading-6 text-mkt-fg">“{quote}”</p>
      <figcaption className="mt-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="size-10 rounded-full object-cover ring-2 ring-[#0de3af]/50"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-mkt-fg">{name}</p>
          <p className="truncate text-xs text-mkt-subtle">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

const stackA = quotes.slice(0, 3);
const stackB = quotes.slice(3);

function Row({
  items,
  reverse,
}: {
  items: (typeof quotes)[number][];
  reverse?: boolean;
}) {
  const loop = [...items, ...items];
  return (
    <div className="mkt-logo-mask mkt-marquee-mask overflow-hidden">
      <div
        className={
          reverse
            ? "mkt-marquee-reverse flex gap-4 pr-4"
            : "mkt-marquee flex gap-4 pr-4"
        }
      >
        {loop.map((item, i) => (
          <Card key={`${item.name}-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
}

export function BrandTestimonials() {
  return (
    <section id="love" className="overflow-hidden border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{The receipts}"}</p>
        <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          How it sounds when the work and the money stay in the same room.
        </h2>
      </div>
      <div className="mt-12 flex flex-col gap-4">
        <Row items={stackA} />
        <Row items={stackB} reverse />
      </div>
    </section>
  );
}
