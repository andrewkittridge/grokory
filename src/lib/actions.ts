"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addTemplate,
  findByBotId,
  incrementAdds as bumpAdds,
  setVote,
} from "./templates-store";
import { fetchBotPreview } from "./fetch-bot";
import { isCategory, parseShareUrl, parseTags, slugify } from "./bot-url";
import { getVoterId } from "./voter";
import type { BotPreview, BotTemplate, VoteValue } from "./types";

export type ActionState = {
  error?: string;
  slug?: string;
};

export type LookupState = {
  error?: string;
  soft?: boolean;
  preview?: BotPreview;
};

export async function lookupShareLink(
  _prev: LookupState,
  formData: FormData
): Promise<LookupState> {
  const shareInput = String(formData.get("shareUrl") ?? "");
  if (!shareInput.trim()) {
    return { error: "Paste a Grok Bot share link first." };
  }
  const parsed = parseShareUrl(shareInput);
  if (!parsed) {
    return {
      error:
        "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    };
  }
  const result = await fetchBotPreview(parsed.botUrl);
  if (!result.ok) return { error: result.error, soft: true };
  return { preview: result.preview };
}

export async function createListing(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const shareInput = String(formData.get("shareUrl") ?? "");
  const parsed = parseShareUrl(shareInput);
  if (!parsed) {
    return {
      error:
        "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    };
  }

  let slug: string;
  try {
    const existing = await findByBotId(parsed.botId);
    if (existing) {
      return {
        error: "That Grok Bot is already listed.",
        slug: existing.slug,
      };
    }

    const lookedUp = await fetchBotPreview(parsed.botUrl);
    const title = String(formData.get("title") ?? "").trim();
    const authorName = String(formData.get("authorName") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const tags = parseTags(String(formData.get("tags") ?? ""));
    const note = String(formData.get("note") ?? "").trim();
    const submittedBy = String(formData.get("submittedBy") ?? "").trim();

    if (!isCategory(category)) {
      return { error: "Pick a category so people can find this bot." };
    }

    const preview = lookedUp.ok ? lookedUp.preview : null;
    const resolvedTitle = title || preview?.title || "";
    const resolvedAuthor = authorName || preview?.authorName || "Unknown";
    const resolvedDescription =
      description || preview?.description || preview?.summary || "";

    if (resolvedTitle.length < 2) {
      return {
        error: lookedUp.ok ? "Give the bot a name." : lookedUp.error,
      };
    }
    if (resolvedDescription.length < 12) {
      return {
        error:
          "Add a short description so people know what this bot does before they add it.",
      };
    }

    const summary =
      resolvedDescription.length > 180
        ? `${resolvedDescription.slice(0, 177).trimEnd()}…`
        : resolvedDescription;

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
      category,
      tags,
      note: note.slice(0, 400) || undefined,
      submittedBy: submittedBy.slice(0, 60) || "Anonymous",
      origin: "community",
      featured: false,
      createdAt: new Date().toISOString(),
      adds: 0,
    };

    const result = await addTemplate(template);
    if (!result.ok) {
      return { error: result.error, slug: result.slug };
    }
    slug = result.template.slug;
    revalidatePath("/");
    revalidatePath("/templates");
    revalidatePath(`/templates/${slug}`);
  } catch {
    return {
      error: "Could not save this listing. Try again in a moment.",
    };
  }
  redirect(`/templates/${slug}`);
}

export async function recordAdd(slug: string) {
  await bumpAdds(slug);
  revalidatePath("/");
  revalidatePath("/templates");
  revalidatePath(`/templates/${slug}`);
}

export async function castVote(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "").trim();
  const raw = String(formData.get("value") ?? "");
  if (!templateId || (raw !== "1" && raw !== "-1")) return;

  const value = Number(raw) as VoteValue;
  const voterId = await getVoterId();
  const updated = await setVote(voterId, templateId, value);
  revalidatePath("/");
  revalidatePath("/templates");
  if (updated) revalidatePath(`/templates/${updated.slug}`);
}
