import { z } from "zod";
import { countryByCode, currentVisitDate } from "./model";
import type { Visit } from "./model";

const INVALID_VISIT = "Invalid visit.";
const INVALID_ID = "Each visit needs a unique ID.";
const INVALID_COUNTRY = "Choose a country from the list.";
const INVALID_CITY = "City must be 100 characters or fewer.";
const INVALID_DATE = "Invalid visit date.";
const INVALID_DATE_RANGE =
  "Use a real visit date between 1900 and today, or leave it blank.";
const INVALID_LATEST_COUNTRY =
  "Most recent country must be one of your visited countries.";

const visitSchema = z.object(
  {
    id: z
      .string({ error: INVALID_ID })
      .regex(/^[a-zA-Z0-9-]{1,64}$/, { message: INVALID_ID }),
    country: z
      .string({ error: INVALID_COUNTRY })
      .refine((code) => countryByCode.has(code), {
        message: INVALID_COUNTRY,
      }),
    date: z
      .string({ error: INVALID_DATE })
      .superRefine((date, context) => {
        if (!date) return;

        const parsed = new Date(`${date}T00:00:00Z`);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          Number.isNaN(parsed.valueOf()) ||
          parsed.toISOString().slice(0, 10) !== date ||
          date < "1900-01-01" ||
          date > currentVisitDate()
        ) {
          context.addIssue({ code: "custom", message: INVALID_DATE_RANGE });
        }
      }),
    city: z
      .string({ error: INVALID_CITY })
      .max(100, { message: INVALID_CITY })
      .transform((city) => city.trim()),
  },
  { error: INVALID_VISIT },
);

const visitsSchema = z.array(visitSchema).superRefine((visits, context) => {
  const ids = new Set<string>();
  visits.forEach((visit, index) => {
    if (ids.has(visit.id)) {
      context.addIssue({
        code: "custom",
        path: [index, "id"],
        message: INVALID_ID,
      });
    }
    ids.add(visit.id);
  });
});

const travelUpdateSchema = z.object(
  {
    revision: z
      .string({ error: "Invalid revision. Reload your visits." })
      .max(64, { message: "Invalid revision. Reload your visits." }),
    visits: z.unknown(),
    latestCountry: z.unknown(),
  },
  { error: "Invalid passport." },
);

function firstIssue(error: z.ZodError, fallback: string) {
  return error.issues[0]?.message || fallback;
}

export function parseVisits(value: unknown): Visit[] {
  // Keep the existing message for a non-array and for an oversized payload.
  if (!Array.isArray(value) || value.length > 1000)
    throw new Error("Please keep the passport to 1,000 visits or fewer.");

  const result = visitsSchema.safeParse(value);
  if (!result.success) throw new Error(firstIssue(result.error, INVALID_VISIT));
  return result.data;
}

export function parseLatestCountry(value: unknown, visits: Visit[]) {
  const result = z
    .string({ error: INVALID_LATEST_COUNTRY })
    .refine(
      (country) =>
        country === "" || visits.some((visit) => visit.country === country),
      { message: INVALID_LATEST_COUNTRY },
    )
    .safeParse(value);

  if (!result.success) throw new Error(INVALID_LATEST_COUNTRY);
  return result.data;
}

export function parseTravelUpdate(value: unknown) {
  const result = travelUpdateSchema.safeParse(value);
  if (!result.success)
    throw new Error(firstIssue(result.error, "Invalid passport."));

  const visits = parseVisits(result.data.visits);
  return {
    revision: result.data.revision,
    visits,
    latestCountry: parseLatestCountry(result.data.latestCountry, visits),
  };
}
