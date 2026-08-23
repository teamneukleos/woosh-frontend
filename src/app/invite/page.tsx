import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { acceptTeamInvite } from "@/domains/organisation/invites";
import { AuthShell } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button-link";

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/register");

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { organisation: true },
  });
  if (!invite) {
    return (
      <AuthShell title="Invite not found" description="This link is invalid or has already been used.">
        <ButtonLink href="/login">Sign in</ButtonLink>
      </AuthShell>
    );
  }

  const session = await auth();
  if (session?.user?.id) {
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

  const expired = invite.expiresAt < new Date();
  const accepted = Boolean(invite.acceptedAt);

  return (
    <AuthShell
      title={`Join ${invite.organisation.publicName}`}
      description={
        expired || accepted
          ? "This invite is no longer available."
          : `You were invited as ${invite.role.replaceAll("_", " ").toLowerCase()}. Create an account or sign in with ${invite.email}.`
      }
    >
      {expired || accepted ? (
        <ButtonLink href="/login">Sign in</ButtonLink>
      ) : (
        <div className="flex flex-col gap-3">
          <ButtonLink href={`/register?invite=${token}`}>Create account</ButtonLink>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}`}
            className="text-center text-sm font-medium text-[var(--woosh-blue)] hover:underline"
          >
            Sign in instead
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
