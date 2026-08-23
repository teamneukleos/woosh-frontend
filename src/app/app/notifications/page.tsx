import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EmptyState, Panel } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { markNotificationsReadAction } from "@/app/actions";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notes = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <AppPage
        eyebrow="Inbox"
        title="Notifications"
        description="Claim invites, applications, messages, and payment events."
        actions={
          notes.some((note) => !note.readAt) ? (
            <ActionForm action={markNotificationsReadAction} successTitle="Notifications marked read">
              <Button type="submit" variant="secondary">Mark all read</Button>
            </ActionForm>
          ) : null
        }
    >
      {notes.length ? (
        <ul className="grid gap-3">
          {notes.map((n) => (
            <li key={n.id}>
              <Panel variant={n.readAt ? "default" : "muted"}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="break-words font-semibold text-[var(--woosh-navy)]">
                    {n.title}
                  </p>
                  <p className="mt-1 break-words text-sm text-[var(--woosh-dull)]/70">
                    {n.body}
                  </p>
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="mt-2 inline-block text-sm font-semibold text-[var(--woosh-blue)]"
                    >
                      Open
                    </Link>
                  ) : null}
                </div>
                <Badge tone={n.readAt ? "muted" : "teal"}>
                  {n.readAt ? "Read" : "New"}
                </Badge>
              </div>
              </Panel>
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
