import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Minimal indicator shown in the conversation panel while a thread (?c=) is fetched.
 * A small, thin spinning ring with a transparent centre; it holds still under
 * prefers-reduced-motion. Below lg the inbox is hidden, so a back link stays available.
 */
export function ThreadLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="relative flex flex-1 items-center justify-center p-8"
    >
      <span className="sr-only">Loading conversation…</span>
      <Link
        href="/app/messages"
        aria-label="Back to inbox"
        className="absolute left-3 top-3 grid size-9 place-items-center rounded-full text-[var(--text-strong)] transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-none sm:left-4 lg:hidden"
      >
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
      <span
        aria-hidden="true"
        className="size-[18px] animate-spin rounded-full border-2 border-[var(--woosh-border)] border-t-[var(--woosh-blue)] motion-reduce:animate-none"
      />
    </div>
  );
}
