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
    <body className="mx-4 mb-40 mt-8 flex max-w-2xl flex-col antialiased md:flex-row lg:mx-auto">
      <main className="mt-6 flex min-w-0 flex-auto flex-col px-2 md:px-0">
        <section>
          <Link
            href="/"
            className="mb-4 p-2 bg-neutral-900 text-white rounded inline-block"
          >
            <Undo2 className="size-5" />
          </Link>
          <h1 className="text-2xl font-medium tracking-tighter">
            404 - Page Not Found
          </h1>
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            Sorry, the page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block p-2 bg-neutral-900 text-white rounded"
          >
            Go back home
          </Link>
        </section>
      </main>
    </body>
  );
}
