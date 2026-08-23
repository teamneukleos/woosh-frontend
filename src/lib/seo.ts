import type { Metadata } from "next";
import { brand } from "@/lib/brand";

export const siteName = "Woosh";

export const defaultTitle = `${siteName} — ${brand.tagline}`;

export const defaultDescription =
  "Nigeria marketplace for creator campaigns. Claimed Instagram, TikTok and YouTube — not typed bios. Fund the brief. One thread. Paystack. Zero platform fee.";

export const sameAs = [
  "https://www.instagram.com/woosh.app",
  "https://x.com/wooshapp",
  "https://www.youtube.com/@woosh.app",
  "https://www.facebook.com/woosh.app",
] as const;

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  if (suffix === "/") return siteUrl();
  return `${siteUrl()}${suffix}`;
}

export const noIndex: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  type = "website",
  publishedTime,
  image,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = path === "/" ? defaultTitle : `${title} · ${siteName}`;
  const images = image ? [{ url: image }] : undefined;
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: index ? { index: true, follow: true } : noIndex,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName,
      locale: "en_NG",
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
