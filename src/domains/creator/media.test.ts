import { describe, expect, it } from "vitest";
import { creatorReadiness } from "@/domains/creator/readiness";
import { validateUpload } from "@/lib/storage";

function readyProfile() {
  return {
    avatarUrl: "/avatar.jpg",
    bio: "A".repeat(90),
    locationCountry: "NG",
    categories: ["Lifestyle"],
    languages: ["English"],
    user: { emailVerified: new Date() },
    socialAccounts: [
      {
        status: "ACTIVE",
        snapshots: [{ source: "instagram_oauth", followers: 1000 }],
      },
    ],
    portfolioItems: [
      { status: "APPROVED" },
      { status: "APPROVED" },
      { status: "APPROVED" },
    ],
    ratePackages: [{ active: true }],
  };
}

describe("creatorReadiness", () => {
  it("requires every marketplace signal", () => {
    const result = creatorReadiness(readyProfile());
    expect(result.complete).toBe(true);
    expect(result.percentage).toBe(100);
  });

  it("does not accept unverified manual social metrics", () => {
    const profile = readyProfile();
    profile.socialAccounts[0]!.snapshots[0]!.source = "manual_unverified";
    const result = creatorReadiness(profile);
    expect(result.complete).toBe(false);
    expect(result.checks.find((check) => check.id === "social")?.complete).toBe(
      false,
    );
  });
});

describe("validateUpload", () => {
  it("accepts a correctly signed JPEG", () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    expect(() =>
      validateUpload({ buffer, contentType: "image/jpeg", kind: "avatar" }),
    ).not.toThrow();
  });

  it("rejects MIME spoofing", () => {
    const buffer = Buffer.from("not an image");
    expect(() =>
      validateUpload({ buffer, contentType: "image/jpeg", kind: "avatar" }),
    ).toThrow(/contents/);
  });
});
