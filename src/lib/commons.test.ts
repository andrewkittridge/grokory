import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { sha256Hex } from "./agent";
import {
  NEED_SPEAKING_TOKEN,
  SHARE_URL_SPOOF,
  TURN_MAX_CHARS,
  looksLikeShareUrl,
  looksLikeSpeakingToken,
  makeThreadSlug,
  mintSpeakingSecret,
  parseBearer,
  parseThreadTitle,
  parseTopicTags,
  parseTurnBody,
  pickSpeakingToken,
  speakingPrefix,
  speakingStatusFromRow,
  summarizeThread,
  threadMarkdown,
  threadsIndexMarkdown,
  uniqueSpeakers,
} from "./commons";
import {
  appendTurn,
  createThread,
  getPublicThread,
  installCommonsBackend,
  memoryCommons,
  mintSpeaking,
  resolveSpeaker,
  revokeSpeaking,
  speakingStatus,
} from "./commons-store";
import { consumeBoundedRate, nextRate, resetMemoryRates } from "./rate-limit";
import type { ListedTemplate } from "./types";

afterEach(() => {
  installCommonsBackend(undefined);
  resetMemoryRates();
});

function listing(over: Partial<ListedTemplate> = {}): ListedTemplate {
  return {
    id: "id",
    slug: "research-q6nive",
    botId: "Q6NiveEqmhIiYir_ZQG-4",
    botUrl: "https://x.ai/bot/Q6NiveEqmhIiYir_ZQG-4",
    title: "Research",
    authorName: "Andrew",
    summary: "Cited answers.",
    description: "Cited answers from primary sources.",
    tags: [],
    submittedBy: "Andrew",
    origin: "community",
    featured: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    adds: 0,
    live: true,
    skills: [],
    routines: [],
    score: 1,
    userVote: 0,
    ...over,
  };
}

test("speaking tokens are gdxspk secrets, not share URLs", () => {
  const minted = mintSpeakingSecret();
  assert.equal(looksLikeSpeakingToken(minted.token), true);
  assert.equal(looksLikeShareUrl(minted.token), false);
  assert.equal(minted.prefix, speakingPrefix(minted.token));
  assert.match(minted.prefix, /…$/);
  assert.equal(looksLikeShareUrl("https://x.ai/bot/abc"), true);
  assert.equal(looksLikeSpeakingToken("https://x.ai/bot/abc"), false);
});

test("Bearer parse and shareUrl spoof are rejected before lookup", () => {
  assert.equal(parseBearer("Bearer gdxspk_abc"), "gdxspk_abc");
  assert.equal(parseBearer("bearer gdxspk_abc"), "gdxspk_abc");
  assert.equal(parseBearer("Basic nope"), undefined);

  const missing = pickSpeakingToken({});
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error, NEED_SPEAKING_TOKEN);

  const spoof = pickSpeakingToken({
    shareUrl: "https://x.ai/bot/Q6NiveEqmhIiYir_ZQG-4",
    token: mintSpeakingSecret().token,
  });
  assert.equal(spoof.ok, false);
  if (!spoof.ok) assert.equal(spoof.error, SHARE_URL_SPOOF);

  const asToken = pickSpeakingToken({
    token: "https://x.ai/bot/Q6NiveEqmhIiYir_ZQG-4",
  });
  assert.equal(asToken.ok, false);
  if (!asToken.ok) assert.equal(asToken.error, SHARE_URL_SPOOF);

  const header = pickSpeakingToken({
    authorization: `Bearer ${mintSpeakingSecret().token}`,
  });
  assert.equal(header.ok, true);
});

test("turn and title caps", () => {
  assert.equal(parseTurnBody("").ok, false);
  assert.equal(parseTurnBody("hello").ok, true);
  assert.equal(parseTurnBody("x".repeat(TURN_MAX_CHARS + 1)).ok, false);
  assert.equal(parseThreadTitle("short").ok, false);
  assert.equal(parseThreadTitle("A real thread title").ok, true);
  assert.equal(parseTopicTags("Science, Ethics").join(","), "science,ethics");
});

test("thread slugs are stable from title + id", () => {
  const slug = makeThreadSlug("On the nature of intelligence", "aabbccdd-eeee");
  assert.equal(slug, "on-the-nature-of-intelligence-aabbcc");
});

test("transcript summary counts unique speakers in order", () => {
  const thread = {
    id: "t",
    slug: "nature-aabbcc",
    title: "The nature of intelligence",
    tags: ["science"],
    createdBySlug: "research-q6nive",
    createdAt: "2026-09-04T00:00:00.000Z",
    lastTurnAt: "2026-09-04T00:02:00.000Z",
  };
  const turns = [
    {
      id: "1",
      threadId: "t",
      listingSlug: "research-q6nive",
      displayName: "Research",
      body: "one",
      createdAt: "2026-09-04T00:01:00.000Z",
    },
    {
      id: "2",
      threadId: "t",
      listingSlug: "writer-n92u9t",
      displayName: "Writer",
      body: "two",
      createdAt: "2026-09-04T00:02:00.000Z",
    },
    {
      id: "3",
      threadId: "t",
      listingSlug: "research-q6nive",
      displayName: "Research",
      body: "three",
      createdAt: "2026-09-04T00:03:00.000Z",
    },
  ];
  assert.deepEqual(uniqueSpeakers(turns), ["research-q6nive", "writer-n92u9t"]);
  const publicThread = summarizeThread(thread, turns);
  assert.equal(publicThread.turnCount, 3);
  assert.equal(publicThread.speakerCount, 2);
  assert.equal(publicThread.url, "https://grokdex.net/commons/nature-aabbcc");
});

test("revoked tokens do not count as speaking", () => {
  const off = speakingStatusFromRow("research-q6nive", null);
  assert.equal(off.enabled, false);
  const revoked = speakingStatusFromRow("research-q6nive", {
    listingSlug: "research-q6nive",
    tokenHash: "",
    tokenPrefix: "",
    createdAt: "2026-09-04T00:00:00.000Z",
    revokedAt: "2026-09-04T00:01:00.000Z",
  });
  assert.equal(revoked.enabled, false);
});

test("mint → create → two posts → get_thread against a memory store", async () => {
  const mem = memoryCommons();
  installCommonsBackend(mem);
  const research = listing();
  const writer = listing({
    id: "writer",
    slug: "writer-n92u9t",
    botId: "N92u9t1nHlL_gtgk2nAeN",
    botUrl: "https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN",
    title: "Writer",
  });
  const listings = new Map([
    [research.slug, research],
    [writer.slug, writer],
  ]);
  const find = async (slug: string) => listings.get(slug) ?? null;

  const mintA = await mintSpeaking(research.slug, find);
  assert.equal(mintA.ok, true);
  if (!mintA.ok) return;
  const mintB = await mintSpeaking(writer.slug, find);
  assert.equal(mintB.ok, true);
  if (!mintB.ok) return;

  const speakerA = await resolveSpeaker(mintA.token, find);
  const speakerB = await resolveSpeaker(mintB.token, find);
  assert.equal(speakerA.ok, true);
  assert.equal(speakerB.ok, true);
  if (!speakerA.ok || !speakerB.ok) return;

  const created = await createThread({
    title: "The nature of intelligence",
    tags: "science",
    speaker: speakerA.speaker,
  });
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const first = await appendTurn({
    slug: created.thread.slug,
    body: "Intelligence is the capacity to adaptively achieve goals.",
    speaker: speakerA.speaker,
  });
  const second = await appendTurn({
    slug: created.thread.slug,
    body: "Value judgment is part of intelligence.",
    speaker: speakerB.speaker,
  });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);

  const got = await getPublicThread(created.thread.slug);
  assert.ok(got);
  assert.equal(got?.turnCount, 2);
  assert.equal(got?.speakerCount, 2);
  assert.equal(got?.turns[0]?.listingSlug, "research-q6nive");
  assert.equal(got?.turns[1]?.listingSlug, "writer-n92u9t");
  assert.equal(got?.turns[0]?.body.includes("adaptively"), true);

  const status = await speakingStatus(research.slug);
  assert.equal(status.enabled, true);
  assert.equal(status.prefix, mintA.prefix);

  const revoked = await revokeSpeaking(research.slug);
  assert.equal(revoked.ok, true);
  const after = await resolveSpeaker(mintA.token, find);
  assert.equal(after.ok, false);
});

test("down listings cannot speak even with a leftover token hash", async () => {
  const mem = memoryCommons();
  installCommonsBackend(mem);
  const live = listing();
  const minted = await mintSpeaking(live.slug, async () => live);
  assert.equal(minted.ok, true);
  if (!minted.ok) return;
  const down = await resolveSpeaker(minted.token, async () => ({
    ...live,
    live: false,
  }));
  assert.equal(down.ok, false);
});

test("sha256 of a speaking token is 64 hex chars", async () => {
  const { token } = mintSpeakingSecret();
  const digest = await sha256Hex(token);
  assert.match(digest, /^[0-9a-f]{64}$/);
});

test("commons markdown is a transcript, not a chat UI", () => {
  const md = threadsIndexMarkdown([]);
  assert.match(md, /# Public threads/);
  assert.match(md, /listing capability token/);
  assert.doesNotMatch(md, /Grokory/);
  assert.doesNotMatch(md, /Sign in/);
  const thread = threadMarkdown({
    slug: "nature-aabbcc",
    title: "The nature of intelligence",
    tags: ["science"],
    createdBySlug: "research-q6nive",
    createdAt: "2026-09-04T00:00:00.000Z",
    lastTurnAt: "2026-09-04T00:02:00.000Z",
    turnCount: 2,
    speakerCount: 2,
    url: "https://grokdex.net/commons/nature-aabbcc",
    speakers: ["research-q6nive", "writer-n92u9t"],
    turns: [
      {
        id: "1",
        listingSlug: "research-q6nive",
        displayName: "Research",
        body: "Intelligence is adaptive.",
        createdAt: "2026-09-04T00:01:00.000Z",
        listingUrl: "https://grokdex.net/templates/research-q6nive",
      },
      {
        id: "2",
        listingSlug: "writer-n92u9t",
        displayName: "Writer",
        body: "Value judgment is part of it.",
        createdAt: "2026-09-04T00:02:00.000Z",
        listingUrl: "https://grokdex.net/templates/writer-n92u9t",
      },
    ],
  });
  assert.match(thread, /Research \/ research-q6nive/);
  assert.match(thread, /Writer \/ writer-n92u9t/);
  assert.doesNotMatch(thread, /compose/);
});

test("bounded rate falls back to memory when KV is absent", async () => {
  const key = "commons-test:v1";
  for (let i = 0; i < 3; i += 1) {
    assert.equal(await consumeBoundedRate(key, 3, 60_000), true);
  }
  assert.equal(await consumeBoundedRate(key, 3, 60_000), false);
  const now = 1_000_000;
  let record = null as ReturnType<typeof nextRate>["record"] | null;
  const first = nextRate(record, now, 1, 1_000);
  assert.equal(first.ok, true);
  assert.equal(nextRate(first.record, now, 1, 1_000).ok, false);
});
