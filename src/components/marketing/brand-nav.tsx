"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "Brands", href: "/for-brands" },
  { label: "Creators", href: "/for-creators" },
  { label: "Agencies", href: "/for-agencies" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
];

export function BrandNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[calc(0.75rem+env(safe-area-inset-top))] transition-[background,border,box-shadow] duration-300 ${
          open
            ? "border-b border-mkt-border bg-[var(--mkt-bg)]"
            : scrolled
              ? "bg-mkt-nav shadow-[0_4px_16px_rgb(18_20_26_/_0.08)] backdrop-blur-xl"
              : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <Logo href="/" adaptive size="md" />

          <div className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.8125rem] text-mkt-muted transition-colors hover:text-mkt-fg"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-[0.8125rem] text-mkt-muted transition-colors hover:text-mkt-fg"
            >
              Log in
            </Link>
            <Link href="/register" className="mkt-cta mkt-cta-primary h-9 px-4 text-[0.8125rem]">
              Sign up
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full text-mkt-fg transition-colors hover:bg-mkt-ghost"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
            </button>
          </div>
        </nav>
      </header>

      {open ? (
        <div
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+0.75rem+env(safe-area-inset-top))] z-40 bg-[var(--mkt-bg)] md:hidden"
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => {
                      if (l.href.includes("#")) setOpen(false);
                    }}
                    className="flex min-h-12 items-center border-b border-mkt-border text-[1.0625rem] text-mkt-fg"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto grid gap-3 pt-8">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mkt-cta mkt-cta-ghost w-full"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="mkt-cta mkt-cta-primary w-full"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
