import { api } from "@/lib/api";
import { asDate } from "@/lib/nest";

export async function listFailedWebhookEvents() {
  const rows = await api<
    Array<{
      id: string;
      eventType: string;
      reference: string | null;
      error: string | null;
      createdAt: string;
    }>
  >("/admin/webhooks/failed");
  return rows.map((row) => ({
    ...row,
    createdAt: asDate(row.createdAt) ?? new Date(),
  }));
}

export async function replayPaystackWebhook(id: string, _actorUserId: string) {
  return api(`/admin/webhooks/${id}/replay`, { method: "POST" });
}
