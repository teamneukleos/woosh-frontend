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
import { ThreadList } from "@/components/messages/thread-list";
import { MessageBubbles } from "@/components/messages/message-bubbles";
import { MessageComposer } from "@/components/messages/message-composer";
import { ThreadScroller } from "@/components/messages/thread-scroller";

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
      className="gap-4"
    >
      <div
        className={cn(
          "grid min-h-[min(36rem,calc(100dvh-12rem))] overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white md:min-h-[calc(100dvh-10rem)] lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]",
        )}
      >
        <aside
          className={cn(
            "min-h-0 flex-col border-[var(--woosh-border)] lg:border-r",
            c ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--woosh-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text-strong)]">
              Inbox
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {threads.length} {threads.length === 1 ? "thread" : "threads"}
            </p>
          </div>
          <ThreadList items={threads} activeId={activeId} />
        </aside>

        <section
          className={cn(
            "min-h-0 flex-col bg-[var(--surface-sunken)]/70",
            c ? "flex" : "hidden lg:flex",
          )}
        >
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-[var(--woosh-border)] bg-white px-3 py-3 sm:px-4">
                <Link
                  href="/app/messages"
                  className="grid size-9 place-items-center rounded-full text-[var(--text-strong)] hover:bg-[var(--surface-sunken)] lg:hidden"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </Link>
                <Avatar name={counterpart} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-[var(--text-strong)]">
                      {activeTitle}
                    </h2>
                    {kindLabel ? (
                      <Badge tone="muted" className="shrink-0">
                        {kindLabel}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {counterpart}
                  </p>
                </div>
                {workHref ? (
                  <Link
                    href={workHref}
                    className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-control)] px-2 py-1.5 text-xs font-medium text-[var(--woosh-blue)] hover:bg-[var(--accent-soft)]"
                  >
                    Open work
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ) : null}
              </header>
              <ThreadScroller>
                <MessageBubbles
                  currentUserId={userId}
                  messages={active.messages.map((message) => ({
                    id: message.id,
                    body: message.body,
                    senderUserId: message.senderUserId,
                    isSystem: message.isSystem,
                    createdAt: message.createdAt,
                  }))}
                />
              </ThreadScroller>
              <MessageComposer conversationId={active.id} />
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
