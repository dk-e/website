import { randomUUID } from "node:crypto";
import { INITIAL_PASSPORT } from "./model";
import { parseLatestCountry, parseVisits } from "./validation";
import type { Passport, Visit } from "./model";

const key = process.env.TRAVEL_REDIS_KEY || "travel:passport:v1";

export function storageConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export async function redis(command: (string | number)[]): Promise<unknown> {
  if (!storageConfigured())
    throw new Error("Travel storage is not configured.");
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Travel storage is unavailable.");
  const body = await response.json();
  if (body.error) throw new Error("Travel storage rejected the request.");
  return body.result;
}

export async function readPassport(): Promise<Passport> {
  const raw = await redis(["GET", key]);
  if (raw === null) return structuredClone(INITIAL_PASSPORT);
  if (typeof raw !== "string") throw new Error("Invalid travel data.");
  const data = JSON.parse(raw);
  if (typeof data.revision !== "string")
    throw new Error("Invalid travel data.");
  const visits = parseVisits(data.visits);
  return {
    revision: data.revision,
    visits,
    latestCountry: parseLatestCountry(data.latestCountry, visits),
  };
}

// Compare and save in one operation, so a stale browser cannot overwrite newer edits.
const SAVE = `
local current = redis.call('GET', KEYS[1])
local revision = '0'
if current then revision = cjson.decode(current).revision end
if revision ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
return 1
`;

export async function savePassport(
  revision: string,
  visits: Visit[],
  latestCountry: string,
): Promise<Passport | null> {
  const passport = { revision: randomUUID(), visits, latestCountry };
  const saved = await redis([
    "EVAL",
    SAVE,
    1,
    key,
    revision,
    JSON.stringify(passport),
  ]);
  return saved === 1 ? passport : null;
}

export async function allowLoginAttempt() {
  const bucket = Math.floor(Date.now() / (15 * 60_000));
  // A single-owner editor has a shared limit, independent of spoofable IP headers.
  const attempts = await redis([
    "EVAL",
    "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 900) end; return n",
    1,
    `${key}:login:${bucket}`,
  ]);
  return typeof attempts === "number" && attempts <= 20;
}
