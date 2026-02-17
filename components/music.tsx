"use client";
import useSWR from "swr";
import Image from "next/image";
import { Link } from "next-view-transitions";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Music() {
  const { data } = useSWR("/api/spotify", fetcher, {
    refreshInterval: 10_000, // 10 s
  });

  if (!data || !data.isPlaying)
    return <p className="text-sm text-neutral-600 dark:text-neutral-400" />;

  return (
    <div className="flex items-center max-w-xs">
      <Image
        src={data.albumImageUrl}
        width={1920}
        height={1080}
        draggable={false}
        alt="Album art"
        className="size-20 border-2 border-neutral-700 rounded-md mr-4 my-2"
      />
      <div className="flex flex-col">
        <Link
          href={data.trackUrl}
          target="_blank"
          className="text-md font-bold link-underline"
        >
          {data.title}
        </Link>
        <div className="text-sm text-gray-300">{data.artist}</div>
      </div>
    </div>
  );
}
