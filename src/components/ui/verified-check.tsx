import { cn } from "@/lib/cn";

const sizes = {
  sm: "size-4",
  md: "size-[1.125rem]",
  lg: "size-6",
} as const;

/** Blue verified mark — sits next to a name, not as a text chip. */
export function VerifiedCheck({
  size = "md",
  className,
  label = "Verified",
}: {
  size?: keyof typeof sizes;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 text-[var(--woosh-blue)]", sizes[size], className)}
      title={label}
    >
      <span className="sr-only">{label}</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-full"
      >
        <path
          fill="currentColor"
          d="M12 2.1 14.6 4l3.05-.35 1.4 2.72 2.72 1.4-.35 3.05L23.9 12l-2.48 2.18.35 3.05-2.72 1.4-1.4 2.72-3.05-.35L12 21.9l-2.18 2.48-3.05.35-1.4-2.72-2.72-1.4.35-3.05L.1 12l2.48-2.18-.35-3.05 2.72-1.4 1.4-2.72L9.4 4 12 2.1Z"
        />
        <path
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.4 12.2 10.3 15l6.3-6.4"
        />
      </svg>
    </span>
  );
}
