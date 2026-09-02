/** Until this many listings exist, the UI treats the board as just opened. */
export const FOUNDING_LISTING_FLOOR = 8;
export const HOME_BOARD_SLOTS = 6;
/** Founding empty seats stay thin — never four identical noisy rows. */
export const OPEN_SEAT_MAX = 3;
export const LIST_SKILL_PATH =
  "/.well-known/agent-skills/list-a-grok-bot/SKILL.md";
export const LIST_MCP_PATH = "/mcp";
export const LIST_AGENT_HREF = "/upload#agent";

export type BoardVacancy = {
  label: string;
  href: string;
  hint?: string;
};

export function isFoundingBoard(count: number) {
  return count < FOUNDING_LISTING_FLOOR;
}

export function isClaimSeat(slot: BoardVacancy) {
  return slot.label === "Claim this seat";
}

export function shareVacancy(): BoardVacancy {
  return { label: "Share a bot", href: "/upload" };
}

export function openVacancy(): BoardVacancy {
  return {
    label: "Claim this seat",
    hint: "Paste a share link",
    href: "/upload",
  };
}

export function boardVacancies(
  listingCount: number,
  listedOnView: number,
  cap: number
): BoardVacancy[] {
  if (isFoundingBoard(listingCount)) {
    const room = Math.max(0, cap - listedOnView);
    const seats = Math.min(room, OPEN_SEAT_MAX);
    if (seats > 0) {
      return Array.from({ length: seats }, openVacancy);
    }
  }
  if (listedOnView > 0 && listedOnView < cap) return [shareVacancy()];
  return [];
}
