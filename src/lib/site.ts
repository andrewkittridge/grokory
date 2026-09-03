import type { Metadata } from "next";

export const SITE_URL = "https://grokdex.net";
export const SITE_NAME = "Grokdex";
export const SITE_TITLE = "Grokdex — Ranked Grok Bot directory";
export const SITE_DESCRIPTION =
  "The ranked public board of Grok Bot templates. Live share links from x.ai. Vote, add a copy to your Grok account, or list yours — no account.";
export const REPORT_EMAIL = "report@grokdex.net";

/** Product X handle for `twitter:site`. Unset until Grokdex has a stable one. */
export const TWITTER_SITE: `@${string}` | undefined = undefined;

export function absUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}

export function twitterMeta(title: string, description: string) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    ...(TWITTER_SITE ? { site: TWITTER_SITE } : {}),
  };
}

export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
}: {
  title: string;
  description: string;
  path: string;
  ogTitle?: string;
}): Metadata {
  const socialTitle =
    ogTitle ?? (title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: absUrl(path),
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: twitterMeta(socialTitle, description),
  };
}

export function publicEnv(name: string) {
  const value = process.env[name]?.trim() ?? "";
  return value || undefined;
}

export function safeTagId(value: string | undefined) {
  if (!value) return undefined;
  return /^[A-Z0-9_-]+$/i.test(value) ? value : undefined;
}
