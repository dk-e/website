"use client";
import { useLanyardWS } from "use-lanyard";
import { discordId } from "../lib/constants";

const statusCopy = {
  dnd: "in dnd",
  idle: "idle",
  online: "online",
  offline: "offline",
} as const;

const statusClass = {
  dnd: "text-red-800/80 dark:text-red-400/70",
  idle: "text-amber-800/80 dark:text-amber-400/70",
  online: "text-emerald-800/80 dark:text-emerald-400/70",
  offline: "",
} as const;

export default function Discord(props: { lanyard?: unknown }) {
  const lanyard = useLanyardWS(discordId, {
    initialData: props.lanyard as never,
  });

  const status = (lanyard?.discord_status ??
    "offline") as keyof typeof statusCopy;

  return (
    <p className="text-sm text-zinc-500">
      I&apos;m currently{" "}
      <span className={statusClass[status]}>{statusCopy[status]}</span>.
    </p>
  );
}
