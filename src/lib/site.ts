export const SITE_URL = "https://grokdex.net";
export const SITE_NAME = "Grokdex";
export const SITE_TITLE = "Grokdex — Ranked Grok Bot catalog";
export const SITE_DESCRIPTION =
  "A public ranked catalog of Grok Bot templates. Browse specialist agents, upvote the useful ones, and add a copy to your Grok account.";
export const REPORT_EMAIL = "report@grokdex.net";

export function absUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}

export function publicEnv(name: string) {
  const value = process.env[name]?.trim() ?? "";
  return value || undefined;
}

export function safeTagId(value: string | undefined) {
  if (!value) return undefined;
  return /^[A-Z0-9_-]+$/i.test(value) ? value : undefined;
}
