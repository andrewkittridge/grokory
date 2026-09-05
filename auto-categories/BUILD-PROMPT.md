# Grokdex auto-categories — Grok Build (draft PR only)

Apply **poteto-mode**. Prefer `grok-4.6-xhigh` if selectable.

Repo worktree: `/workspace/grokory/repo-auto-categories` (= `andrewkittridge/grokory`)
Base: `origin/main` @ current (post #21)
Branch: `wave/auto-categories` (already checked out in this worktree)
Live: https://grokdex.net · Brand: **Grokdex** only
**Jarvis box only. Draft PR only — no merge/deploy.**

Read (copy into branch `auto-categories/`):
- `/workspace/grokory/auto-categories/product-notes.md`
- `/workspace/grokory/auto-categories/VISUAL-BAR.md`
- moods: `mood-chips-all.png`, `mood-chips-selected.png`, `mood-chips-phone.png`
- BRIEF.md

## Thesis
Infer a closed set of browse **lanes** on list/refresh from public text. Surface as **filter chips on the one board** — still one Hot/Top/New list. Freeform tags stay. No category boosts, no job-lane boards, no required job on upload. Ranking formula unchanged except filter.

## Ship-now (one draft PR)
1. **Lane field** — first-class `lane` (prefer over reserved tag prefix). Closed vocabulary ~8–12 lanes locked in code/docs (propose from marketplace + live tags: Product, Engineering, Research, Writing, Design, Marketing, Sales, Ops, Personal, Media, Other — keep short; Product confirms in PR review).
2. **Assigner** — deterministic assign on `list_bot` / create / re-paste / `refresh_bot`. Priority: marketplace category (if known) → human tags matching a lane → keyword rules on title+summary → else `Other`. Do **not** wipe freeform `tags`. No invented x.ai category API. LLM classify = ship-next only.
3. **Backfill** — one-time migration/script for existing rows; evidence table before/after sample under `auto-categories/evidence/`.
4. **Board chips + `?lane=`** — chip row above ranked list: All + lanes with honest counts; empty lanes hidden or quiet grey. Selected filters same list via `?lane=`. Match live board chrome (dark Grokdex). Desktop wrap/scroll; phone horizontal scroll.
5. **Listing** — show primary lane quietly; free tags unchanged if present.
6. OpenAPI/MCP **read** of lane OK; verify **no** boost/rank change by lane.

## Hard no
- Category **boosts** / ranking by lane
- Separate **job-lane boards** / resurrect `list_categories` as ranking product
- Required job picker / lane nag on `/upload`
- Fake density / inventing lanes for empty seats
- Dual Grokory brand / SEO doorway pages per lane this wave
- Auth / commons tokens / MCP rewrite / ranking formula changes (except filter)
- Merge / deploy

## Evidence (`auto-categories/evidence/`)
- `board-chips-all.png` — All selected; full ranked list; honest counts
- `board-chips-lane.png` — one lane selected; filtered slice; still one board
- `board-chips-phone.png` — scrollable chips; thumb targets
- `listing-lane.png` — quiet primary lane on listing
- before/after backfill sample table
`npm test` + `npx tsc --noEmit` green.

Write `auto-categories/RESULT.md` with PR URL, evidence paths, what must not merge.

## Deliver
Draft PR: "Auto categories: lane field + board chip filter". Do not merge.
