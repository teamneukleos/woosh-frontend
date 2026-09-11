import fs from "node:fs";
import path from "node:path";
import { markdownToHtml } from "@/lib/markdown";

export type BlogAudience = "brands" | "creators" | "agencies";

export const BLOG_PLACEHOLDER_IMAGE = "/marketing/blog-placeholder.png";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  audience?: BlogAudience;
  draft: boolean;
  body: string;
  html: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content/blog");
const AUDIENCES = new Set<BlogAudience>(["brands", "creators", "agencies"]);

function parseFrontmatter(raw: string) {
  const source = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!source.startsWith("---\n")) {
    throw new Error("Missing frontmatter");
  }
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) throw new Error("Unclosed frontmatter");
  const yaml = source.slice(4, end);
  const body = source.slice(end + 5).trim();
  const data: Record<string, string> = {};
  for (const line of yaml.split("\n")) {
    const match = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!match) continue;
    data[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
  }
  return { data, body };
}

function featuredImagePath(value?: string) {
  const raw = value?.trim();
  if (raw && (raw.startsWith("/") || raw.startsWith("https://"))) {
    return raw;
  }
  return BLOG_PLACEHOLDER_IMAGE;
}

function parsePost(filename: string, raw: string): BlogPost {
  const { data, body } = parseFrontmatter(raw);
  const slug = data.slug || filename.replace(/\.md$/, "");
  const audience = data.audience as BlogAudience | undefined;
  if (audience && !AUDIENCES.has(audience)) {
    throw new Error(`Unknown audience in ${filename}: ${audience}`);
  }
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "1970-01-01",
    image: featuredImagePath(data.image),
    audience,
    draft: data.draft === "true",
    body,
    html: markdownToHtml(body),
  };
}

function readAllPosts(): BlogPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
      return parsePost(file, raw);
    });
}

export function listPublishedPosts(): BlogPost[] {
  return readAllPosts()
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPublishedPost(slug: string): BlogPost | undefined {
  return listPublishedPosts().find((post) => post.slug === slug);
}

export function relatedPosts(slug: string, audience?: BlogAudience, limit = 3) {
  const others = listPublishedPosts().filter((post) => post.slug !== slug);
  const same = others.filter((post) => post.audience && post.audience === audience);
  const rest = others.filter((post) => post.audience !== audience);
  return [...same, ...rest].slice(0, limit);
}

export function formatPostDate(iso: string) {
  const date = new Date(`${iso}T00:00:00+01:00`);
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function audienceCta(audience?: BlogAudience) {
  if (audience === "creators") {
    return {
      href: "/for-creators",
      label: "How creators get paid",
      registerLabel: "Register as a creator",
    };
  }
  if (audience === "agencies") {
    return {
      href: "/for-agencies",
      label: "Agency workspaces",
      registerLabel: "Register an agency",
    };
  }
  return {
    href: "/for-brands",
    label: "How brands run campaigns",
    registerLabel: "Create a brand account",
  };
}
