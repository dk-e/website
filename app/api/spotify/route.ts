import { NextResponse } from "next/server";

const BASIC = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
).toString("base64");

async function getAccessToken() {
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

  const json = await res.json();
  return json.access_token;
}

export async function GET() {
  const token = await getAccessToken();
  const playing = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing?market=US",
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (playing.status === 204 || playing.status === 202)
    return NextResponse.json({ isPlaying: false });

  const data = await playing.json();
  return NextResponse.json({
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists.map((a: any) => a.name).join(", "),
    album: data.item.album.name,
    albumImageUrl: data.item.album.images[0].url,
    trackUrl: data.item.external_urls.spotify,
  });
}
