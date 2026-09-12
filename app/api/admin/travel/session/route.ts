import { NextResponse } from "next/server";
import {
  authConfigured,
  checkPassword,
  COOKIE_NAME,
  createSession,
  sameOrigin,
  SESSION_SECONDS,
} from "../../../../../lib/travel/auth";
import {
  allowLoginAttempt,
  storageConfigured,
} from "../../../../../lib/travel/store";

const headers = { "Cache-Control": "no-store" };
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  if (!authConfigured() || !storageConfigured())
    return NextResponse.json(
      { error: "Finish the admin setup first." },
      { status: 503, headers },
    );
  try {
    const raw = await request.text();
    if (raw.length > 2048)
      return NextResponse.json(
        { error: "Invalid password." },
        { status: 400, headers },
      );
    const body = JSON.parse(raw);
    if (typeof body.password !== "string")
      return NextResponse.json(
        { error: "Enter your password." },
        { status: 400, headers },
      );
    if (!(await allowLoginAttempt()))
      return NextResponse.json(
        { error: "Too many sign-in attempts. Try again in 15 minutes." },
        { status: 429, headers: { ...headers, "Retry-After": "900" } },
      );
    if (!checkPassword(body.password))
      return NextResponse.json(
        { error: "That password is incorrect." },
        { status: 401, headers },
      );
    const response = NextResponse.json({ ok: true }, { headers });
    response.cookies.set(COOKIE_NAME, createSession(), {
      ...cookieOptions,
      maxAge: SESSION_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not sign in. Please try again." },
      { status: 503, headers },
    );
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  const response = NextResponse.json({ ok: true }, { headers });
  response.cookies.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
