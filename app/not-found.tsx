import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Undo2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for could not be found.",
  openGraph: {
    images: [
      {
        url: "https://daniel.rest/og/home?title=page+not+found",
      },
    ],
  },
};

export default function NotFoundPage() {
  return (
    <main className="space-y-8 text-left">
      <section className="space-y-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-1 text-sm text-purple-500 transition-colors hover:text-purple-400 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <Undo2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>back</span>
        </Link>

        <h1 className="flex items-center gap-1 font-medium uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <span className="text-purple-500 dark:text-purple-400">*</span>
          <span>404 - page not found</span>
        </h1>

        <p className="max-w-prose text-base text-neutral-700 dark:text-neutral-300">
          this page does not exist.
        </p>
      </section>
    </main>
  );
}
