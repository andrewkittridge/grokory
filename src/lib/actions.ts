"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  findByBotId,
  incrementAdds as bumpAdds,
  setVote,
} from "./templates-store";
import { fetchBotPreview } from "./fetch-bot";
import { parseShareUrl } from "./bot-url";
import { publishListing } from "./listing";
import {
  consumeSpeakingMutateRate,
  mintSpeaking,
  revokeSpeaking,
  speakingStatus,
} from "./commons-store";
import type { SpeakingStatus } from "./commons";
import { consumeVoteRate, headerIp } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";
import { getVoterId } from "./voter";
import type { BotPreview, VoteValue } from "./types";

export type ActionState = {
  error?: string;
  slug?: string;
};

export type ExistingLookup = {
  slug: string;
  title: string;
  tags: string[];
  note?: string;
  submittedBy: string;
  xHandle?: string;
};

export type LookupState = {
  error?: string;
  soft?: boolean;
  preview?: BotPreview;
  input?: string;
  existing?: ExistingLookup;
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
  const [result, listed] = await Promise.all([
    fetchBotPreview(parsed.botUrl),
    findByBotId(parsed.botId),
  ]);
  const existing = listed
    ? {
        slug: listed.slug,
        title: listed.title,
        tags: listed.tags,
        note: listed.note,
        submittedBy: listed.submittedBy,
        xHandle: listed.xHandle,
      }
    : undefined;
  if (!result.ok) {
    return {
      error: result.error,
      soft: true,
      input: parsed.botUrl,
      existing,
    };
  }
  return { preview: result.preview, input: parsed.botUrl, existing };
}

export async function createListing(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = await verifyTurnstile(formData);
  if (blocked) return { error: blocked };

  const intentRaw = String(formData.get("intent") ?? "publish");
  const intent = intentRaw === "refresh" ? "refresh" : "publish";
  const result = await publishListing({
    shareUrl: String(formData.get("shareUrl") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    note: String(formData.get("note") ?? ""),
    submittedBy: String(formData.get("submittedBy") ?? ""),
    title: String(formData.get("title") ?? ""),
    authorName: String(formData.get("authorName") ?? ""),
    xHandle: String(formData.get("xHandle") ?? ""),
    description: String(formData.get("description") ?? ""),
    source: "form",
    intent,
    applyFields: String(formData.get("updateFields") ?? "") === "1",
  });
  if (!result.ok) {
    return { error: result.error, slug: result.slug };
  }
  const query = new URLSearchParams();
  if (result.updated) query.set("updated", "1");
  else if (result.linked) query.set("linked", "1");
  else query.set("listed", "1");
  if (result.linked && result.updated) query.set("linked", "1");
  redirect(`/templates/${result.slug}?${query.toString()}`);
}

export type SpeakingActionState = {
  error?: string;
  token?: string | null;
  speaking?: SpeakingStatus;
};

export async function mutateSpeaking(
  _prev: SpeakingActionState,
  formData: FormData
): Promise<SpeakingActionState> {
  const blocked = await verifyTurnstile(formData);
  if (blocked) return { error: blocked };

  const slug = String(formData.get("slug") ?? "").trim();
  const action = String(formData.get("action") ?? "mint").trim();
  if (!slug) return { error: "Missing listing." };
  if (action !== "mint" && action !== "rotate" && action !== "revoke") {
    return { error: "Unknown speaking action." };
  }

  const ip = headerIp(await headers());
  const allowed = await consumeSpeakingMutateRate(slug, ip);
  if (!allowed) return { error: "Too many commons writes. Try again in an hour." };

  if (action === "revoke") {
    const revoked = await revokeSpeaking(slug);
    if (!revoked.ok) return { error: revoked.error };
    revalidatePath(`/templates/${slug}`);
    return { speaking: await speakingStatus(slug), token: null };
  }

  const minted = await mintSpeaking(slug);
  if (!minted.ok) return { error: minted.error };
  revalidatePath(`/templates/${slug}`);
  return {
    token: minted.token,
    speaking: {
      slug: minted.slug,
      enabled: true,
      prefix: minted.prefix,
      mintedAt: minted.mintedAt,
      revokedAt: null,
    },
  };
}

export async function recordAdd(slug: string) {
  await bumpAdds(slug);
  revalidatePath("/");
  revalidatePath("/templates");
  revalidatePath("/catalog");
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
  revalidatePath("/catalog");
  revalidatePath(`/templates/${updated.slug}`);
  revalidatePath("/authors/[slug]", "page");
}
