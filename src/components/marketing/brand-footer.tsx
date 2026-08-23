import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/lib/brand";
import { SocialIcon, socialLabel } from "@/components/ui/social-icon";

const product = [
  { href: "/#how", label: "How it works" },
  { href: "/for-brands", label: "For brands" },
  { href: "/for-creators", label: "For creators" },
  { href: "/for-agencies", label: "For agencies" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

const account = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Open a workspace" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const social = [
  { href: "https://www.instagram.com/woosh.app", channel: "INSTAGRAM" },
  { href: "https://x.com/wooshapp", channel: "X" },
  { href: "https://www.youtube.com/@woosh.app", channel: "YOUTUBE" },
  { href: "https://www.facebook.com/woosh.app", channel: "FACEBOOK" },
] as const;

export function BrandFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8">
        <div>
          <Logo href="/" light size="md" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/45">
            {brand.tagline} Claimed supply. Funded briefs. Naira on Paystack.
            Zero platform fee.
          </p>
          <ul className="mt-6 flex flex-wrap items-center gap-2">
            {social.map((item) => (
              <li key={item.channel}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={socialLabel(item.channel) ?? item.channel}
                  className="inline-flex size-10 items-center justify-center rounded-full bg-white/[0.08] text-white/55 shadow-[0_2px_6px_rgb(0_0_0_/_0.18)] transition hover:bg-white/[0.14] hover:text-white"
                >
                  <SocialIcon channel={item.channel} size="md" tone="mono" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.75rem] text-white/35">Product</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-white/55">
            {product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.75rem] text-white/35">Account</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-white/55">
            {account.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-2 border-t border-white/10 px-5 pt-8 text-xs text-white/35 sm:flex-row sm:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Woosh. All rights reserved.</p>
        <p>Lagos · Nigeria · NGN</p>
      </div>
    </footer>
  );
}
