import Image from "next/image";
import Link from "next/link";
import { marketingPhotos } from "@/components/marketing/cast";

const audiences = [
  {
    title: "Creators",
    href: "/register?type=creator",
    cta: "Join as a creator",
    copy: "Get discovered for what you create. Build your profile, showcase your work, find briefs that fit and build your reputation.",
    image: marketingPhotos.whoCreators,
    alt: "Creator on a video call between campaign shoots",
    position: "object-[center_20%]",
  },
  {
    title: "Brands",
    href: "/register?type=brand",
    cta: "Post a brief",
    copy: "Find the creators your campaign needs. Search, shortlist, brief and manage campaigns without the usual back and forth.",
    image: marketingPhotos.whoBrands,
    alt: "Night-time city billboard for a Nigeria brand campaign",
    position: "object-center",
  },
  {
    title: "Agencies",
    href: "/register?type=agency",
    cta: "Run campaigns",
    copy: "Find, manage and pay creators without the usual chaos. Keep your campaigns moving while staying on top of creators, deliverables and payments.",
    image: marketingPhotos.whoAgencies,
    alt: "Agency team reviewing creator campaign work together",
    position: "object-[center_40%]",
  },
];

export function BrandWho() {
  return (
    <section id="who" className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{Built for everyone}"}</p>
        <h2 className="font-display mt-4 max-w-lg text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          Built for everyone in the creator economy.
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {audiences.map((a) => (
            <article
              key={a.title}
              className="mkt-lift flex flex-col overflow-hidden rounded-[1.1rem] bg-mkt-inset"
            >
              <Image
                src={a.image}
                alt={a.alt}
                width={1200}
                height={675}
                quality={95}
                sizes="(min-width: 1024px) 33vw, 100vw"
                className={`h-56 w-full object-cover md:h-64 ${a.position}`}
              />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[1.0625rem] font-medium text-mkt-fg">
                  {a.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-mkt-subtle">{a.copy}</p>
                <Link href={a.href} className="mkt-accent mt-4 text-sm font-medium hover:underline">
                  {a.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
