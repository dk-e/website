import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDX } from "../[slug]/mdx";
import { getBlogPostBySlug } from "../../../lib/blog";
import { Undo2 } from "lucide-react";
import { Link } from "next-view-transitions";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return;
  }

  const publishedTime = formatDate(post.metadata.date);

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      publishedTime,
      type: "article",
      url: `https://daniel.rest/blog/${post.slug}`,
      images: [
        {
          url: `https://daniel.rest/og/blog?title=${post.metadata.title}&top=${publishedTime}`,
        },
      ],
    },
    twitter: {
      title: post.metadata.title,
      description: post.metadata.description,
      card: "summary_large_image",
      creator: "@lootings",
      images: [
        `https://daniel.rest/og/blog?title=${post.metadata.title}&top=${publishedTime}`,
      ],
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <main className="space-y-8 text-left">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.date,
            dateModified: post.metadata.date,
            description: post.metadata.description,
            image: `https://daniel.rest/og/blog?title=${
              post.metadata.title
            }&top=${formatDate(post.metadata.date)}`,
            url: `https://daniel.rest/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Dan",
            },
          }),
        }}
      />

      <section className="space-y-3">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 text-sm text-purple-500 transition-colors hover:text-purple-400 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <Undo2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className=" ">back</span>
        </Link>
      </section>

      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {post.metadata.title}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.metadata.date)}
        </p>
      </section>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <MDX source={post.content} />
      </article>
    </main>
  );
}
