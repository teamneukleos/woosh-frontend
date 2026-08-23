import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

export function Icon({
  icon: Lucide,
  className,
  strokeWidth = 1.75,
  ...props
}: LucideProps & { icon: LucideIcon }) {
  return (
    <Lucide
      aria-hidden="true"
      strokeWidth={strokeWidth}
      className={cn("size-[1.15rem] shrink-0", className)}
      {...props}
    />
  );
}
