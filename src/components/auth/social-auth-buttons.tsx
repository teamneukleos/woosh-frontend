"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function postLoginPath(raw: string | null) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/app";
}

export function SocialAuthButtons({
  intent = "signin",
  google = true,
  apple = true,
}: {
  intent?: "signin" | "signup";
  google?: boolean;
  apple?: boolean;
}) {
  const params = useSearchParams();
  const callbackUrl = postLoginPath(params.get("callbackUrl"));
  const verb = intent === "signup" ? "Sign up" : "Continue";

  if (!google && !apple) return null;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3 text-[0.75rem] uppercase tracking-[0.08em] text-[var(--text-muted)]">
        <span className="h-px flex-1 bg-[var(--woosh-border)]" />
        or
        <span className="h-px flex-1 bg-[var(--woosh-border)]" />
      </div>
      {google ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl })}
        >
          <GoogleMark />
          {verb} with Google
        </Button>
      ) : null}
      {apple ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => signIn("apple", { callbackUrl })}
        >
          <AppleMark />
          {verb} with Apple
        </Button>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.47 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.45-3.45C17.95 1.14 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M16.37 12.62c.02 2.37 2.08 3.16 2.1 3.17-.02.05-.33 1.12-1.08 2.22-.65.95-1.33 1.9-2.4 1.92-1.05.02-1.39-.62-2.59-.62-1.2 0-1.58.6-2.57.64-1.03.04-1.82-1.03-2.48-1.98-1.35-1.94-2.38-5.48-1-7.88.69-1.2 1.92-1.96 3.26-1.98 1.02-.02 1.98.69 2.59.69.61 0 1.76-.85 2.97-.73.51.02 1.93.2 2.85 1.54-.07.05-1.7 1-1.65 2.99ZM14.7 6.3c.55-.67.92-1.6.82-2.53-.8.03-1.76.53-2.33 1.2-.51.59-.96 1.54-.84 2.45.88.07 1.79-.45 2.35-1.12Z"
      />
    </svg>
  );
}
