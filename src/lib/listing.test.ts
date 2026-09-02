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

function listed(
  over: Partial<ListedTemplate> = {}
): ListedTemplate {
  return saved({
    id: "id",
    slug: "jarvis-n92u9t",
    botId: "N92u9t1nHlL_gtgk2nAeN",
    botUrl: SHARE,
    title: "Jarvis",
    authorName: "Andrew",
    summary: "A chief of agents for a solo founder who routes work.",
    description: "A chief of agents for a solo founder who routes work.",
    category: "Work",
    tags: ["routing"],
    note: "Keep it at the top of a roster.",
    submittedBy: "Anonymous",
    origin: "community",
    featured: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    adds: 0,
    live: true,
    skills: ["route"],
    routines: ["stand-up"],
    ...over,
  });
}

function deps(over: PublishListingDeps = {}): PublishListingDeps {
  return {
    findExisting: async () => null,
    preview: async () => ({ ok: true, preview: preview() }),
    save: async (template) => ({ ok: true, template: saved(template) }),
    update: async (_botId, patch) => ({
      ok: true,
      template: listed({
        title: patch.title ?? "Jarvis",
        authorName: patch.authorName ?? "Andrew",
        summary: patch.summary ?? listed().summary,
        description: patch.description ?? listed().description,
        category: patch.category ?? "Work",
        tags: patch.tags ?? ["routing"],
        note: patch.note === null ? undefined : (patch.note ?? listed().note),
        submittedBy: patch.submittedBy ?? "Anonymous",
        live: patch.live ?? true,
        skills: patch.skills ?? ["route"],
        routines: patch.routines ?? ["stand-up"],
      }),
    }),
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

test("re-pasting a listed share URL updates it", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Founder",
      tags: "chief-of-staff, routing",
      note: "Let it spawn specialists.",
      source: "agent",
    },
    deps({
      findExisting: async () => ({
        slug: "jarvis-n92u9t",
        title: "Jarvis",
        category: "Work",
        tags: ["routing"],
      }),
      update: async (botId, patch) => {
        assert.equal(botId, "N92u9t1nHlL_gtgk2nAeN");
        assert.equal(patch.category, "Founder");
        assert.deepEqual(patch.tags, ["chief-of-staff", "routing"]);
        assert.equal(patch.note, "Let it spawn specialists.");
        assert.equal(patch.title, "Jarvis");
        return {
          ok: true,
          template: listed({
            category: "Founder",
            tags: ["chief-of-staff", "routing"],
            note: "Let it spawn specialists.",
          }),
        };
      },
    })
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.updated, true);
  assert.equal(result.slug, "jarvis-n92u9t");
  assert.equal(
    result.listingUrl,
    "https://grokdex.net/templates/jarvis-n92u9t"
  );
});

test("form re-paste before lookup keeps job and tags", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Work",
      tags: "",
      note: "",
      title: "Hacked name",
      source: "form",
    },
    deps({
      findExisting: async () => ({
        slug: "jarvis-n92u9t",
        title: "Jarvis",
        category: "Research",
        tags: ["citations"],
      }),
      update: async (_botId, patch) => {
        assert.equal(patch.category, undefined);
        assert.equal(patch.tags, undefined);
        assert.equal(patch.note, undefined);
        assert.equal(patch.title, "Jarvis");
        assert.notEqual(patch.title, "Hacked name");
        return { ok: true, template: listed() };
      },
    })
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.updated, true);
});

test("form re-paste applies job after lookup", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Founder",
      tags: "chief-of-staff",
      note: "Let it spawn specialists.",
      title: "Hacked name",
      source: "form",
      applyFields: true,
    },
    deps({
      findExisting: async () => ({
        slug: "jarvis-n92u9t",
        title: "Jarvis",
        category: "Work",
      }),
      update: async (_botId, patch) => {
        assert.equal(patch.category, "Founder");
        assert.deepEqual(patch.tags, ["chief-of-staff"]);
        assert.equal(patch.note, "Let it spawn specialists.");
        assert.equal(patch.title, "Jarvis");
        return {
          ok: true,
          template: listed({
            category: "Founder",
            tags: ["chief-of-staff"],
            note: "Let it spawn specialists.",
          }),
        };
      },
    })
  );
  assert.equal(result.ok, true);
});

test("refresh intent skips job, tags, and note", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Founder",
      tags: "should-not-apply",
      note: "should-not-apply",
      source: "agent",
      intent: "refresh",
    },
    deps({
      findExisting: async () => ({
        slug: "jarvis-n92u9t",
        title: "Jarvis",
        category: "Work",
      }),
      update: async (_botId, patch) => {
        assert.equal(patch.category, undefined);
        assert.equal(patch.tags, undefined);
        assert.equal(patch.note, undefined);
        assert.equal(patch.title, "Jarvis");
        return { ok: true, template: listed() };
      },
    })
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.updated, true);
});

test("agent updates require a live x.ai preview", async () => {
  const result = await publishListing(
    { shareUrl: SHARE, category: "Work", source: "agent" },
    deps({
      findExisting: async () => ({ slug: "jarvis-n92u9t", title: "Jarvis" }),
      preview: async () => ({
        ok: false,
        error: "x.ai returned 404. That share link may have been taken down.",
        gone: true,
      }),
      update: async () => {
        throw new Error("should not update without a preview");
      },
    })
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "preview");
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
    })
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.linked, true);
  assert.equal(result.updated, true);
  assert.equal(result.slug, "jarvis-n92u9t");
  assert.equal(result.title, "Jarvis");
});

test("a second X handle on an existing listing is rejected", async () => {
  const result = await publishListing(
    {
      shareUrl: SHARE,
      category: "Work",
      xHandle: "@other",
      source: "form",
    },
    deps({
      findExisting: async () => ({
        slug: "jarvis-n92u9t",
        title: "Jarvis",
        xHandle: "andrew",
      }),
      linkHandle: async () => ({
        ok: false,
        error: "That listing already has an X handle.",
        slug: "jarvis-n92u9t",
      }),
      update: async () => {
        throw new Error("should not update after a handle conflict");
      },
    })
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "already_listed");
  assert.match(result.error, /already has an X handle/);
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

test("listBotFromAgent maps an update to 200", async () => {
  const result = await listBotFromAgent(
    { shareUrl: SHARE, category: "Work" },
    new Request("https://grokdex.net/api/bots", { method: "POST" }),
    deps({
      findExisting: async () => ({ slug: "jarvis-n92u9t", title: "Jarvis" }),
    })
  );
  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal("updated" in result.body && result.body.updated, true);
  assert.equal(
    "listingUrl" in result.body && result.body.listingUrl,
    "https://grokdex.net/templates/jarvis-n92u9t"
  );
});

test("updating a listing revalidates author pages", async () => {
  const paths: string[] = [];
  await publishListing(
    { shareUrl: SHARE, category: "Work", source: "agent" },
    deps({
      findExisting: async () => ({
        slug: "jarvis-n92u9t",
        title: "Jarvis",
        authorName: "Andrew",
      }),
      revalidate: (path) => {
        paths.push(path);
      },
    })
  );
  assert.ok(paths.includes("/authors"));
  assert.ok(paths.includes("/authors/andrew"));
  assert.ok(paths.includes("/templates/jarvis-n92u9t"));
});

test("listBotFromAgent maps a bad share URL to 400", async () => {
  const result = await listBotFromAgent(
    { shareUrl: "not-a-bot", category: "Work" },
    new Request("https://grokdex.net/api/bots", { method: "POST" }),
    deps()
  );
  assert.equal(result.status, 400);
});
