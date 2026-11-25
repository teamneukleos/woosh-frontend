import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import {
  markNotificationsReadAction,
  openNotificationAction,
} from "@/app/actions";
import { listMyNotifications } from "@/domains/identity/notifications";

// Shared row styling: unread rows get a soft blue tint, read rows a neutral hover.
function rowClass(read: boolean) {
  return [
    "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--woosh-blue)]",
    read
      ? "hover:bg-[var(--woosh-navy)]/[0.03]"
      : "bg-[var(--woosh-blue)]/[0.06] hover:bg-[var(--woosh-blue)]/[0.1]",
  ].join(" ");
}

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = await listMyNotifications();

  return (
    <AppPage
      eyebrow="Inbox"
      title="Notifications"
      description="Claim invites, applications, messages, and payment events. Opening one marks it read."
      actions={
        notes.some((note) => !note.readAt) ? (
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
        <Panel className="overflow-hidden p-0">
          <ul className="divide-y divide-[var(--woosh-navy)]/10">
            {notes.map((n) => (
              <li key={n.id}>
                {n.readAt ? (
                  n.href ? (
                    <Link href={n.href} className={rowClass(true)}>
                      <NotificationRow
                        title={n.title}
                        body={n.body}
                        href={n.href}
                        read
                      />
                    </Link>
                  ) : (
                    <div className={rowClass(true)}>
                      <NotificationRow
                        title={n.title}
                        body={n.body}
                        href={n.href}
                        read
                      />
                    </div>
                  )
                ) : (
                  <form action={openNotificationAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="href" value={n.href ?? ""} />
                    <button type="submit" className={rowClass(false)}>
                      <NotificationRow
                        title={n.title}
                        body={n.body}
                        href={n.href}
                        read={false}
                        asOpenHint
                      />
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      ) : (
        <EmptyState
          title="You're all caught up"
          description="New claim invites and application updates will land here."
        />
      )}
    </AppPage>
  );
}

// Content only. The wrapper (link, button or div) is chosen by the caller.
function NotificationRow({
  title,
  body,
  href,
  read,
  asOpenHint = false,
}: {
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  asOpenHint?: boolean;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          read
            ? "bg-[var(--woosh-navy)]/5 text-[var(--woosh-dull)]/60"
            : "bg-[var(--woosh-blue)]/10 text-[var(--woosh-blue)]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block break-words text-[var(--woosh-navy)] ${
            read ? "font-medium" : "font-semibold"
          }`}
        >
          {title}
        </span>
        <span className="mt-0.5 block break-words text-sm text-[var(--woosh-dull)]/70">
          {body}
        </span>
        {asOpenHint ? (
          <span className="mt-1.5 block text-sm font-semibold text-[var(--woosh-blue)]">
            {href ? "Open" : "Mark read"}
          </span>
        ) : null}
      </span>

      {read ? null : (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--woosh-blue)]">
          <span className="sr-only">Unread</span>
        </span>
      )}
    </>
  );
}