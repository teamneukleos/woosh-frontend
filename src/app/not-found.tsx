import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button-link";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndex,
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--surface-base)] px-6 text-center">
      <Logo href="/" />
      <h1 className="font-display mt-10 text-[2.5rem] text-[var(--text-strong)]">
        This page isn’t here
      </h1>
      <p className="mt-3 max-w-md text-[var(--text-secondary)]">
        The link may be outdated, or the page has moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/register" variant="secondary">
          Create an account
        </ButtonLink>
      </div>
    </main>
  );
}
