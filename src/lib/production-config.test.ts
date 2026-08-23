import { describe, expect, it } from "vitest";
import { productionConfigurationIssues } from "@/lib/production-config";

const complete = {
  DATABASE_URL: "postgresql://woosh:secret@db.internal:5432/woosh",
  AUTH_SECRET: "a".repeat(32),
  NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: "b".repeat(32),
  NEXT_PUBLIC_APP_URL: "https://app.woosh.example",
  AUTH_URL: "https://app.woosh.example",
  PAYSTACK_SECRET_KEY: "sk_live_value",
  PAYSTACK_PUBLIC_KEY: "pk_live_value",
  PAYOUT_ACCOUNT_ENCRYPTION_KEY: "c".repeat(32),
  WOOSH_CRON_SECRET: "d".repeat(32),
  OAUTH_TOKEN_ENCRYPTION_KEY: "e".repeat(32),
  WOOSH_ALLOW_DEV_OAUTH: "false",
  RESEND_API_KEY: "re_live_value",
  EMAIL_FROM: "Woosh <hello@woosh.example>",
  AWS_S3_BUCKET: "woosh-production",
  AWS_ACCESS_KEY_ID: "aws-access",
  AWS_SECRET_ACCESS_KEY: "aws-secret",
  AWS_REGION: "eu-west-1",
  META_APP_ID: "meta-id",
  META_APP_SECRET: "meta-secret",
  TIKTOK_CLIENT_KEY: "tiktok-key",
  TIKTOK_CLIENT_SECRET: "tiktok-secret",
  GOOGLE_CLIENT_ID: "google-id",
  GOOGLE_CLIENT_SECRET: "google-secret",
};

describe("production configuration", () => {
  it("accepts a complete production environment", () => {
    expect(productionConfigurationIssues(complete)).toEqual([]);
  });

  it("rejects insecure URLs, development OAuth and short secrets", () => {
    const issues = productionConfigurationIssues({
      ...complete,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      AUTH_URL: "http://localhost:3000",
      WOOSH_ALLOW_DEV_OAUTH: "true",
      AUTH_SECRET: "short",
    });
    expect(issues).toContain("NEXT_PUBLIC_APP_URL must use HTTPS");
    expect(issues).toContain("AUTH_URL must use HTTPS");
    expect(issues).toContain(
      "WOOSH_ALLOW_DEV_OAUTH must be false in production",
    );
    expect(issues).toContain(
      "AUTH_SECRET must contain at least 32 characters",
    );
  });

  it("rejects missing and placeholder provider values", () => {
    const issues = productionConfigurationIssues({
      ...complete,
      PAYSTACK_SECRET_KEY: "",
      RESEND_API_KEY: "replace-with-resend-key",
    });
    expect(issues).toContain("PAYSTACK_SECRET_KEY is required");
    expect(issues).toContain("RESEND_API_KEY is required");
  });
});
