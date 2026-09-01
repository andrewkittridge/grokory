import { cookies } from "next/headers";
import {
  LEGACY_VOTER_COOKIE,
  validVoterId,
  VOTER_COOKIE,
} from "./vote";

export { validVoterId };

export async function readVoterId() {
  const jar = await cookies();
  return (
    validVoterId(jar.get(VOTER_COOKIE)?.value) ??
    validVoterId(jar.get(LEGACY_VOTER_COOKIE)?.value)
  );
}

export async function getVoterId() {
  const existing = await readVoterId();
  const jar = await cookies();
  if (existing) {
    if (!validVoterId(jar.get(VOTER_COOKIE)?.value)) {
      jar.set(VOTER_COOKIE, existing, cookieOptions());
    }
    return existing;
  }
  const id = crypto.randomUUID();
  jar.set(VOTER_COOKIE, id, cookieOptions());
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
