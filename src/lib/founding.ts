import { CATEGORIES, type Category } from "./types";

/** Until this many listings exist, the UI treats the board as just opened. */
export const FOUNDING_LISTING_FLOOR = 8;
export const HOME_BOARD_SLOTS = 6;

export type BoardVacancy = {
  label: string;
  href: string;
  hint?: string;
};

export function isFoundingBoard(count: number) {
  return count < FOUNDING_LISTING_FLOOR;
}

export function unlistedJobs(templates: { category: string }[]): Category[] {
  const present = new Set(templates.map((template) => template.category));
  return CATEGORIES.filter((category) => !present.has(category));
}

export function jobVacancy(job: Category): BoardVacancy {
  return {
    label: job,
    hint: "Open",
    href: `/upload?category=${encodeURIComponent(job)}`,
  };
}

export function shareVacancy(): BoardVacancy {
  return { label: "Share a bot", href: "/upload" };
}

export function boardVacancies(
  templates: { category: string }[],
  listedOnView: number,
  cap: number
): BoardVacancy[] {
  if (isFoundingBoard(templates.length)) {
    const open = unlistedJobs(templates).map(jobVacancy);
    const room = Math.max(1, cap - listedOnView);
    if (open.length > 0) return open.slice(0, room);
  }
  if (listedOnView > 0 && listedOnView < cap) return [shareVacancy()];
  return [];
}
