"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageBubbles,
  type BubbleMessage,
} from "@/components/messages/message-bubbles";
import { ThreadScroller } from "@/components/messages/thread-scroller";
import { useConversationSocket } from "@/components/messages/use-conversation-socket";
import type { RealtimeMessageEvent } from "@/lib/socket";

function asDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function toBubble(message: RealtimeMessageEvent["message"]): BubbleMessage {
  return {
    id: message.id,
    body: message.body,
    senderUserId: message.senderUserId,
    isSystem: message.isSystem,
    createdAt: asDate(message.createdAt),
  };
}

function mergeMessage(list: BubbleMessage[], incoming: BubbleMessage) {
  if (list.some((row) => row.id === incoming.id)) return list;
  return [...list, incoming];
}

export function LiveThread({
  conversationId,
  currentUserId,
  initialMessages,
  joinIds,
  variant = "inbox",
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Array<Omit<BubbleMessage, "createdAt"> & { createdAt: string | Date }>;
  joinIds?: string[];
  variant?: "inbox" | "campaign";
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(() =>
    initialMessages.map((row) => ({ ...row, createdAt: asDate(row.createdAt) })),
  );
  const initialKey = initialMessages.map((row) => row.id).join(",");

  useEffect(() => {
    setMessages(
      initialMessages.map((row) => ({ ...row, createdAt: asDate(row.createdAt) })),
    );
    // Message identity is tracked in initialKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, initialKey]);

  useConversationSocket({
    conversationIds: [conversationId, ...(joinIds ?? [])],
    onMessage: (event) => {
      if (event.conversationId !== conversationId) return;
      setMessages((current) => mergeMessage(current, toBubble(event.message)));
    },
    onReconnect: () => router.refresh(),
  });

  const bubbles = (
    <MessageBubbles currentUserId={currentUserId} messages={messages} />
  );

  if (variant === "campaign") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface-sunken)]/70 px-4 py-4">
        {bubbles}
      </div>
    );
  }

  return <ThreadScroller>{bubbles}</ThreadScroller>;
}
