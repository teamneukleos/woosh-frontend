import Image from "next/image";
import Link from "next/link";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { AudienceHero } from "@/components/marketing/audience/audience-hero";
import { AudienceFaq } from "@/components/marketing/audience/audience-faq";
import { AudienceClose } from "@/components/marketing/audience/audience-close";
import { ClientWallets } from "@/components/marketing/audience/client-wallets";
import { marketingPhotos } from "@/components/marketing/cast";
import { JsonLd } from "@/components/seo/json-ld";
import { agencyAudienceFaqs } from "@/lib/audience-faq";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchemaFrom } from "@/lib/seo-schema";

export const metadata = pageMetadata({
  title: "Every client. Their own Naira.",
  description:
    "Switch brand context. Duplicate the brief. Fund that client’s wallet. Zero platform fee. Wallets never mix.",
  path: "/for-agencies",
});

export default function ForAgenciesPage() {
  return (
    <MarketingChrome>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "For agencies", path: "/for-agencies" },
        ])}
      />
      <JsonLd data={faqSchemaFrom(agencyAudienceFaqs)} />

      <AudienceHero
        kicker="{For agencies}"
        title="Client money does not mix. Ever."
        lede="Switch the brand. Duplicate the brief. Fund that wallet. Same campaign rules. Separate Naira. We take 0%."
        primaryHref="/register?type=agency"
        primaryLabel="Sign up"
        secondaryHref="/pricing"
        secondaryLabel="See pricing"
        layout="workspace"
      >
        <div className="relative min-h-[32rem]">
          <div className="relative h-full min-h-[32rem] overflow-hidden rounded-[1.1rem]">
            <Image
              src={marketingPhotos.workspace}
              alt="Agency workspace — billboard and client campaigns"
              fill
              priority
              quality={95}
              sizes="(min-width: 1024px) 28rem, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#07080c]/55" />
          </div>
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
            <ClientWallets />
          </div>
        </div>
      </AudienceHero>

      <section className="border-t border-mkt-border py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] lg:aspect-[4/4.2]">
            <Image
              src={marketingPhotos.whoAgencies}
              alt="Agency team switching client context"
              fill
              quality={95}
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="object-cover object-[center_25%]"
            />
          </div>
          <div>
            <p className="mkt-kicker">{"{Seats}"}</p>
            <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
              Same street. Different ledgers.
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-mkt-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-mkt-inset text-mkt-subtle">
                  <tr>
                    <th className="px-4 py-3 font-medium"> </th>
                    <th className="px-4 py-3 font-medium">Brand seat</th>
                    <th className="px-4 py-3 font-medium">Agency seat</th>
                  </tr>
                </thead>
                <tbody className="text-mkt-muted">
                  {[
                    ["Workspaces", "One organisation", "Client roster"],
                    ["Wallets", "One NGN ledger", "One ledger per client"],
                    ["Briefs", "Yours to run", "Scoped to the active brand"],
                    ["Fund before select", "Yes", "Yes — from that client wallet"],
                    ["Claimed supply", "Yes", "Yes"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t border-mkt-border">
                      <th className="px-4 py-3 font-medium text-mkt-fg">{row[0]}</th>
                      <td className="px-4 py-3">{row[1]}</td>
                      <td className="px-4 py-3">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-mkt-border py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="mkt-kicker">{"{How you work}"}</p>
          <h2 className="font-display mt-4 max-w-xl text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] text-mkt-fg">
            Switch. Duplicate. Fund that client.
          </h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Pick the client",
                body: "The workspace switcher sets brand context. Files and wallets stay on that brand.",
              },
              {
                n: "02",
                title: "Duplicate the brief",
                body: "Reuse deliverables and rights. Change the client. Do not dump assets into a shared Drive.",
              },
              {
                n: "03",
                title: "Fund, then select",
                body: "Accept commits the creator rate from the active client wallet. Woosh platform fee is 0%. New orgs can be moderated.",
              },
            ].map((step) => (
              <li key={step.n} className="mkt-lift rounded-[1.1rem] border border-mkt-border bg-mkt-inset p-5">
                <p className="mkt-accent text-xs">{step.n}</p>
                <h3 className="mt-2 text-lg font-medium text-mkt-fg">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-mkt-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-mkt-subtle">
            Single-brand teams should use a{" "}
            <Link
              href="/for-brands"
              className="mkt-link"
            >
              brand account
            </Link>
            .
          </p>
        </div>
      </section>

      <AudienceFaq heading="Before you add the next client." items={agencyAudienceFaqs} />
      <AudienceClose
        title="Open the agency seat."
        lede="Creators still see the rate before they say yes. One-brand teams stay on a brand seat."
        primaryHref="/register?type=agency"
        primaryLabel="Sign up"
        secondaryHref="/for-creators"
        secondaryLabel="For creators"
      />
    </MarketingChrome>
  );
}
