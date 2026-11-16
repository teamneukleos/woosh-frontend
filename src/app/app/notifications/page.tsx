import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import {
  markNotificationsReadAction,
  openNotificationAction,
} from "@/app/actions";
import { listMyNotifications } from "@/domains/identity/notifications";

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
        <ul className="grid gap-3">
          {notes.map((n) => (
            <li key={n.id}>
              {n.readAt ? (
                <NotificationCard
                  title={n.title}
                  body={n.body}
                  href={n.href}
                  read
                />
              ) : (
                <form action={openNotificationAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <input type="hidden" name="href" value={n.href ?? ""} />
                  <button type="submit" className="w-full text-left">
                    <NotificationCard
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
      ) : (
        <EmptyState
          title="You're all caught up"
          description="New claim invites and application updates will land here."
        />
      )}
    </AppPage>
  );
}

function NotificationCard({
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
    <Panel variant={read ? "default" : "muted"}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words font-semibold text-[var(--woosh-navy)]">
            {title}
          </p>
          <p className="mt-1 break-words text-sm text-[var(--woosh-dull)]/70">
            {body}
          </p>
          {href && read ? (
            <Link
              href={href}
              className="mt-2 inline-block text-sm font-semibold text-[var(--woosh-blue)]"
            >
              Open
            </Link>
          ) : null}
          {asOpenHint ? (
            <p className="mt-2 text-sm font-semibold text-[var(--woosh-blue)]">
              {href ? "Open" : "Mark read"}
            </p>
          ) : null}
        </div>
        <Badge tone={read ? "muted" : "teal"}>{read ? "Read" : "New"}</Badge>
      </div>
    </Panel>
  );
}
