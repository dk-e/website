import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { clx } from "../lib/utils";
import Footer from "../components/footer";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const serif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dann.my"),
  title: {
    default: "Dan",
    template: "%s | Dan",
  },
  description: "Cyber security student.",
  openGraph: {
    title: "Dan",
    description: "Cyber security student.",
    url: "https://dann.my",
    siteName: "Dan",
    locale: "en_US",
    type: "website",
    images: ["https://dann.my/og/home"],
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
          sans.variable,
          serif.variable,
          sans.className,
          "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100",
        )}
      >
        {/* The min-height is what lets the footer sit at the bottom of a short
            page. It subtracts the body's own mt-10 + mb-24 (2.5rem + 6rem), which
            live outside the box, so a full-height page doesn't gain a scrollbar. */}
        <body className="mx-4 mb-24 mt-10 flex min-h-[calc(100dvh-8.5rem)] max-w-2xl flex-col antialiased md:flex-row lg:mx-auto">
          <main className="mt-6 flex min-w-0 flex-auto flex-col px-2 md:px-0">
            {children}
            <Footer />
          </main>
        </body>
      </html>
    </ViewTransitions>
  );
}
