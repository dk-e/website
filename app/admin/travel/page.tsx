import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { authConfigured, isAdmin } from "../../../lib/travel/auth";
import { storageConfigured } from "../../../lib/travel/store";
import TravelAdmin from "../../../components/travel-admin";

export const metadata: Metadata = {
  title: "Travel admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function TravelAdminPage() {
  const configured = authConfigured() && storageConfigured();
  return (
    <div className="space-y-8">
      <Link href="/" className="nav-back">
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back to site
      </Link>
      <header>
        <p className="section-kicker">Just for you</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
          Your travel passport
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Keep track of where you&apos;ve been. Your map and country totals
          update together.
        </p>
      </header>
      {configured ? (
        <TravelAdmin authenticated={await isAdmin()} />
      ) : (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-medium">One-time setup</h2>
          {!authConfigured() && (
            <p>
              Run{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 dark:bg-zinc-800">
                bun run travel:password
              </code>{" "}
              in the project to generate an admin password. Restart the local
              server afterwards.
            </p>
          )}
          {!storageConfigured() && (
            <p>
              Add <code>UPSTASH_REDIS_REST_URL</code> and{" "}
              <code>UPSTASH_REDIS_REST_TOKEN</code> to your environment to
              enable saved edits.
            </p>
          )}
          <p className="text-zinc-500">
            For the live website, add <code>TRAVEL_ADMIN_PASSWORD</code> (at
            least 16 characters) in your hosting environment and redeploy. Use
            the same Redis database as the rest of the site.
          </p>
        </div>
      )}
    </div>
  );
}
