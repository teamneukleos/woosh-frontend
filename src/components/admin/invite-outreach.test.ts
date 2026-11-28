import { describe, expect, it, vi } from "vitest";

// The cell imports server actions; the message builder doesn't need them.
vi.mock("@/app/actions", () => ({
  adminRenewClaimLinkAction: vi.fn(),
  adminUpdateInviteOutreachAction: vi.fn(),
}));

import { outreachMessage, type InviteOutreachRow } from "./invite-outreach";

const row: InviteOutreachRow = {
  id: "inv_1",
  message: "Love your Lagos food reels",
  handle: "ada.creates",
  contactEmail: null,
  contactPhone: null,
  profileUrl: "https://www.instagram.com/ada.creates/",
  outreach: null,
  claimLink: {
    state: "READY",
    url: "https://app.woosh.test/claim/abc123",
    expiresAt: "2026-12-12T10:00:00.000Z",
    canRenew: false,
  },
  brief: { title: "Lagos launch", status: "OPEN" },
  brand: { name: "Acme" },
  creatorName: "Ada",
};

describe("outreachMessage", () => {
  it("names the creator, brand, brief and claim link", () => {
    const text = outreachMessage(row);
    expect(text).toContain("Hi Ada");
    expect(text).toContain("@ada.creates");
    expect(text).toContain("Acme");
    expect(text).toContain('"Lagos launch"');
    expect(text).toContain("https://app.woosh.test/claim/abc123");
    expect(text).toContain('Their note: "Love your Lagos food reels"');
    expect(text).toMatch(/expires on 12 Dec 2026/);
  });

  it("leaves out the note when the brand didn't add one", () => {
    expect(outreachMessage({ ...row, message: null })).not.toContain("Their note");
  });
});
