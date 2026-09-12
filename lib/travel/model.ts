import countryData from "../../data/travel-countries.json";

export const countries = countryData;
export const countryByCode = new Map(
  countries.map((country) => [country.code, country]),
);

export type Visit = {
  id: string;
  country: string;
  date: string;
  city: string;
};

export type Passport = {
  revision: string;
  visits: Visit[];
  latestCountry: string;
};

// Dan's supplied travel history; dates remain unknown until entered in the editor.
export const INITIAL_PASSPORT: Passport = {
  revision: "0",
  latestCountry: "FR",
  visits: [
    "US",
    "FR",
    "TH",
    "CH",
    "IT",
    "SA",
    "AE",
    "AT",
    "BE",
    "CY",
    "DE",
    "NO",
    "PL",
    "PT",
    "ES",
    "GB",
  ].map((country) => ({
    id: `initial-${country}`,
    country,
    date: "",
    city: "",
  })),
};

export function flag(code: string) {
  return String.fromCodePoint(
    ...[...code].map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

export function formatVisitDate(date: string) {
  return date
    ? new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${date}T00:00:00Z`))
    : "Date not recorded";
}

// Use the site's home timezone for both the editor default and server validation.
export function currentVisitDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function travelStats(visits: Visit[], latestCountry = "") {
  const visited = [...new Set(visits.map((visit) => visit.country))];
  const continents = new Set(
    visited.map((code) => countryByCode.get(code)?.continent).filter(Boolean),
  );
  const dated = visits
    .filter((visit) => visit.date)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = latestCountry
    ? ([...visits]
        .filter((visit) => visit.country === latestCountry)
        .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null)
    : (dated[0] ?? null);
  return { visited, continents: continents.size, latest };
}

export function parseLatestCountry(value: unknown, visits: Visit[]) {
  if (
    typeof value !== "string" ||
    (value !== "" && !visits.some((visit) => visit.country === value))
  )
    throw new Error(
      "Most recent country must be one of your visited countries.",
    );
  return value;
}

export function parseVisits(value: unknown): Visit[] {
  if (!Array.isArray(value) || value.length > 1000)
    throw new Error("Please keep the passport to 1,000 visits or fewer.");
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid visit.");
    const visit = item as Record<string, unknown>;
    if (
      typeof visit.id !== "string" ||
      !/^[a-zA-Z0-9-]{1,64}$/.test(visit.id) ||
      ids.has(visit.id)
    )
      throw new Error("Each visit needs a unique ID.");
    ids.add(visit.id);
    if (typeof visit.country !== "string" || !countryByCode.has(visit.country))
      throw new Error("Choose a country from the list.");
    if (typeof visit.city !== "string" || visit.city.length > 100)
      throw new Error("City must be 100 characters or fewer.");
    if (typeof visit.date !== "string") throw new Error("Invalid visit date.");
    if (visit.date) {
      const date = new Date(`${visit.date}T00:00:00Z`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(visit.date) ||
        Number.isNaN(date.valueOf()) ||
        date.toISOString().slice(0, 10) !== visit.date ||
        visit.date < "1900-01-01" ||
        visit.date > currentVisitDate()
      ) {
        throw new Error(
          "Use a real visit date between 1900 and today, or leave it blank.",
        );
      }
    }
    return {
      id: visit.id,
      country: visit.country,
      date: visit.date,
      city: visit.city.trim(),
    };
  });
}
