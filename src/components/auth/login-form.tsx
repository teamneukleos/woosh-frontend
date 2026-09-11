"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Input, Label } from "@/components/ui/field";
import {
  requestPasswordResetAction,
  requestVerificationAction,
  resetPasswordAction,
} from "@/app/actions";

const initialRecoveryState = { ok: false, message: "" };

export function LoginForm({
  google = true,
  apple = true,
}: {
  google?: boolean;
  apple?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const registered = params.get("registered") === "1";
  const joined = params.get("joined") === "1";
  const verify = params.get("verify");
  const reset = params.get("reset");
  const oauthError = params.get("error");

  if (reset && reset !== "done") {
    return (
      <ResetPasswordForm
        token={reset}
        email={params.get("email") ?? ""}
      />
    );
  }
  if (params.get("forgot") === "1") return <ForgotPasswordForm />;
  if (verify === "resend") return <VerificationRequestForm />;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setPending(false);
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    const callback = params.get("callbackUrl") || "/app";
    router.push(callback.startsWith("/") ? callback : "/app");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      {joined ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--text-strong)]">
          You&apos;re on the team. Sign in to open the workspace.
        </p>
      ) : null}
      {registered ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--text-strong)]">
          Account created. Check your inbox and verify your email before signing in.
        </p>
      ) : null}
      {verify === "ok" ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
          Email verified. You can now sign in.
        </p>
      ) : null}
      {verify === "invalid" ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          That verification link is invalid or expired. Request a new one below.
        </p>
      ) : null}
      {reset === "done" ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
          Password updated. Sign in with your new password.
        </p>
      ) : null}
      {oauthError ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          Google or Apple sign-in failed. Check that the provider is configured, then try again.
        </p>
      ) : null}
      <Label>
        Email
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={params.get("email") ?? ""}
        />
      </Label>
      <Label>
        Password
        <Input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="current-password"
        />
      </Label>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <SocialAuthButtons intent="signin" google={google} apple={apple} />
      <div className="flex flex-wrap justify-between gap-3 text-sm">
        <Link
          href="/login?forgot=1"
          className="font-medium text-[var(--woosh-blue)] hover:underline"
        >
          Forgot password?
        </Link>
        <Link
          href="/login?verify=resend"
          className="font-medium text-[var(--woosh-blue)] hover:underline"
        >
          Resend verification
        </Link>
      </div>
    </form>
  );
}

function RecoveryHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[var(--text-strong)]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}

function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialRecoveryState,
  );
  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <RecoveryHeader
        title="Reset your password"
        description="Enter your account email and we’ll send a secure one-hour reset link."
      />
      <Label>
        Email
        <Input name="email" type="email" required autoComplete="email" />
      </Label>
      {state.message ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]" role="status">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <BackToSignIn />
    </form>
  );
}

function VerificationRequestForm() {
  const [state, action, pending] = useActionState(
    requestVerificationAction,
    initialRecoveryState,
  );
  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <RecoveryHeader
        title="Resend verification"
        description="We’ll send a fresh verification link if this account is still pending."
      />
      <Label>
        Email
        <Input name="email" type="email" required autoComplete="email" />
      </Label>
      {state.message ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]" role="status">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send verification link"}
      </Button>
      <BackToSignIn />
    </form>
  );
}

function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialRecoveryState,
  );
  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <RecoveryHeader
        title="Choose a new password"
        description="Use at least eight characters. This link can only be used once."
      />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <Label>
        New password
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
        />
      </Label>
      {state.message ? (
        <p className="rounded-[var(--radius-control)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
      <BackToSignIn />
    </form>
  );
}

function BackToSignIn() {
  return (
    <Link
      href="/login"
      className="text-center text-sm font-medium text-[var(--woosh-blue)] hover:underline"
    >
      Back to sign in
    </Link>
  );
}
