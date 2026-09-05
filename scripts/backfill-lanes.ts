import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { explainLane, LANE_LABELS, type LaneSource } from "../src/lib/lane";
import {
  listTemplates,
  updateListingFromShare,
} from "../src/lib/templates-store";

const SAMPLE_SLUGS = [
  "research-q6nive",
  "writer-n92u9t",
  "engineer-ezo9ls",
  "writing-bot-gj4wan",
  "product-3p03gr",
  "figma-bro-vhmdji",
  "last30days-txb-fy",
  "researchy-i2hvae",
  "alfred-p7gh6h",
  "fantasy-dakddn",
  "image-gen-bot-phpqtg",
  "dr-eggbot-93goz3",
];

type Row = {
  slug: string;
  title: string;
  tags: string[];
  before: string;
  after: string;
  source: LaneSource;
};

async function main() {
  const apply = process.argv.includes("--apply");
  const listed = await listTemplates(undefined, { includeDown: true });
  const rows: Row[] = [];

  for (const template of listed) {
    const assigned = explainLane(template);
    rows.push({
      slug: template.slug,
      title: template.title,
      tags: template.tags,
      before: template.lane,
      after: assigned.lane,
      source: assigned.source,
    });
    if (apply && assigned.lane !== template.lane) {
      const saved = await updateListingFromShare(template.botId, {
        lane: assigned.lane,
      });
      if (!saved.ok) {
        console.error(`${template.slug}: ${saved.error}`);
      }
    }
  }

  const table = markdownTable(rows);
  const evidenceDir = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "auto-categories",
    "evidence"
  );
  if (apply) {
    writeFileSync(join(evidenceDir, "backfill-sample.md"), `${table}\n`);
  }
  process.stdout.write(`${table}\n`);
  process.stdout.write(
    apply
      ? `\nApplied ${rows.filter((row) => row.before !== row.after).length} lane writes of ${rows.length} listings.\n`
      : `\nDry run. Pass --apply to persist.\n`
  );
}

function markdownTable(rows: Row[]) {
  const sample = SAMPLE_SLUGS.map((slug) =>
    rows.find((row) => row.slug === slug)
  ).filter((row): row is Row => Boolean(row));
  const shown = sample.length > 0 ? sample : rows.slice(0, 12);
  const lines = [
    "| Listing | Tags before | Lane before | Lane after | Source |",
    "| --- | --- | --- | --- | --- |",
    ...shown.map(
      (row) =>
        `| ${row.title} (\`${row.slug}\`) | ${row.tags.length ? row.tags.join(", ") : "—"} | ${row.before} | ${LANE_LABELS[row.after as keyof typeof LANE_LABELS] ?? row.after} | ${row.source} |`
    ),
  ];
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.after, (counts.get(row.after) ?? 0) + 1);
  }
  lines.push("");
  lines.push(
    `All ${rows.length} listings: ${[...counts.entries()]
      .map(([lane, count]) => `${lane} ${count}`)
      .join(" · ")}`
  );
  return lines.join("\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
