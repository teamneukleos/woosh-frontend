import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { acceptTeamInvite, previewTeamInvite } from "@/domains/organisation/invites";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button-link";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email: emailFromLink } = await searchParams;
  if (!token) redirect("/register");

  let preview: {
    email: string;
    orgName: string;
    brandName: string;
    role: string;
  } | null = null;
  try {
    preview = await previewTeamInvite(token);
  } catch {
    preview = null;
  }

  const invitedEmail = emailFromLink?.trim() || preview?.email || "";

  const session = await auth();
  if (session?.user?.id && session.error !== "RefreshFailed") {
    let failure: string | null = null;
    try {
      await acceptTeamInvite({ token, userId: session.user.id });
    } catch (error) {
      failure =
        error instanceof Error
          ? error.message
          : "Try signing in with the invited email.";
    }
    if (!failure) redirect("/app");
    return (
      <AuthShell title="Could not accept invite" description={failure}>
        <ButtonLink href="/login">Sign in</ButtonLink>
      </AuthShell>
    );
  }

  if (!preview) {
    return (
      <AuthShell
        title="Invite not found"
        description="This link is invalid, expired, or already used. Ask a teammate to send a new invite."
      >
        <ButtonLink href="/login">Sign in</ButtonLink>
      </AuthShell>
    );
  }

  const loginHref = `/login?${new URLSearchParams({
    callbackUrl: `/invite?token=${token}${invitedEmail ? `&email=${invitedEmail}` : ""}`,
    ...(invitedEmail ? { email: invitedEmail } : {}),
  }).toString()}`;

  const roleLabel = preview.role.replaceAll("_", " ").toLowerCase();

  return (
    <AuthShell
      title={`Join ${preview.brandName}`}
      description={`You were invited to ${preview.brandName} at ${preview.orgName} as ${roleLabel}. You will only see this brand. Choose a password here to create your account, then you can sign in.`}
      footer={
        <p>
          Already have a Woosh account on this email?{" "}
          <Link
            href={loginHref}
            className="font-medium text-[var(--woosh-blue)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading…</p>}>
        <RegisterForm
          inviteToken={token}
          invitedEmail={invitedEmail}
          google={false}
          apple={false}
        />
      </Suspense>
    </AuthShell>
  );
}
