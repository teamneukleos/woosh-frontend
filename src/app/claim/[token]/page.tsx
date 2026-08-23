import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClaimByToken } from "@/domains/creator/claim";
import { ClaimForm } from "@/components/claim/claim-form";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const interest = await getClaimByToken(token);
  if (!interest) notFound();

  const session = await auth();
  const expired = interest.claimTokenExpiresAt < new Date();
  const claimed = interest.status === "CLAIMED";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--surface-base)] text-[var(--text-primary)]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <Logo href="/" />
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-16 sm:px-6">
        <Badge tone="teal">Claim invite</Badge>
        <h1 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.03em] text-[var(--text-strong)]">
          Your profile is waiting
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-strong)]">
            {interest.brand.name}
          </span>{" "}
          invited{" "}
          {interest.prospect ? (
            <span className="font-medium">@{interest.prospect.handle}</span>
          ) : (
            "you"
          )}{" "}
          to join Woosh.
        </p>
        {interest.message ? (
          <blockquote className="mt-5 border-l-2 border-[var(--woosh-border)] pl-4 text-sm leading-6 text-[var(--text-secondary)]">
            {interest.message}
          </blockquote>
        ) : null}

        <div className="mt-8 rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white p-5">
          {expired || claimed ? (
            <p className="text-sm text-[var(--text-secondary)]">
              {claimed
                ? "This invite has already been claimed."
                : "This invite has expired."}{" "}
              <Link
                href="/login"
                className="font-medium text-[var(--woosh-blue)] hover:underline"
              >
                Sign in
              </Link>
            </p>
          ) : (
            <>
              <h2 className="text-base font-semibold text-[var(--text-strong)]">
                Claim and continue
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Create an account or claim with your signed-in profile.
              </p>
              <div className="mt-5">
                <ClaimForm token={token} loggedIn={!!session?.user} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
