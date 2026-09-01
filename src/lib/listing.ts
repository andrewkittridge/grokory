import {
  addTemplate,
  findByBotId,
} from "./templates-store";
import { fetchBotPreview } from "./fetch-bot";
import {
  ALREADY_LISTED,
  authorSlug as slugifyAuthor,
  isCategory,
  parseShareUrl,
  parseTags,
  slugify,
} from "./bot-url";
import { consumeKvRate, headerIp } from "./rate-limit";
import { absUrl } from "./site";
import type { BotPreview, BotTemplate } from "./types";

const LIST_RATE_LIMIT = 8;
const LIST_RATE_WINDOW_MS = 60 * 60 * 1000;
const INVALID_SHARE =
  "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN";

export type PublishListingInput = {
  shareUrl: string;
  category: string;
  tags?: string | string[];
  note?: string;
  submittedBy?: string;
  title?: string;
  authorName?: string;
  description?: string;
  source: "form" | "agent";
};

export type PublishListingResult =
  | {
      ok: true;
      slug: string;
      listingUrl: string;
      title: string;
    }
  | {
      ok: false;
      error: string;
      code: "invalid" | "already_listed" | "preview" | "save";
      slug?: string;
      listingUrl?: string;
    };

export type PublishListingDeps = {
  findExisting?: (
    botId: string
  ) => Promise<{ slug: string } | null | undefined>;
  preview?: typeof fetchBotPreview;
  save?: typeof addTemplate;
  revalidate?: (path: string) => void | Promise<void>;
};

export function clientIp(request: Request) {
  return headerIp(request.headers);
}

export async function consumeListRate(ip: string) {
  return consumeKvRate(
    `list-rate:v1:${ip || "unknown"}`,
    LIST_RATE_LIMIT,
    LIST_RATE_WINDOW_MS
  );
}

function listingUrlFor(slug: string) {
  return absUrl(`/templates/${slug}`);
}

function normalizeTags(tags?: string | string[]) {
  if (!tags) return [];
  if (Array.isArray(tags)) return parseTags(tags.join(","));
  return parseTags(tags);
}

async function defaultRevalidate(path: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath(path);
}

export async function publishListing(
  input: PublishListingInput,
  deps: PublishListingDeps = {}
): Promise<PublishListingResult> {
  const parsed = parseShareUrl(input.shareUrl);
  if (!parsed) {
    return { ok: false, error: INVALID_SHARE, code: "invalid" };
  }
  if (!isCategory(input.category)) {
    return {
      ok: false,
      error: "Pick a category so people can find this bot.",
      code: "invalid",
    };
  }

  const findExisting =
    deps.findExisting ??
    (async (botId: string) => {
      const existing = await findByBotId(botId);
      return existing ? { slug: existing.slug } : null;
    });
  const previewFn = deps.preview ?? fetchBotPreview;
  const save = deps.save ?? addTemplate;
  const revalidate = deps.revalidate ?? defaultRevalidate;

  try {
    const existing = await findExisting(parsed.botId);
    if (existing?.slug) {
      return {
        ok: false,
        error: ALREADY_LISTED,
        code: "already_listed",
        slug: existing.slug,
        listingUrl: listingUrlFor(existing.slug),
      };
    }

    const lookedUp = await previewFn(parsed.botUrl);
    if (input.source === "agent" && !lookedUp.ok) {
      return { ok: false, error: lookedUp.error, code: "preview" };
    }

    const preview: BotPreview | null = lookedUp.ok ? lookedUp.preview : null;
    const title = (input.title ?? "").trim();
    const authorName = (input.authorName ?? "").trim();
    const description = (input.description ?? "").trim();

    const resolvedTitle =
      input.source === "agent"
        ? preview?.title ?? ""
        : title || preview?.title || "";
    const resolvedAuthor =
      input.source === "agent"
        ? preview?.authorName || "Unknown"
        : authorName || preview?.authorName || "Unknown";
    const resolvedDescription =
      input.source === "agent"
        ? preview?.description || preview?.summary || ""
        : description || preview?.description || preview?.summary || "";

    if (resolvedTitle.length < 2) {
      return {
        ok: false,
        error: lookedUp.ok ? "Give the bot a name." : lookedUp.error,
        code: lookedUp.ok ? "invalid" : "preview",
      };
    }
    if (resolvedDescription.length < 12) {
      return {
        ok: false,
        error:
          "Add a short description so people know what this bot does before they add it.",
        code: "invalid",
      };
    }

    const summary =
      resolvedDescription.length > 180
        ? `${resolvedDescription.slice(0, 177).trimEnd()}…`
        : resolvedDescription;

    const submittedBy =
      (input.submittedBy ?? "").trim().slice(0, 60) ||
      (input.source === "agent" ? "Grok Bot" : "Anonymous");

    const template: BotTemplate = {
      id: crypto.randomUUID(),
      slug: slugify(resolvedTitle, parsed.botId),
      botId: parsed.botId,
      botUrl: parsed.botUrl,
      title: resolvedTitle.slice(0, 80),
      authorName: resolvedAuthor.slice(0, 60),
      summary,
      description: resolvedDescription.slice(0, 2000),
      ogImage: preview?.ogImage,
      category: input.category,
      tags: normalizeTags(input.tags),
      note: (input.note ?? "").trim().slice(0, 400) || undefined,
      submittedBy,
      origin: "community",
      featured: false,
      createdAt: new Date().toISOString(),
      adds: 0,
      live: !(lookedUp.ok === false && lookedUp.gone),
      lastCheckedAt: new Date().toISOString(),
      skills: preview?.skills ?? [],
      routines: preview?.routines ?? [],
    };

    const result = await save(template);
    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        code: result.error === ALREADY_LISTED ? "already_listed" : "save",
        slug: result.slug,
        listingUrl: result.slug ? listingUrlFor(result.slug) : undefined,
      };
    }

    const slug = result.template.slug;
    await revalidate("/");
    await revalidate("/templates");
    await revalidate(`/templates/${slug}`);
    await revalidate("/feed.xml");
    await revalidate(`/authors/${slugifyAuthor(resolvedAuthor)}`);

    return {
      ok: true,
      slug,
      listingUrl: listingUrlFor(slug),
      title: result.template.title,
    };
  } catch {
    return {
      ok: false,
      error: "Could not save this listing. Try again in a moment.",
      code: "save",
    };
  }
}

export async function listBotFromAgent(
  input: {
    shareUrl?: string;
    category?: string;
    tags?: string | string[];
    note?: string;
    submittedBy?: string;
  },
  request: Request,
  deps: PublishListingDeps = {}
) {
  const allowed = await consumeListRate(clientIp(request));
  if (!allowed) {
    return {
      status: 429,
      body: {
        ok: false as const,
        error: "Too many listing attempts. Try again in an hour.",
        code: "rate_limited" as const,
      },
    };
  }

  const result = await publishListing(
    {
      shareUrl: input.shareUrl ?? "",
      category: input.category ?? "",
      tags: input.tags,
      note: input.note,
      submittedBy: input.submittedBy,
      source: "agent",
    },
    deps
  );

  if (result.ok) {
    return {
      status: 201,
      body: result,
    };
  }

  const status =
    result.code === "already_listed"
      ? 409
      : result.code === "save"
        ? 500
        : 400;

  return {
    status,
    body: {
      ok: false as const,
      error: result.error,
      code: result.code,
      ...(result.slug
        ? { slug: result.slug, listingUrl: result.listingUrl }
        : {}),
    },
  };
}
