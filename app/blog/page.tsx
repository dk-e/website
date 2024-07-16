import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { getBlogPosts } from "../../lib/blog";
import { Suspense } from "react";
import { ViewCounter } from "../blog/view-counter";
import { redis } from "../../lib/redis";
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
    <body className="mx-4 mb-40 mt-8 flex max-w-2xl flex-col antialiased md:flex-row lg:mx-auto">
      <main className="mt-6 flex min-w-0 flex-auto flex-col px-2 md:px-0">
        <section>
          <Link
            href="/"
            className="mb-4 p-2 bg-neutral-900 text-white rounded inline-block"
          >
            <Undo2 className="size-5" />
          </Link>
          <h1 className="text-2xl font-medium tracking-tighter">blog</h1>

          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="flex w-full flex-col gap-y-1">
                  <p className="text-lg font-medium group-hover:underline group-hover:decoration-neutral-400 group-hover:underline-offset-4 group-hover:dark:decoration-neutral-600">
                    {post.metadata.title.toLowerCase()}
                  </p>
                  <p className="prose prose-neutral dark:prose-invert">
                    {post.metadata.description.toLowerCase()}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(post.metadata.date)
                      .toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      .toLowerCase()}
                    <Suspense>
                      {" • "}
                      <Views slug={post.slug} />
                    </Suspense>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </body>
  );
}

async function Views({ slug }: { slug: string }) {
  let allViews = [];

  try {
    const data = await redis.get("views");

    if (data) {
      // @ts-ignore
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        allViews = parsedData;
      } else {
        console.error("Fetched views data is not an array:", parsedData);
      }
    }
  } catch (error) {
    console.error("Error fetching or parsing views data:", error);
  }

  return <ViewCounter slug={slug} allViews={allViews} />;
}
