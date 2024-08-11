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
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = getBlogPostBySlug(params.slug);
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

export default function Post({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  return (
    <body className="mx-4 mb-40 mt-8 flex max-w-2xl flex-col antialiased md:flex-row lg:mx-auto">
      <main className="mt-6 flex min-w-0 flex-auto flex-col px-2 md:px-0">
        <section>
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

          <Link
            href="/blog"
            className="mb-4 p-2 bg-neutral-900 text-white rounded inline-block"
          >
            <Undo2 className="size-5" />
          </Link>

          <h1 className="title mb-2 max-w-[650px] text-3xl font-medium tracking-tighter">
            {post.metadata.title}
          </h1>
          <div className="mb-8 flex max-w-[650px] items-center justify-between text-sm">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {formatDate(post.metadata.date)}
            </p>
          </div>

          <article className="prose prose-neutral dark:prose-invert">
            <MDX source={post.content} />
          </article>
        </section>
      </main>
    </body>
  );
}
