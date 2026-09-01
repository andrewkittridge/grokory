import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clientIp,
  listBotFromAgent,
  publishListing,
  type PublishListingDeps,
} from "./listing";
import type { BotPreview, BotTemplate, ListedTemplate } from "./types";

const SHARE = "https://x.ai/bot/N92u9t1nHlL_gtgk2nAeN";

function preview(over: Partial<BotPreview> = {}): BotPreview {
  return {
    botId: "N92u9t1nHlL_gtgk2nAeN",
    botUrl: SHARE,
    title: "Jarvis",
    authorName: "Andrew",
    summary: "A chief of agents for a solo founder.",
    description: "A chief of agents for a solo founder who routes work.",
    skills: ["route"],
    routines: ["stand-up"],
    ...over,
  };
}

function saved(template: BotTemplate): ListedTemplate {
  return { ...template, score: 0, userVote: 0 };
}

function deps(over: PublishListingDeps = {}): PublishListingDeps {
  return {
    findExisting: async () => null,
    preview: async () => ({ ok: true, preview: preview() }),
    save: async (template) => ({ ok: true, template: saved(template) }),
    revalidate: () => undefined,
    ...over,
  };
}

test("clientIp prefers cf-connecting-ip", () => {
  const request = new Request("https://grokdex.net/api/bots", {
    headers: {
      "cf-connecting-ip": "1.2.3.4",
      "x-forwarded-for": "9.9.9.9",
    },
  });
  assert.equal(clientIp(request), "1.2.3.4");
});

test("publishListing rejects an invalid share URL", async () => {
  const result = await publishListing(
    { shareUrl: "https://example.com/bot", category: "Work", source: "agent" },
    deps({
      preview: async () => {
        throw new Error("should not preview");
      },
    })
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid");
});

test("publishListing rejects an unknown category", async () => {
  const result = await publishListing(
    { shareUrl: SHARE, category: "Magic", source: "agent" },
    deps()
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid");
  assert.match(result.error, /category/);
});

test("agent listings require a live x.ai preview", async () => {
  const result = await publishListing(
    { shareUrl: SHARE, category: "Work", source: "agent" },
    deps({
      preview: async () => ({
        ok: false,
        error: "x.ai returned 404. That share link may have been taken down.",
        gone: true,
      }),
      save: async () => {
        throw new Error("should not save");
      },
    })
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "preview");
  assert.match(result.error, /404/);
});

test("already listed returns the existing listingUrl", async () => {
  const result = await publishListing(
    { shareUrl: SHARE, category: "Work", source: "agent" },
    deps({
      findExisting: async () => ({ slug: "jarvis-n92u9t" }),
      preview: async () => {
        throw new Error("should not preview");
      },
    })
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "already_listed");
  assert.equal(result.slug, "jarvis-n92u9t");
  assert.equal(
    result.listingUrl,
    "https://grokdex.net/templates/jarvis-n92u9t"
  );
});

test("agent listings use x.ai preview fields", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Work",
      title: "Ignored",
      submittedBy: "",
      source: "agent",
    },
    deps({
      save: async (template) => {
        assert.equal(template.title, "Jarvis");
        assert.equal(template.authorName, "Andrew");
        assert.equal(template.submittedBy, "Grok Bot");
        assert.deepEqual(template.skills, ["route"]);
        return { ok: true, template: saved(template) };
      },
    })
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.title, "Jarvis");
  assert.match(result.listingUrl, /\/templates\/jarvis-/);
});

test("form listings can fill name by hand when preview fails", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Research",
      title: "Research",
      description: "Primary-source research for cited answers.",
      source: "form",
    },
    deps({
      preview: async () => ({
        ok: false,
        error: "Could not reach x.ai to look up that bot.",
      }),
      save: async (template) => {
        assert.equal(template.title, "Research");
        assert.equal(template.submittedBy, "Anonymous");
        assert.equal(template.live, true);
        return { ok: true, template: saved(template) };
      },
    })
  );
  assert.equal(result.ok, true);
});

test("publishListing stores an optional X handle", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Work",
      xHandle: "@andrew",
      source: "agent",
    },
    deps({
      save: async (template) => {
        assert.equal(template.xHandle, "andrew");
        return { ok: true, template: saved(template) };
      },
    })
  );
  assert.equal(result.ok, true);
});

test("publishListing rejects a junk X handle", async () => {
  const result = await publishListing(
    { shareUrl: SHARE, category: "Work", xHandle: "nope!", source: "form" },
    deps({
      save: async () => {
        throw new Error("should not save");
      },
    })
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid");
  assert.match(result.error, /X username/);
});

test("publishListing can attach an X handle to an existing listing", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Work",
      xHandle: "https://x.com/andrew",
      source: "form",
    },
    deps({
      findExisting: async () => ({ slug: "jarvis-n92u9t", title: "Jarvis" }),
      linkHandle: async (botId, handle) => {
        assert.equal(botId, "N92u9t1nHlL_gtgk2nAeN");
        assert.equal(handle, "andrew");
        return { ok: true, slug: "jarvis-n92u9t" };
      },
      preview: async () => {
        throw new Error("should not preview");
      },
    })
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.linked, true);
  assert.equal(result.slug, "jarvis-n92u9t");
  assert.equal(result.title, "Jarvis");
});

test("listBotFromAgent maps a handle link to 200", async () => {
  const result = await listBotFromAgent(
    { shareUrl: SHARE, category: "Work", xHandle: "@andrew" },
    new Request("https://grokdex.net/api/bots", { method: "POST" }),
    deps({
      findExisting: async () => ({ slug: "jarvis-n92u9t", title: "Jarvis" }),
      linkHandle: async () => ({ ok: true, slug: "jarvis-n92u9t" }),
    })
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
});

test("listBotFromAgent maps already listed to 409", async () => {
  const result = await listBotFromAgent(
    { shareUrl: SHARE, category: "Work" },
    new Request("https://grokdex.net/api/bots", { method: "POST" }),
    deps({
      findExisting: async () => ({ slug: "jarvis-n92u9t" }),
    })
  );
  assert.equal(result.status, 409);
  assert.equal(result.body.ok, false);
  assert.equal(
    "listingUrl" in result.body && result.body.listingUrl,
    "https://grokdex.net/templates/jarvis-n92u9t"
  );
});

test("listBotFromAgent maps a bad share URL to 400", async () => {
  const result = await listBotFromAgent(
    { shareUrl: "not-a-bot", category: "Work" },
    new Request("https://grokdex.net/api/bots", { method: "POST" }),
    deps()
  );
  assert.equal(result.status, 400);
});
