import Image from "next/image";
import Link from "next/link";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { AudienceHero } from "@/components/marketing/audience/audience-hero";
import { AudienceFaq } from "@/components/marketing/audience/audience-faq";
import { AudienceClose } from "@/components/marketing/audience/audience-close";
import { marketingPhotos } from "@/components/marketing/cast";
import {
  DiscoveryMock,
  ProductFrame,
  ThreadMock,
} from "@/components/marketing/product-frame";
import { JsonLd } from "@/components/seo/json-ld";
import { brandAudienceFaqs } from "@/lib/audience-faq";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchemaFrom } from "@/lib/seo-schema";

export const metadata = pageMetadata({
  title: "Run campaigns without the group chat",
  description:
    "Claimed Instagram, TikTok and YouTube. Put Naira on the brief before you select. One thread. Zero platform fee.",
  path: "/for-brands",
});

const briefModes = [
  {
    title: "Open",
    use: "When you want claimed creators to apply.",
    body: "Publish the brief to discovery. Shortlist from applications with live reach, not a typed follower count.",
    lane: "Applications",
  },
  {
    title: "Invite-only",
    use: "When you already know who should run it.",
    body: "Invite claimed profiles or unclaimed prospects. Pending handles stay labelled until they connect.",
    lane: "Roster",
  },
  {
    title: "Hybrid",
    use: "When you want a shortlist and an open lane.",
    body: "Invite a core roster and still take applications. Same wallet, same thread rules.",
    lane: "Both",
  },
];

export default function ForBrandsPage() {
  return (
    <MarketingChrome>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "For brands", path: "/for-brands" },
        ])}
      />
      <JsonLd data={faqSchemaFrom(brandAudienceFaqs)} />

      <AudienceHero
        kicker="{For brands}"
        title="Stop running campaigns in WhatsApp."
        lede="Claimed Instagram, TikTok, YouTube. Put Naira on the brief, then pick who runs it. One thread. We take 0%."
        primaryHref="/register?type=brand"
        primaryLabel="Sign up"
        secondaryHref="/pricing"
        secondaryLabel="See pricing"
        layout="split"
      >
        <div className="relative pb-28 sm:pb-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] sm:aspect-[5/4]">
            <Image
              src={marketingPhotos.whoBrands}
              alt="Brand operators reviewing a campaign board"
              fill
              priority
              quality={95}
              sizes="(min-width: 1024px) 28rem, 100vw"
              className="object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-xs text-white/80">
              Operator board · one organisation, one NGN wallet
            </p>
          </div>
          <div className="absolute bottom-6 right-3 w-[min(100%,18rem)] sm:-right-2 sm:w-72">
            <ProductFrame title="woosh.app / shortlist">
              <DiscoveryMock heading="Claimed supply" sub="Open brief · NGN" />
            </ProductFrame>
          </div>
        </div>
      </AudienceHero>

      <section className="border-t border-mkt-border py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{Brief types}"}</p>
          <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
            Open the street. Or invite the room.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {briefModes.map((mode) => (
              <article
                key={mode.title}
                className="mkt-lift rounded-[1.1rem] border border-mkt-border bg-mkt-inset p-5"
              >
                <p className="text-[0.65rem] uppercase tracking-wider text-mkt-faint">
                  Lane · {mode.lane}
                </p>
                <h3 className="mt-2 text-lg font-medium text-mkt-fg">{mode.title}</h3>
                <p className="mkt-accent mt-2 text-sm">{mode.use}</p>
                <p className="mt-3 text-sm leading-6 text-mkt-muted">{mode.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-mkt-border bg-[var(--mkt-electric)] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[0.8125rem] font-medium tracking-[0.01em] text-white/75">
            {"{Fund before you select}"}
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-white">
            Draft empty-handed. Accept only when the Naira is there.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80">
            No “we will pay after they post”. Finance sees the same number
            marketing just locked. USD when that rail is real — not before.
          </p>
          <dl className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              { label: "Wallet", value: "One ledger" },
              { label: "Select", value: "After fund" },
              { label: "Settle", value: "NGN · Paystack" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl bg-black/20 px-4 py-3">
                <dt className="text-xs text-white/55">{row.label}</dt>
                <dd className="mt-1 text-sm font-medium text-white">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-mkt-border py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:px-8 lg:grid-cols-2">
          <div>
            <p className="mkt-kicker">{"{One thread}"}</p>
            <h2 className="font-display mt-4 text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
              The thread is the work. The group chat can rest.
            </h2>
            <p className="mt-4 text-sm leading-6 text-mkt-muted">
              Creators upload into the campaign. You request a change without a
              new group chat. One organisation, one wallet — unless you need a
              client roster, which is the{" "}
              <Link
                href="/for-agencies"
                className="mkt-link"
              >
                agency seat
              </Link>
              .
            </p>
          </div>
          <ProductFrame title="woosh.app / campaign thread">
            <ThreadMock />
          </ProductFrame>
        </div>
      </section>

      <AudienceFaq
        heading="Before you put Naira on a brief."
        items={brandAudienceFaqs}
      />
      <AudienceClose
        title="Open the brand seat."
        lede="Creators claim and collect in Naira. You fund, pick, settle — one ledger. We take 0%."
        primaryHref="/register?type=brand"
        primaryLabel="Sign up"
        secondaryHref="/for-creators"
        secondaryLabel="For creators"
      />
    </MarketingChrome>
  );
}
