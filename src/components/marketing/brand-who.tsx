import Image from "next/image";
import Link from "next/link";
import { marketingPhotos } from "@/components/marketing/cast";

const audiences = [
  {
    title: "Brands",
    href: "/for-brands",
    copy: "Publish the brief yourself. Shortlist people whose reach is live — not a retainer, not a typed follower count.",
    image: marketingPhotos.whoBrands,
    alt: "Night-time city billboard for a Nigeria brand campaign",
    position: "object-center",
  },
  {
    title: "Agencies",
    href: "/for-agencies",
    copy: "Every client. Their own wallet. Switch context, duplicate the brief, never mix the money.",
    image: marketingPhotos.whoAgencies,
    alt: "Agency team reviewing creator campaign work together",
    position: "object-[center_40%]",
  },
  {
    title: "Creators",
    href: "/for-creators",
    copy: "Claim the handle. Connect the apps. Set your packages. Get paid — we take 0%.",
    image: marketingPhotos.whoCreators,
    alt: "Creator on a video call between campaign shoots",
    position: "object-[center_20%]",
  },
];

export function BrandWho() {
  return (
    <section id="who" className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{Who it’s for}"}</p>
        <h2 className="font-display mt-4 max-w-lg text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          One loop. Three seats. Same money.
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
                  <Link href={a.href} className="hover:text-[#0de3af]">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-6 text-mkt-subtle">{a.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
