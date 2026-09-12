/** Public-domain Natural Earth map units, projected once rather than in the browser.
 * Map units give French Guiana (GF), Réunion (RE), etc. their own ISO identities.
 * Run: bun run travel:map
 */
import { writeFile } from "node:fs/promises";

type Point = [number, number];
type Feature = {
  properties: {
    ISO_A2_EH: string;
    GU_A3: string;
    CONTINENT: string;
    NAME_EN: string;
  };
  geometry:
    | { type: "Polygon"; coordinates: Point[][] }
    | { type: "MultiPolygon"; coordinates: Point[][][] };
};

const source =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_map_units.geojson";

function simplify(points: Point[], tolerance = 0.12): Point[] {
  if (points.length < 3) return points;
  const a = points[0]!;
  const b = points[points.length - 1]!;
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  let best = 0,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]!;
    const t = length
      ? Math.max(
          0,
          Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length),
        )
      : 0;
    const distance = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
    if (distance > best) {
      best = distance;
      index = i;
    }
  }
  if (best > tolerance * tolerance)
    return [
      ...simplify(points.slice(0, index + 1)).slice(0, -1),
      ...simplify(points.slice(index)),
    ];
  return [a, b];
}

// Equal Earth projection. Round at generation time to keep the bundled SVG small.
function project([lon, lat]: Point): Point {
  const theta = Math.asin((Math.sqrt(3) / 2) * Math.sin((lat * Math.PI) / 180));
  const t2 = theta * theta,
    t6 = t2 * t2 * t2;
  const a1 = 1.340264,
    a2 = -0.081106,
    a3 = 0.000893,
    a4 = 0.003796;
  const x =
    (2 * Math.sqrt(3) * ((lon * Math.PI) / 180) * Math.cos(theta)) /
    (3 * (a1 + 3 * a2 * t2 + t6 * (7 * a3 + 9 * a4 * t2)));
  const y = theta * (a1 + a2 * t2 + t6 * (a3 + a4 * t2));
  return [
    Math.round((360 + 128 * x) * 10) / 10,
    Math.round((177 - 128 * y) * 10) / 10,
  ];
}

const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Map download failed: ${response.status}`);
const { features } = (await response.json()) as { features: Feature[] };
const names = new Intl.DisplayNames(["en"], { type: "region" });
const countries = new Map<
  string,
  { code: string; name: string; continent: string }
>();
const shapes = new Map<string, { code: string; path: string }>();
const oceanContinents: Record<string, string> = {
  GS: "South America",
  IO: "Asia",
  SH: "Africa",
  SC: "Africa",
  PT: "Europe",
  MU: "Africa",
  MV: "Asia",
  RE: "Africa",
  TF: "Antarctica",
  HM: "Antarctica",
};

for (const { properties: p, geometry } of features) {
  if (p.ISO_A2_EH === "AQ") continue;
  const code = /^[A-Z]{2}$/.test(p.ISO_A2_EH) ? p.ISO_A2_EH : p.GU_A3;
  if (code.length === 2) {
    const continent =
      p.CONTINENT === "Seven seas (open ocean)"
        ? oceanContinents[code]
        : p.CONTINENT;
    if (!continent) throw new Error(`Missing continent for ${code}`);
    countries.set(code, { code, name: names.of(code) ?? p.NAME_EN, continent });
  }
  const polygons =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates];
  let path = "";
  for (const polygon of polygons) {
    for (const ring of polygon) {
      // Tiny islands retain their outline instead of disappearing on simplification.
      const simplified = simplify(ring);
      const points = (simplified.length < 4 ? ring : simplified).map(project);
      path += `M${points.map(([x, y]) => `${x},${y}`).join("L")}Z`;
    }
  }
  // England, Scotland, Wales and Northern Ireland share GB; overseas ISO codes do not.
  shapes.set(code, { code, path: (shapes.get(code)?.path ?? "") + path });
}

await writeFile(
  new URL("../data/travel-countries.json", import.meta.url),
  JSON.stringify(
    [...countries.values()].sort((a, b) => a.name.localeCompare(b.name)),
  ) + "\n",
);
await writeFile(
  new URL("../data/travel-map.json", import.meta.url),
  JSON.stringify([...shapes.values()]) + "\n",
);
console.log(
  `Generated ${countries.size} country/territory entries and ${shapes.size} map shapes.`,
);
