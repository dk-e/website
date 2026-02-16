"use client";
import { useLanyardWS } from "use-lanyard";
import { discordId } from "../lib/constants";
import Image from "next/image";
import { Link } from "next-view-transitions";

export default function Music(props: any) {
  const lanyard = useLanyardWS(discordId, {
    initialData: props.lanyard,
  })!;

  if (!lanyard || !lanyard.spotify) {
    return <p className="text-sm text-neutral-600 dark:text-neutral-400"></p>;
  }

  return (
    <div className="flex items-center max-w-xs">
      <Image
        src={lanyard.spotify.album_art_url ?? ""}
        width={1920}
        height={1080}
        draggable={false}
        alt="Album art"
        className="size-20 border-2 border-neutral-700 rounded-md mr-4 my-2"
      />
      <div className="flex flex-col">
        <Link
          href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
          target="_blank"
          className="text-md font-bold hover:underline decoration-neutral-400 decoration-[0.1em] underline-offset-2 dark:decoration-neutral-600"
        >
          {lanyard.spotify.song}
        </Link>
        <div className="text-sm text-gray-300">{lanyard.spotify.artist}</div>
      </div>
    </div>
  );
}
