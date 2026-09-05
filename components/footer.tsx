import { Link } from "next-view-transitions";

const linkClass =
  "lowercase transition-colors hover:text-zinc-800 dark:hover:text-zinc-300";

export default function Footer() {
  return (
    <footer className="mt-20 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-sm text-zinc-500">
      <p>© {new Date().getFullYear()} Dan</p>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="mailto:d@niel.lol" className={linkClass}>
          d@niel.lol
        </Link>
        <a
          href="https://git.new/dan-"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          github
        </a>
        <a
          href="https://x.com/lootings"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          twitter
        </a>
      </nav>
    </footer>
  );
}
