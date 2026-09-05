"use client";

import useSWR from "swr";
import Image from "next/image";
import { Link } from "next-view-transitions";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Music() {
  const { data } = useSWR("/api/spotify", fetcher, {
    refreshInterval: 10_000,
    keepPreviousData: true,
  });

  if (!data || !data.isPlaying) return null;

  return (
    <p className="text-sm text-zinc-500">
      Listening to{" "}
      {data.trackUrl ? (
        <Link href={data.trackUrl} target="_blank" className="link-underline">
          {data.title}
        </Link>
      ) : (
        data.title
      )}{" "}
      by {data.artist}.
    </p>
  );
}
