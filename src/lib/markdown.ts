function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(href: string) {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("https://") || href.startsWith("http://")) return href;
  return "#";
}

function inline(text: string) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
      const url = safeHref(href);
      return `<a href="${escapeHtml(url)}">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function markdownToHtml(source: string) {
  const blocks = source.trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      if (lines.length === 1 && /^#{1,3} /.test(lines[0])) {
        const level = lines[0].match(/^#+/)?.[0].length ?? 2;
        const text = lines[0].replace(/^#{1,3} /, "");
        const tag = `h${level}` as const;
        return `<${tag}>${inline(text)}</${tag}>`;
      }
      if (lines.every((line) => /^[-*] /.test(line))) {
        const items = lines
          .map((line) => `<li>${inline(line.replace(/^[-*] /, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("\n");
}
