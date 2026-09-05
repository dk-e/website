# website

My personal site — [dann.my](https://dann.my). Next.js, TypeScript, Tailwind.

## Running it

Needs [Bun](https://bun.sh).

```bash
bun install
bun dev
```

Then open http://localhost:3000.

## Env vars

None are required to run the site, but a few features stay quiet without them. Put them in `.env.local`:

| Variable | Used for |
| --- | --- |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | Now-playing track |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Storing presence |
| `PRESENCE_SECRET` | Auth for the presence endpoint |

## Layout

```
app/         pages and API routes
components/  shared UI
lib/         helpers, constants, blog loading
posts/       blog posts as MDX
```

## Writing a post

Add an `.mdx` file to `posts/` with front matter:

```mdx
---
title: hello world
description: my first post
date: "August 12, 2024"
---
```

It shows up at `/blog/<filename>`.

## Scripts

- `bun dev` — dev server
- `bun run build` — production build
- `bun start` — serve the build
- `bun run lint` — eslint
