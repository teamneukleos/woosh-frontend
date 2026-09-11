import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { acceptTeamInvite, previewTeamInvite } from "@/domains/organisation/invites";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button-link";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email: emailFromLink } = await searchParams;
  if (!token) redirect("/register");

  let invitedEmail = emailFromLink?.trim() || "";
  if (!invitedEmail) {
    try {
      invitedEmail = (await previewTeamInvite(token)).email;
    } catch {
      invitedEmail = "";
    }
  }

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

  const registerHref = invitedEmail
    ? `/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(invitedEmail)}`
    : `/register?invite=${encodeURIComponent(token)}`;
  const loginHref = `/login?${new URLSearchParams({
    callbackUrl: `/invite?token=${token}${invitedEmail ? `&email=${invitedEmail}` : ""}`,
    ...(invitedEmail ? { email: invitedEmail } : {}),
  }).toString()}`;

  return (
    <AuthShell
      title="Join a Woosh organisation"
      description="Create an account or sign in with the email this invite was sent to. You will join as a teammate — not as a new brand, agency, or creator."
    >
      <div className="flex flex-col gap-3">
        <ButtonLink href={registerHref}>Create account</ButtonLink>
        <Link
          href={loginHref}
          className="text-center text-sm font-medium text-[var(--woosh-blue)] hover:underline"
        >
          Sign in instead
        </Link>
      </div>
    </AuthShell>
  );
}
