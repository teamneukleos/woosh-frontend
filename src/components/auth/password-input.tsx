"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { PASSWORD_HINT, PASSWORD_PATTERN_HTML } from "@/lib/password";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  enforceComplexity?: boolean;
};

export function PasswordInput({
  className,
  enforceComplexity = false,
  title,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        minLength={props.minLength ?? 8}
        maxLength={props.maxLength ?? 128}
        pattern={enforceComplexity ? PASSWORD_PATTERN_HTML : props.pattern}
        title={
          title ?? (enforceComplexity ? PASSWORD_HINT : undefined)
        }
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
  );
}
