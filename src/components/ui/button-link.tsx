import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  Button,
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button";

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonStyles(variant, size),
        className,
      )}
      {...props}
    />
  );
}

export { Button };
