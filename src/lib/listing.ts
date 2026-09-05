import {
  addTemplate,
  checkedIdentity,
  findByBotId,
  linkXHandleIfEmpty,
  updateListingFromShare,
  type ListingPatch,
} from "./templates-store";
import { fetchBotPreview } from "./fetch-bot";
import {
  ALREADY_LISTED,
  HANDLE_ALREADY_SET,
  authorIdentity,
  parseShareUrl,
  parseTags,
  parseXHandle,
  slugify,
} from "./bot-url";
import { consumeKvRate, headerIp } from "./rate-limit";
import { absUrl } from "./site";
import { assignLane } from "./lane";
import type { BotPreview, BotTemplate, ListedTemplate } from "./types";

const LIST_RATE_LIMIT = 8;
const LIST_RATE_WINDOW_MS = 60 * 60 * 1000;
const INVALID_SHARE =
  "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN";

export type PublishListingInput = {
  shareUrl: string;
  tags?: string | string[];
  note?: string;
  submittedBy?: string;
  title?: string;
  authorName?: string;
  xHandle?: string;
  description?: string;
  source: "form" | "agent";
  intent?: "publish" | "refresh";
  applyFields?: boolean;
};

export type PublishListingResult =
  | {
      ok: true;
      slug: string;
      listingUrl: string;
      title: string;
      linked?: boolean;
      updated?: boolean;
    }
  | {
      ok: false;
      error: string;
      code: "invalid" | "already_listed" | "preview" | "save";
      slug?: string;
      listingUrl?: string;
    };

export type ExistingListing = {
  slug: string;
  title?: string;
  authorName?: string;
  xHandle?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  note?: string;
  submittedBy?: string;
};

export type PublishListingDeps = {
  findExisting?: (
    botId: string
  ) => Promise<ExistingListing | null | undefined>;
  preview?: typeof fetchBotPreview;
  save?: typeof addTemplate;
  linkHandle?: typeof linkXHandleIfEmpty;
  update?: typeof updateListingFromShare;
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

  const parsedHandle = parseXHandle(input.xHandle);
  if (!parsedHandle.ok) {
    return { ok: false, error: parsedHandle.error, code: "invalid" };
  }
  const xHandle = parsedHandle.handle;

  const findExisting =
    deps.findExisting ??
    (async (botId: string) => {
      const existing = await findByBotId(botId);
      return existing ? toExisting(existing) : null;
    });
  const previewFn = deps.preview ?? fetchBotPreview;
  const save = deps.save ?? addTemplate;
  const linkHandle = deps.linkHandle ?? linkXHandleIfEmpty;
  const update = deps.update ?? updateListingFromShare;
  const revalidate = deps.revalidate ?? defaultRevalidate;

  try {
    const existing = await findExisting(parsed.botId);
    if (existing?.slug) {
      return updateExistingListing(
        {
          input,
          parsed,
          xHandle,
          existing,
          previewFn,
          linkHandle,
          update,
          revalidate,
        }
      );
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
      xHandle,
      summary,
      description: resolvedDescription.slice(0, 2000),
      ogImage: preview?.ogImage,
      mark: preview?.mark,
      tags: normalizeTags(input.tags),
      lane: assignLane({
        botId: parsed.botId,
        title: resolvedTitle,
        summary,
        description: resolvedDescription,
        tags: normalizeTags(input.tags),
      }),
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
    await revalidateListing(revalidate, slug, [
      { authorName: resolvedAuthor, xHandle },
    ]);

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

function toExisting(template: ListedTemplate): ExistingListing {
  return {
    slug: template.slug,
    title: template.title,
    authorName: template.authorName,
    xHandle: template.xHandle,
    summary: template.summary,
    description: template.description,
    tags: template.tags,
    note: template.note,
    submittedBy: template.submittedBy,
  };
}

async function revalidateListing(
  revalidate: (path: string) => void | Promise<void>,
  slug: string,
  authors: Array<{ authorName?: string; xHandle?: string }>
) {
  await revalidate("/");
  await revalidate("/templates");
  await revalidate("/catalog");
  await revalidate(`/templates/${slug}`);
  await revalidate("/feed.xml");
  await revalidate("/authors");
  const seen = new Set<string>();
  for (const author of authors) {
    const name = author.authorName ?? "";
    const handle = author.xHandle?.trim();
    if (!name.trim() && !handle) continue;
    const path = `/authors/${authorIdentity({ authorName: name, xHandle: handle }).slug}`;
    if (seen.has(path)) continue;
    seen.add(path);
    await revalidate(path);
  }
}

async function updateExistingListing(args: {
  input: PublishListingInput;
  parsed: { botId: string; botUrl: string };
  xHandle?: string;
  existing: ExistingListing;
  previewFn: typeof fetchBotPreview;
  linkHandle: typeof linkXHandleIfEmpty;
  update: typeof updateListingFromShare;
  revalidate: (path: string) => void | Promise<void>;
}): Promise<PublishListingResult> {
  const {
    input,
    parsed,
    xHandle,
    existing,
    previewFn,
    linkHandle,
    update,
    revalidate,
  } = args;
  const refreshOnly = input.intent === "refresh";

  if (xHandle) {
    const linked = await linkHandle(parsed.botId, xHandle);
    if (!linked.ok) {
      return {
        ok: false,
        error: linked.error,
        code: "already_listed",
        slug: linked.slug ?? existing.slug,
        listingUrl: listingUrlFor(linked.slug ?? existing.slug),
      };
    }
  }

  const lookedUp = await previewFn(parsed.botUrl);
  if (input.source === "agent" && !lookedUp.ok) {
    if (xHandle) {
      await revalidateListing(revalidate, existing.slug, [
        { authorName: existing.authorName ?? "", xHandle: existing.xHandle },
        { authorName: existing.authorName ?? "", xHandle },
      ]);
      return {
        ok: true,
        slug: existing.slug,
        listingUrl: listingUrlFor(existing.slug),
        title: existing.title || existing.slug,
        linked: true,
      };
    }
    return { ok: false, error: lookedUp.error, code: "preview" };
  }

  const preview: BotPreview | null = lookedUp.ok ? lookedUp.preview : null;
  const identity = checkedIdentity({
    title: preview?.title,
    authorName: preview?.authorName,
    description: preview?.description,
    summary: preview?.summary,
  });
  const patch: ListingPatch = {};

  if (preview) {
    if (identity.title) patch.title = identity.title.slice(0, 80);
    if (identity.authorName) patch.authorName = identity.authorName.slice(0, 60);
    if (identity.description) {
      patch.description = identity.description.slice(0, 2000);
      patch.summary =
        identity.summary && identity.summary.length <= 180
          ? identity.summary
          : patch.description.length > 180
            ? `${patch.description.slice(0, 177).trimEnd()}…`
            : patch.description;
    }
    if (preview.ogImage) patch.ogImage = preview.ogImage;
    if (preview.mark) patch.mark = preview.mark;
    patch.skills = preview.skills;
    patch.routines = preview.routines;
    patch.live = true;
    patch.lastCheckedAt = new Date().toISOString();
  } else if (lookedUp.ok === false && lookedUp.gone) {
    patch.live = false;
    patch.lastCheckedAt = new Date().toISOString();
  }

  if (!refreshOnly && input.source === "form" && input.applyFields) {
    const tags = normalizeTags(input.tags);
    if (tags.length > 0) patch.tags = tags;
    const note = (input.note ?? "").trim().slice(0, 400);
    if (note) patch.note = note;
    const submittedBy = (input.submittedBy ?? "").trim().slice(0, 60);
    if (submittedBy) patch.submittedBy = submittedBy;
  }

  if (!refreshOnly && input.source === "agent") {
    if (input.tags !== undefined) patch.tags = normalizeTags(input.tags);
    if (input.note !== undefined) {
      const note = input.note.trim().slice(0, 400);
      patch.note = note || null;
    }
    const submittedBy = (input.submittedBy ?? "").trim().slice(0, 60);
    if (submittedBy) patch.submittedBy = submittedBy;
  }

  const tagsForLane = patch.tags ?? existing.tags ?? [];
  patch.lane = assignLane({
    botId: parsed.botId,
    title: patch.title ?? existing.title ?? "",
    summary: patch.summary ?? existing.summary ?? "",
    description: patch.description ?? existing.description ?? "",
    tags: tagsForLane,
  });

  const saved = await update(parsed.botId, patch);
  if (!saved.ok) {
    return {
      ok: false,
      error: saved.error,
      code: saved.error === HANDLE_ALREADY_SET ? "already_listed" : "save",
      slug: saved.slug ?? existing.slug,
      listingUrl: listingUrlFor(saved.slug ?? existing.slug),
    };
  }

  await revalidateListing(revalidate, saved.template.slug, [
    { authorName: existing.authorName ?? "", xHandle: existing.xHandle },
    {
      authorName: saved.template.authorName,
      xHandle: saved.template.xHandle ?? xHandle,
    },
  ]);

  return {
    ok: true,
    slug: saved.template.slug,
    listingUrl: listingUrlFor(saved.template.slug),
    title: saved.template.title,
    updated: true,
    linked: Boolean(xHandle) && !existing.xHandle,
  };
}

export async function listBotFromAgent(
  input: {
    shareUrl?: string;
    tags?: string | string[];
    note?: string;
    submittedBy?: string;
    xHandle?: string;
    intent?: "publish" | "refresh";
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
      tags: input.tags,
      note: input.note,
      submittedBy: input.submittedBy,
      xHandle: input.xHandle,
      intent: input.intent,
      source: "agent",
    },
    deps
  );

  if (result.ok) {
    return {
      status: result.updated || result.linked ? 200 : 201,
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
