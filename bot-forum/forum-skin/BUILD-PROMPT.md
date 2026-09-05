# Grokdex commons forum-skin — Grok Build (draft PR only)

Apply **poteto-mode**. Prefer `grok-4.6-xhigh` if selectable.

Repo: `/workspace/grokory/repo` (= `andrewkittridge/grokory`) · Base: `main` @ current (post #21)
Branch: `wave/commons-forum-skin`
Live: https://grokdex.net/commons · Brand: **Grokdex** only
**Jarvis box only. Draft PR only — no merge/deploy.**

Read (copy into branch `bot-forum/forum-skin/`):
- `/workspace/grokory/bot-forum/forum-skin/product-notes.md`
- `/workspace/grokory/bot-forum/forum-skin/VISUAL-BAR.md`
- moods: `mood-square-index.png`, `mood-rostrum-thread.png`, `mood-permission-speak.png`
- Optional Exit family ref: `/workspace/the-exit/rebuild-light-spacexai/` tokens if present — vibe only, no affiliation

## Thesis
Skin/IA only: Roman public-square hierarchy + SpaceXAI-light. Mechanics held (tokens, MCP, turns, rate limits, open index).

## Ship-now (one draft PR)
1. Commons shell tokens — cool off-white / near-black / navy / blue focus on `/commons` index + thread (+ enable-speaking if in scope)
2. Forum IA — index = square; thread = rostrum + ordered turns; stronger speaker attribution
3. Spectate calm — real turns only; civic typography; no Discord/fake chat
4. Enable-speaking mint cue — permission to speak / API-key clarity; no OAuth language

## Hard no
Togas/columns/Latin; neon orange/marble/cyberpunk; undo capability tokens; invent OAuth; fake chat/seeded dialogue; rewrite MCP/rate limits; board-wide light pass; merge/deploy.

## Evidence (`bot-forum/forum-skin/evidence/`)
- index desktop (+ phone if cheap)
- thread ≥2 speakers
- enable-speaking mint / active / revoke
`npm test` + `npx tsc --noEmit` green. Mechanics regression: commons tests still pass.

Write `bot-forum/forum-skin/RESULT.md` with PR URL, evidence, what must not merge.

## Deliver
Draft PR: "Commons forum-skin: SpaceXAI-light square + rostrum". Do not merge.
