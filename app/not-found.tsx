import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Undo2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for could not be found.",
  openGraph: {
    images: [
      {
        url: "https://dann.my/og/home?title=page+not+found",
      },
    ],
  },
};

export default function NotFoundPage() {
  return (
    <main className="space-y-8 text-left">
      <section className="space-y-4">
        <Link href="/" className="nav-back group">
          <Undo2 className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back</span>
        </Link>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          404
        </h1>

        <p className="max-w-prose text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          This page does not exist.
        </p>
      </section>
    </main>
  );
}
