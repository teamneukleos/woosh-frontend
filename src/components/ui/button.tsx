import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "pill";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variants = {
  primary:
    "bg-[var(--woosh-blue)] text-white shadow-[0_2px_8px_rgb(0_58_244_/_0.18)] hover:bg-[#1a4dff] active:bg-[#0030d4]",
  secondary:
    "border border-[var(--woosh-border)] bg-white text-[var(--text-strong)] hover:bg-[var(--surface-sunken)]",
  ghost: "text-[var(--text-strong)] hover:bg-black/[0.04]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[#c40013] active:bg-[#b00011]",
  pill:
    "bg-[var(--woosh-blue)] text-white hover:bg-[#1a4dff] active:bg-[#0030d4]",
};

const sizes = {
  sm: "h-8 px-3 text-[0.8125rem]",
  md: "h-10 px-3.5 text-sm",
  lg: "h-11 px-4 text-sm",
  icon: "size-10 p-0",
};

export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium tracking-[-0.01em] transition-[background-color,opacity,box-shadow] duration-200 ease-out active:translate-y-px focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles(variant, size), className)}
      {...props}
    />
  );
}
