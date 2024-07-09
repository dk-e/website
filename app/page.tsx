"use client";
import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import Image from "next/image";
import { SiSpotify } from "react-icons/si";
import { useLanyardWS, type Data as LanyardData } from "use-lanyard";
import { MessageGroup } from "../components/message";
import { discordId } from "../utils/constants";

export interface Props {
  lanyard: LanyardData;
}

export default function Home(props: any) {
  const lanyard = useLanyardWS(discordId, {
    initialData: props.lanyard,
  })!;

  const status = lanyard?.discord_status ?? "offline";

  return (
    <main className="mx-auto max-w-xl px-3 pb-16 pt-24">
      <motion.ul
        transition={{
          staggerChildren: 0.3,
          delayChildren: 0.3,
        }}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <MessageGroup
          messages={[
            {
              key: "intro",
              content: (
                <>
                  Hi there, I&apos;m <span className="font-serif">Dan</span>.
                  I&apos;m a fullstack dev (barely)
                </>
              ),
            },
            {
              key: "work",
              content: (
                <>
                  Currently I&apos;m working on{" "}
                  <Link
                    target="_blank"
                    href="https://remor.se"
                    className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
                  >
                    remorse
                  </Link>
                  . It&apos;s a file upload service designed for sharex &amp;
                  discord with some cool domains.
                </>
              ),
            },
            {
              key: "remorse",
              content: (
                <>
                  <span className="italic">
                    (if you want to share images with friends &amp; show off
                    cool domains, try it out when we release
                  </span>{" "}
                  😊<span className="italic">)</span>
                </>
              ),
            },
          ]}
        />
        <MessageGroup
          messages={[
            ...(lanyard?.spotify
              ? [
                  {
                    key: "music-playing",
                    content: (
                      <div className="space-y-3">
                        <p>
                          I listen to a lot of music. Everything from
                          underground to rock &amp; indie. Currently listening
                          to this on Spotify:
                        </p>

                        <Link
                          href={`https://open.spotify.com/track/${lanyard.spotify.track_id}`}
                          className="group relative !mb-1 block w-fit min-w-[300px] overflow-hidden rounded-xl rounded-bl-md p-3"
                          target="_blank"
                        >
                          <div className="absolute -inset-[1px] z-20 rounded-xl rounded-bl-md border-[3px] border-black/10 dark:border-white/20"></div>

                          <div className="absolute inset-0">
                            <div className="absolute inset-0 z-10 bg-white/70 group-hover:bg-white/80 dark:bg-neutral-800/80 dark:group-hover:bg-neutral-800/90"></div>
                            <Image
                              src={lanyard.spotify.album_art_url ?? ""}
                              width={1920}
                              height={1080}
                              alt="Album art"
                              aria-hidden
                              className="absolute top-1/2 -translate-y-1/2 scale-[3] blur-3xl saturate-[15] dark:saturate-[10]"
                            />
                          </div>

                          <div className="relative z-10 flex items-center space-x-4 pr-8">
                            <Image
                              src={lanyard.spotify.album_art_url ?? ""}
                              width={1920}
                              height={1080}
                              alt="Album art"
                              className="size-12 rounded-md border-2"
                            />

                            <div className="space-y-1">
                              <p className="line-clamp-1">
                                <strong>{lanyard.spotify.song}</strong>
                              </p>
                              <p className="line-clamp-1 text-neutral-800 dark:text-white/60">
                                {lanyard.spotify.artist.split("; ").join(", ")}
                              </p>
                            </div>
                          </div>

                          <div className="absolute right-4 top-4 z-10">
                            <SiSpotify className="size-4 text-neutral-900/80 dark:text-white/50" />
                          </div>
                        </Link>
                      </div>
                    ),
                  },
                ]
              : [
                  {
                    key: "music",
                    content: (
                      <p>
                        I listen to a lot of music, I like everything from
                        underground all the way to rock &amp; indie. If you come
                        back to this page later, you might see what I&apos;m
                        listening to on Spotify, in realtime.
                      </p>
                    ),
                  },
                ]),
          ]}
        />

        <MessageGroup
          messages={[
            {
              key: "blog-intro",
              content: (
                <p>
                  I also have a blog which I will try to post on fairly often.{" "}
                  <Link
                    href={"/blog"}
                    className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
                  >
                    Check it out
                  </Link>{" "}
                  ✍️
                </p>
              ),
            },
            {
              key: "blog-2",
              content: (
                <p>
                  I will try to dynamically display the blogs in this section
                  when I get around to it.
                </p>
              ),
            },
          ]}
        />

        <MessageGroup
          messages={[
            {
              key: "contact",
              content: <>Want to reach me?</>,
            },
            {
              key: "discord",
              content: (
                <>
                  My Discord is <code>@sexuals</code> - I&apos;m currently{" "}
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
                </>
              ),
            },
            {
              key: "socials",
              content: (
                <>
                  Also check out my{" "}
                  <Link
                    href="https://git.new/rich"
                    className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
                    target="_blank"
                  >
                    GitHub
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="https://twitter.com/lootings"
                    className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
                    target="_blank"
                  >
                    X
                  </Link>{" "}
                  (twitter) :)
                </>
              ),
            },
          ]}
        />

        <MessageGroup
          messages={[
            {
              key: "yt",
              content: (
                <>
                  Just one more thing that i found cool... i managed to get {""}
                  <Link
                    href="https://youtube.com/@板"
                    className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50 text-red-500 text-glow-red-500"
                    target="_blank"
                  >
                    @板
                  </Link>{" "}
                  on youtube, which is pretty cool imo.
                </>
              ),
            },
            {
              key: "yt-2",
              content: (
                <>This is definitly not supposed to be possible, but it is.</>
              ),
            },
          ]}
        />

        <MessageGroup
          messages={[
            {
              key: "finally",
              content: (
                <>
                  Finally, this site is basically a 1:1 from{" "}
                  <Link
                    href="https://github.com/alii"
                    className="nice-underline-neutral-400 dark:nice-underline-neutral-200/50"
                    target="_blank"
                  >
                    alii
                  </Link>{" "}
                  over on github so shoutout to him for open sourcing this.
                </>
              ),
            },
          ]}
        />
      </motion.ul>
    </main>
  );
}
