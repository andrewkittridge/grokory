/** Until this many listings exist, the UI treats the board as just opened. */
export const FOUNDING_LISTING_FLOOR = 8;
export const HOME_BOARD_SLOTS = 8;
/** Empty-board fallback only — live rows use a single seats-open invite. */
export const OPEN_SEAT_MAX = 2;
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

export function showBoardSortTabs(count: number) {
  return !isFoundingBoard(count);
}

export function isClaimSeat(slot: BoardVacancy) {
  return slot.label === "Claim this seat";
}

export function isSeatsOpenInvite(slot: BoardVacancy) {
  return slot.label === "Seats open";
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

export function seatsOpenInvite(): BoardVacancy {
  return {
    label: "Seats open",
    hint: "Claim this seat",
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
    if (room > 0 && listedOnView > 0) {
      return [seatsOpenInvite()];
    }
    if (room > 0) {
      return Array.from(
        { length: Math.min(room, OPEN_SEAT_MAX) },
        openVacancy
      );
    }
  }
  if (listedOnView > 0 && listedOnView < cap) return [shareVacancy()];
  return [];
}
