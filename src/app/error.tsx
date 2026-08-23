"use client";

import { useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--surface-base)] px-6 text-center">
      <Logo href="/" />
      <h1 className="mt-10 text-[1.75rem] font-medium tracking-[-0.02em] text-[var(--text-strong)]">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
        The page failed to load. Try again, or go back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </main>
  );
}
