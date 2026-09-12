import { NextResponse } from "next/server";
import { INITIAL_PASSPORT } from "../../../lib/travel/model";
import { readPassport, storageConfigured } from "../../../lib/travel/store";

export async function GET() {
  try {
    const passport = storageConfigured()
      ? await readPassport()
      : INITIAL_PASSPORT;
    return NextResponse.json(
      { visits: passport.visits, latestCountry: passport.latestCountry },
      {
        headers: {
          "Cache-Control":
            "public, max-age=0, s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Travel details are temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
