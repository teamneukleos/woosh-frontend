import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Surface } from "@/components/surface";

export function LegalDocument({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <Surface name="default">
      <div className="flex min-h-dvh flex-1 flex-col bg-[var(--surface-base)] text-[var(--text-primary)]">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
            <Logo href="/" light />
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/login"
                className="font-medium text-white/70 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-full bg-[#003af4] px-3.5 text-sm font-semibold text-white"
              >
                Sign up
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
          <p className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-[#003af4]">
            {updated}
          </p>
          <h1 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-medium tracking-[-0.03em] text-[var(--text-strong)]">
            {title}
          </h1>
          <div className="mt-8 grid gap-6 text-sm leading-7 text-[var(--text-secondary)] [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-medium [&_h2]:tracking-[-0.015em] [&_h2]:text-[var(--text-strong)] [&_a]:font-medium [&_a]:text-[#003af4]">
            {children}
          </div>
        </main>
      </div>
    </Surface>
  );
}
