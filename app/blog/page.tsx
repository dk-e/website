import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { getBlogPosts } from "../../lib/blog";
import { Undo2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Talking about nerdy stuff that interests me.",
  openGraph: {
    images: [
      {
        url: "https://daniel.rest/og/home?title=dan's+blog",
      },
    ],
  },
};

export default function BlogPage() {
  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime()
  );

  return (
    <main className="space-y-8 text-left">
      <section className="space-y-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-1 text-sm text-purple-500 transition-colors hover:text-purple-400 dark:text-purple-300 dark:hover:text-purple-200"
        >
          <Undo2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="nice-underline-purple-500 dark:nice-underline-purple-300">
            back
          </span>
        </Link>
        <h1 className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="text-purple-500 dark:text-purple-400">*</span>
          <span>blog</span>
        </h1>
      </section>

      <section className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <div className="flex w-full flex-col gap-y-1">
              <p className="text-base font-medium text-neutral-900 transition-colors group-hover:text-purple-600 dark:text-neutral-50 dark:group-hover:text-purple-300">
                {post.metadata.title.toLowerCase()}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {post.metadata.description.toLowerCase()}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {new Date(post.metadata.date)
                  .toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  .toLowerCase()}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
