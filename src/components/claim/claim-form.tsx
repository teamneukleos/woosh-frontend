"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { claimInviteAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function ClaimForm({
  token,
  loggedIn,
}: {
  token: string;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(claimInviteAction, {
    ok: false,
  });

  useEffect(() => {
    if (state.ok) {
      router.push(loggedIn ? "/app/messages" : "/login?registered=1");
      router.refresh();
    }
  }, [state.ok, router, loggedIn]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {loggedIn ? (
        <>
          <input type="hidden" name="mode" value="login" />
          <p className="text-sm text-[var(--woosh-dull)]/75">
            You&apos;re signed in. Claim this prospect into your creator
            profile.
          </p>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Claiming…" : "Claim with this account"}
          </Button>
        </>
      ) : (
        <>
          <input type="hidden" name="mode" value="register" />
          <Label>
            Name
            <Input name="name" required />
          </Label>
          <Label>
            Email
            <Input name="email" type="email" required />
          </Label>
          <Label>
            Password
            <Input name="password" type="password" minLength={8} required />
          </Label>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Creating…" : "Create account & claim"}
          </Button>
          <p className="text-sm text-[var(--woosh-dull)]/75">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=/claim/${token}`}
              className="font-semibold text-[var(--woosh-blue)]"
            >
              Sign in first
            </Link>
          </p>
        </>
      )}
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
