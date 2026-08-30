import { neon } from "@neondatabase/serverless";

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

export function sql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
}
