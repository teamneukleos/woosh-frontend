import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageSize,
  total,
  hrefForPage,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-between gap-3", className)}
      aria-label="Pagination"
    >
      <p className="text-sm text-[var(--woosh-dull)]/70">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefForPage(page - 1)}>
            <Button type="button" variant="secondary" size="sm">
              Previous
            </Button>
          </Link>
        ) : (
          <Button type="button" variant="secondary" size="sm" disabled>
            Previous
          </Button>
        )}
        {page < pages ? (
          <Link href={hrefForPage(page + 1)}>
            <Button type="button" variant="secondary" size="sm">
              Next
            </Button>
          </Link>
        ) : (
          <Button type="button" variant="secondary" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}
