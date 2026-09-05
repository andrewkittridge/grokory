# Grokdex auto-categories — RESULT

Branch: `wave/auto-categories`  
Base: `main` @ `193608e` (post #21)  
Bar: `auto-categories/VISUAL-BAR.md`  
Product: `auto-categories/product-notes.md`  
Public brand: **Grokdex** only  
**Draft PR only — not merged, not deployed.**

PR: https://github.com/andrewkittridge/grokory/pull/23

## What landed

Closed browse **lanes** inferred on list/refresh from public text. Filter chips on the **one** Hot/Top/New board. Freeform tags stay. Ranking formula untouched except the filter.

1. **Lane field** — first-class `lane` on listings (not a reserved tag prefix). Closed set of 11, locked in `src/lib/lane.ts`: Product, Engineering, Research, Writing, Design, Marketing, Sales, Ops, Personal, Media, Other. Product confirms names in PR review.
2. **Assigner** — deterministic on create / re-paste / `list_bot` / `refresh_bot`. Priority: marketplace category if the share id is in the 2026-09-04 marketplace snapshot → human tags that match a lane → keyword rules on title+summary → `Other`. Does not wipe `tags`. No x.ai category API. No LLM classify.
3. **Backfill** — `npx tsx scripts/backfill-lanes.ts --apply`. Sample table: `auto-categories/evidence/backfill-sample.md`.
4. **Board chips + `?lane=`** — All + occupied lanes with honest counts, above the ranked list. Empty lanes hidden. Same list, same sort. Dark Grokdex chrome (square, mono). Desktop wrap; phone horizontal scroll, 44px targets.
5. **Listing** — quiet primary lane (mono, muted) linking to `?lane=`. Tags unchanged when present.
6. **Read APIs** — `lane` on `GET /api/bots`, `GET /api/bots/{slug}`, MCP `search_bots` / `get_bot`. OpenAPI documents `?lane=` as filter-only. `list_bot` does not take a lane. `list_categories` stays gone. `src/lib/rank.ts` does not mention lane.

Upload still has no job picker.

## Evidence

Local `next dev --webpack` :43128. Fixture is gitignored `data/templates.json` built from live `GET /api/bots` (58 listings) then backfilled. Votes were not copied, so local scores are 0. Default silhouettes (no x.ai marks in the fixture). Next.js **N** appears on local shots.

| File | Look for |
| --- | --- |
| `evidence/board-chips-all.png` | All selected (58); honest counts; full ranked list; one board |
| `evidence/board-chips-lane.png` | Writing selected; 2 bots; still one board; Hot · 2 bots |
| `evidence/board-chips-phone.png` | Horizontal chip row; RESEARCH clipped = scroll; thumb-height chips |
| `evidence/listing-lane.png` | Quiet **Writing** under the description; no tag rewrite |
| `evidence/backfill-sample.md` | Before/after + source for 12 listings; 58-row totals |

Counts in the All shot: Product 4 · Engineering 8 · Research 1 · Writing 2 · Design 3 · Marketing 9 · Sales 8 · Ops 5 · Personal 9 · Media 3 · Other 6.

## Test status

- `npx tsx --test src/lib/*.test.ts` — **152 pass**, 0 fail
- `npx tsc --noEmit` — clean

## What must not merge

- No merge / deploy without Andrew yes.
- Do not treat this draft as live on grokdex.net.
- Do not add category **boosts** or rank-by-lane.
- Do not resurrect job-lane boards / `list_categories`.
- Do not require a job/lane picker on `/upload`.
- Do not invent empty lanes for density.
- Do not add per-lane SEO doorway pages or dual Grokory brand.
- Do not change the ranking formula (filter only).
- Do not ship LLM classify this wave.

## Product confirm in review

- Final names (11, including Other).
- Marketplace-over-tag: last30days → Product, Researchy → Engineering, Company Docs Q&A → Sales.
- Recruiting & People → Ops.
- Fantasy/sports → Personal.

## Known v1 limits

Keyword rules miss some honest-Other listings (dr eggbot, Connections, The Page, Pattern of Pain, When It Matters, Lennybot). LLM classify is ship-next. Rank rows do not show lane chips (also ship-next). Cron `check-links` does not re-assign; `refresh_bot` / re-paste does.
