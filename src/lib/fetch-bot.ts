import { parseShareUrl } from "./bot-url";
import type { BotPreview } from "./types";

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html: string, property: string) {
  const patterns = [
    new RegExp(
      `<meta[^>]+property="${property}"[^>]+content="([^"]*)"`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content="([^"]*)"[^>]+property="${property}"`,
      "i"
    ),
    new RegExp(`<meta[^>]+name="${property}"[^>]+content="([^"]*)"`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decode(match[1]);
  }
  return undefined;
}

function attr(html: string, tagPattern: RegExp) {
  const match = html.match(tagPattern);
  return match?.[1] ? decode(match[1]) : undefined;
}

export async function fetchBotPreview(
  input: string
): Promise<{ ok: true; preview: BotPreview } | { ok: false; error: string }> {
  const parsed = parseShareUrl(input);
  if (!parsed) {
    return {
      ok: false,
      error:
        "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(parsed.botUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Grokdex/1.0; +https://grokdex.net)",
        Accept: "text/html",
      },
      cache: "no-store",
    });
    clearTimeout(timer);

    if (response.status === 404) {
      return {
        ok: false,
        error: "x.ai returned 404. That share link may have been taken down.",
      };
    }
    if (!response.ok) {
      return {
        ok: false,
        error: `Could not load that bot from x.ai (${response.status}). You can still fill in the name by hand.`,
      };
    }

    const html = await response.text();
    const ogTitle = metaContent(html, "og:title");
    const ogDescription = metaContent(html, "og:description");
    const ogImage = metaContent(html, "og:image");
    const pageTitle = attr(html, /<h1[^>]*title="([^"]+)"/i);
    const byline = attr(
      html,
      /<p class="text-secondary text-sm">by ([^<]+)<\/p>/i
    );
    const fullDescription = attr(
      html,
      /<p title="([^"]+)" class="text-secondary mt-3/i
    );

    if (
      html.includes("Page not found") &&
      !pageTitle &&
      !ogTitle?.includes(" by ")
    ) {
      return {
        ok: false,
        error: "x.ai does not have a bot at that link.",
      };
    }

    let title = pageTitle;
    let authorName = byline;
    if (!title && ogTitle) {
      const split = ogTitle.match(/^(.*) by (.+)$/);
      if (split) {
        title = split[1];
        authorName = authorName ?? split[2];
      } else {
        title = ogTitle;
      }
    }

    const description =
      fullDescription || ogDescription || "A shared Grok Bot template.";
    const summary =
      description.length > 180
        ? `${description.slice(0, 177).trimEnd()}…`
        : description;

    return {
      ok: true,
      preview: {
        botId: parsed.botId,
        botUrl: parsed.botUrl,
        title: (title || "Untitled bot").slice(0, 80),
        authorName: (authorName || "Unknown").slice(0, 60),
        summary,
        description: description.slice(0, 2000),
        ogImage,
      },
    };
  } catch {
    return {
      ok: false,
      error:
        "Could not reach x.ai to look up that bot. Check the link, or enter the name and description yourself.",
    };
  }
}
