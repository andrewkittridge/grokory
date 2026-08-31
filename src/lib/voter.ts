import { cookies } from "next/headers";

const COOKIE = "grokdex_voter";
const LEGACY_COOKIE = "grokory_voter";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validId(value: string | undefined) {
  return value && UUID.test(value) ? value : undefined;
}

export async function readVoterId() {
  const jar = await cookies();
  return (
    validId(jar.get(COOKIE)?.value) ?? validId(jar.get(LEGACY_COOKIE)?.value)
  );
}

export async function getVoterId() {
  const existing = await readVoterId();
  const jar = await cookies();
  if (existing) {
    if (!validId(jar.get(COOKIE)?.value)) {
      jar.set(COOKIE, existing, cookieOptions());
    }
    return existing;
  }
  const id = crypto.randomUUID();
  jar.set(COOKIE, id, cookieOptions());
  return id;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}
