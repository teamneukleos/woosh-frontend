import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

export type InboxNotification = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  type: string;
};

export async function listMyNotifications() {
  const rows = await api<
    Array<{
      id: string;
      title: string;
      body: string;
      href: string | null;
      readAt: string | null;
      createdAt: string;
      type: string;
    }>
  >("/notifications");
  return rows.map((row) => ({
    ...row,
    readAt: asDate(row.readAt),
    createdAt: asDate(row.createdAt) ?? new Date(),
  })) satisfies InboxNotification[];
}

export async function markNotificationsRead(_userId?: string, ids?: string[]) {
  return api("/notifications/read", {
    method: "POST",
    body: ids?.length ? { ids } : {},
  });
}

export async function countUnreadNotifications() {
  const result = await api<{ unread: number }>("/notifications/unread-count");
  return result.unread;
}
