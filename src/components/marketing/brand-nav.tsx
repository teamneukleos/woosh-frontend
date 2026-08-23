"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "Brands", href: "/for-brands" },
  { label: "Creators", href: "/for-creators" },
  { label: "Agencies", href: "/for-agencies" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
];

export function BrandNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[calc(0.75rem+env(safe-area-inset-top))] transition-[background,border] duration-300 ${
        scrolled
          ? "bg-black/80 shadow-[0_4px_16px_rgb(0_0_0_/_0.2)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <Logo href="/" light size="md" />

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.8125rem] text-white/55 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[0.8125rem] text-white/55 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link href="/register" className="mkt-cta mkt-cta-primary h-9 px-4 text-[0.8125rem]">
            Open a workspace
          </Link>
        </div>
      </nav>
    </header>
  );
}
