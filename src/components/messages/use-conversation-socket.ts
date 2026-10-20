"use client";

import { useEffect, useRef } from "react";
import { getSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { nestSocketOrigin, type RealtimeMessageEvent } from "@/lib/socket";

export function useConversationSocket({
  conversationIds,
  onMessage,
  onReconnect,
}: {
  conversationIds: string[];
  onMessage: (event: RealtimeMessageEvent) => void;
  onReconnect?: () => void;
}) {
  const onMessageRef = useRef(onMessage);
  const onReconnectRef = useRef(onReconnect);
  onMessageRef.current = onMessage;
  onReconnectRef.current = onReconnect;
  const idsKey = conversationIds.join(",");

  useEffect(() => {
    const ids = idsKey.split(",").filter(Boolean);
    let socket: Socket | null = null;
    let cancelled = false;
    let sawConnect = false;

    async function connect() {
      const session = await getSession();
      if (cancelled || !session?.accessToken) return;
      socket = io(`${nestSocketOrigin()}/realtime`, {
        path: "/socket.io",
        auth: { token: session.accessToken },
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
      socket.on("connect", () => {
        for (const id of ids) socket?.emit("conversation:join", id);
        if (sawConnect) onReconnectRef.current?.();
        sawConnect = true;
      });
      socket.on("message.new", (event: RealtimeMessageEvent) => {
        onMessageRef.current(event);
      });
      socket.on("connect_error", async () => {
        const next = await getSession();
        if (next?.accessToken && socket) {
          socket.auth = { token: next.accessToken };
        }
      });
    }

    void connect();
    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [idsKey]);
}
