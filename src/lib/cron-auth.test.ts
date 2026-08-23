import { afterEach, describe, expect, it, vi } from "vitest";
import { cronAuthorizationStatus } from "@/lib/cron-auth";

afterEach(() => vi.unstubAllEnvs());

describe("cron authorization", () => {
  it("fails closed when the scheduler secret is missing", () => {
    vi.stubEnv("WOOSH_CRON_SECRET", "");
    expect(
      cronAuthorizationStatus(new Request("https://woosh.test/internal")),
    ).toBe("unconfigured");
  });

  it("uses an exact bearer secret", () => {
    vi.stubEnv("WOOSH_CRON_SECRET", "a-secure-cron-secret");
    expect(
      cronAuthorizationStatus(
        new Request("https://woosh.test/internal", {
          headers: { authorization: "Bearer wrong" },
        }),
      ),
    ).toBe("unauthorized");
    expect(
      cronAuthorizationStatus(
        new Request("https://woosh.test/internal", {
          headers: { authorization: "Bearer a-secure-cron-secret" },
        }),
      ),
    ).toBe("configured");
  });
});
