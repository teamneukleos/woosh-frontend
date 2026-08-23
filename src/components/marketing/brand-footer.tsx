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
  { href: "/register", label: "Sign up" },
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
    <footer className="border-t border-mkt-border bg-mkt-bg py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-8">
        <div>
          <Logo href="/" adaptive size="md" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-mkt-subtle">
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
                  className="inline-flex size-10 items-center justify-center rounded-full bg-mkt-ghost text-mkt-muted shadow-[0_2px_6px_rgb(18_20_26_/_0.08)] transition hover:bg-mkt-ghost-hover hover:text-mkt-fg"
                >
                  <SocialIcon channel={item.channel} size="md" tone="mono" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.75rem] text-mkt-faint">Product</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-mkt-muted">
            {product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-mkt-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.75rem] text-mkt-faint">Account</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-mkt-muted">
            {account.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-mkt-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-2 border-t border-mkt-border px-5 pt-8 text-xs text-mkt-faint sm:flex-row sm:justify-between md:px-8">
        <p>© {new Date().getFullYear()} Woosh. All rights reserved.</p>
        <p>Lagos · Nigeria · NGN</p>
      </div>
    </footer>
  );
}
