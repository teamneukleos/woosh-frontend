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
}: {
  items: ThreadListItem[];
  activeId?: string;
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
        const next = current.map((thread) =>
          thread.id === event.conversationId
            ? {
                ...thread,
                preview: event.message.body,
                when,
                unread: thread.id !== activeId && !event.message.isSystem,
              }
            : thread,
        );
        const hit = next.find((thread) => thread.id === event.conversationId);
        if (!hit) return next;
        return [hit, ...next.filter((thread) => thread.id !== hit.id)];
      });
    },
    onReconnect: () => router.refresh(),
  });

  return <ThreadList items={threads} activeId={activeId} />;
}
