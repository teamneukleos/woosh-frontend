import { describe, expect, it } from "vitest";
import { cartoonAvatar } from "./cartoon-avatar";
import { avatarSources, initials } from "./image-fallback";

const expiredInstagram =
  "https://scontent.cdninstagram.com/v/t51.2885-19/abc.jpg?oe=6512AB00&_nc_ht=x";

describe("avatarSources", () => {
  it("tries the stored photo first, then the cartoon avatar", () => {
    expect(avatarSources("Chioma Okeke", expiredInstagram)).toEqual([
      expiredInstagram,
      cartoonAvatar("Chioma Okeke"),
    ]);
  });

  it("uses only the cartoon avatar when there is no photo", () => {
    for (const missing of [null, undefined, "", "   "]) {
      expect(avatarSources("Chioma Okeke", missing)).toEqual([
        cartoonAvatar("Chioma Okeke"),
      ]);
    }
  });

  it("never lists the same source twice", () => {
    const cartoon = cartoonAvatar("Ada");
    expect(avatarSources("Ada", cartoon)).toEqual([cartoon]);
  });
});

describe("initials", () => {
  it("uses up to two initials", () => {
    expect(initials("Chioma Okeke")).toBe("CO");
    expect(initials("ada")).toBe("A");
    expect(initials("Mary Jane Watson")).toBe("MJ");
  });

  it("has a non-empty fallback", () => {
    expect(initials("   ")).toBe("W");
  });
});
