import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { Surface } from "@/components/surface";
import { JsonLd } from "@/components/seo/json-ld";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/seo-schema";
import { pageMetadata } from "@/lib/seo";
import {
  audienceCta,
  formatPostDate,
  getPublishedPost,
  listPublishedPosts,
  relatedPosts,
} from "@/lib/blog";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return listPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPublishedPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    image: post.image,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPublishedPost(slug);
  if (!post) notFound();

  const others = relatedPosts(post.slug, post.audience);
  const cta = audienceCta(post.audience);

  return (
    <Surface name="marketing">
      <MarketingChrome>
        <JsonLd data={blogPostingSchema(post)} />
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ])}
        />
        <article className="relative isolate overflow-hidden">
          <div aria-hidden className="mkt-pattern pointer-events-none absolute inset-0 -z-10 opacity-80" />
          <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8">
          <p className="mkt-kicker">{"{Blog}"}</p>
          <p className="mt-3 text-[0.75rem] text-mkt-faint">
            <Link href="/blog" className="mkt-link">
              All notes
            </Link>
            <span className="px-2">·</span>
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          </p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.03em] text-mkt-fg">
            {post.title}
          </h1>
          <p className="mt-6 max-w-xl text-[0.9375rem] leading-7 text-mkt-muted md:text-base">{post.description}</p>
          <Image
            src={post.image}
            alt=""
            width={1600}
            height={900}
            quality={95}
            priority
            sizes="(min-width: 768px) 48rem, 100vw"
            className="mt-8 h-auto w-full rounded-[1.1rem] object-cover"
          />
          <div
            className="mkt-prose mt-10"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/register" className="mkt-cta mkt-cta-primary">
              {cta.registerLabel}
            </Link>
            <Link href={cta.href} className="mkt-cta mkt-cta-ghost">
              {cta.label}
            </Link>
          </div>

          {others.length > 0 ? (
            <aside className="mt-16 border-t border-mkt-border pt-10">
              <p className="mkt-kicker">{"{Other notes}"}</p>
              <ul className="mt-4 grid gap-3">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/blog/${item.slug}`}
                      className="mkt-link"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
          </div>
        </article>
      </MarketingChrome>
    </Surface>
  );
}
