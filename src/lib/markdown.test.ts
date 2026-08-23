import { describe, expect, it } from "vitest";
import { markdownToHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  it("renders headings, links and lists", () => {
    const html = markdownToHtml(
      "## Title\n\nSee [brands](/for-brands).\n\n- one\n- two",
    );
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain('<a href="/for-brands">brands</a>');
    expect(html).toContain("<li>one</li>");
  });
});
