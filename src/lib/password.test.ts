import { describe, expect, it } from "vitest";
import { isStrongPassword, passwordRuleStatus } from "@/lib/password";

describe("password complexity", () => {
  it("requires uppercase, digit, and special character", () => {
    expect(isStrongPassword("password123")).toBe(false);
    expect(isStrongPassword("Password123")).toBe(false);
    expect(isStrongPassword("Password!")).toBe(false);
    expect(isStrongPassword("password1!")).toBe(false);
    expect(isStrongPassword("Password1!")).toBe(true);
  });

  it("checks each rule as the password is typed", () => {
    expect(passwordRuleStatus("").every((rule) => !rule.met)).toBe(true);

    const partial = Object.fromEntries(
      passwordRuleStatus("Pass1").map((rule) => [rule.id, rule.met]),
    );
    expect(partial).toEqual({
      length: false,
      upper: true,
      digit: true,
      special: false,
    });

    expect(passwordRuleStatus("Password1!").every((rule) => rule.met)).toBe(
      true,
    );
  });
});
