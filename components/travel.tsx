"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Globe2,
} from "lucide-react";
import shapes from "../data/travel-map.json";
import {
  countryByCode,
  flag,
  formatVisitDate,
  travelStats,
} from "../lib/travel/model";
import type { Passport } from "../lib/travel/model";

type PublicPassport = Pick<Passport, "visits" | "latestCountry">;

async function fetcher(url: string): Promise<PublicPassport> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("Travel details are temporarily unavailable.");
  return response.json();
}

export function PassportCard({ passport }: { passport: PublicPassport }) {
  const [expanded, setExpanded] = useState(false);
  const { visited, continents, latest } = travelStats(
    passport.visits,
    passport.latestCountry,
  );
  const sorted = [...visited].sort((a, b) =>
    (countryByCode.get(a)?.name ?? "").localeCompare(
      countryByCode.get(b)?.name ?? "",
    ),
  );
  const latestName = latest ? countryByCode.get(latest.country)?.name : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_24px_-12px_rgba(0,0,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between px-5 pt-5 sm:px-6">
        <p className="flex items-center gap-2.5 text-sm font-medium">
          <Globe2 aria-hidden="true" className="h-4 w-4 text-zinc-500" />{" "}
          Dan&apos;s passport
        </p>
        <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] text-zinc-500 dark:border-zinc-700">
          All time
        </span>
      </div>

      <div className="px-1 pb-3 pt-3">
        <svg
          viewBox="18 8 687 308"
          role="img"
          aria-label={`World map showing ${visited.length} visited countries: ${sorted.map((code) => countryByCode.get(code)?.name).join(", ") || "none yet"}`}
          className="block h-auto w-full"
        >
          <g
            strokeWidth="0.45"
            strokeLinejoin="round"
            className="stroke-white dark:stroke-zinc-900"
          >
            {shapes.map((shape) => (
              <path
                key={shape.code}
                d={shape.path}
                className={
                  visited.includes(shape.code)
                    ? "fill-blue-500 dark:fill-blue-400"
                    : "fill-zinc-200 dark:fill-zinc-700/80"
                }
              >
                <title>
                  {countryByCode.get(shape.code)?.name ?? ""}
                  {visited.includes(shape.code) ? " · visited" : ""}
                </title>
              </path>
            ))}
          </g>
        </svg>
        <div className="mt-1 flex justify-end gap-3 px-4 text-[10px] text-zinc-500 sm:px-5">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            Visited
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            Still to explore
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-zinc-100 py-5 dark:border-zinc-800 sm:grid-cols-[1fr_1fr_1.35fr]">
        <div className="px-5 sm:px-6">
          <p className="text-4xl font-medium leading-none tracking-tight tabular-nums">
            {visited.length}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Countries visited</p>
        </div>
        <div className="border-l border-zinc-100 px-5 dark:border-zinc-800 sm:px-6">
          <p className="text-4xl font-medium leading-none tracking-tight tabular-nums">
            {continents}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Continents</p>
        </div>
        <div className="col-span-2 mt-5 flex items-center gap-3 border-t border-zinc-100 px-5 pt-4 dark:border-zinc-800 sm:col-span-1 sm:mt-0 sm:border-l sm:border-t-0 sm:px-6 sm:pt-0">
          {latest && (
            <span aria-hidden="true" className="text-3xl leading-none">
              {flag(latest.country)}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Most recent
            </p>
            <p className="mt-1 text-sm font-medium">
              {latestName ?? "More adventures ahead"}
            </p>
            {latest && (latest.date || latest.city) && (
              <p className="mt-0.5 text-[10px] text-zinc-500">
                {[latest.city, latest.date ? formatVisitDate(latest.date) : ""]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {visited.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls="visited-countries"
            className="flex w-full items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-500 dark:border-zinc-800 dark:hover:bg-zinc-800/50 sm:px-6"
          >
            <span
              aria-hidden="true"
              className="flex min-w-0 items-center gap-2 overflow-hidden text-lg leading-none"
            >
              {sorted.slice(0, 6).map((code) => (
                <span key={code}>{flag(code)}</span>
              ))}
              {visited.length > 6 && (
                <span className="text-[10px] text-zinc-400">
                  +{visited.length - 6}
                </span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-zinc-500">
              {expanded ? "Hide countries" : "View countries"}
              <ChevronDown
                aria-hidden="true"
                className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </span>
          </button>
          {expanded && (
            <ul
              id="visited-countries"
              className="grid grid-cols-1 gap-x-5 border-t border-zinc-100 px-5 py-2 dark:border-zinc-800 sm:grid-cols-2 sm:px-6"
            >
              {sorted.map((code) => {
                const visit = passport.visits
                  .filter((item) => item.country === code)
                  .sort((a, b) => b.date.localeCompare(a.date))[0];
                return (
                  <li
                    key={code}
                    className="flex items-center gap-2.5 py-2.5 text-xs"
                  >
                    <span aria-hidden="true" className="text-lg">
                      {flag(code)}
                    </span>
                    <span className="flex-1">
                      {countryByCode.get(code)?.name}
                    </span>
                    {code === latest?.country ? (
                      <span className="text-[9px] text-blue-600 dark:text-blue-400">
                        Latest
                      </span>
                    ) : visit?.date ? (
                      <span className="text-[9px] text-zinc-500">
                        {formatVisitDate(visit.date)}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <p className="border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500 dark:border-zinc-800">
          The first destination is still to come.
        </p>
      )}
    </div>
  );
}

export default function Travel() {
  const { data, error, mutate } = useSWR<PublicPassport>(
    "/api/travel",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 60_000, errorRetryCount: 2 },
  );
  return (
    <section aria-labelledby="travel-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="travel-title" className="section-kicker">
          Travel
        </h2>
        <ArrowDownRight
          aria-hidden="true"
          className="h-3.5 w-3.5 text-zinc-400"
        />
      </div>
      {data ? (
        <PassportCard passport={data} />
      ) : error ? (
        <div className="rounded-2xl border border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
          Travel details are temporarily unavailable.{" "}
          <button className="link-underline" onClick={() => void mutate()}>
            Try again{" "}
            <ArrowUpRight aria-hidden="true" className="inline h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          role="status"
          className="h-80 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 motion-reduce:animate-none dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="sr-only">Loading travel passport</span>
        </div>
      )}
    </section>
  );
}
