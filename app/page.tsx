import { Link } from "next-view-transitions";
import { getBlogPosts } from "../lib/blog";
// import Flag from "react-flagkit";
import {
  age,
  daysSinceStartedCoding,
  yearsSinceStartedCoding,
  monthsSinceSeriousAboutSWE,
  daysSinceSeriousAboutSWE,
} from "../lib/constants";
import ConfettiText from "../components/confetti";
import Music from "../components/music";
import { FaGithub, FaTelegram } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
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
  <span className="relative group">
    {children}
    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 p-2 bg-neutral-800 text-white text-sm rounded transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none min-w-max whitespace-nowrap">
      {text}
    </span>
  </span>
);

export default function Home() {
  const posts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime()
    )
    .slice(0, 4);

  return (
    <main className="text-left">
      <h1 className="mb-4 text-2xl font-medium tracking-tighter">
        a bit about me
      </h1>
      {/* <div className="flex items-center gap-2 mb-2">
        <LocationIcon />
        <Flag country="GB" size={20} draggable="false" />
      </div> */}
      <p className="prose prose-neutral dark:prose-invert">
        Hi, I&apos;m{" "}
        <span className="font-medium prose prose-neutral dark:prose-invert">
          Dan
        </span>
        . <br /> I&apos;m {age === 18 ? "an" : "a"} {age} y/o tech nerd based in
        the{" "}
        <span className="font-medium underline decoration-wavy">
          <ConfettiText text="UK" emoji="☕" scalar={5} />
        </span>
        . I enjoy building for the web, hardware and cyber security!
      </p>
      <h3 className="mb-2 mt-4 text-xl font-medium">music</h3>
      <p className="prose prose-neutral dark:prose-invert">
        I&apos;m a big music guy and I like pretty much everything depending on
        the mood. Check out my{" "}
        <Link
          href="https://stats.fm/warn"
          className="font-medium underline decoration-neutral-400 decoration-[0.1em] underline-offset-2 dark:decoration-neutral-600"
        >
          stats.fm
        </Link>{" "}
        to see what I&apos;ve been listening to lately. Also, If I&apos;m
        listening at the moment, you will be able to see it below, in real time!
      </p>
      <Music />
      <h3 className="mb-2 mt-4 text-xl font-medium">blog</h3>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="flex w-full justify-between">
              <p className="font-medium underline decoration-neutral-400 decoration-[0.1em] underline-offset-2 dark:decoration-neutral-600">
                {post.metadata.title.toLowerCase()}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
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

        <Link
          href="/blog"
          className="decoration-neutral-400 font-medium underline decoration-[0.1em] underline-offset-2 dark:decoration-neutral-600"
        >
          all posts →
        </Link>
      </div>
      <h3 className="mt-8 text-xl font-medium">journey</h3>
      <p className="prose prose-neutral dark:prose-invert">
        I started coding in Python{" "}
        <Tooltip text={`${daysSinceStartedCoding} days`}>
          <span className="underline decoration-wavy">
            ~{yearsSinceStartedCoding}
          </span>
        </Tooltip>{" "}
        years ago at high school. In my own time, I learned (basic) web
        development in late 2022. I now work with React, TypeScript, and
        TailwindCSS. I also have a strong interest in cyber security, ethical
        hacking, and the{" "}
        <Link className="font-medium" href="/donate">
          blockchain
        </Link>
        . I&apos;ve been seriously pursuing these interests for{" "}
        <Tooltip text={`${daysSinceSeriousAboutSWE} days`}>
          <span className="underline decoration-wavy">
            ~{monthsSinceSeriousAboutSWE}
          </span>
        </Tooltip>{" "}
        months and would like to make them my career.
      </p>
      <h3 className="mt-8 text-xl font-medium">extras</h3>
      <p className="prose prose-neutral dark:prose-invert">
        Aside from all of that, I love to travel. I aim to visit every continent
        at the very least. Currently, I&apos;m 3/7 of the way there.
      </p>

      <h3 className="mt-8 text-xl font-medium">connect</h3>
      <p className="prose prose-neutral dark:prose-invert">
        Contact via email at{" "}
        <Link className="font-medium" href="mailto:hi@dann.lol">
          hi@dann.lol
        </Link>{" "}
        or on signal at{" "}
        <Link
          className="font-medium"
          href="https://signal.me/#eu/9ruCLvkLVNjqXtu94TW6-5BUv2BkiZRBt6YWlWCWNQeNQzYNpltGT7E2LeojN4Gu"
        >
          nope.01
        </Link>
      </p>
      <Discord />
      <ul className="font-sm mt-4 flex space-x-4 text-neutral-600 dark:text-neutral-300">
        <li>
          <Link
            href="https://x.com/lootings"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-500 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
          >
            <BsTwitterX className="text-black dark:text-neutral-400" />
          </Link>
        </li>
        <li>
          <Link
            href="https://git.new/dan-"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-500 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
          >
            <FaGithub className="text-black dark:text-neutral-400" />
          </Link>
        </li>
        <li>
          <Link
            href="https://t.me/reIiefs"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-500 dark:border-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
          >
            <FaTelegram className="text-black dark:text-neutral-400" />
          </Link>
        </li>
      </ul>
      <footer className="fixed bottom-4 right-4 text-xs text-neutral-600 dark:text-neutral-400">
        <p>
          pssttt this is{" "}
          <Link
            href="https://github.com/dk-e/website"
            className="font-medium underline decoration-neutral-400 decoration-[0.1em] underline-offset-2 dark:decoration-neutral-600"
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
