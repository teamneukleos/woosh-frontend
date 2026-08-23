import { cn } from "@/lib/cn";
import { cartoonAvatar } from "@/lib/cartoon-avatar";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const photo = src || cartoonAvatar(name);
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo}
      alt={name}
      className={cn(
        "rounded-full object-cover object-center ring-2 ring-white",
        sizes[size],
        className,
      )}
    />
  );
}
