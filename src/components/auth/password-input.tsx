"use client";

import { useState } from "react";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import {
  PASSWORD_HINT,
  PASSWORD_PATTERN_HTML,
  passwordRuleStatus,
} from "@/lib/password";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  enforceComplexity?: boolean;
  showRequirements?: boolean;
};

export function PasswordInput({
  className,
  enforceComplexity = false,
  showRequirements = false,
  title,
  onInput,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(
    typeof props.defaultValue === "string" ? props.defaultValue : "",
  );

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="relative">
        <Input
          {...props}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          minLength={props.minLength ?? 8}
          maxLength={props.maxLength ?? 128}
          pattern={enforceComplexity ? PASSWORD_PATTERN_HTML : props.pattern}
          title={title ?? (enforceComplexity ? PASSWORD_HINT : undefined)}
          onInput={(event) => {
            setValue(event.currentTarget.value);
            onInput?.(event);
          }}
        />
        <button
          type="button"
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-secondary)] hover:bg-black/[0.04] hover:text-[var(--text-strong)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((open) => !open)}
        >
          <Icon icon={visible ? EyeOff : Eye} />
        </button>
      </div>
      {showRequirements ? <PasswordRequirements value={value} /> : null}
    </div>
  );
}

function PasswordRequirements({ value }: { value: string }) {
  const rules = passwordRuleStatus(value);

  return (
    <ul className="grid gap-1" aria-live="polite">
      {rules.map((rule) => (
        <li
          key={rule.id}
          className={cn(
            "flex items-center gap-1.5 text-xs leading-5",
            rule.met
              ? "text-[var(--success)]"
              : "text-[var(--text-muted)]",
          )}
        >
          <Icon
            icon={rule.met ? Check : Circle}
            className="size-3.5"
            strokeWidth={rule.met ? 2.5 : 1.75}
          />
          <span>
            {rule.label}
            <span className="sr-only">
              {rule.met ? " met" : " not met yet"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
