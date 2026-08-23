import { timingSafeEqual } from "crypto";

export function cronAuthorizationStatus(
  request: Request,
): "configured" | "unconfigured" | "unauthorized" {
  const expected = process.env.WOOSH_CRON_SECRET?.trim();
  if (!expected) return "unconfigured";
  const provided = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!provided) return "unauthorized";
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
    ? "configured"
    : "unauthorized";
}
