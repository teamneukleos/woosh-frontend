import { redirect } from "next/navigation";
import { Bell, ChevronRight, type LucideIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { markNotificationsReadAction } from "@/app/actions";
import { listMyNotifications } from "@/domains/identity/notifications";

/* ─────────────────────────────────────────────────────────────────────────────
   Icon system (same as the rest of the dashboard)
   - Thin strokes, icons sit directly on the surface, chevrons for navigation.
   ───────────────────────────────────────────────────────────────────────────── */

const STROKE = { light: 1.25, regular: 1.5 } as const;

function Glyph({
  icon: Icon,
  size = 18,
  weight = "regular",
  className = "",
}: {
  icon: LucideIcon;
  size?: number;
  weight?: keyof typeof STROKE;
  className?: string;
}) {
  return (
    <Icon
      size={size}
      strokeWidth={STROKE[weight]}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = await listMyNotifications();
  const unreadCount = notes.filter((note) => !note.readAt).length;

  return (
    <AppPage
      eyebrow="Inbox"
      title="Notifications"
      description="Claim invites, applications, messages, and payment events."
      width="wide"
      className="w-full max-w-none"
      actions={
        unreadCount > 0 ? (
          <ActionForm
            action={markNotificationsReadAction}
            successTitle="Notifications marked read"
          >
            <Button type="submit" variant="secondary">
              Mark all read
            </Button>
          </ActionForm>
        ) : null
      }
    >
      {notes.length ? (
        /* One feed with hairline dividers, like the X notifications timeline.
           Unread items are tinted, and the whole row opens its link. */
        <section
          aria-label="All notifications"
          className="w-full overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--woosh-border)] px-5 py-4 sm:px-6">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-base font-semibold text-[var(--woosh-navy)]">
                All notifications
              </h2>
              <span className="text-sm tabular-nums text-[var(--text-secondary)]">
                {notes.length}
              </span>
            </div>

            {unreadCount > 0 ? (
              <div className="flex items-center gap-2 rounded-full bg-[var(--woosh-blue)]/[0.07] px-3 py-1.5">
                <span className="size-2 rounded-full bg-[var(--woosh-blue)]" />
                <span className="text-xs font-semibold tabular-nums text-[var(--woosh-blue)]">
                  {unreadCount} unread
                </span>
              </div>
            ) : (
              <Badge tone="muted">All caught up</Badge>
            )}
          </div>

          <ul className="divide-y divide-[var(--woosh-border)]">
            {notes.map((n) => {
              const rowClass = `group flex items-start gap-4 px-5 py-4 transition-colors sm:px-6 sm:py-5 ${
                n.readAt
                  ? "bg-white hover:bg-[#faf9f7]"
                  : "bg-[var(--woosh-blue)]/[0.04] hover:bg-[var(--woosh-blue)]/[0.07]"
              }`;

              const content = (
                <>
                  <Glyph
                    icon={Bell}
                    size={20}
                    className={`mt-0.5 ${
                      n.readAt
                        ? "text-[var(--text-muted)]"
                        : "text-[var(--woosh-blue)]"
                    }`}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`break-words text-sm leading-6 text-[var(--woosh-navy)] sm:text-base ${
                          n.readAt ? "font-medium" : "font-semibold"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.readAt ? <Badge tone="teal">New</Badge> : null}
                    </div>

                    <p className="mt-1 break-words text-sm leading-6 text-[var(--text-secondary)]">
                      {n.body}
                    </p>
                  </div>

                  {n.href ? (
                    <Glyph
                      icon={ChevronRight}
                      size={18}
                      className="mt-1 text-[#c2c4c9] transition group-hover:translate-x-0.5 group-hover:text-[var(--woosh-blue)]"
                    />
                  ) : null}
                </>
              );

              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      className={`${rowClass} outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woosh-blue)]`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className={rowClass}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <EmptyState
          title="You're all caught up"
          description="New claim invites and application updates will land here."
        />
      )}
    </AppPage>
  );
}