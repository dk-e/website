import { NextResponse } from "next/server";

const BASIC = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
).toString("base64");

const NOT_PLAYING = { isPlaying: false };

// Access tokens live an hour, so hold on to one instead of minting a fresh
// token on every poll. Refreshing per-request doubled our call volume and was
// what pushed us into Spotify's rate limit.
let token: { value: string; expiresAt: number } | null = null;

async function getAccessToken() {
  if (token && Date.now() < token.expiresAt) return token.value;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${BASIC}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (!json.access_token) return null;

  token = {
    value: json.access_token,
    // Expire a minute early so we never race the real expiry mid-request.
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return token.value;
}

// Every visitor tab polls this route, but they all want the same answer, so
// share one upstream call between them for a few seconds.
let cached: { body: unknown; expiresAt: number } | null = null;

async function getNowPlaying() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NOT_PLAYING;

  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing?market=US",
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );

  // 401 means the cached token went stale early (revoked, scope change).
  // Drop it so the next poll mints a new one.
  if (res.status === 401) token = null;

  // 204 is Spotify's "nothing playing". Anything else non-OK (429 rate limit,
  // 5xx) has an error body, not a track — don't try to read one out of it.
  if (!res.ok || res.status === 204) return NOT_PLAYING;

  const data = await res.json().catch(() => null);

  // `item` is absent for ads and unknown playback types even on a 200.
  if (!data?.item) return NOT_PLAYING;

  const item = data.item;

  // Tracks carry artists and an album; podcast episodes carry a show and
  // their own images.
  const artist = Array.isArray(item.artists)
    ? item.artists.map((a: { name: string }) => a.name).join(", ")
    : (item.show?.name ?? "");
  const images = item.album?.images ?? item.images ?? [];

  return {
    isPlaying: data.is_playing,
    title: item.name,
    artist,
    album: item.album?.name ?? item.show?.name ?? "",
    albumImageUrl: images[0]?.url ?? null,
    trackUrl: item.external_urls?.spotify ?? null,
  };
}

export async function GET() {
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.body);
  }

  try {
    const body = await getNowPlaying();
    cached = { body, expiresAt: Date.now() + 5_000 };
    return NextResponse.json(body);
  } catch {
    // Never 500 here — a failed poll should just render nothing, not send the
    // client into an error-retry loop that makes the rate limiting worse.
    return NextResponse.json(NOT_PLAYING);
  }
}
