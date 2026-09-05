"use client";

import useSWR from "swr";

// Declared here rather than imported from lib/constants: that module does
// birthday arithmetic at import time, which would then run in every visitor's
// browser just to borrow a formatter — and take this component down with it if
// it ever threw.
const relative = new Intl.RelativeTimeFormat("en", { style: "long" });

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const statusCopy = {
  online: "online",
  idle: "idle",
  offline: "offline",
} as const;

const statusClass = {
  online: "text-emerald-800/80 dark:text-emerald-400/70",
  idle: "text-amber-800/80 dark:text-amber-400/70",
  offline: "",
} as const;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function lastSeenCopy(at: number) {
  const elapsed = Date.now() - at;

  if (elapsed < MINUTE) return "just now";

  const [value, unit] =
    elapsed < HOUR
      ? [elapsed / MINUTE, "minute" as const]
      : elapsed < DAY
        ? [elapsed / HOUR, "hour" as const]
        : [elapsed / DAY, "day" as const];

  return relative.format(-Math.floor(value), unit);
}

type Presence = {
  status: keyof typeof statusCopy;
  app: string | null;
  lastSeen: number | null;
};

export default function Presence() {
  const { data } = useSWR<Presence>("/api/presence", fetcher, {
    refreshInterval: 30_000,
    keepPreviousData: true,
  });

  // Render nothing until the first fetch lands. Defaulting to "offline" meant
  // the prerendered HTML always asserted I was offline, so a CDN-cached page,
  // blocked JS or a quick glance showed the wrong state until SWR corrected it.
  if (!data) return null;

  const status = data.status;

  return (
    <p className="text-sm text-zinc-500">
      I&apos;m currently{" "}
      <span className={statusClass[status]}>{statusCopy[status]}</span>
      {status === "online" && data.app ? <> in {data.app}</> : null}
      {status === "offline" && data.lastSeen ? (
        <>, last online {lastSeenCopy(data.lastSeen)}</>
      ) : null}
      .
    </p>
  );
}
