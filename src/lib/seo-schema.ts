import { brand } from "@/lib/brand";
import { marketingFaqs } from "@/lib/marketing-faq";
import { absoluteUrl, sameAs, siteName, siteUrl } from "@/lib/seo";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl(),
    logo: absoluteUrl("/brand/app-icon.png"),
    description: brand.promise,
    areaServed: { "@type": "Country", name: "Nigeria" },
    sameAs: [...sameAs],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl(),
    inLanguage: "en",
    publisher: { "@type": "Organization", name: siteName, url: siteUrl() },
  };
}

export function softwareSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl(),
    description:
      "Nigeria marketplace for creator campaigns. Claimed socials, funded briefs, one thread, Paystack. Zero platform fee.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
    },
    audience: [
      { "@type": "Audience", audienceType: "Brand marketers" },
      { "@type": "Audience", audienceType: "Agencies" },
      { "@type": "Audience", audienceType: "Creators" },
    ],
  };
}

export function faqSchemaFrom(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function faqSchema() {
  return faqSchemaFrom(marketingFaqs);
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteName} blog`,
    description:
      "How Woosh runs Nigeria-first creator campaigns: claimed socials, funded selection, payouts, and the campaign thread.",
    url: absoluteUrl("/blog"),
    publisher: { "@type": "Organization", name: siteName, url: siteUrl() },
    inLanguage: "en",
  };
}

export function blogPostingSchema(post: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    image: absoluteUrl(post.image),
    inLanguage: "en",
    author: { "@type": "Organization", name: siteName, url: siteUrl() },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl(),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/app-icon.png"),
      },
    },
  };
}
