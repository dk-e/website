"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
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
type MapView = { x: number; y: number; width: number; height: number };
type MapPoint = { x: number; y: number };

const WORLD_VIEW: MapView = { x: 18, y: 8, width: 687, height: 308 };
const MAX_ZOOM = 8;

function clampMapView(view: MapView): MapView {
  return {
    ...view,
    x: Math.max(WORLD_VIEW.x, Math.min(view.x, WORLD_VIEW.x + WORLD_VIEW.width - view.width)),
    y: Math.max(WORLD_VIEW.y, Math.min(view.y, WORLD_VIEW.y + WORLD_VIEW.height - view.height)),
  };
}

function PassportMap({
  visited,
  sorted,
}: {
  visited: string[];
  sorted: string[];
}) {
  const instructionsId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef<MapView>(WORLD_VIEW);
  const pointers = useRef(new Map<number, MapPoint>());
  const [view, setView] = useState<MapView>(WORLD_VIEW);

  const updateView = useCallback((next: (current: MapView) => MapView) => {
    const updated = clampMapView(next(viewRef.current));
    const current = viewRef.current;
    if (updated.x === current.x && updated.y === current.y &&
        updated.width === current.width && updated.height === current.height) return;
    viewRef.current = updated;
    setView(updated);
  }, []);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number, destination?: MapPoint) => {
      if (!Number.isFinite(factor) || factor <= 0) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      const nx = (clientX - rect.left) / rect.width;
      const ny = (clientY - rect.top) / rect.height;
      const targetX = destination ? (destination.x - rect.left) / rect.width : nx;
      const targetY = destination ? (destination.y - rect.top) / rect.height : ny;
      updateView((current) => {
        const zoom = Math.max(1, Math.min(MAX_ZOOM, (WORLD_VIEW.width / current.width) * factor));
        const width = WORLD_VIEW.width / zoom;
        const height = WORLD_VIEW.height / zoom;
        return {
          x: current.x + nx * current.width - targetX * width,
          y: current.y + ny * current.height - targetY * height,
          width,
          height,
        };
      });
    },
    [updateView],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Trackpad pinches arrive as Ctrl+wheel in Chromium/Firefox and gesture events in Safari.
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      zoomAt(event.clientX, event.clientY, Math.exp(-event.deltaY * 0.01));
    };
    type SafariGesture = Event & { scale: number; clientX?: number; clientY?: number };
    let previousGestureScale = 1;
    const onGestureStart = (event: Event) => {
      event.preventDefault();
      previousGestureScale = 1;
    };
    const onGestureChange = (event: Event) => {
      event.preventDefault();
      const gesture = event as SafariGesture;
      // iOS may also dispatch pointer events for the same pinch.
      if (pointers.current.size >= 2) {
        previousGestureScale = gesture.scale;
        return;
      }
      const rect = svg.getBoundingClientRect();
      zoomAt(
        gesture.clientX ?? rect.left + rect.width / 2,
        gesture.clientY ?? rect.top + rect.height / 2,
        gesture.scale / previousGestureScale,
      );
      previousGestureScale = gesture.scale;
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("gesturestart", onGestureStart, { passive: false });
    svg.addEventListener("gesturechange", onGestureChange, { passive: false });
    return () => {
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("gesturestart", onGestureStart);
      svg.removeEventListener("gesturechange", onGestureChange);
    };
  }, [zoomAt]);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (pointers.current.size >= 2) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    const other = [...pointers.current.entries()].find(([id]) => id !== event.pointerId)?.[1];
    pointers.current.set(event.pointerId, current);
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    if (other) {
      const oldMid = { x: (previous.x + other.x) / 2, y: (previous.y + other.y) / 2 };
      const newMid = { x: (current.x + other.x) / 2, y: (current.y + other.y) / 2 };
      const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
      const newDistance = Math.hypot(current.x - other.x, current.y - other.y);
      if (!oldDistance) return;
      zoomAt(oldMid.x, oldMid.y, newDistance / oldDistance, newMid);
    } else {
      updateView((view) => ({
        ...view,
        x: view.x - ((current.x - previous.x) / rect.width) * view.width,
        y: view.y - ((current.y - previous.y) / rect.height) * view.height,
      }));
    }
  };

  const onPointerEnd = (event: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const rect = event.currentTarget.getBoundingClientRect();
    switch (event.key) {
      case "+":
      case "=":
        zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.5);
        break;
      case "-":
      case "_":
        zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1 / 1.5);
        break;
      case "0":
      case "Escape":
        updateView(() => WORLD_VIEW);
        break;
      case "ArrowLeft":
        updateView((current) => ({ ...current, x: current.x - current.width * 0.1 }));
        break;
      case "ArrowRight":
        updateView((current) => ({ ...current, x: current.x + current.width * 0.1 }));
        break;
      case "ArrowUp":
        updateView((current) => ({ ...current, y: current.y - current.height * 0.1 }));
        break;
      case "ArrowDown":
        updateView((current) => ({ ...current, y: current.y + current.height * 0.1 }));
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <>
      <span id={instructionsId} className="sr-only">
        Pinch to zoom and drag to move the map. With the map focused, use plus and minus to zoom, arrow keys to move, and Escape to reset.
      </span>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        role="img"
        tabIndex={0}
        aria-describedby={instructionsId}
        aria-label={`World map showing ${visited.length} visited countries: ${sorted.map((code) => countryByCode.get(code)?.name).join(", ") || "none yet"}`}
        className="block h-auto w-full touch-none cursor-grab active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onLostPointerCapture={onPointerEnd}
        onKeyDown={onKeyDown}
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
    </>
  );
}

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
        <PassportMap visited={visited} sorted={sorted} />
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
