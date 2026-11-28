import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react";
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
  threadViewerSide,
  type ThreadViewerSide,
} from "@/domains/messaging/presentation";
import { EmptyState } from "@/components/ui/panel";
import { AppPage } from "@/components/ui/app-page";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { LiveInbox } from "@/components/messages/live-inbox";
import { LiveThread } from "@/components/messages/live-thread";
import { MessageComposer } from "@/components/messages/message-composer";
import { ThreadLoading } from "@/components/messages/thread-loading";

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

/** Shown in the conversation panel when the requested thread is unavailable. */
function ConversationNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <EmptyState
        title="Conversation not found"
        description="It may have been removed, or you may not have access to it."
        action={
          <Link
            href="/app/messages"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-[var(--woosh-blue)]"
          >
            <Glyph
              icon={ArrowLeft}
              size={16}
              className="transition group-hover:-translate-x-0.5"
            />
            Back to inbox
          </Link>
        }
      />
    </div>
  );
}

/**
 * The open conversation (?c=). Rendered inside a Suspense boundary keyed by the
 * conversation id, so ThreadLoading shows in this panel while it is fetched and the
 * inbox beside it stays on screen.
 */
async function ActiveConversation({
  id,
  userId,
  viewerIsCreator,
  viewerSide,
}: {
  id: string;
  userId: string;
  viewerIsCreator: boolean;
  viewerSide: ThreadViewerSide;
}) {
  const active = await getConversation(id, userId);
  if (!active) return <ConversationNotFound />;

  const activeTitle = conversationTitle(active);
  const counterpart = conversationCounterpart(active, viewerIsCreator);
  const workHref = conversationWorkHref(active, viewerIsCreator);
  const kindLabel = conversationKindLabel[active.type] ?? active.type;

  return (
    <>
      <header className="flex items-center gap-3 border-b border-[var(--woosh-border)] bg-white px-3 py-3 sm:px-4">
        <Link
          href="/app/messages"
          title="Back to inbox (Esc)"
          className="grid size-9 shrink-0 place-items-center rounded-full text-[var(--text-strong)] transition-colors hover:bg-[var(--surface-sunken)] focus-visible:outline-none focus-visible:bg-[var(--surface-sunken)]"
          aria-label="Back to inbox"
        >
          <Glyph icon={ArrowLeft} size={18} />
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
            className="group inline-flex shrink-0 items-center gap-0.5 rounded-[var(--radius-control)] px-2.5 py-1.5 text-xs font-medium text-[var(--woosh-blue)] transition-colors hover:bg-[var(--accent-soft)]"
          >
            Open work
            <Glyph
              icon={ChevronRight}
              size={14}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </header>
      <LiveThread
        conversationId={active.id}
        currentUserId={userId}
        initialMessages={active.messages.map((message) => ({
          id: message.id,
          body: message.body,
          senderUserId: message.senderUserId,
          isSystem: message.isSystem,
          createdAt: message.createdAt,
          offer: message.offer ?? null,
        }))}
        viewerSide={viewerSide}
      />
      <MessageComposer conversationId={active.id} />
    </>
  );
}

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
  const activeId = c;

  const conversations = await listConversations(userId);

  const threads = conversations.map((conversation) => {
    const last = conversation.messages[0];

    return {
      id: conversation.id,
      title: conversationTitle(conversation),
      counterpart: conversationCounterpart(conversation, viewerIsCreator),
      kindLabel: conversationKindLabel[conversation.type] ?? conversation.type,
      preview: last?.body || "No messages yet",
      when: last ? formatMessageTime(last.createdAt) : "",
      unread: conversation.unreadCount > 0,
    };
  });

  return (
    <AppPage
      eyebrow="Inbox"
      title="Messages"
      description="The conversation lives on the work — not a disappearing chat."
      width="wide"
      className="w-full max-w-none gap-4"
    >

      <div
        className={cn(
          "grid min-h-[min(36rem,calc(100dvh-12rem))] overflow-hidden rounded-[var(--radius-surface)] border border-[var(--woosh-border)] bg-white shadow-[var(--shadow-soft)] md:min-h-[calc(100dvh-10rem)]",
          c
            ? "lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]"
            : "grid-cols-1",2
        )}
      >
        <aside
          className={cn(
            "min-h-0 flex-col border-[var(--woosh-border)] bg-white lg:border-r",
            c ? "hidden lg:flex" : "flex lg:border-r-0",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--woosh-border)] px-4 py-3 sm:px-5">
            <p className="text-sm font-semibold text-[var(--text-strong)]">
              Inbox
            </p>
            <p className="text-xs tabular-nums text-[var(--text-muted)]">
              {threads.length} {threads.length === 1 ? "thread" : "threads"}
            </p>
          </div>
          <LiveInbox
            items={threads}
            activeId={activeId}
            currentUserId={userId}
          />        
        </aside>

        <section
          className={cn(
            "min-h-0 flex-col bg-[var(--surface-sunken)]/70",
            c ? "flex" : "hidden",
          )}
        >
          {c ? (
            <Suspense key={c} fallback={<ThreadLoading />}>
              <ActiveConversation
                id={c}
                userId={userId}
                viewerIsCreator={viewerIsCreator}
                viewerSide={threadViewerSide(workspace?.kind)}
              />
            </Suspense>
          ) : (
            <ConversationNotFound />
          )}
        </section>
      </div>
    </AppPage>
  );
}