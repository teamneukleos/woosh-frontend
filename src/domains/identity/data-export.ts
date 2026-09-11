import { api } from "@/lib/api";

export async function buildAccountDataExport(_userId?: string) {
  return api("/auth/export");
}
