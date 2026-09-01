import { createHash, timingSafeEqual } from "node:crypto";
import { publicEnv } from "./site";

export async function cronAuthorized(request: Request) {
  const expected = publicEnv("CRON_SECRET");
  if (!expected) return false;
  const header =
    request.headers.get("authorization") ??
    request.headers.get("x-cron-secret") ??
    "";
  const provided = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : header.trim();
  if (!provided) return false;

  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}
