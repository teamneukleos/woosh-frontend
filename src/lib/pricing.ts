/**
 * Buyer subscription logic. Creators are never charged.
 *
 * Woosh still takes 0% of the creator rate. Brands and agencies pay a
 * monthly (or annual) seat for how many briefs they can run. Paystack
 * processing on wallet top-up and payout is separate.
 *
 * Unit: one published brief in a calendar month (open, invite-only, or
 * hybrid). Accepts and applications on that brief do not consume another
 * slot. Unused slots do not roll over.
 */

export const PRICING_CURRENCY = "NGN" as const;
export const ANNUAL_MONTHS_BILLED = 10;
export const CREATOR_PRICING = {
  monthlyKobo: 0,
  briefsPerMonth: Number.POSITIVE_INFINITY,
  platformFeeRate: 0,
  note: "Creators never pay Woosh. The rate they accept is the rate we pay out.",
} as const;

export type PricingAudience = "brand" | "agency";
export type BillingCycle = "monthly" | "annual";
export type BriefCap = number;

export type PricingPlan = {
  id: string;
  audience: PricingAudience;
  name: string;
  pitch: string;
  monthlyNgn: number | null;
  briefsPerMonth: BriefCap;
  clientBrands: BriefCap;
  seats: BriefCap;
  popular?: boolean;
  cta: { label: string; href: string };
  features: string[];
};

export const BRAND_PLANS: PricingPlan[] = [
  {
    id: "brand-starter",
    audience: "brand",
    name: "Starter",
    pitch: "First brief. See if the loop holds.",
    monthlyNgn: 0,
    briefsPerMonth: 1,
    clientBrands: 1,
    seats: 1,
    cta: { label: "Start free", href: "/register?type=brand&plan=brand-starter" },
    features: [
      "Search claimed Instagram, TikTok and YouTube",
      "1 published brief per month",
      "Fund before you select",
      "One campaign thread",
      "0% on the creator rate",
      "Paystack wallet in NGN",
    ],
  },
  {
    id: "brand-studio",
    audience: "brand",
    name: "Studio",
    pitch: "A month of briefs without opening WhatsApp.",
    monthlyNgn: 20_000,
    briefsPerMonth: 5,
    clientBrands: 1,
    seats: 3,
    popular: true,
    cta: { label: "Start Studio", href: "/register?type=brand&plan=brand-studio" },
    features: [
      "Everything in Starter",
      "5 published briefs per month",
      "Open, invite-only and hybrid briefs",
      "Prospect handles that stay pending until claimed",
      "3 team seats",
      "Campaign analytics",
    ],
  },
  {
    id: "brand-house",
    audience: "brand",
    name: "House",
    pitch: "Always-on. No counting slots.",
    monthlyNgn: 75_000,
    briefsPerMonth: Number.POSITIVE_INFINITY,
    clientBrands: 1,
    seats: 8,
    cta: { label: "Start House", href: "/register?type=brand&plan=brand-house" },
    features: [
      "Everything in Studio",
      "Unlimited published briefs",
      "8 team seats",
      "Priority review on first campaigns",
      "Exportable ledger for finance",
    ],
  },
  {
    id: "brand-enterprise",
    audience: "brand",
    name: "Enterprise",
    pitch: "Several markets. One ledger they can audit.",
    monthlyNgn: null,
    briefsPerMonth: Number.POSITIVE_INFINITY,
    clientBrands: Number.POSITIVE_INFINITY,
    seats: Number.POSITIVE_INFINITY,
    cta: { label: "Talk to us", href: "/register?type=brand&plan=brand-enterprise" },
    features: [
      "Everything in House",
      "Custom seats and permissions",
      "Named onboarding",
      "Billing that matches finance",
    ],
  },
];

export const AGENCY_PLANS: PricingPlan[] = [
  {
    id: "agency-desk",
    audience: "agency",
    name: "Desk",
    pitch: "One client. Prove the wallets never mix.",
    monthlyNgn: 0,
    briefsPerMonth: 1,
    clientBrands: 1,
    seats: 2,
    cta: { label: "Start free", href: "/register?type=agency&plan=agency-desk" },
    features: [
      "1 client brand, its own NGN wallet",
      "1 published brief per month",
      "Search claimed creators",
      "0% on the creator rate",
      "2 team seats",
    ],
  },
  {
    id: "agency-roster",
    audience: "agency",
    name: "Roster",
    pitch: "A small book. Separate Naira for each name.",
    monthlyNgn: 40_000,
    briefsPerMonth: 5,
    clientBrands: 5,
    seats: 6,
    popular: true,
    cta: { label: "Start Roster", href: "/register?type=agency&plan=agency-roster" },
    features: [
      "Everything in Desk",
      "5 client brands — wallets never mix",
      "5 published briefs per month",
      "Duplicate a brief onto another client",
      "6 team seats",
      "Campaign analytics per brand",
    ],
  },
  {
    id: "agency-floor",
    audience: "agency",
    name: "Floor",
    pitch: "The whole roster. No mixing. No cap.",
    monthlyNgn: 150_000,
    briefsPerMonth: Number.POSITIVE_INFINITY,
    clientBrands: Number.POSITIVE_INFINITY,
    seats: 20,
    cta: { label: "Start Floor", href: "/register?type=agency&plan=agency-floor" },
    features: [
      "Everything in Roster",
      "Unlimited client brands",
      "Unlimited published briefs",
      "20 team seats",
      "Priority support",
    ],
  },
  {
    id: "agency-custom",
    audience: "agency",
    name: "Custom",
    pitch: "Several markets, one invoice.",
    monthlyNgn: null,
    briefsPerMonth: Number.POSITIVE_INFINITY,
    clientBrands: Number.POSITIVE_INFINITY,
    seats: Number.POSITIVE_INFINITY,
    cta: { label: "Talk to us", href: "/register?type=agency&plan=agency-custom" },
    features: [
      "Everything in Floor",
      "Custom permissions by brand",
      "Named onboarding",
      "Billing terms finance can live with",
    ],
  },
];

export const PRICING_FEATURES = [
  {
    kicker: "01 / Find",
    title: "Search who is actually claimed",
    body: "Instagram, TikTok, YouTube — live from the app. Prospects stay labelled until they connect. Nobody types a follower count.",
  },
  {
    kicker: "02 / Brief",
    title: "Publish. Invite. Or both.",
    body: "A brief slot is one published brief in the calendar month. Creators apply to you. Accepts on that brief do not burn another slot.",
  },
  {
    kicker: "03 / Thread",
    title: "The group chat can rest",
    body: "Drafts, revisions, rights, deadlines — on the campaign. Finance sees the same number marketing just locked.",
  },
  {
    kicker: "04 / Pay",
    title: "Naira first. We take 0% of it.",
    body: "Fund the wallet before you pick anyone. The rate you agree is the rate that pays. Subscription is for volume. Paystack processing is theirs.",
  },
] as const;

export const PRICING_FAQS = [
  {
    q: "Do creators pay?",
    a: "No. Creators never pay Woosh. They claim, apply, ship and collect. We take 0% of the rate they accept. Paystack may still charge its own payout processing.",
  },
  {
    q: "What am I paying for, then?",
    a: "Brands and agencies pay for how many briefs they can publish in a month. Starter and Desk are free for one brief. Studio is ₦20,000 for five. House and Floor stop counting. The creator rate is untouched.",
  },
  {
    q: "What counts as a brief?",
    a: "One published brief — open, invite-only or hybrid — in a calendar month. Applications and accepts on that brief do not use another slot. Unused slots do not roll over.",
  },
  {
    q: "Is there still a platform fee on hires?",
    a: "No. 0% of the creator rate, on every plan. The subscription is the charge. Paystack processing on top-up and payout is separate.",
  },
  {
    q: "Can I try before I pay?",
    a: "Yes. Starter (brands) and Desk (agencies) are free. Search, fund one brief, run the thread. Upgrade when the fifth brief is the problem, not the first.",
  },
  {
    q: "Monthly or annual?",
    a: "Annual bills ten months. Same plan, two months free. Cancel at the end of the term from settings once billing is live.",
  },
  {
    q: "What’s the difference between brand and agency pricing?",
    a: "A brand seat is one organisation, one wallet. An agency seat is client brands that must not mix. Roster and Floor price the extra ledgers.",
  },
] as const;

export function plansFor(audience: PricingAudience) {
  return audience === "agency" ? AGENCY_PLANS : BRAND_PLANS;
}

export function annualNgn(monthlyNgn: number) {
  return monthlyNgn * ANNUAL_MONTHS_BILLED;
}

export function billedMonthlyNgn(monthlyNgn: number, cycle: BillingCycle) {
  if (cycle === "monthly") return monthlyNgn;
  return Math.round(annualNgn(monthlyNgn) / 12);
}

export function annualSavingsNgn(monthlyNgn: number) {
  return monthlyNgn * 12 - annualNgn(monthlyNgn);
}

export function formatNgn(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: PRICING_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCap(value: BriefCap) {
  return Number.isFinite(value) ? String(value) : "Unlimited";
}

export function canPublishBrief(input: {
  audience: PricingAudience | "creator";
  planId?: string | null;
  briefsPublishedThisMonth: number;
}) {
  if (input.audience === "creator") return { ok: true as const, remaining: Number.POSITIVE_INFINITY };
  const plan =
    [...BRAND_PLANS, ...AGENCY_PLANS].find((item) => item.id === input.planId) ??
    (input.audience === "agency" ? AGENCY_PLANS[0] : BRAND_PLANS[0]);
  if (!plan) return { ok: false as const, remaining: 0 };
  const remaining = plan.briefsPerMonth - input.briefsPublishedThisMonth;
  if (!Number.isFinite(plan.briefsPerMonth)) {
    return { ok: true as const, remaining: Number.POSITIVE_INFINITY };
  }
  return remaining > 0
    ? { ok: true as const, remaining }
    : { ok: false as const, remaining: 0 };
}
