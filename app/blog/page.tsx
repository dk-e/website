import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { getBlogPosts } from "../../lib/blog";
import { Undo2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on security, the web, and related work.",
  openGraph: {
    images: [
      {
        url: "https://dann.my/og/home?title=dan's+blog",
      },
    ],
  },
};

export default function BlogPage() {
  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime(),
  );

  return (
    <main className="space-y-10 text-left">
      <section className="space-y-4">
        <Link href="/" className="nav-back group">
          <Undo2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back</span>
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Blog
        </h1>
      </section>

      <section className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block py-5 first:pt-0"
          >
            <div className="flex w-full flex-col gap-y-1.5">
              <p className="text-base text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                {post.metadata.title}
              </p>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {post.metadata.description}
              </p>
              <p className="text-xs tabular-nums text-zinc-500">
                {new Date(post.metadata.date).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
