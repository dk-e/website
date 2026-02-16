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
    <p>
      my discord is{" "}
      <Link
        className="link-underline"
        href="https://discord.dog/745631824163766412"
        target="_blank"
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
