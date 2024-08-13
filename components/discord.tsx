"use client";
import { useLanyardWS } from "use-lanyard";
import { discordId, discordUser } from "../lib/constants";

export default function Discord(props: any) {
  const lanyard = useLanyardWS(discordId, {
    initialData: props.lanyard,
  })!;

  const status = lanyard?.discord_status ?? "offline";

  return (
    <p className="prose prose-neutral dark:prose-invert">
      my discord is{" "}
      <span className="font-medium underline text-white">
        @{lanyard?.discord_user.username || `${discordUser}`}
      </span>{" "}
      - i&apos;m currently{" "}
      <span
        className={
          {
            dnd: "text-red-600 dark:text-red-400",
            idle: "text-amber-500",
            online: "text-green-500",
            offline: "text-blurple",
          }[status]
        }
      >
        {
          {
            dnd: "in dnd",
            idle: "idle",
            online: "online",
            offline: "offline",
          }[status]
        }
      </span>
    </p>
  );
}
