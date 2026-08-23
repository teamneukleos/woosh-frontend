import Link from "next/link";
import { cn } from "@/lib/cn";

export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-semibold text-[var(--woosh-blue)] transition hover:text-[var(--woosh-navy)]",
        className,
      )}
    >
      <span aria-hidden>←</span>
      {children}
    </Link>
  );
}
