"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  registerUser,
  type RegisterState,
} from "@/domains/identity/register";
import { Button } from "@/components/ui/button";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/cn";

const initial: RegisterState = { ok: false };

const ROLES = [
  {
    value: "brand",
    title: "Brand",
    body: "Find who is real. Publish a brief. Run the work in one thread.",
  },
  {
    value: "agency",
    title: "Agency",
    body: "Every client. Their own wallet. No mixing the Naira.",
  },
  {
    value: "creator",
    title: "Creator",
    body: "Claim the handle. Connect the apps. Collect in Naira. We take 0%.",
  },
] as const;

export function RegisterForm({
  google = true,
  apple = true,
}: {
  google?: boolean;
  apple?: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerUser, initial);
  const params = useSearchParams();
  const invite = params.get("invite") ?? "";
  const typeParam = params.get("type");
  const [accountType, setAccountType] = useState<(typeof ROLES)[number]["value"]>(
    typeParam === "agency" || typeParam === "creator" || typeParam === "brand"
      ? typeParam
      : "brand",
  );

  useEffect(() => {
    if (state.ok) router.push("/login?registered=1");
  }, [state.ok, router]);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}
      <Label>
        Full name
        <Input name="name" required autoComplete="name" />
      </Label>
      <Label>
        Email
        <Input name="email" type="email" required autoComplete="email" />
      </Label>
      <Label>
        Password
        <Input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </Label>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--text-strong)]">
          I am a
        </legend>
        <input type="hidden" name="accountType" value={accountType} />
        <div className="grid gap-2">
          {ROLES.map((role) => {
            const active = accountType === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setAccountType(role.value)}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-3 text-left transition",
                  active
                    ? "border-[var(--woosh-blue)] bg-[var(--accent-soft)]"
                    : "border-[var(--woosh-border)] bg-white hover:border-[var(--woosh-blue)]/35",
                )}
              >
                <p className="font-semibold text-[var(--text-strong)]">
                  {role.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--woosh-dull)]/70">
                  {role.body}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
        <input
          type="checkbox"
          name="terms"
          required
          className="mt-1 size-4 accent-[var(--woosh-blue)]"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-[var(--woosh-blue)] underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-[var(--woosh-blue)] underline">
            Privacy notice
          </Link>
          .
        </span>
      </label>

      {state.error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Opening your seat…" : "Take the seat"}
      </Button>
      {google || apple ? (
        <p className="text-center text-xs leading-5 text-[var(--text-muted)]">
          Google and Apple create an account and sign you in. Same email as an
          existing user is linked.
        </p>
      ) : null}
      <SocialAuthButtons intent="signup" google={google} apple={apple} />
    </form>
  );
}
