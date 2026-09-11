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

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite } = await searchParams;
  const joiningTeam = Boolean(invite);

  return (
    <AuthShell
      title={joiningTeam ? "Join your team" : "Take a seat"}
      description={
        joiningTeam
          ? "Create an account with the invited email, then sign in. No second verification email."
          : "Brand, agency or creator. Same loop. Different wallet."
      }
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
