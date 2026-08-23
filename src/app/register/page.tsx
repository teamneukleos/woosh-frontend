import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { appleLoginEnabled, googleLoginEnabled } from "@/lib/oauth-login";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Create a Woosh account",
  description:
    "Brand, agency or creator. Claimed socials. Funded briefs. Paystack. Zero platform fee.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthShell
      title="Take a seat"
      description="Brand, agency or creator. Same loop. Different wallet."
      footer={
        <p>
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--woosh-blue)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading…</p>}>
        <RegisterForm google={googleLoginEnabled()} apple={appleLoginEnabled()} />
      </Suspense>
    </AuthShell>
  );
}
