import { cookies } from "next/headers";

const COOKIE = "grokory_voter";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function readVoterId() {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (value && UUID.test(value)) return value;
  return undefined;
}

export async function getVoterId() {
  const existing = await readVoterId();
  if (existing) return existing;
  const id = crypto.randomUUID();
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
