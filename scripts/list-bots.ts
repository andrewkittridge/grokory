import { readFileSync } from "node:fs";
import { ALREADY_LISTED, parseShareUrl, slugify } from "../src/lib/bot-url";
import { fetchBotPreview } from "../src/lib/fetch-bot";
import { assignLane } from "../src/lib/lane";
import { addTemplate, findByBotId } from "../src/lib/templates-store";
import type { BotTemplate } from "../src/lib/types";

type Spec = { url: string; note?: string };

function usage() {
  console.error(`List real public Grok Bot share URLs on the board.

  npx tsx scripts/list-bots.ts --url https://x.ai/bot/…
  npx tsx scripts/list-bots.ts bots.json

JSON is [{ "url": "https://x.ai/bot/…", "note": "optional" }].
Does not seed fake bots. Skips duplicates and dead links.
`);
}

function args(): Spec[] {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    usage();
    process.exit(1);
  }
  if (argv.length === 1 && !argv[0].startsWith("-")) {
    return JSON.parse(readFileSync(argv[0], "utf8")) as Spec[];
  }
  const specs: Spec[] = [];
  for (let i = 0; i < argv.length; ) {
    if (argv[i] !== "--url" || !argv[i + 1]) {
      throw new Error(`Unknown arg ${argv[i]}`);
    }
    const url = argv[i + 1];
    i += 2;
    let note: string | undefined;
    if (argv[i] === "--note" && argv[i + 1]) {
      note = argv[i + 1];
      i += 2;
    }
    specs.push({ url, note });
  }
  return specs;
}

async function listOne(spec: Spec) {
  const parsed = parseShareUrl(spec.url);
  if (!parsed) {
    return { url: spec.url, error: "Not a Grok Bot share link." };
  }
  const existing = await findByBotId(parsed.botId);
  if (existing) {
    return { url: spec.url, error: ALREADY_LISTED, slug: existing.slug };
  }
  const lookedUp = await fetchBotPreview(parsed.botUrl);
  if (!lookedUp.ok) {
    return { url: spec.url, error: lookedUp.error };
  }
  const preview = lookedUp.preview;
  const template: BotTemplate = {
    id: crypto.randomUUID(),
    slug: slugify(preview.title, parsed.botId),
    botId: parsed.botId,
    botUrl: parsed.botUrl,
    title: preview.title,
    authorName: preview.authorName,
    summary: preview.summary,
    description: preview.description,
    ogImage: preview.ogImage,
    mark: preview.mark,
    tags: [],
    lane: assignLane({
      botId: parsed.botId,
      title: preview.title,
      summary: preview.summary,
      description: preview.description,
      tags: [],
    }),
    note: spec.note,
    submittedBy: "Anonymous",
    origin: "community",
    featured: false,
    createdAt: new Date().toISOString(),
    adds: 0,
    live: true,
    lastCheckedAt: new Date().toISOString(),
    skills: preview.skills,
    routines: preview.routines,
  };
  const result = await addTemplate(template);
  if (!result.ok) {
    return { url: spec.url, error: result.error, slug: result.slug };
  }
  return { url: spec.url, slug: result.template.slug };
}

async function main() {
  const specs = args();
  for (const spec of specs) {
    const result = await listOne(spec);
    if ("error" in result && result.error) {
      console.error(`${result.url}: ${result.error}${result.slug ? ` (${result.slug})` : ""}`);
    } else {
      console.log(`${result.url}: /templates/${result.slug}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
