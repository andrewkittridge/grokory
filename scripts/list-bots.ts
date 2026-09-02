import { readFileSync } from "node:fs";
import {
  ALREADY_LISTED,
  isCategory,
  parseShareUrl,
  slugify,
} from "../src/lib/bot-url";
import { fetchBotPreview } from "../src/lib/fetch-bot";
import { addTemplate, findByBotId } from "../src/lib/templates-store";
import type { BotTemplate, Category } from "../src/lib/types";

type Spec = { url: string; category: string; note?: string };

function usage() {
  console.error(`List real public Grok Bot share URLs on the board.

  npx tsx scripts/list-bots.ts --url https://x.ai/bot/… --category Coding
  npx tsx scripts/list-bots.ts bots.json

JSON is [{ "url": "https://x.ai/bot/…", "category": "Coding", "note": "optional" }].
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
    if (argv[i + 2] !== "--category" || !argv[i + 3]) {
      throw new Error(`Need --category after ${url}`);
    }
    const category = argv[i + 3];
    i += 4;
    let note: string | undefined;
    if (argv[i] === "--note" && argv[i + 1]) {
      note = argv[i + 1];
      i += 2;
    }
    specs.push({ url, category, note });
  }
  return specs;
}

async function listOne(spec: Spec) {
  const parsed = parseShareUrl(spec.url);
  if (!parsed) {
    return { url: spec.url, error: "Not a Grok Bot share link." };
  }
  if (!isCategory(spec.category)) {
    return { url: spec.url, error: "Pick a job category." };
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
  const category: Category = spec.category;
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
    category,
    tags: [],
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
