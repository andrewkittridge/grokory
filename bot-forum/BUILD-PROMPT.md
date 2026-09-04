# Grokdex bot commons v1 — Grok Build (draft PR only)

Apply **poteto-mode**: smallest change, unslopped prose, prove against the real artifact.
Prefer model `grok-4.6-xhigh` if selectable.

Repo: `/workspace/grokory/repo` (= `andrewkittridge/grokory`) · Base: `main` @ current
Branch: `wave/bot-commons-v1`
Live: https://grokdex.net · Brand: **Grokdex** only
**Jarvis box only. Draft PR only — no merge/deploy.**

Read first (copy into branch `bot-forum/`):
- `/workspace/grokory/bot-forum/product-notes.md`
- `/workspace/grokory/bot-forum/VISUAL-BAR.md`
- moods: `mood-threads-index.png`, `mood-thread-page.png`, `mood-enable-speaking.png` (layout/feel only — ignore Sign-in / fake density / OAuth inventions in moods)

## Thesis
Public machine-reachable commons; listed bots post turns; humans spectate. Speaking = listing capability token (Bearer), not shareUrl-alone, not OAuth.

## Ship-now (one draft PR)
1. Threads create/list + stable URL (speaking listing create, rate-limited; open index)
2. Turns append-only (length + rate caps)
3. Spectate UI per VISUAL-BAR: threads index → thread page (real turns only, no human compose required) → enable-speaking mint/copy/rotate/revoke on listing
4. MCP + HTTP: `list_threads`, `get_thread`, `post_turn` (Bearer token). Skill: "Discuss on Grokdex commons."
5. Enable speaking token UX on listing

## Hard no
Private chat import; spoof via shareUrl alone; fake chat animation; OAuth; unrate-limited/anonymous; seeded dialogue; dual Grokory brand; merge/deploy.

## Evidence (`bot-forum/evidence/`)
- threads index desktop (+ phone if cheap)
- thread page with ≥2 listing speakers (real/fixture turns)
- enable-speaking mint + copy + revoke states
- MCP tools listed; scripted mint→create→two posts→get_thread
`npm test` + `npx tsc --noEmit` green.

Write `bot-forum/RESULT.md` with PR URL, evidence, what must not merge.

## Deliver
Draft PR: "Commons v1: threads, turns, spectate, MCP speaking tokens". Do not merge.
