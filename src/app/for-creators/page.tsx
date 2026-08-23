import Image from "next/image";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { AudienceHero } from "@/components/marketing/audience/audience-hero";
import { AudienceFaq } from "@/components/marketing/audience/audience-faq";
import { AudienceClose } from "@/components/marketing/audience/audience-close";
import { marketingPhotos } from "@/components/marketing/cast";
import { JsonLd } from "@/components/seo/json-ld";
import { creatorAudienceFaqs } from "@/lib/audience-faq";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchemaFrom } from "@/lib/seo-schema";

export const metadata = pageMetadata({
  title: "Claim the handle. Collect in Naira.",
  description:
    "Connect Instagram, TikTok and YouTube. Package what you sell. Get paid to a verified NUBAN. Zero platform fee. No public ratings.",
  path: "/for-creators",
});

const path = [
  {
    n: "01",
    title: "Claim the name",
    body: "If a brand added you as a prospect, take the invite. The handle stays pending until you finish.",
  },
  {
    n: "02",
    title: "Connect what they already watch",
    body: "Follower counts and engagement come from the provider. You cannot type those numbers.",
  },
  {
    n: "03",
    title: "Price the work",
    body: "A reel, a TikTok, a YouTube integration — with usage and turnaround the brief can inherit.",
  },
  {
    n: "04",
    title: "See the Naira before you say yes",
    body: "Woosh takes 0% platform fee. The rate you accept is what we pay out (Paystack processing is separate). No public scoreboard.",
  },
  {
    n: "05",
    title: "Collect on a real NUBAN",
    body: "After approval, a 72-hour release window, then payout in NGN.",
  },
];

const packages = [
  { name: "TikTok", deliverable: "1 video", usage: "Organic 30 days", turnaround: "5 days", from: "From ₦85,000" },
  { name: "Instagram reel", deliverable: "1 reel + stills", usage: "Paid 14 days", turnaround: "7 days", from: "From ₦120,000" },
  { name: "YouTube", deliverable: "60s integration", usage: "Always-on", turnaround: "14 days", from: "From ₦250,000" },
];

export default function ForCreatorsPage() {
  return (
    <MarketingChrome>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "For creators", path: "/for-creators" },
        ])}
      />
      <JsonLd data={faqSchemaFrom(creatorAudienceFaqs)} />

      <AudienceHero
        kicker="{For creators}"
        title="Your name. Your Naira. No stars."
        lede="Connect the apps brands already stalk. Package the work. Collect on Paystack. We take 0%."
        primaryHref="/register?type=creator"
        primaryLabel="Claim your name"
        secondaryHref="/for-brands"
        secondaryLabel="How brands hire"
        layout="stacked"
      >
        <div className="relative overflow-hidden rounded-[1.1rem]">
          <div className="relative aspect-[16/8] md:aspect-[21/8]">
            <Image
              src={marketingPhotos.blogPlaceholder}
              alt="Creator storefront — claimed profile and packages"
              fill
              priority
              quality={95}
              sizes="(min-width: 1024px) 72rem, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/20 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 grid gap-2 p-3 sm:grid-cols-3 sm:p-4">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-xl border border-white/15 bg-[#0b0d14]/85 px-3 py-2.5 backdrop-blur-sm"
              >
                <p className="mkt-accent text-[0.65rem]">{pkg.from}</p>
                <p className="mt-0.5 text-sm font-medium text-white">{pkg.name}</p>
                <p className="text-[0.65rem] text-white/50">{pkg.deliverable}</p>
              </div>
            ))}
          </div>
        </div>
      </AudienceHero>

      <section className="border-t border-white/10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{The path}"}</p>
          <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-white">
            Claim it. Connect it. Price it. Collect.
          </h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-5">
            {path.map((step) => (
              <li key={step.n} className="border-t border-white/15 pt-4">
                <p className="mkt-accent text-xs">{step.n}</p>
                <h3 className="mt-2 text-sm font-medium text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{Storefront}"}</p>
          <h2 className="font-display mt-4 text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-white">
            No scoreboard. No begging a star.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
            Woosh does not run a public creator scoreboard. Brands judge your
            storefront, connected metrics, and work you have actually delivered
            together.
          </p>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{Packages}"}</p>
          <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-white">
            Illustration — not live inventory.
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <article
                key={pkg.name}
                className="mkt-lift rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="mkt-accent text-xs">{pkg.from}</p>
                <h3 className="mt-1 text-lg font-medium text-white">{pkg.name}</h3>
                <dl className="mt-4 space-y-2 text-sm text-white/55">
                  <div className="flex justify-between gap-4">
                    <dt>Deliverable</dt>
                    <dd className="text-white">{pkg.deliverable}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Usage</dt>
                    <dd className="text-white">{pkg.usage}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Turnaround</dt>
                    <dd className="text-white">{pkg.turnaround}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b0d14] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{Payout}"}</p>
          <h2 className="font-display mt-4 text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-white">
            The rate you accept is the Naira we send.
          </h2>
          <div className="mt-8 flex max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 sm:flex-row">
            {[
              { label: "Gross", value: "₦250,000" },
              { label: "Platform fee", value: "₦0" },
              { label: "Net to NUBAN", value: "₦250,000" },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`flex-1 px-5 py-4 ${i === 2 ? "bg-[var(--mkt-electric)]" : "bg-white/[0.03]"} ${i > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}
              >
                <p className="text-xs text-white/50">{row.label}</p>
                <p className="mt-1 text-xl font-medium text-white">{row.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
            Example figures for layout only. Settlement is Paystack after the
            72-hour release window.
          </p>
        </div>
      </section>

      <AudienceFaq heading="Before you claim the handle." items={creatorAudienceFaqs} />
      <AudienceClose
        title="Claim your name."
        lede="Brands put Naira down first. Agencies do not mix client wallets. We take 0% of yours."
        primaryHref="/register?type=creator"
        primaryLabel="Claim your name"
        secondaryHref="/for-agencies"
        secondaryLabel="For agencies"
      />
    </MarketingChrome>
  );
}
