import { describe, expect, it } from "vitest";
import { expectedActionFailure } from "./action-result";
import { ApiError } from "./nest";

describe("expectedActionFailure", () => {
  it("returns the backend's reason when accept is refused before the creator agrees", () => {
    const message = "The creator must agree to the active offer first.";
    expect(
      expectedActionFailure(new ApiError(400, message), "Couldn't accept application"),
    ).toEqual({ ok: false, title: "Couldn't accept application", message });
  });

  it("keeps the insufficient-funds title and message", () => {
    const message =
      "Insufficient brand funds. Need ₦30,000 (creator rate); wallet has ₦20,000. Top up the wallet first.";
    expect(
      expectedActionFailure(new ApiError(400, message), "Couldn't accept application"),
    ).toEqual({ ok: false, title: "Insufficient funds", message });
  });

  it("covers permission and conflict refusals (e.g. rate threshold, already accepted)", () => {
    expect(expectedActionFailure(new ApiError(403, "Rate exceeds manager threshold"), "t"))
      .toMatchObject({ ok: false, message: "Rate exceeds manager threshold" });
    expect(expectedActionFailure(new ApiError(409, "Already accepted"), "t"))
      .toMatchObject({ ok: false, message: "Already accepted" });
  });

  it("leaves server errors, auth errors and non-API errors to be thrown", () => {
    expect(expectedActionFailure(new ApiError(500, "Internal server error"), "t")).toBeNull();
    expect(expectedActionFailure(new ApiError(401, "Unauthorized"), "t")).toBeNull();
    expect(expectedActionFailure(new Error("network down"), "t")).toBeNull();
  });
});
