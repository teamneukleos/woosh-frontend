import Image from "next/image";
import {
  BriefPipelineMock,
  ProductFrame,
  StorefrontMock,
} from "@/components/marketing/product-frame";
import { marketingPhotos } from "@/components/marketing/cast";

function Scene({
  kicker,
  title,
  copy,
  image,
  alt,
  objectPosition,
  frameTitle,
  mock,
  reverse,
  priority,
}: {
  kicker: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
  objectPosition: string;
  frameTitle: string;
  mock: React.ReactNode;
  reverse?: boolean;
  priority?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem]">
      <div className="relative min-h-[28rem] md:min-h-[36rem]">
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          quality={100}
          unoptimized
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="mkt-os-live object-cover"
          style={{ objectFit: "cover", objectPosition }}
        />
        <div
          className={`absolute inset-0 ${
            reverse
              ? "bg-gradient-to-l from-black/75 via-black/35 to-black/10 md:from-black/70 md:via-black/25 md:to-transparent"
              : "bg-gradient-to-r from-black/75 via-black/35 to-black/10 md:from-black/70 md:via-black/25 md:to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

        <div
          className={`relative flex min-h-[28rem] flex-col justify-between gap-10 p-6 md:min-h-[36rem] md:p-10 ${
            reverse ? "md:items-end md:text-right" : ""
          }`}
        >
          <div className={reverse ? "md:max-w-md md:self-end" : "max-w-md"}>
            <p className="mkt-kicker">{kicker}</p>
            <h3 className="font-display mt-3 text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.15] text-white">
              {title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-white/70">{copy}</p>
          </div>
          <div className={`w-full max-w-md ${reverse ? "md:self-start" : "md:self-end"}`}>
            <div className="mkt-float">
              <ProductFrame title={frameTitle} className="mkt-lift">
                {mock}
              </ProductFrame>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandOs() {
  return (
    <section className="border-t border-mkt-border bg-mkt-bg py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="mkt-kicker">{"{Marketplace + workspace}"}</p>
        <h2 className="font-display mt-4 max-w-2xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
          A face the street already knows. A brief with money behind it.
        </h2>
        <p className="mt-5 max-w-lg text-sm leading-6 text-mkt-subtle">
          The storefront a brand opens at 11pm. The brief a creator can actually
          finish. Same product. Two surfaces. No theatre.
        </p>

        <div className="mt-12 grid gap-6">
          <Scene
            kicker="{01 / Storefront}"
            title="The profile they open first"
            copy="Connected channels. Packages. Work you actually delivered. Metrics from the app — not a number somebody typed. No public scoreboard."
            image={marketingPhotos.osCreator}
            alt="Creator styled for a claimed Woosh storefront"
            objectPosition="center 18%"
            frameTitle="woosh.app / storefront"
            mock={<StorefrontMock />}
            priority
          />
          <Scene
            kicker="{02 / Briefs}"
            title="A yes that already has money"
            copy="Open, invite-only or hybrid. Accept locks the rate from a funded wallet. If finance cannot see it, it is not a yes."
            image={marketingPhotos.whoAgencies}
            alt="Team reviewing a funded creator campaign together"
            objectPosition="center 40%"
            frameTitle="woosh.app / briefs"
            mock={<BriefPipelineMock />}
            reverse
          />
        </div>
      </div>
    </section>
  );
}
