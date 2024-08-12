import { Link } from "next-view-transitions";
import { getBlogPosts } from "../lib/blog";
import Flag from "react-flagkit";
import {
  age,
  daysSinceStartedCoding,
  yearsSinceStartedCoding,
  monthsSinceSeriousAboutSWE,
  daysSinceSeriousAboutSWE,
} from "../lib/constants";
import ConfettiText from "../components/confetti";
import Music from "../components/music";
import { FaInstagram, FaGithub } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

function LocationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

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

      <div className="flex items-center gap-2 mb-2">
        <LocationIcon />
        <Flag country="GB" size={20} draggable="false" />
      </div>

      <p className="prose prose-neutral dark:prose-invert">
        hey, i&apos;m dan. i&apos;m a {age} y/o software engineer (barely) based
        in the{" "}
        <span className="font-medium underline decoration-wavy">
          <ConfettiText text="UK" emoji="☕" scalar={5} />
        </span>
        . i love tinkering with things to make them just how i like. tech wise i
        enjoy building for the web and i live on the terminal!
      </p>

      <h3 className="mb-2 mt-4 text-xl font-medium">music</h3>
      <p className="prose prose-neutral dark:prose-invert">
        i&apos;m a big music guy. i like anything from underground/opium to rock
        & indie, if im listening at the minute you will be able to see this
        below! cool right?
      </p>
      <Music />

      <h3 className="mb-2 mt-4 text-xl font-medium">blog</h3>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="">
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
        I started coding in python{" "}
        <Tooltip text={`${daysSinceStartedCoding} days`}>
          <span className="underline decoration-wavy">
            ~{yearsSinceStartedCoding}
          </span>
        </Tooltip>{" "}
        years ago. Though I never really understood it back then. I then moved
        onto web development in late 2022 and started working with HTML and CSS.
        I now work with React, TypeScript, and TailwindCSS. I&apos;ve been
        serious about SWE for{" "}
        <Tooltip text={`${daysSinceSeriousAboutSWE} days`}>
          <span className="underline decoration-wavy">
            ~{monthsSinceSeriousAboutSWE}
          </span>
        </Tooltip>{" "}
        months and would like to make it my career.
      </p>

      <h3 className="mt-8 text-xl font-medium">connect</h3>
      <p className="prose prose-neutral dark:prose-invert">
        contact me directly at{" "}
        <Link className="font-medium" href="mailto:d@niel.lol">
          d@niel.lol
        </Link>{" "}
        or find me at the links below.
      </p>
      <ul className="font-sm mt-4 flex space-x-4 text-neutral-600 dark:text-neutral-300">
        <li>
          <Link
            href="https://x.com/lootings"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-500 dark:border-neutral-700 transition-colors"
          >
            <BsTwitterX className="text-white dark:text-neutral-400" />
          </Link>
        </li>
        <li>
          <Link
            href="https://instagram.com/ddann.k"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-500 dark:border-neutral-700 transition-colors"
          >
            <FaInstagram className="text-white dark:text-neutral-400" />
          </Link>
        </li>
        <li>
          <Link
            href="https://git.new/dan-"
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-neutral-500 dark:border-neutral-700 transition-colors"
          >
            <FaGithub className="text-white dark:text-neutral-400" />
          </Link>
        </li>
      </ul>
    </main>
  );
}
