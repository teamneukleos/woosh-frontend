import { afterEach, describe, expect, it, vi } from "vitest";
import { decryptOAuthToken, encryptOAuthToken } from "@/lib/oauth-token";

const originalKey = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
const originalAuthSecret = process.env.AUTH_SECRET;

afterEach(() => {
  process.env.OAUTH_TOKEN_ENCRYPTION_KEY = originalKey;
  process.env.AUTH_SECRET = originalAuthSecret;
  vi.unstubAllEnvs();
});

describe("OAuth token encryption", () => {
  it("round-trips without exposing the plaintext", () => {
    process.env.OAUTH_TOKEN_ENCRYPTION_KEY = "test-key-that-is-long-enough";
    const encrypted = encryptOAuthToken("provider-secret-token");
    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain("provider-secret-token");
    expect(decryptOAuthToken(encrypted)).toBe("provider-secret-token");
  });

  it("rejects legacy plaintext tokens", () => {
    process.env.OAUTH_TOKEN_ENCRYPTION_KEY = "test-key-that-is-long-enough";
    expect(() => decryptOAuthToken("plaintext-token")).toThrow(/reconnected/);
  });

  it("requires a dedicated key in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("OAUTH_TOKEN_ENCRYPTION_KEY", "");
    vi.stubEnv("AUTH_SECRET", "auth-secret-must-not-encrypt-provider-tokens");
    expect(() => encryptOAuthToken("provider-secret-token")).toThrow(
      /required in production/,
    );
  });
});
