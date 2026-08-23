import { LegalDocument } from "@/components/legal/legal-document";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo-schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description:
    "Terms for using Woosh, the Nigeria-first creator campaign marketplace for brands, agencies and creators.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Terms of use", path: "/terms" },
        ])}
      />
      <LegalDocument title="Terms of use" updated="Effective 22 August 2026">
      <p>
        Woosh is a creator campaign marketplace operated for brands, agencies,
        and creators in Nigeria. By creating an account you agree to these
        terms.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        Accounts
      </h2>
      <p>
        You must provide accurate information, keep credentials confidential,
        and use only one account per person unless we agree otherwise. We may
        suspend accounts that fail verification, abuse the platform, or
        breach campaign terms.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        Campaigns and payments
      </h2>
      <p>
        Briefs, rates, usage rights, and timelines you accept on Woosh form
        the commercial terms for that campaign. Brands fund commitments before
        selection. Payouts settle in NGN through Paystack after approval and
        any release window. Woosh takes 0% of the creator rate. Creators are
        not charged. Brands and agencies may pay a subscription for brief
        volume as published on the pricing page. Paystack processing fees may
        still apply on funding and payout.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        Content and conduct
      </h2>
      <p>
        You retain rights in your content except for the usage you grant in a
        brief. Do not post prohibited categories (including adult, gambling,
        weapons, or illegal products). We may moderate briefs, profiles, and
        media.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        Liability
      </h2>
      <p>
        Woosh provides software infrastructure. We are not a party to every
        creative decision. Our liability is limited to fees paid to us in the
        three months before a claim, except where Nigerian law does not allow
        that limit.
      </p>
      <p>
        Questions: use in-app support or the email on your workspace settings.
      </p>
      </LegalDocument>
    </>
  );
}
