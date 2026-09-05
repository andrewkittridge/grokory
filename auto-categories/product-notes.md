# Grokdex — auto categories (ship-now notes)
2026-09-04. Product. Evidence: implementation-plan.md (categories removed) · live `/api/bots` (~31; most `tags: []`) · marketplace-seed category strings · Andrew “auto categories would be good”

## Problem

Browse is a **single ranked list**. Job filters / job lanes / category boosts / `list_categories` were **intentionally removed**. Listings still allow optional free tags, but almost nobody sets them — so the board is hard to skim as density grows (marketplace seed + more authors). Andrew wants **auto categories** without bringing back the old lane-boost product.

## Bet

**Infer a small closed set of browse lanes** on list/refresh from public text (title, summary/description, existing tags, marketplace category when present). Surface them as **filter chips on the one board** — still one Hot/Top/New list underneath. Freeform tags stay optional and secondary.

## What “auto categories” means (v1)

| Means | Does not mean |
|---|---|
| Closed vocabulary of ~8–12 **lanes** (e.g. Product, Engineering, Research, Writing, Design, Marketing, Sales, Ops, Personal, Media, Other) | Open-ended taxonomy explosion |
| Deterministic assign on `list_bot` / re-paste / `refresh_bot` | Required “pick a job” on upload |
| Board chips → `?lane=` (or reuse `?tag=` if lane is stored as a reserved tag prefix — prefer explicit `lane` field) | Separate per-job boards |
| Backfill existing rows once | Category **boosts** / ranking by lane |
| Marketplace category string → normalize into a lane when listing from seed | Resurrect `list_categories` MCP ranking product |

**Source of truth (priority):** marketplace category (if known) → existing human tags that match a lane → keyword rules on title+summary → else `Other`. No invented x.ai category API. LLM classify = **ship next** only if rules miss too often.

## Ship now

1. **Lane vocabulary** — locked closed set in code/docs (Engineer + Product agree names; start from marketplace + live ad-hoc tags: product, research, writing/copy, design, marketing, sales, ops, personal, media/video, engineering, fantasy/sports→Personal or Media — keep list short).
2. **Auto-assign pipeline** — on create/update/refresh: set `lane` (single primary). Do not wipe freeform `tags`.
3. **Board UI** — chip row above the list: All + lanes with counts; filters the same ranked list. Empty lanes hidden or grey.
4. **Migration** — one-time backfill for existing listings; evidence table before/after sample.
5. **Listing page** — show primary lane quietly; keep free tags if any.

## Ship next

- LLM-assisted lane when rules uncertain (Andrew-gated cost)
- Trending lanes / “lanes with new listings”
- Row chips on every rank row (plan once called this fine later)
- Skill-based filters (already `?skill=` — don’t conflate)

## Never / non-goals

- Resurrect **job-lane boards**, **category boosts**, or **`list_categories` as a ranking feature** unless Andrew explicitly re-opens that product
- Force a job picker on `/upload` as required
- Fake density by inventing lanes for empty seats
- Dual Grokory brand / SEO doorway pages per lane in this wave
- Merge without Andrew yes

## Designer

**Yes** — short VISUAL-BAR: board chip row (desktop + phone) in current Grokdex chrome (or commons SpaceXAI-light if board already moving — default **match live board**). Moods: chips idle / one selected / empty All.

## Engineer (draft)

- Spec: `lane` field (or reserved tag convention — prefer first-class `lane`), assigner module, backfill script, board chips + query param, OpenAPI/MCP read of lane, verify no boost/rank change by lane
- Hold: auth, commons tokens, ranking formula (except filter)
- Draft PR only; evidence under `auto-categories/evidence/`

## Success sniff

At n≈30+, I can tap **Writing** or **Engineering** and see a short honest slice without leaving the single-board mental model — and upload still doesn’t nag me for a job.

## Handoff

- Done: problem, bet, meaning, ship-now / never, Designer yes
- Evidence: implementation-plan removal note; live tags sparse
- Unresolved: final lane name list (Engineer proposes from marketplace+tags; Product confirms in PR review)
- Next: Designer chips bar → Engineer draft. Draft only.
