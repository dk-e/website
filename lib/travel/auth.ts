import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "travel-admin";
export const SESSION_SECONDS = 7 * 24 * 60 * 60;

export function authConfigured() {
  return (process.env.TRAVEL_ADMIN_PASSWORD?.length ?? 0) >= 16;
}

function equal(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

export function checkPassword(password: string) {
  return (
    authConfigured() && equal(password, process.env.TRAVEL_ADMIN_PASSWORD!)
  );
}

function signature(value: string) {
  return createHmac("sha256", process.env.TRAVEL_ADMIN_PASSWORD!)
    .update(`travel-admin:${value}`)
    .digest("base64url");
}

export function createSession() {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${signature(expires)}`;
}

export function validSession(token: string | undefined) {
  if (!authConfigured() || !token || token.length > 150) return false;
  const [expires, signed, extra] = token.split(".");
  if (!expires || !signed || extra !== undefined || !/^\d+$/.test(expires))
    return false;
  const remaining = Number(expires) - Math.floor(Date.now() / 1000);
  return (
    remaining > 0 &&
    remaining <= SESSION_SECONDS &&
    equal(signed, signature(expires))
  );
}

export async function isAdmin() {
  return validSession((await cookies()).get(COOKIE_NAME)?.value);
}

export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
