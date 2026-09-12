import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "../../../../lib/travel/auth";
import { parseTravelUpdate } from "../../../../lib/travel/validation";
import { readPassport, savePassport } from "../../../../lib/travel/store";

const headers = { "Cache-Control": "no-store" };

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json(
      { error: "Please sign in." },
      { status: 401, headers },
    );
  try {
    return NextResponse.json(await readPassport(), { headers });
  } catch {
    return NextResponse.json(
      { error: "Could not load your visits. Please try again." },
      { status: 503, headers },
    );
  }
}

export async function PUT(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  if (!(await isAdmin()))
    return NextResponse.json(
      {
        error:
          "Your session expired. Open /admin/travel in a new tab to sign in, then retry saving here. Your unsaved edits are still on this page.",
      },
      { status: 401, headers },
    );
  let update: ReturnType<typeof parseTravelUpdate>;
  try {
    const raw = await request.text();
    if (raw.length > 250_000) throw new Error("Your passport is too large.");
    update = parseTravelUpdate(JSON.parse(raw));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid passport." },
      { status: 400, headers },
    );
  }
  try {
    const passport = await savePassport(
      update.revision,
      update.visits,
      update.latestCountry,
    );
    if (!passport)
      return NextResponse.json(
        {
          error:
            "Your passport changed in another window. Reload saved visits before editing again.",
        },
        { status: 409, headers },
      );
    return NextResponse.json(passport, { headers });
  } catch {
    return NextResponse.json(
      {
        error: "Could not save. Your changes are still here; please try again.",
      },
      { status: 503, headers },
    );
  }
}
