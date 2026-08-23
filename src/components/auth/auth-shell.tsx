import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Surface } from "@/components/surface";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Surface name="default">
      <div className="grid min-h-dvh lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#003af4] px-10 py-10 text-white lg:flex lg:flex-col">
          <div
            className="pointer-events-none absolute -right-24 -top-28 size-[28rem] rounded-full bg-[#091b68]/45 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-16 size-[22rem] rounded-full bg-[#0de3af]/25 blur-3xl"
            aria-hidden
          />
          <Logo href="/" light size="md" className="relative" />
          <div className="relative mt-auto max-w-md pb-6">
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-white/75">
              Motion at the speed of culture
            </p>
            <h2 className="font-display mt-4 text-[2.35rem] leading-[1.08] tracking-[-0.03em]">
              Culture doesn&apos;t
              <br />
              wait.
            </h2>
            <p className="mt-5 text-sm leading-6 text-white/80">
              Find who is real. Put Naira on the brief. One thread. Paystack.
              We take 0%.
            </p>
          </div>
        </aside>

        <div className="flex min-h-dvh flex-col bg-[var(--surface-base)]">
          <header className="flex items-center justify-between px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
            <Logo href="/" size="md" className="lg:hidden" />
            <span className="hidden lg:block" />
            <Link
              href="/"
              className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              Back to home
            </Link>
          </header>
          <main className="woosh-page-enter flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-6">
              <div className="w-full max-w-[24.5rem]">
                <h1 className="text-[1.5rem] font-medium leading-tight tracking-[-0.03em] text-[var(--text-strong)]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 text-[0.9375rem] leading-6 text-[var(--text-secondary)]">
                    {description}
                  </p>
                ) : null}
                <div className="mt-8">{children}</div>
                {footer ? (
                  <div className="mt-6 text-sm text-[var(--text-secondary)]">
                    {footer}
                  </div>
                ) : null}
              </div>
            </div>
            <p className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 text-xs text-[var(--text-muted)] sm:px-8">
              <Link href="/privacy" className="hover:text-[var(--woosh-blue)]">
                Privacy
              </Link>
              <span aria-hidden className="mx-2">
                ·
              </span>
              <Link href="/terms" className="hover:text-[var(--woosh-blue)]">
                Terms
              </Link>
            </p>
          </main>
        </div>
      </div>
    </Surface>
  );
}
