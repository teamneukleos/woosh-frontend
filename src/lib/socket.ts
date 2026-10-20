export type RealtimeMessageEvent = {
  conversationId: string;
  message: {
    id: string;
    body: string;
    isSystem: boolean;
    senderUserId: string | null;
    createdAt: string | Date;
    readAt: string | Date | null;
  };
};

/** Nest HTTP origin without the `/api` prefix (Socket.IO is not under the REST prefix). */
export function nestSocketOrigin() {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_WS_URL?.trim() ||
    "http://localhost:4000/api"
  ).replace(/\/$/, "");
  return raw.replace(/\/api$/i, "") || "http://localhost:4000";
}
