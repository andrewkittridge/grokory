export const GROK_BOT_HOP_CLASS = "grok-bot-hopping";
export const GROK_BOT_ENTER_CLASS = "grok-bot-entering";

export function playGrokBot(
  el: HTMLElement | null,
  reduced: boolean,
  className: string
) {
  if (!el || reduced) return;
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

export function hopGrokBot(el: HTMLElement | null, reduced: boolean) {
  playGrokBot(el, reduced, GROK_BOT_HOP_CLASS);
}

export function enterGrokBot(el: HTMLElement | null, reduced: boolean) {
  playGrokBot(el, reduced, GROK_BOT_ENTER_CLASS);
}
