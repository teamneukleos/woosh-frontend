import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { appleLoginEnabled, googleLoginEnabled } from "@/lib/oauth-login";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign in to Woosh",
  description:
    "Sign in to run briefs, claimed supply and payouts — one workspace.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="The brief, the thread, the money — one workspace."
      footer={
        <p>
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--woosh-blue)] hover:underline"
          >
            Create one
          </Link>
        </p>
      }
    >
      <Suspense
        fallback={<p className="text-sm text-[var(--text-secondary)]">Loading…</p>}
      >
        <LoginForm google={googleLoginEnabled()} apple={appleLoginEnabled()} />
      </Suspense>
    </AuthShell>
  );
}
