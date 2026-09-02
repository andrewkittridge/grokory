# Grokdex wave 2 — RESULT

Branch: `wave/2-scoreboard-aura`  
Base: `main` @ `64c1791`  
Bar: `wave2/VISUAL-BAR.md`  
Public brand: **Grokdex** only  
Draft PR work only — not merged, not deployed.

## What landed (1–4)

### 1. Quiet empty OPEN seats
Live pain was four identical rows of `Claim this seat` plus `MCP list_bot` on every empty seat.

- Cap founding vacancies at **3** (`OPEN_SEAT_MAX`).
- Per-row copy is one calm line: **Claim this seat** · Paste a share link. No skill/MCP on the row.
- Agent path once: compact “Have your bot list it” strip on home; on `/templates`, a single footer: **Or have your bot list it · Skill · MCP**.
- Home roster does not repeat the agent footer (the compact strip already does that job).

**Paths:** `src/lib/founding.ts`, `src/lib/founding.test.ts`, `src/components/open-slots.tsx`, `src/components/bot-rank-row.tsx`

### 2. One Share hero
- Removed the mid-page **JUST OPENED / Share a Grok Bot** band (`LandingCta`) from home.
- Home hero keeps the primary **Share a bot** (founding) with **Browse** secondary.
- Nav **Share a bot** is ghost on `/` so there is one solid Share on home; it stays solid on other pages.
- Agent list strip stays **once**, compact.

**Paths:** `src/app/page.tsx`, `src/components/site-header.tsx`, `src/components/landing-hero.tsx`  
`src/components/landing-cta.tsx` is unused now (kept, not wired).

### 3. Scoreboard aura
- Rank rows: more padding, hairline dividers (`.rank-list`), sunset rank + spark only on **#1**; hover/focus rail is the active state.
- Mobile: **Copy + Post** both visible and thumb-reachable; votes stay on the same action row (`ml-auto`).
- Hot / Top / New: smaller tracking and padding; founding board strip no longer repeats `HOT` or a live-dot.
- Listing: **Add to Grok Bot** solid primary; **Preview on x.ai** outline; share stays compact/tertiary.

**Paths:** `src/components/bot-rank-row.tsx`, `src/components/share-listing.tsx`, `src/components/board-strip.tsx`, `src/components/bot-filters.tsx`, `src/app/templates/page.tsx`, `src/app/globals.css`, `src/components/add-procedure.tsx`, `src/components/listing-trust.tsx`, `src/components/add-bot-button.tsx`

### 4. Upload / Turnstile calm + listing Add hierarchy
- Form spacing tightened; Turnstile sits with Publish (`appearance: interaction-only`, `size: flexible`, `.turnstile-quiet`).
- Agent skill block is a secondary `border-t` section, not a second Frame competing with Publish.
- Listing Add hierarchy as in (3). Post-list **Post on X** hero in `ListedBanner` unchanged.

**Paths:** `src/components/upload-form.tsx`, `src/components/turnstile-field.tsx`, `src/app/upload/page.tsx`, `src/components/bot-list-paste.tsx`, `src/components/add-procedure.tsx`, `src/components/listing-trust.tsx`

## Never (held)
No seeds in product code. No skill walls. Featured/ads not louder. No Grokory in UI. No accounts/OAuth. No redesign.

## Unfinished
- `landing-cta.tsx` still on disk, unwired.
- Catalog parade still pads lanes with `openVacancy()` (now quiet “Claim this seat”, but density unchanged — out of ship-now).
- Local after-upload shot has **no Turnstile widget**: this checkout has no `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `.env`. Live before still shows the checkbox; production will use interaction-only (hidden unless a challenge is required).
- Post-list `?listed=1` banner not re-shot (kept as-is).
- Footer still has quiet text “Share” / “SHARE A BOT” — not a CTA band.

## Evidence
`wave2/evidence/before/` = live https://grokdex.net (Brave headless).  
`wave2/evidence/after/` = local `next dev` :43127 with a **gitignored** `data/templates.json` mirror of the two live listings (Writer, Research). Not committed.

| Shot | Look for |
|---|---|
| `before/home.png` vs `after/home.png` | MCP ×4 gone; 3 quiet seats; no JUST OPENED band; nav Share ghost; one hero Share; agent strip once |
| `after/home-mobile.png` | Copy + Post + votes; quiet seats |
| `before/board.png` vs `after/board.png` | 3 seats; Skill·MCP once; quieter Hot/Top/New; hairlines |
| `after/board-mobile.png` | Copy + Post thumb-reachable |
| `after/listing.png` | Add solid; Preview outline; share tertiary |
| `after/upload.png` | Form card; agent block secondary (Turnstile absent locally) |

## Test status
- `npm test` — **86 pass**, 0 fail
- `npx tsc --noEmit` — clean
- eslint on touched TS/TSX — clean
- Full Cloudflare `opennextjs-cloudflare build` **not** run (too heavy; types green)

HTML spot-check on local (visible copy, scripts stripped): 0× `MCP list_bot` on home/board; 3 claim seats; 1× agent footer on board; JUST OPENED band gone from home.
