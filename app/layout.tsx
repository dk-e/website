import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://da.niel.lol"),
  title: {
    default: "Dan",
    template: "%s | Dan",
  },
  description: "Developer, cardist and maker of things.",
  openGraph: {
    title: "Dan",
    description: "Developer, cardist and maker of things.",
    url: "https://da.niel.lol",
    siteName: "Dan",
    locale: "en_US",
    type: "website",
    images: ["https://da.niel.lol/og/home"],
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
    creator: "@nexxeln",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
