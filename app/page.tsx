import { Link } from "next-view-transitions";
import { getBlogPosts } from "../lib/blog";
// import Flag from "react-flagkit";
import {
  age,
  daysSinceStartedCoding,
  yearsSinceStartedCoding,
  monthsSinceSeriousAboutSWE,
  daysSinceSeriousAboutSWE,
  domain,
} from "../lib/constants";
import ConfettiText from "../components/confetti";
import Music from "../components/music";
import { FaGithub, FaTelegram } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { ArrowUpRight } from "lucide-react";
import Discord from "../components/discord";

// function LocationIcon() {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className="h-5 w-5"
//     >
//       <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
//       <circle cx="12" cy="10" r="3" />
//     </svg>
//   );
// }

const Tooltip = ({ text, children }: any) => (
  <span className="group relative">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 min-w-max -translate-x-1/2 rounded bg-neutral-800 p-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      {text}
    </span>
  </span>
);

export default function Home() {
  const posts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    )
    .slice(0, 4);

  return (
    <main className="space-y-8 text-left">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-500 dark:text-purple-400">
          {domain}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          hi, i&apos;m dan
        </h1>
        <p className="max-w-prose text-base text-neutral-700 dark:text-neutral-300">
          i&apos;m {age === 18 ? "an" : "a"} {age} y/o cyber security student.
          interested in web development, investigating cybercrime, and crypto.
          based in the{" "}
          <span className="font-medium underline decoration-wavy decoration-purple-500 dark:decoration-purple-400">
            <ConfettiText text="UK" emoji="🇬🇧" scalar={5} />
          </span>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="text-purple-500 dark:text-purple-400">*</span>
          <span>now</span>
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300">
          check out my{" "}
          <Link
            href="https://stats.fm/warn"
            className="link-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            stats.fm
          </Link>{" "}
          to see what i&apos;ve been listening to lately. if i&apos;m listening
          at the moment, you&apos;ll be able to see it below in real time.
        </p>
        <Music />
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="text-purple-500 dark:text-purple-400">*</span>
          <span>blog</span>
        </h2>
        <div className="space-y-1">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="group flex w-full items-baseline justify-between gap-4 px-1 py-1">
                <p className="text-base font-medium text-neutral-900 transition-colors group-hover:text-purple-600 dark:text-neutral-50 dark:group-hover:text-purple-400">
                  {post.metadata.title.toLowerCase()}
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
        </div>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-1 pl-1  text-purple-500 transition-colors dark:text-purple-400 "
        >
          <span className="link-underline">all posts</span>
          <ArrowUpRight className="lucide lucide-arrow-up-right h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="text-purple-500 dark:text-purple-400">*</span>
          <span>journey</span>
        </h2>
        <p className="max-w-prose text-base text-neutral-700 dark:text-neutral-300">
          i started coding in python{" "}
          <Tooltip text={`${daysSinceStartedCoding} days`}>
            <span className="underline decoration-wavy decoration-purple-500 dark:decoration-purple-400">
              ~{yearsSinceStartedCoding}
            </span>
          </Tooltip>{" "}
          years ago, and started to learn web development in late 2022. now my
          strongest interests are in cyber security, ethical hacking, and web
          development. i&apos;ve been seriously pursuing these interests for{" "}
          <Tooltip text={`${daysSinceSeriousAboutSWE} days`}>
            <span className="underline decoration-wavy decoration-purple-500 dark:decoration-purple-400">
              ~{monthsSinceSeriousAboutSWE}
            </span>
          </Tooltip>{" "}
          months.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="text-purple-500 dark:text-purple-400">*</span>
          <span>connect</span>
        </h2>
        <p className="text-base text-neutral-700 dark:text-neutral-300">
          contact via email at{" "}
          <Link className="link-underline" href="mailto:hi@dann.lol">
            hi@dann.lol
          </Link>{" "}
          or on signal at{" "}
          <Link
            className="link-underline"
            href="https://signal.me/#eu/9ruCLvkLVNjqXtu94TW6-5BUv2BkiZRBt6YWlWCWNQeNQzYNpltGT7E2LeojN4Gu"
          >
            nope.01
          </Link>
        </p>
        <Discord />
        <ul className="mt-2 flex gap-3 text-neutral-600 dark:text-neutral-300">
          <li>
            <Link
              href="https://x.com/lootings"
              rel="noopener noreferrer"
              target="_blank"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500/60 bg-neutral-100 text-neutral-800 transition-colors hover:border-purple-500 hover:bg-purple-500/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-purple-400"
            >
              <BsTwitterX className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link
              href="https://git.new/dan-"
              rel="noopener noreferrer"
              target="_blank"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500/60 bg-neutral-100 text-neutral-800 transition-colors hover:border-purple-500 hover:bg-purple-500/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-purple-400"
            >
              <FaGithub className="h-4 w-4" />
            </Link>
          </li>
          <li>
            <Link
              href="https://t.me/reIiefs"
              rel="noopener noreferrer"
              target="_blank"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-500/60 bg-neutral-100 text-neutral-800 transition-colors hover:border-purple-500 hover:bg-purple-500/10 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-purple-400"
            >
              <FaTelegram className="h-4 w-4" />
            </Link>
          </li>
        </ul>
      </section>

      <footer className="pt-4 text-xs text-neutral-600 dark:text-neutral-500">
        <p>
          pssttt this is{" "}
          <Link
            href="https://github.com/dk-e/website"
            className="link-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            open source
          </Link>
        </p>
      </footer>
    </main>
  );
}
