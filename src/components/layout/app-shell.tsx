"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Menu,
  MoreHorizontal,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BrandSwitcher } from "@/components/brand-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupNav, navByKind, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type ShellBrand = { id: string; name: string };

export function AppShell({
  kind,
  userName,
  userEmail,
  brands,
  activeBrandId,
  activeBrandName,
  signOutAction,
  children,
}: {
  kind: string;
  userName?: string | null;
  userEmail?: string | null;
  brands: ShellBrand[];
  activeBrandId?: string | null;
  activeBrandName?: string | null;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const nav = navByKind[kind] ?? navByKind.brand;
  const groups = groupNav(nav);
  const mobileNav = nav.filter((item) => item.mobile);

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex min-h-full flex-1 bg-[var(--surface-base)]">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-[#07070a] px-3 py-4 text-white md:flex">
        <div className="px-2 pb-4">
          <Logo href="/app" light />
          <p className="mt-3 text-[0.75rem] capitalize text-white/45">
            {kind}
          </p>
        </div>

        {(kind === "agency" || kind === "brand" || kind === "admin") &&
        brands.length > 0 ? (
          <div className="mb-3 px-0.5">
            {brands.length > 1 ? (
              <BrandSwitcher
                brands={brands}
                activeBrandId={activeBrandId}
                className="text-white"
              />
            ) : (
              <p className="truncate px-2 py-1.5 text-sm font-medium text-white">
                {activeBrandName}
              </p>
            )}
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto pr-0.5">
          {groups.map((group) => (
            <div key={group.label ?? group.items[0]?.href} className="flex flex-col gap-0.5">
              {group.label ? (
                <p className="px-2.5 pb-1 text-[0.6875rem] font-medium text-white/35">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-3 border-t border-white/10 pt-3">
          <UserMenu
            name={userName}
            email={userEmail}
            signOutAction={signOutAction}
          />
        </div>
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(92vw,18rem)] flex-col border-white/10 bg-[#07070a] p-4 pt-[max(1rem,env(safe-area-inset-top))] text-white md:hidden"
        >
          <SheetTitle className="sr-only">Woosh navigation</SheetTitle>
          <div className="mb-4 flex items-center justify-between">
            <Logo href="/app" light />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <Badge tone="blue" className="mb-4 w-fit capitalize">
            {kind}
          </Badge>
          <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.label ?? group.items[0]?.href} className="flex flex-col gap-0.5">
                {group.label ? (
                  <p className="px-2.5 pb-1 text-[0.6875rem] font-medium text-white/35">
                    {group.label}
                  </p>
                ) : null}
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                ))}
              </div>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            <UserMenu
              name={userName}
              email={userEmail}
              signOutAction={signOutAction}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-[var(--woosh-border)] bg-white/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:hidden">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
          <Logo href="/app" size="sm" />
          <div className="ml-auto">
            <Link
              href="/app/notifications"
              aria-label="Notifications"
              className="grid size-10 place-items-center rounded-full text-[var(--text-strong)] transition hover:bg-black/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-ring)]"
            >
              <Bell aria-hidden="true" className="size-5" />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-5 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-6 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--woosh-border)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
          <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 py-1">
            {mobileNav.slice(0, 4).map((item) => (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[0.625rem] font-medium transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
                    isActive(item.href)
                      ? "text-[var(--woosh-blue)]"
                      : "text-[var(--text-muted)]",
                  )}
                >
                  <item.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="flex-1">
              <button
                type="button"
                className="flex min-h-11 w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1 text-[0.625rem] font-medium text-[var(--text-muted)] transition hover:bg-black/[0.04] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
                aria-label="Open all navigation"
                onClick={() => setDrawerOpen(true)}
              >
                <MoreHorizontal aria-hidden="true" className="size-5" />
                More
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] transition focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]",
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/[0.06] hover:text-white",
      )}
    >
      <item.icon
        aria-hidden="true"
        className="size-4 shrink-0"
        strokeWidth={1.75}
      />
      {item.label}
    </Link>
  );
}

function UserMenu({
  name,
  email,
  signOutAction,
}: {
  name?: string | null;
  email?: string | null;
  signOutAction: () => Promise<void>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woosh-blue)]"
        >
          <Avatar name={name || email || "User"} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">
              {name || "Account"}
            </span>
            <span className="block truncate text-xs text-white/45">
              {email}
            </span>
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-4 text-white/45" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Settings aria-hidden="true" className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/notifications">
            <Bell aria-hidden="true" className="size-4" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            const form = document.getElementById(
              "woosh-signout",
            ) as HTMLFormElement | null;
            form?.requestSubmit();
          }}
        >
          <LogOut aria-hidden="true" className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
      <form id="woosh-signout" action={signOutAction} className="hidden" />
    </DropdownMenu>
  );
}
