import { describe, expect, it } from "vitest";
import { nestSocketOrigin } from "@/lib/socket";

describe("nestSocketOrigin", () => {
  it("strips a trailing /api from the public Nest URL", () => {
    const previous = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = "https://api.woosh.example/api";
    expect(nestSocketOrigin()).toBe("https://api.woosh.example");
    process.env.NEXT_PUBLIC_API_URL = previous;
  });
});
