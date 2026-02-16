"use client";
import { useLanyardWS } from "use-lanyard";
import { discordId, discordUser } from "../lib/constants";
import Link from "next/link";

export default function Discord(props: any) {
  const lanyard = useLanyardWS(discordId, {
    initialData: props.lanyard,
  })!;

  const status = lanyard?.discord_status ?? "offline";

  return (
    <p className="prose prose-neutral dark:prose-invert">
      my discord is{" "}
      <Link
        className="font-medium text-purple-600 nice-underline-purple-500 dark:text-purple-300 dark:nice-underline-purple-300"
        href="https://discord.com/users/424242424242424242"
      >
        @{lanyard?.discord_user.username || `${discordUser}`}
      </Link>{" "}
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
