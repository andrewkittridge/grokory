import { isBoostedActive, partitionBoosted } from "./boost";
import { isFeaturedActive, partitionFeatured } from "./featured";
import { openVacancy, type BoardVacancy } from "./founding";
import type { BotMark, ListedTemplate, TemplateFilters } from "./types";
import { authorIdentity } from "./bot-url";
import { sortTemplates } from "./rank";

export const CATALOG_LANE_FLOOR = 4;
export const CATALOG_EMPTY_OPENS = 3;
export const CATALOG_TRACK_SIZE = 6;

export type CatalogLane = {
  id: string;
  templates: ListedTemplate[];
};

export type CatalogToken =
  | {
      kind: "listed";
      key: string;
      template: ListedTemplate;
      featured: boolean;
      boosted: boolean;
    }
  | {
      kind: "open";
      key: string;
      vacancy: BoardVacancy;
    };

export function filterTemplates(
  templates: ListedTemplate[],
  filters: TemplateFilters
) {
  const q = filters.q?.trim().toLowerCase();
  const tag = filters.tag?.trim().toLowerCase();
  const skill = filters.skill?.trim().toLowerCase();

  return templates.filter((template) => {
    if (tag && !template.tags.some((item) => item === tag)) return false;
    if (
      skill &&
      !template.skills.some((item) => item.toLowerCase() === skill)
    ) {
      return false;
    }
    if (!q) return true;
    const handle = template.xHandle?.trim();
    const haystack = [
      template.title,
      template.authorName,
      handle ?? "",
      handle ? `@${handle}` : "",
      template.summary,
      template.description,
      template.note ?? "",
      template.tags.join(" "),
      template.skills.join(" "),
      template.routines.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function catalogTokenMatches(token: CatalogToken, q: string) {
  const query = q.trim();
  if (!query) return true;
  if (token.kind === "open") return false;
  return filterTemplates([token.template], { q: query }).length > 0;
}

export function catalogListedHitCount(tokens: CatalogToken[], q: string) {
  return tokens.filter(
    (token) => token.kind === "listed" && catalogTokenMatches(token, q)
  ).length;
}

export function relatedTemplates(
  templates: ListedTemplate[],
  current: ListedTemplate
) {
  const currentTags = new Set(current.tags.map((item) => item.toLowerCase()));
  const currentSkills = new Set(
    current.skills.map((item) => item.toLowerCase())
  );
  const others = templates.filter(
    (template) => template.slug !== current.slug
  );
  const scored = others
    .map((template) => {
      let overlap = 0;
      for (const tag of template.tags) {
        if (currentTags.has(tag.toLowerCase())) overlap += 1;
      }
      for (const skill of template.skills) {
        if (currentSkills.has(skill.toLowerCase())) overlap += 1;
      }
      return { template, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap);

  if (scored.length > 0) {
    return scored.map((item) => item.template).slice(0, 3);
  }

  return sortTemplates(others, "hot").slice(0, 3);
}

export type AuthorIndexRow = {
  slug: string;
  name: string;
  handles: string[];
  count: number;
  mark?: BotMark;
};

export function authorIndex(templates: ListedTemplate[]): AuthorIndexRow[] {
  const bySlug = new Map<
    string,
    { name: string; handles: Set<string>; count: number; mark?: BotMark }
  >();
  for (const template of templates) {
    const identity = authorIdentity(template);
    const slug = identity.slug;
    const row = bySlug.get(slug) ?? {
      name: identity.name,
      handles: new Set<string>(),
      count: 0,
    };
    row.count += 1;
    if (template.xHandle) row.handles.add(template.xHandle);
    if (!row.mark && template.mark) row.mark = template.mark;
    bySlug.set(slug, row);
  }
  return [...bySlug.entries()]
    .map(([slug, row]) => ({
      slug,
      name: row.name,
      handles: [...row.handles],
      count: row.count,
      mark: row.mark,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function catalogParadeLanes(
  templates: ListedTemplate[],
  now = Date.now()
): CatalogLane[] {
  const { featured, organic } = partitionFeatured(templates, now);
  const { boosted, rest } = partitionBoosted(organic, now);
  const ordered = [...featured, ...boosted, ...sortTemplates(rest, "hot")];
  if (ordered.length === 0) {
    return [{ id: "lane-0", templates: [] }];
  }
  const lanes: CatalogLane[] = [];
  for (let index = 0; index < ordered.length; index += CATALOG_TRACK_SIZE) {
    lanes.push({
      id: `lane-${lanes.length}`,
      templates: ordered.slice(index, index + CATALOG_TRACK_SIZE),
    });
  }
  return lanes;
}

export function catalogLaneTokens(
  lane: CatalogLane,
  now = Date.now()
): CatalogToken[] {
  const listed: CatalogToken[] = lane.templates.map((template) => ({
    kind: "listed",
    key: template.id,
    template,
    featured: isFeaturedActive(template, now),
    boosted: isBoostedActive(template, now),
  }));
  const vacancy = openVacancy();
  const opens =
    listed.length === 0
      ? CATALOG_EMPTY_OPENS
      : Math.max(0, CATALOG_LANE_FLOOR - listed.length);
  const tokens = [...listed];
  for (let index = 0; index < opens; index += 1) {
    tokens.push({
      kind: "open",
      key: `${lane.id}-open-${index}`,
      vacancy,
    });
  }
  return tokens;
}
