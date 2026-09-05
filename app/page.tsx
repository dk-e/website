import { Link } from "next-view-transitions";
import { getBlogPosts } from "../lib/blog";
import { age } from "../lib/constants";
import ConfettiText from "../components/confetti";
import Music from "../components/music";
import { ArrowUpRight } from "lucide-react";
import Presence from "../components/presence";

export default function Home() {
  const posts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    )
    .slice(0, 4);

  return (
    <main className="space-y-12 text-left">
      <section className="space-y-4">
        <p className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dan
        </p>

        <div className="space-y-3">
          <p className="max-w-prose text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            I&apos;m a {age} y/o cyber security student at{" "}
            <span className=" text-zinc-800 underline decoration-zinc-400 underline-offset-2 dark:text-zinc-200 dark:decoration-zinc-500">
              MMU
            </span>
            .
          </p>

          <p className="max-w-prose text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            I&apos;m interested in the web, cybercrime and love to travel.
            I&apos;m based in the{" "}
            <span className="text-zinc-800 underline decoration-zinc-400 underline-offset-2 dark:text-zinc-200 dark:decoration-zinc-500">
              <ConfettiText text="UK" emoji="🇬🇧" scalar={5} />
            </span>
            .
          </p>

          <div className="space-y-1.5 pt-2">
            <Presence />
            <Music />
          </div>
        </div>
      </section>

      {/* writing */}
      <section className="space-y-4">
        <h2 className="section-kicker">writing</h2>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <div className="group flex w-full items-baseline justify-between gap-4 py-2.5">
                <p className="text-base text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                  {post.metadata.title}
                </p>

                <p className="shrink-0 text-xs tabular-nums text-zinc-500">
                  {new Date(post.metadata.date).toLocaleDateString("en-GB", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <span>All posts</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </section>
    </main>
  );
}
