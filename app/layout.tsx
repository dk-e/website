import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { clx } from "../lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://daniel.rest"),
  title: {
    default: "Dan",
    template: "%s | Dan",
  },
  description: "Developer | 🧑‍💻",
  openGraph: {
    title: "Dan",
    description: "Developer | 🧑‍💻",
    url: "https://daniel.rest",
    siteName: "Dan",
    locale: "en_US",
    type: "website",
    images: ["https://daniel.rest/og/home"],
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  twitter: {
    title: "Dan",
    card: "summary_large_image",
    creator: "@lootings",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={clx(
          inter.className,
          "bg-neutral-100 text-black dark:bg-neutral-950 dark:text-white"
        )}
      >
        <body className="mx-4 mb-40 mt-8 flex max-w-2xl flex-col antialiased md:flex-row lg:mx-auto">
          <main className="mt-6 flex min-w-0 flex-auto flex-col px-2 md:px-0">
            {children}
          </main>
        </body>
      </html>
    </ViewTransitions>
  );
}
