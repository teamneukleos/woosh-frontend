
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageSquare } from "lucide-react";
import { auth } from "@/lib/auth";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  getConversation,
  listConversations,
} from "@/domains/messaging/threads";
import {
  conversationCounterpart,
  conversationKindLabel,
  conversationTitle,
  conversationWorkHref,
  formatMessageTime,
} from "@/domains/messaging/presentation";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { LiveInbox } from "@/components/messages/live-inbox";
import { LiveThread } from "@/components/messages/live-thread";
import { MessageComposer } from "@/components/messages/message-composer";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  const workspace = await getWorkspaceContext(userId);
  const viewerIsCreator = workspace?.kind === "creator";
  const { c } = await searchParams;
  const conversations = await listConversations(userId);
  const activeId = c || conversations[0]?.id;
  const active = activeId
    ? await getConversation(activeId, userId)
    : null;

  const threads = conversations.map((conversation) => {
    const last = conversation.messages[0];
    const unread = Boolean(
      last &&
        !last.isSystem &&
        last.senderUserId !== userId &&
        !last.readAt,
    );
    return {
      id: conversation.id,
      title: conversationTitle(conversation),
      counterpart: conversationCounterpart(conversation, viewerIsCreator),
      kindLabel: conversationKindLabel[conversation.type] ?? conversation.type,
      preview: last?.body || "No messages yet",
      when: last ? formatMessageTime(last.createdAt) : "",
      unread,
    };
  });

  const activeTitle = active ? conversationTitle(active) : "Conversation";
  const counterpart = active
    ? conversationCounterpart(active, viewerIsCreator)
    : "Conversation";
  const workHref = active
    ? conversationWorkHref(active, viewerIsCreator)
    : null;
  const kindLabel = active
    ? (conversationKindLabel[active.type] ?? active.type)
    : null;

  return (
    <AppPage
      eyebrow="Inbox"
      title="Messages"
      description="The conversation lives on the work — not a disappearing chat."
      className="gap-5"
    >
      <div
        className={cn(
          "grid min-h-[min(40rem,calc(100dvh-11rem))] overflow-hidden rounded-2xl border border-[var(--woosh-border)] bg-[var(--woosh-surface)] shadow-[var(--shadow-soft)] md:min-h-[calc(100dvh-11rem)] lg:grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "min-h-0 flex-col border-[var(--woosh-border)] bg-white lg:border-r",
            c ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--woosh-border)] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-[var(--woosh-navy)]">
                Inbox
              </p>
              <p className="mt-1 text-xs text-[var(--woosh-grey)]">
                {threads.length} {threads.length === 1 ? "thread" : "threads"}
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--woosh-mist)] text-[var(--woosh-navy)]">
              <MessageSquare className="size-4" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <LiveInbox items={threads} activeId={activeId} />
          </div>
        </aside>

        <section
          className={cn(
            "min-h-0 flex-col bg-[var(--surface-base)]",
            c ? "flex" : "hidden lg:flex",
          )}
        >
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-[var(--woosh-border)] bg-white px-4 py-4 sm:px-6">
                <Link
                  href="/app/messages"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--woosh-border)] text-[var(--woosh-navy)] transition hover:border-[var(--woosh-blue)]/30 hover:bg-[var(--woosh-mist)] lg:hidden"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </Link>

                <Avatar name={counterpart} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-[var(--woosh-navy)]">
                      {activeTitle}
                    </h2>
                    {kindLabel ? (
                      <Badge tone="muted" className="shrink-0">
                        {kindLabel}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-xs text-[var(--woosh-grey)]">
                    {counterpart}
                  </p>
                </div>

                {workHref ? (
                  <Link
                    href={workHref}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--woosh-border)] px-3 py-2 text-xs font-semibold text-[var(--woosh-blue)] transition hover:border-[var(--woosh-blue)]/30 hover:bg-[var(--accent-soft)]"
                  >
                    Open work
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ) : null}
              </header>

              <div className="flex min-h-0 flex-1 flex-col">
                <LiveThread
                  conversationId={active.id}
                  currentUserId={userId}
                  initialMessages={active.messages.map((message) => ({
                    id: message.id,
                    body: message.body,
                    senderUserId: message.senderUserId,
                    isSystem: message.isSystem,
                    createdAt: message.createdAt,
                  }))}
                />
                <MessageComposer conversationId={active.id} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState
                title="Select a conversation"
                description="Applications, invites, and campaigns open a thread here."
                action={
                  <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <MessageSquare className="size-4" aria-hidden="true" />
                    Waiting on the first brief
                  </span>
                }
              />
            </div>
          )}
        </section>
      </div>
    </AppPage>
  );
}
