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
| `TRAVEL_ADMIN_PASSWORD` | Travel editor password (at least 16 characters) |

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

## Travel passport

The homepage passport appears below writing. Dan's supplied 16-country list is the initial data in `lib/travel/model.ts`, with France marked most recent and no invented dates. Once saved in the editor, Redis becomes the source of truth, including when all visits are removed.

### Editing

1. Run `bun run travel:password` once. It generates a password, prints it, and stores it in your git-ignored `.env.local`. If one is already set, the command leaves it alone.
2. Restart the dev server and open `/admin/travel` (or `/admin`). Sign in with that password.
3. Search for a country, optionally enter a city, and add a visit. The date defaults to today (Europe/London); change it for an older trip or clear it if unknown. Edit or remove existing visits, and choose your most recent country. Preview the result, then **Save changes** to publish.

For the live site, set `TRAVEL_ADMIN_PASSWORD` in the hosting project's environment and redeploy. The existing `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are reused. No separate database or paid map service is needed. Bookmark `/admin/travel`; it isn't linked from the public homepage. Changing the password invalidates existing sessions.

Visits are stored persistently in Redis at `travel:passport:v1`, separately from presence. `TRAVEL_REDIS_KEY` can override that key for isolated preview/test environments. Public results can take up to 90 seconds to refresh through the CDN; the editor always reads fresh data. Saves check a revision atomically so two tabs cannot silently overwrite each other. Failed reads/writes show an error and do not reset the stored data.

Countries are counted once even with repeat visits. Continents follow Natural Earth's geographic grouping; the selection includes countries and territories. Most recent uses your explicit country selection, or the newest known visit date. Unknown dates remain blank. The public `GET /api/travel` endpoint exposes the saved countries, cities and dates. Admin writes require a signed, HTTP-only, same-site session cookie and same-origin requests; sign-in is limited to 20 attempts per 15-minute window across the single-owner editor.

### Map data

Map paths and country metadata are generated from [Natural Earth](https://www.naturalearthdata.com/), whose map data is [public domain](https://www.naturalearthdata.com/about/terms-of-use/). `bun run travel:map` runs the TypeScript generator for the compact Equal Earth SVG paths and country selector data. Map units keep overseas territories separate: visiting France highlights mainland France and Corsica, while French Guiana, Réunion, Guadeloupe, Martinique and Mayotte have their own selectable codes. UK constituent nations still count together as GB. The map is bundled locally, with no external map requests or runtime mapping dependency.

`bun run test:travel` checks travel totals, validation, session integrity and the France/French Guiana map boundary regression.
