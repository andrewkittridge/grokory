/** Until this many listings exist, the UI treats the board as just opened. */
export const FOUNDING_LISTING_FLOOR = 8;
export const HOME_BOARD_SLOTS = 6;
export const LIST_SKILL_PATH =
  "/.well-known/agent-skills/list-a-grok-bot/SKILL.md";
export const LIST_MCP_PATH = "/mcp";

export type BoardVacancy = {
  label: string;
  href: string;
  hint?: string;
  agentHref?: string;
  agentLabel?: string;
};

export function isFoundingBoard(count: number) {
  return count < FOUNDING_LISTING_FLOOR;
}

export function shareVacancy(): BoardVacancy {
  return { label: "Share a bot", href: "/upload" };
}

export function openVacancy(): BoardVacancy {
  return {
    label: "Claim this seat",
    hint: "Paste a share link",
    href: "/upload",
    agentHref: LIST_SKILL_PATH,
    agentLabel: "MCP list_bot",
  };
}

export function boardVacancies(
  listingCount: number,
  listedOnView: number,
  cap: number
): BoardVacancy[] {
  if (isFoundingBoard(listingCount)) {
    const room = Math.max(0, cap - listedOnView);
    if (room > 0) {
      return Array.from({ length: room }, openVacancy);
    }
  }
  if (listedOnView > 0 && listedOnView < cap) return [shareVacancy()];
  return [];
}
