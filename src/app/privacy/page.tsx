import { LegalDocument } from "@/components/legal/legal-document";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo-schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy notice",
  description:
    "How Woosh collects and uses account, campaign, social and payout data for the Nigeria-first creator marketplace.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Privacy notice", path: "/privacy" },
        ])}
      />
      <LegalDocument title="Privacy notice" updated="Effective 22 August 2026">
      <p>
        We collect account details, workspace membership, campaign records,
        connected social metrics, payout account identifiers, and device logs
        needed to operate Woosh.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        How we use data
      </h2>
      <p>
        To authenticate you, run discovery and campaigns, process NGN
        payments, prevent fraud, send transactional email, and improve the
        product. We do not sell personal data. Optional demographics (age
        band, gender) are searchable only if you opt in.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        Processors
      </h2>
      <p>
        Depending on configuration this may include hosting, Auth.js session
        storage, PostgreSQL, Resend, Paystack, AWS S3, and Instagram / TikTok
        / YouTube for connected creator accounts. Bank account numbers are
        encrypted at rest.
      </p>
      <h2 className="text-base font-medium text-[var(--text-strong)]">
        Retention and rights
      </h2>
      <p>
        You can export your account JSON from Settings. You may request
        correction or deletion subject to legal retention of ledgers and
        campaign records. Contact us from your workspace to exercise these
        rights.
      </p>
      </LegalDocument>
    </>
  );
}
