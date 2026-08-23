import { BrandNav } from "@/components/marketing/brand-nav";
import { BrandHero } from "@/components/marketing/brand-hero";
import { BrandLogos } from "@/components/marketing/brand-logos";
import { BrandAdvantage } from "@/components/marketing/brand-advantage";
import { BrandOs } from "@/components/marketing/brand-os";
import { BrandWho } from "@/components/marketing/brand-who";
import { BrandSteps } from "@/components/marketing/brand-steps";
import { BrandUgc } from "@/components/marketing/brand-ugc";
import { BrandTestimonials } from "@/components/marketing/brand-testimonials";
import { BrandFaq } from "@/components/marketing/brand-faq";
import { BrandClosing } from "@/components/marketing/brand-closing";
import { BrandFooter } from "@/components/marketing/brand-footer";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import {
  faqSchema,
  organizationSchema,
  softwareSchema,
  websiteSchema,
} from "@/lib/seo-schema";

export function HomeExperience() {
  return (
    <div className="min-h-screen bg-black text-white">
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={softwareSchema()} />
      <JsonLd data={faqSchema()} />
      <BrandNav />
      <main>
        <BrandHero />
        <Reveal>
          <BrandLogos />
        </Reveal>
        <Reveal>
          <BrandAdvantage />
        </Reveal>
        <Reveal>
          <BrandOs />
        </Reveal>
        <Reveal>
          <BrandWho />
        </Reveal>
        <Reveal>
          <BrandSteps />
        </Reveal>
        <Reveal>
          <BrandUgc />
        </Reveal>
        <Reveal>
          <BrandTestimonials />
        </Reveal>
        <Reveal>
          <BrandFaq />
        </Reveal>
        <Reveal>
          <BrandClosing />
        </Reveal>
      </main>
      <BrandFooter />
    </div>
  );
}
