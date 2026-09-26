"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import useSWR from "swr";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Globe2,
  Minus,
  Plus,
  RotateCcw,
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

const MAP = { x: 18, y: 8, width: 687, height: 308 };
const ZOOM_LEVELS = [1, 1.6, 2.5, 4, 6];
const INITIAL_VIEW = {
  level: 0,
  centerX: MAP.x + MAP.width / 2,
  centerY: MAP.y + MAP.height / 2,
};

function clampView(view: typeof INITIAL_VIEW) {
  const zoom = ZOOM_LEVELS[view.level] ?? 1;
  const halfWidth = MAP.width / zoom / 2;
  const halfHeight = MAP.height / zoom / 2;
  return {
    ...view,
    centerX: Math.min(
      MAP.x + MAP.width - halfWidth,
      Math.max(MAP.x + halfWidth, view.centerX),
    ),
    centerY: Math.min(
      MAP.y + MAP.height - halfHeight,
      Math.max(MAP.y + halfHeight, view.centerY),
    ),
  };
}

async function fetcher(url: string): Promise<PublicPassport> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error("Travel details are temporarily unavailable.");
  return response.json();
}

export function PassportCard({ passport }: { passport: PublicPassport }) {
  const [expanded, setExpanded] = useState(false);
  const [mapView, setMapView] = useState(INITIAL_VIEW);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    pointerId: number;
    x: number;
    y: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const zoom = ZOOM_LEVELS[mapView.level] ?? 1;
  const viewWidth = MAP.width / zoom;
  const viewHeight = MAP.height / zoom;

  function changeZoom(step: number) {
    setMapView((current) =>
      clampView({
        ...current,
        level: Math.max(
          0,
          Math.min(ZOOM_LEVELS.length - 1, current.level + step),
        ),
      }),
    );
  }

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    if (
      mapView.level === 0 ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      centerX: mapView.centerX,
      centerY: mapView.centerY,
    };
    setDragging(true);
  }

  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setMapView((current) =>
      clampView({
        ...current,
        centerX: start.centerX - ((event.clientX - start.x) / bounds.width) * viewWidth,
        centerY: start.centerY - ((event.clientY - start.y) / bounds.height) * viewHeight,
      }),
    );
  }

  function stopDrag() {
    dragStart.current = null;
    setDragging(false);
  }

  function panWithKeyboard(event: KeyboardEvent<SVGSVGElement>) {
    if (mapView.level === 0) return;
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-viewWidth / 5, 0],
      ArrowRight: [viewWidth / 5, 0],
      ArrowUp: [0, -viewHeight / 5],
      ArrowDown: [0, viewHeight / 5],
    };
    if (event.key === "Escape") {
      setMapView(INITIAL_VIEW);
      return;
    }
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    setMapView((current) =>
      clampView({
        ...current,
        centerX: current.centerX + offset[0],
        centerY: current.centerY + offset[1],
      }),
    );
  }

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
          viewBox={`${mapView.centerX - viewWidth / 2} ${mapView.centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`}
          role="img"
          aria-label={`World map showing ${visited.length} visited countries: ${sorted.map((code) => countryByCode.get(code)?.name).join(", ") || "none yet"}`}
          aria-describedby="passport-map-help"
          tabIndex={mapView.level > 0 ? 0 : -1}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onLostPointerCapture={stopDrag}
          onKeyDown={panWithKeyboard}
          className={`block h-auto w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${mapView.level > 0 ? "cursor-grab touch-none" : ""} ${dragging ? "cursor-grabbing" : ""}`}
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
        <div className="mt-1 flex items-center justify-between gap-2 px-4 sm:px-5">
          <p id="passport-map-help" className="text-[10px] text-zinc-500">
            {mapView.level > 0
              ? "Drag to move · arrow keys when focused"
              : "Zoom in to explore the map"}
          </p>
          <div
            role="group"
            aria-label="Map zoom controls"
            className="flex shrink-0 items-center gap-1"
          >
            <button
              type="button"
              onClick={() => changeZoom(-1)}
              disabled={mapView.level === 0}
              aria-label="Zoom out"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Minus aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center text-[10px] tabular-nums text-zinc-500">
              {zoom}×
            </span>
            <button
              type="button"
              onClick={() => changeZoom(1)}
              disabled={mapView.level === ZOOM_LEVELS.length - 1}
              aria-label="Zoom in"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            {mapView.level > 0 && (
              <button
                type="button"
                onClick={() => setMapView(INITIAL_VIEW)}
                aria-label="Reset map"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
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
