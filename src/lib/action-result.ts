import { ApiError } from "@/lib/nest";

/** What a server action returns for a refusal ActionForm should show as a toast. */
export type ActionFailure = { ok: false; title?: string; message: string };

/**
 * The backend's business-rule refusals (4xx) as a result ActionForm can show. Errors thrown
 * from a server action lose their message in production (React error #441), so only
 * unexpected failures should be rethrown. Returns null for anything else.
 */
export function expectedActionFailure(
  error: unknown,
  title: string,
): ActionFailure | null {
  if (!(error instanceof ApiError) || ![400, 403, 404, 409].includes(error.status)) {
    return null;
  }
  return {
    ok: false,
    title: error.message.startsWith("Insufficient brand funds.")
      ? "Insufficient funds"
      : title,
    message: error.message,
  };
}
