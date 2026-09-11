import { describe, expect, it } from "vitest";
import { productionConfigurationIssues } from "@/lib/production-config";

const complete = {
  AUTH_SECRET: "a".repeat(32),
  NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: "b".repeat(32),
  NEXT_PUBLIC_APP_URL: "https://app.woosh.example",
  AUTH_URL: "https://app.woosh.example",
  WOOSH_API_URL: "https://api.woosh.example/api",
  WOOSH_ALLOW_DEV_OAUTH: "false",
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

  it("rejects missing Nest API URL", () => {
    const issues = productionConfigurationIssues({
      ...complete,
      WOOSH_API_URL: "",
    });
    expect(issues).toContain("WOOSH_API_URL is required");
  });
});
