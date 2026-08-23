import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/brand";
import { marketingPhotos } from "@/components/marketing/cast";
import { SocialIcon, SocialLogoRow } from "@/components/ui/social-icon";

const floats = [
  {
    title: "Palm Cola brief",
    meta: "Funded in NGN",
    value: "₦150k",
    channel: "TIKTOK",
    place: "bottom-5 left-4 sm:bottom-8 sm:left-8",
    delay: "0s",
  },
  {
    title: "Paystack payout",
    meta: "Released to creator",
    value: "₦162k",
    channel: "YOUTUBE",
    place: "right-4 top-6 max-sm:hidden sm:right-8 sm:top-8",
    delay: "-2.2s",
  },
] as const;

function FloatCard({
  title,
  meta,
  value,
  channel,
  className,
  delay,
}: {
  title: string;
  meta: string;
  value: string;
  channel: string;
  className: string;
  delay: string;
}) {
  return (
    <div
      className={`mkt-float mkt-lift absolute z-10 flex w-[min(16.5rem,calc(100%-1.5rem))] items-center gap-3 rounded-2xl bg-[#0b0d14]/92 px-3.5 py-3 backdrop-blur-md ${className}`}
      style={{ animationDelay: delay }}
    >
      <SocialIcon channel={channel} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="truncate text-xs text-white/45">{meta}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export function BrandHero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-mkt-bg pt-[calc(5.5rem+env(safe-area-inset-top))] text-mkt-fg"
    >
      <div aria-hidden className="mkt-pattern absolute inset-0 -z-10 opacity-80" />
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:px-8 md:pb-20 md:pt-10">
        <p className="mkt-rise text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[#0de3af]">
          {brand.promise}
        </p>
        <div className="mkt-rise mt-4 grid items-end gap-8 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
          <h1 className="font-display max-w-[11ch] text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.02] tracking-[-0.035em]">
            Culture doesn&apos;t{" "}
            <span className="text-[#0de3af]">wait.</span>
          </h1>
          <div>
            <p className="max-w-md text-[0.9375rem] leading-7 text-mkt-muted md:text-base">
              Nigeria runs on the feed. Woosh is the marketplace that keeps up:
              claimed Instagram, TikTok and YouTube — not typed bios. Put Naira
              on the brief. One thread. Paystack. Zero platform fee.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/register" className="mkt-cta mkt-cta-primary">
                Sign up
              </Link>
              <Link href="/#how" className="mkt-cta mkt-cta-ghost">
                See the loop
              </Link>
            </div>
            <SocialLogoRow className="mt-8 gap-2.5 opacity-95" />
          </div>
        </div>

        <div className="mkt-rise relative mt-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem] sm:aspect-[2/1] md:h-[28rem] md:aspect-auto lg:h-[30rem]">
            <Image
              src={marketingPhotos.hero}
              alt="Two creators in a Nigerian city with a skateboard, standing in for campaign talent"
              fill
              priority
              quality={95}
              unoptimized
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
              style={{ objectFit: "cover", objectPosition: "center 28%" }}
            />
          </div>
          {floats.map((card) => (
            <FloatCard
              key={card.meta}
              title={card.title}
              meta={card.meta}
              value={card.value}
              channel={card.channel}
              className={card.place}
              delay={card.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
