import type { SocialChannel } from "@/lib/enums";

/** Controlled taxonomies for Woosh — never free-text for these fields in product UI. */

export const CREATOR_CATEGORIES = [
  "Beauty",
  "Fashion",
  "Lifestyle",
  "Food & Drink",
  "Tech",
  "Gaming",
  "Music",
  "Comedy",
  "Education",
  "Fitness & Wellness",
  "Parenting",
  "Finance",
  "Travel",
  "Sports",
  "Automotive",
  "Home & DIY",
  "Business",
  "News & Culture",
] as const;

export type CreatorCategory = (typeof CREATOR_CATEGORIES)[number];

export const BRAND_INDUSTRIES = [
  "FMCG",
  "Beauty & Personal Care",
  "Fashion & Apparel",
  "Food & Beverage",
  "Tech & Telecom",
  "Finance & Fintech",
  "Entertainment & Media",
  "Health & Pharma",
  "Automotive",
  "Travel & Hospitality",
  "Retail & E-commerce",
  "Education",
  "Government & NGO",
  "Other",
] as const;

export const LANGUAGES = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Pidgin",
  "French",
  "Portuguese",
  "Arabic",
  "Swahili",
] as const;

export const SOCIAL_CHANNELS: { value: SocialChannel; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
];

export function parseSelectedCategories(formData: FormData): string[] {
  return formData
    .getAll("categories")
    .map(String)
    .filter((c) =>
      (CREATOR_CATEGORIES as readonly string[]).includes(c),
    );
}

export function parseSelectedLanguages(formData: FormData): string[] {
  return formData
    .getAll("languages")
    .map(String)
    .filter((l) => (LANGUAGES as readonly string[]).includes(l));
}
