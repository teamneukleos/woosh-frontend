
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ThreadList,
  type ThreadListItem,
} from "@/components/messages/thread-list";
import { useConversationSocket } from "@/components/messages/use-conversation-socket";
import { formatMessageTime } from "@/domains/messaging/presentation";

export function LiveInbox({
  items,
  activeId,
  currentUserId,
}: {
  items: ThreadListItem[];
  activeId?: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [threads, setThreads] = useState(items);

  useEffect(() => {
    setThreads(items);
  }, [items]);

  useConversationSocket({
    conversationIds: items.map((item) => item.id),
    onMessage: (event) => {
      const when = formatMessageTime(new Date(event.message.createdAt));

      setThreads((current) => {
        const next = current.map((thread) => {
          if (thread.id !== event.conversationId) return thread;

          const incomingFromOtherUser =
            !event.message.isSystem &&
            event.message.senderUserId !== null &&
            event.message.senderUserId !== currentUserId;

          return {
            ...thread,
            preview: event.message.body,
            when,
            unread:
              thread.id === activeId
                ? false
                : incomingFromOtherUser
                  ? true
                  : thread.unread,
          };
        });

        const hit = next.find(
          (thread) => thread.id === event.conversationId,
        );

        if (!hit) return next;

        return [hit, ...next.filter((thread) => thread.id !== hit.id)];
      });
    },
    onReconnect: () => router.refresh(),
  });

  return <ThreadList items={threads} activeId={activeId} />;
}
