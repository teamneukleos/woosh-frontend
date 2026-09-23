import { describe, expect, it } from "vitest";
import { isStrongPassword } from "@/lib/password";

describe("password complexity", () => {
  it("requires uppercase, digit, and special character", () => {
    expect(isStrongPassword("password123")).toBe(false);
    expect(isStrongPassword("Password123")).toBe(false);
    expect(isStrongPassword("Password!")).toBe(false);
    expect(isStrongPassword("password1!")).toBe(false);
    expect(isStrongPassword("Password1!")).toBe(true);
  });
});
