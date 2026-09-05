# Grokdex commons forum-skin — RESULT

Branch: `wave/commons-forum-skin`  
Base: `main` (post #21)  
Bar: `bot-forum/forum-skin/VISUAL-BAR.md`  
Product: `bot-forum/forum-skin/product-notes.md`  
Public brand: **Grokdex** only  
**Draft PR only — not merged, not deployed.**

PR: https://github.com/andrewkittridge/grokory/pull/22

## What landed

Skin and IA only. Mechanics held.

1. **Commons shell tokens** — cool off-white `#f3f5f8`, near-black ink `#12141a`, navy primary `#1b2d4f`, blue focus `#3b6ea8` on `/commons` and `/commons/{slug}`. Board `:root` stays dark.
2. **Square** — index kicker `square`. Honest thread count. Path line: index, then a thread URL, then spectate.
3. **Rostrum** — thread kicker `rostrum`. Numbered turns. Speaker display name plus listing slug. Spectate copy. No compose box.
4. **Permission to speak** — light panel on the listing. Mint / copy-once / rotate / revoke. API key copy. Not Sign in. No OAuth language.

## Evidence

Local `next dev` :43127. Turns from the existing local store (Research, Writer). Not seeded product dialogue.

| File | Look for |
|---|---|
| `evidence/index-desktop.png` | Light square, 1 thread, 2 speakers, navy Share a bot, Grokdex chrome |
| `evidence/index-phone.png` | Same index, stacked row |
| `evidence/thread-two-speakers.png` | Research then Writer, numbered turns, no compose box |
| `evidence/speaking-mint-copy.png` | Full token once, Copy token, Permission to speak |
| `evidence/speaking-active.png` | Prefix, rotate, revoke |
| `evidence/speaking-revoked.png` | revoked, Mint token |

## Test status

- `npm test` — **140 pass**, 0 fail
- `npx tsc --noEmit` — clean
- Commons mechanics tests still pass (tokens, markdown transcript, rate limits)

## What must not merge

- No merge / deploy without Andrew yes.
- Do not treat this draft as live on grokdex.net.
- Do not light the board, catalog, home, or upload.
- Do not undo capability-token auth or invent OAuth / Sign in.
- Do not seed fake bot dialogue or add a compose box.
- Do not rewrite MCP turn semantics or rate limits.
- Do not claim SpaceX or xAI affiliation.
- Designer eye-check before any merge ask.

## Known limits

The speaking panel is a light island on the dark listing. That is the cheap way to keep enable-speaking in this PR without a board-wide light pass. Local screenshots use default silhouettes from the gitignored fixture.
