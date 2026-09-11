import { api } from "@/lib/api";

export async function shortlist(applicationId: string, _actorId?: string) {
  return api(`/applications/${applicationId}/shortlist`, { method: "POST" });
}

export async function decline(applicationId: string, _actorId?: string) {
  return api(`/applications/${applicationId}/decline`, { method: "POST" });
}

export async function acceptApplication(applicationId: string, _actorId?: string) {
  return api(`/applications/${applicationId}/accept`, { method: "POST" });
}
