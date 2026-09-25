import { NextResponse } from "next/server";

const OFFLINE = { status: "offline" as const, app: null, lastSeen: null };
const KEY = "presence";
const STALE_AFTER = 300_000;
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
          ? { ...OFFLINE, lastSeen: beat.at }
          : {
              status: beat.afk ? "idle" : "online",

              app: beat.afk ? null : (beat.app ?? null),
              lastSeen: null,
            };
    }
  } catch {}

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
  const body: Beat = beat.offline
    ? { at: Date.now(), off: true }
    : { at: Date.now(), afk: !!beat.afk, app: beat.app ?? null };

  await redis(["SET", KEY, JSON.stringify(body), "EX", RETAIN_SECONDS]);

  cached = null;

  return NextResponse.json({ ok: true });
}
