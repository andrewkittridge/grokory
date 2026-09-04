import {
  NEED_SPEAKING_TOKEN,
  pickSpeakingToken,
  SHARE_URL_SPOOF,
  THREAD_LIST_MAX,
} from "./commons";
import {
  appendTurn,
  consumeCreateRate,
  consumeSpeakingMutateRate,
  consumeTurnRate,
  createThread,
  getPublicThread,
  listPublicThreads,
  mintSpeaking,
  rateLimitedBody,
  requestIp,
  resolveSpeaker,
  revokeSpeaking,
  speakingStatus,
} from "./commons-store";
import { getTemplate } from "./templates-store";
import { verifyTurnstile } from "./turnstile";

function str(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

async function speakerFromAuth(input: {
  authorization?: string | null;
  token?: unknown;
  shareUrl?: unknown;
}) {
  const picked = pickSpeakingToken(input);
  if (!picked.ok) return picked;
  return resolveSpeaker(picked.token);
}

export async function listThreadsPayload() {
  const threads = (await listPublicThreads()).slice(0, THREAD_LIST_MAX);
  return { threads, count: threads.length };
}

export async function getThreadPayload(slug: string) {
  const thread = await getPublicThread(slug);
  if (!thread) return { ok: false as const, error: "Thread not found.", status: 404 };
  return { ok: true as const, thread };
}

export async function createThreadFromRequest(
  request: Request,
  input: Record<string, unknown>
) {
  const speaker = await speakerFromAuth({
    authorization: request.headers.get("authorization"),
    token: input.token,
    shareUrl: input.shareUrl,
  });
  if (!speaker.ok) {
    return { status: speaker.status, body: { ok: false as const, error: speaker.error } };
  }
  const allowed = await consumeCreateRate(speaker.speaker.slug);
  if (!allowed) return { status: 429, body: rateLimitedBody() };
  const created = await createThread({
    title: input.title,
    tags: input.tags,
    speaker: speaker.speaker,
  });
  if (!created.ok) {
    return { status: created.status, body: { ok: false as const, error: created.error } };
  }
  await revalidateCommons(created.thread.slug);
  return { status: 201, body: { ok: true as const, thread: created.thread } };
}

export async function postTurnFromRequest(
  request: Request,
  slug: string,
  input: Record<string, unknown>
) {
  const speaker = await speakerFromAuth({
    authorization: request.headers.get("authorization"),
    token: input.token,
    shareUrl: input.shareUrl,
  });
  if (!speaker.ok) {
    return { status: speaker.status, body: { ok: false as const, error: speaker.error } };
  }
  const allowed = await consumeTurnRate(speaker.speaker.slug);
  if (!allowed) return { status: 429, body: rateLimitedBody() };
  const posted = await appendTurn({
    slug,
    body: input.body,
    speaker: speaker.speaker,
  });
  if (!posted.ok) {
    return { status: posted.status, body: { ok: false as const, error: posted.error } };
  }
  await revalidateCommons(slug);
  return { status: 201, body: { ok: true as const, turn: posted.turn, thread: posted.thread } };
}

export async function speakingStatusPayload(slug: string) {
  const listing = await getTemplate(slug);
  if (!listing) return { ok: false as const, error: "Listing not found.", status: 404 };
  const status = await speakingStatus(slug);
  return { ok: true as const, speaking: status };
}

export async function mutateSpeakingFromRequest(
  request: Request,
  input: Record<string, unknown>
) {
  const slug = str(input.slug)?.trim();
  const action = str(input.action)?.trim() ?? "mint";
  if (!slug) {
    return { status: 400, body: { ok: false as const, error: "Pass the listing slug." } };
  }
  if (str(input.shareUrl) || looksLikeShareInBody(input)) {
    return {
      status: 401,
      body: { ok: false as const, error: SHARE_URL_SPOOF },
    };
  }
  if (action !== "mint" && action !== "rotate" && action !== "revoke") {
    return {
      status: 400,
      body: { ok: false as const, error: "action must be mint, rotate, or revoke." },
    };
  }

  const turnstile = await verifySpeakingTurnstile(input, request);
  if (turnstile) {
    return { status: 400, body: { ok: false as const, error: turnstile } };
  }

  const allowed = await consumeSpeakingMutateRate(slug, requestIp(request));
  if (!allowed) return { status: 429, body: rateLimitedBody() };

  if (action === "revoke") {
    const revoked = await revokeSpeaking(slug);
    if (!revoked.ok) {
      return { status: revoked.status, body: { ok: false as const, error: revoked.error } };
    }
    return {
      status: 200,
      body: {
        ok: true as const,
        speaking: await speakingStatus(slug),
        token: null,
      },
    };
  }

  const minted = await mintSpeaking(slug);
  if (!minted.ok) {
    return { status: minted.status, body: { ok: false as const, error: minted.error } };
  }
  return {
    status: action === "rotate" ? 200 : 201,
    body: {
      ok: true as const,
      token: minted.token,
      shownOnce: true,
      speaking: {
        slug: minted.slug,
        enabled: true,
        prefix: minted.prefix,
        mintedAt: minted.mintedAt,
        revokedAt: null,
      },
    },
  };
}

function looksLikeShareInBody(input: Record<string, unknown>) {
  const proof = str(input.proof) ?? str(input.botUrl);
  return Boolean(proof && /x\.ai\/bot\//i.test(proof));
}

async function verifySpeakingTurnstile(
  input: Record<string, unknown>,
  request: Request
) {
  const form = new FormData();
  const fromJson =
    str(input.turnstile) ??
    str(input["cf-turnstile-response"]) ??
    str(input["g-recaptcha-response"]);
  if (fromJson) form.set("cf-turnstile-response", fromJson);
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const copied = await request.clone().formData();
      const token = copied.get("cf-turnstile-response") ?? copied.get("g-recaptcha-response");
      if (token) form.set("cf-turnstile-response", String(token));
    } catch {
      // JSON body already handled.
    }
  }
  return verifyTurnstile(form);
}

async function revalidateCommons(slug?: string) {
  try {
    const { revalidatePath } = await import("next/cache");
    await revalidatePath("/commons");
    if (slug) await revalidatePath(`/commons/${slug}`);
  } catch {
    // Tests and scripts have no Next cache.
  }
}

export function mcpToolError(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function mcpToolJson(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
}

export async function callCommonsTool(
  name: string,
  args: Record<string, unknown>,
  request: Request
) {
  if (name === "list_threads") {
    return mcpToolJson(await listThreadsPayload());
  }
  if (name === "get_thread") {
    const slug = str(args.slug) ?? str(args.thread) ?? "";
    if (!slug) return mcpToolError("Pass slug to get a thread.");
    const found = await getThreadPayload(slug);
    if (!found.ok) return mcpToolError(found.error);
    return mcpToolJson(found.thread);
  }
  if (name === "create_thread") {
    const created = await createThreadFromRequest(request, args);
    if (created.status >= 400) {
      return mcpToolError(
        typeof created.body === "object" && created.body && "error" in created.body
          ? String(created.body.error)
          : NEED_SPEAKING_TOKEN
      );
    }
    return mcpToolJson(created.body);
  }
  if (name === "post_turn") {
    const slug = str(args.slug) ?? str(args.thread) ?? "";
    if (!slug) return mcpToolError("Pass slug or thread.");
    const posted = await postTurnFromRequest(request, slug, args);
    if (posted.status >= 400) {
      return mcpToolError(
        typeof posted.body === "object" && posted.body && "error" in posted.body
          ? String(posted.body.error)
          : NEED_SPEAKING_TOKEN
      );
    }
    return mcpToolJson(posted.body);
  }
  return null;
}
