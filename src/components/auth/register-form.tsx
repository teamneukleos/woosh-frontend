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
import { PasswordInput } from "@/components/auth/password-input";
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
    body: "Every client. Their own wallet. The money never mixes.",
  },
  {
    value: "creator",
    title: "Creator",
    body: "Claim the handle. Connect the apps. Get paid. We take 0%.",
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
  const params = useSearchParams();
  const [state, action, pending] = useActionState(registerUser, initial);
  const invite = params.get("invite") ?? "";
  const invitedEmail = params.get("email")?.trim() ?? "";
  const typeParam = params.get("type");
  const plan = params.get("plan") ?? "";
  const joiningTeam = Boolean(invite);
  const [accountType, setAccountType] = useState<(typeof ROLES)[number]["value"]>(
    typeParam === "agency" || typeParam === "creator" || typeParam === "brand"
      ? typeParam
      : "brand",
  );

  useEffect(() => {
    if (!state.ok) return;
    const next = new URLSearchParams();
    if (invitedEmail) next.set("email", invitedEmail);
    if (invite) {
      next.set("joined", "1");
      next.set("callbackUrl", "/app");
    } else {
      next.set("registered", "1");
    }
    router.push(`/login?${next.toString()}`);
  }, [state.ok, router, invite, invitedEmail]);

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}
      {plan ? <input type="hidden" name="plan" value={plan} /> : null}
      <Label>
        Full name
        <Input name="name" required autoComplete="name" />
      </Label>
      <Label>
        Email
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={invitedEmail}
          readOnly={joiningTeam && Boolean(invitedEmail)}
        />
      </Label>
      {joiningTeam ? (
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          This invite is for a teammate seat. You will join the organisation that
          invited you — not start a new brand, agency, or creator account.
        </p>
      ) : null}
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="register-password">Password</Label>
        <PasswordInput
          id="register-password"
          name="password"
          required
          autoComplete="new-password"
          enforceComplexity
          showRequirements
          onInput={(event) => {
            const form = event.currentTarget.form;
            const confirm = form?.elements.namedItem("confirmPassword");
            if (confirm instanceof HTMLInputElement) {
              confirm.setCustomValidity(
                confirm.value && confirm.value !== event.currentTarget.value
                  ? "Passwords do not match."
                  : "",
              );
            }
          }}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="register-password-confirm">Confirm password</Label>
        <PasswordInput
          id="register-password-confirm"
          name="confirmPassword"
          required
          autoComplete="new-password"
          onInput={(event) => {
            const form = event.currentTarget.form;
            const password = form?.elements.namedItem("password");
            const value =
              password instanceof HTMLInputElement ? password.value : "";
            event.currentTarget.setCustomValidity(
              event.currentTarget.value !== value
                ? "Passwords do not match."
                : "",
            );
          }}
        />
      </div>

      {joiningTeam ? null : (
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
      )}

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
        {pending
          ? joiningTeam
            ? "Joining…"
            : "Opening your seat…"
          : joiningTeam
            ? "Join the team"
            : "Take the seat"}
      </Button>
      {joiningTeam ? null : google || apple ? (
        <p className="text-center text-xs leading-5 text-[var(--text-muted)]">
          Google and Apple create an account and sign you in. Same email as an
          existing user is linked.
        </p>
      ) : null}
      {joiningTeam ? null : (
        <SocialAuthButtons intent="signup" google={google} apple={apple} />
      )}
    </form>
  );
}
