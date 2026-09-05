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
      url: `https://dann.my/blog/${post.slug}`,
      images: [
        {
          url: `https://dann.my/og/blog?title=${post.metadata.title}&top=${publishedTime}`,
        },
      ],
    },
    twitter: {
      title: post.metadata.title,
      description: post.metadata.description,
      card: "summary_large_image",
      creator: "@lootings",
      images: [
        `https://dann.my/og/blog?title=${post.metadata.title}&top=${publishedTime}`,
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
            image: `https://dann.my/og/blog?title=${
              post.metadata.title
            }&top=${formatDate(post.metadata.date)}`,
            url: `https://dann.my/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Dan",
            },
          }),
        }}
      />

      <section className="space-y-3">
        <Link href="/blog" className="nav-back group">
          <Undo2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back</span>
        </Link>
      </section>

      <section className="space-y-3">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {post.metadata.title}
        </h1>
        <p className="text-sm tabular-nums text-zinc-500">
          {formatDate(post.metadata.date)}
        </p>
      </section>

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <MDX source={post.content} />
      </article>
    </main>
  );
}
