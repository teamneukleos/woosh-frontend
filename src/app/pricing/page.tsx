import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { PricingExperience } from "@/components/marketing/pricing-experience";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchemaFrom } from "@/lib/seo-schema";
import { PRICING_FAQS } from "@/lib/pricing";

export const metadata = pageMetadata({
  title: "Pricing for brands and agencies",
  description:
    "Creators stay free. Brands and agencies pay for brief volume. 0% of the creator rate. Paystack.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <MarketingChrome>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <JsonLd data={faqSchemaFrom(PRICING_FAQS)} />
      <PricingExperience />
    </MarketingChrome>
  );
}
