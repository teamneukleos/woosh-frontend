import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

type NestThread = {
  id: string;
  type: string;
  title: string;
  lastMessage: {
    body: string;
    createdAt: string | Date;
    isSystem: boolean;
  } | null;
};

type NestConversation = {
  id: string;
  type: string;
  title: string;
  messages: Array<{
    id: string;
    body: string;
    isSystem: boolean;
    senderUserId: string | null;
    createdAt: string | Date;
    readAt: string | Date | null;
  }>;
};

export async function ensureApplicationConversation(_applicationId: string) {
  return { id: "" };
}

export async function listConversations(_userId?: string) {
  const rows = await api<NestThread[]>("/conversations");
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    application: null,
    campaign: null,
    brand: null,
    creator: null,
    messages: row.lastMessage
      ? [
          {
            body: row.lastMessage.body,
            createdAt: asDate(row.lastMessage.createdAt) ?? new Date(),
            isSystem: row.lastMessage.isSystem,
            senderUserId: "",
            readAt: null,
          },
        ]
      : [],
  }));
}

export async function getConversation(id: string, _actorUserId?: string) {
  const conversation = await api<NestConversation>(`/conversations/${id}`);
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    application: null,
    campaign: null,
    brand: null,
    creator: null,
    messages: conversation.messages.map((message) => ({
      ...message,
      createdAt: asDate(message.createdAt) ?? new Date(),
      readAt: asDate(message.readAt),
    })),
  };
}

export async function sendMessage(input: {
  conversationId: string;
  senderUserId: string;
  body: string;
}) {
  return api(`/conversations/${input.conversationId}/messages`, {
    method: "POST",
    body: { body: input.body },
  });
}
