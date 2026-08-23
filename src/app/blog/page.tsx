import Image from "next/image";
import Link from "next/link";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { Surface } from "@/components/surface";
import { JsonLd } from "@/components/seo/json-ld";
import { blogSchema, breadcrumbSchema } from "@/lib/seo-schema";
import { pageMetadata } from "@/lib/seo";
import {
  BLOG_PLACEHOLDER_IMAGE,
  formatPostDate,
  listPublishedPosts,
} from "@/lib/blog";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "How Nigeria actually runs a brief: claimed socials, funded selection, Naira payouts, brand vs agency, one thread.",
  path: "/blog",
  image: BLOG_PLACEHOLDER_IMAGE,
});

export default function BlogIndexPage() {
  const posts = listPublishedPosts();

  return (
    <Surface name="marketing">
      <MarketingChrome>
        <JsonLd data={blogSchema()} />
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ])}
        />
        <div className="mkt-pattern">
          <section className="mx-auto max-w-5xl px-5 pb-24 pt-10 md:px-8">
            <p className="mkt-kicker">{"{Blog}"}</p>
            <h1 className="font-display mt-4 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.03em] text-white">
              How the brief survives the street.
            </h1>
            <p className="mt-6 max-w-xl text-[0.9375rem] leading-7 text-white/58 md:text-base">
              Claimed supply. Funded selection. Naira. The thread. Notes — not
              invented case studies.
            </p>

            <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mkt-lift block overflow-hidden rounded-[1.1rem] transition hover:bg-white/[0.05]"
                  >
                    <Image
                      src={post.image}
                      alt=""
                      width={1200}
                      height={675}
                      quality={95}
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="h-44 w-full object-cover sm:h-52"
                    />
                    <div className="px-5 py-6">
                      <time
                        dateTime={post.date}
                        className="text-[0.75rem] text-white/40"
                      >
                        {formatPostDate(post.date)}
                      </time>
                      <h2 className="font-display mt-2 text-xl text-white">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {post.description}
                      </p>
                      <span className="mkt-accent mt-4 inline-block text-[0.8125rem]">
                        Read note
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </MarketingChrome>
    </Surface>
  );
}
