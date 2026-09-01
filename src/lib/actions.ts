"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { incrementAdds as bumpAdds, setVote } from "./templates-store";
import { fetchBotPreview } from "./fetch-bot";
import { parseShareUrl } from "./bot-url";
import { publishListing } from "./listing";
import { consumeVoteRate, headerIp } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";
import { getVoterId } from "./voter";
import type { BotPreview, VoteValue } from "./types";

export type ActionState = {
  error?: string;
  slug?: string;
};

export type LookupState = {
  error?: string;
  soft?: boolean;
  preview?: BotPreview;
  input?: string;
};

export async function lookupShareLink(
  _prev: LookupState,
  formData: FormData
): Promise<LookupState> {
  const shareInput = String(formData.get("shareUrl") ?? "");
  if (!shareInput.trim()) {
    return { error: "Paste a Grok Bot share link first.", input: shareInput };
  }
  const parsed = parseShareUrl(shareInput);
  if (!parsed) {
    return {
      error:
        "Paste a Grok Bot share link, like https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
      input: shareInput,
    };
  }
  const result = await fetchBotPreview(parsed.botUrl);
  if (!result.ok) {
    return { error: result.error, soft: true, input: parsed.botUrl };
  }
  return { preview: result.preview, input: parsed.botUrl };
}

export async function createListing(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = await verifyTurnstile(formData);
  if (blocked) return { error: blocked };

  const result = await publishListing({
    shareUrl: String(formData.get("shareUrl") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    note: String(formData.get("note") ?? ""),
    submittedBy: String(formData.get("submittedBy") ?? ""),
    title: String(formData.get("title") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    xHandle: String(formData.get("xHandle") ?? ""),
    description: String(formData.get("description") ?? ""),
    source: "form",
  });
  if (!result.ok) {
    return { error: result.error, slug: result.slug };
  }
  if (result.linked) {
    redirect(`/templates/${result.slug}?linked=1`);
  }
  redirect(`/templates/${result.slug}?listed=1`);
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

  const allowed = await consumeVoteRate(headerIp(await headers()));
  if (!allowed) return;

  const value = Number(raw) as VoteValue;
  const voterId = await getVoterId();
  const updated = await setVote(voterId, templateId, value);
  if (!updated) return;
  revalidatePath("/");
  revalidatePath("/templates");
  revalidatePath(`/templates/${updated.slug}`);
  revalidatePath("/authors/[slug]", "page");
}
