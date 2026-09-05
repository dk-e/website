import { NextResponse } from "next/server";

const OFFLINE = { status: "offline" as const, app: null, lastSeen: null };

// One key holds both the liveness signal and the last-seen stamp: "online" is
// derived from how old the stamp is, not from whether the key exists. Two keys
// meant two Redis commands on every read *and* every write, and Upstash bills
// per command — this halves the whole budget for identical behaviour.
const KEY = "presence";

// The Mac beats every 120s. Anything older than this is presumed offline,
// which tolerates two dropped beats before the site changes its mind.
//
// Being slow here costs almost nothing: the app sends explicit beats on sleep,
// wake and quit, so this threshold only catches what those can't — a crash, a
// dead network, a yanked cable.
const STALE_AFTER = 300_000;

// Long enough that last-seen survives a proper holiday, short enough that a
// dead deployment eventually stops claiming I was around.
const RETAIN_SECONDS = 90 * 24 * 60 * 60;

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(command: (string | number)[]) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;

  const res = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json().catch(() => null))?.result ?? null;
}

// Every visitor tab polls this route and they all want the same answer. This
// cache is also the only hard ceiling on read spend: without it, read commands
// scale with traffic and a single busy day could burn the monthly quota. At
// 30s the worst case is ~86k commands/month no matter how much traffic lands.
//
// It costs nothing in freshness — the underlying data only changes every 120s.
const CACHE_MS = 30_000;

let cached: { body: unknown; expiresAt: number } | null = null;

type Beat = {
  at: number;
  afk?: boolean;
  app?: string | null;
  off?: boolean;
};

export async function GET() {
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.body);
  }

  let body: unknown = OFFLINE;

  try {
    const raw = await redis(["GET", KEY]);

    if (typeof raw === "string") {
      const beat = JSON.parse(raw) as Beat;
      const stale = Date.now() - beat.at > STALE_AFTER;

      body =
        beat.off || stale
          ? // Send the raw epoch, not a formatted string: the client renders it
            // in the visitor's own clock and it stays correct as their tab ages.
            { ...OFFLINE, lastSeen: beat.at }
          : {
              status: beat.afk ? "idle" : "online",
              // Don't claim an app while away; it's whatever was open when I left.
              app: beat.afk ? null : (beat.app ?? null),
              lastSeen: null,
            };
    }
  } catch {
    // A failed read should render nothing, not send the client into an
    // error-retry loop.
  }

  cached = { body, expiresAt: Date.now() + CACHE_MS };
  return NextResponse.json(body);
}

export async function POST(request: Request) {
  const secret = process.env.PRESENCE_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const beat = (await request.json().catch(() => null)) as {
    afk?: boolean;
    app?: string | null;
    offline?: boolean;
  } | null;

  if (!beat) return NextResponse.json({ ok: false }, { status: 400 });

  // Every beat is a sighting, including the one on the way to sleep or quit —
  // last-seen should read as the moment I stopped, not STALE_AFTER before it.
  // The explicit `off` flag is what makes quitting show up immediately instead
  // of waiting out the staleness window.
  const body: Beat = beat.offline
    ? { at: Date.now(), off: true }
    : { at: Date.now(), afk: !!beat.afk, app: beat.app ?? null };

  await redis(["SET", KEY, JSON.stringify(body), "EX", RETAIN_SECONDS]);

  cached = null;

  return NextResponse.json({ ok: true });
}
