# Grokdex wave 3 visual — RESULT

Branch: `wave/3-visual`  
Base: `main` @ `0a56351` (post PR #11 / wave 2)  
Bar: `wave3-visual/VISUAL-BAR.md` · Product: `wave3-visual/product-notes.md`  
Public brand: **Grokdex** only  
Andrew picked all five. Draft PR only — not merged, not deployed.

## What landed (1–5)

### 1. Scoreboard-up / quieter hero
First glance was brand theater; the two listings sat under a tall wordmark + mascot + extra paragraph.

- Shorter hero: one-line promise (`A ranked board of public Grok Bots.`), one Share primary + Browse. Extra body paragraph dropped.
- Wordmark scaled down (`clamp(2.15rem, 7vw, 3.35rem)` vs 3–5.5rem). Mascot tucked (`4.75rem` phone / `7–11rem` desktop vs 7 / 10–20rem).
- Tighter page padding and agent strip. Ranked board (2 listed + seats-open line) is in the first screen.

**Paths:** `src/app/page.tsx`, `src/components/landing-hero.tsx`, `src/components/bot-list-paste.tsx`, `src/app/globals.css`

### 2. #1-only sunset / spark
Desktop leftover: warmth reading onto #2 because the spark sat on the shared hairline.

- Rank numeral sunset on **#1 only**; #2+ stays muted.
- Spark inset (`bottom: 0.7rem`, 28% mix) so it underlines #1 instead of coloring the divider.

**Paths:** `src/components/bot-rank-row.tsx`, `src/app/globals.css`

### 3. One board sort until density
Hot / Top / New at n=2 is founding noise.

- Default remains Hot.
- Tabs hidden while `count < FOUNDING_LISTING_FLOOR` (8). They return at 8+.

**Paths:** `src/lib/founding.ts`, `src/components/bot-filters.tsx`, `src/app/templates/page.tsx`, `src/components/board-strip.tsx`

### 4. Footer + Turnstile hush
- Dropped the footer uppercase **SHARE A BOT** CTA. Nav still has a quiet Share destination.
- Turnstile stays `appearance: interaction-only`. Widget sits under Publish (not beside it). Empty widget collapses (`.turnstile-quiet:not(:has(iframe))`).

**Paths:** `src/components/site-footer.tsx`, `src/components/upload-form.tsx`, `src/components/refresh-listing.tsx`, `src/app/globals.css`

### 5. OPEN seats trim
Three claim rows still dominated the two live listings.

- Live founding rows get one **Seats open · Claim this seat** invite (no rank numbers, no MCP on the row).
- Empty founding board still caps claim rows at **2** (`OPEN_SEAT_MAX`).
- Board keeps the once-only agent footer: **Or have your bot list it · Skill · MCP**. Home roster does not repeat it (hero strip already does).

**Paths:** `src/lib/founding.ts`, `src/lib/founding.test.ts`, `src/components/open-slots.tsx`, `src/components/bot-rank-row.tsx`

## Soft adds

- **(a) Mobile hero wordmark clip — done.** Wordmark row is `min-h` + `pr` for the tucked mascot; promise sits below, full width. After @ 390: “Grokdex” intact; subhead wraps, not truncated.
- **(b) Phone listing title above Add/Pin — done.** Title + byline render above the Add rail on `< lg`. Desktop listing card still owns the title. Local after has no Pin/Boost (Stripe unset); those CTAs live in the same aside, so they also fall below the title on live.

## Never (held)

No seeds in product code. No ads / Featured louder. No Grokory in UI. No invented skills. No OAuth / redesign / mascot redo. No merge / deploy.

## Unfinished

- Catalog parade still pads lanes with `openVacancy()` (ship-next / never-now).
- Local after-upload has **no Turnstile widget** (no `NEXT_PUBLIC_TURNSTILE_SITE_KEY`). Production keeps interaction-only; the checkbox should stay hidden unless Cloudflare challenges.
- Local listing has no Pin/Boost (no Stripe). Live still will, under the title on phone.
- Footer nav still includes a muted Share link (destination, not a CTA band).

## Evidence

`wave3-visual/evidence/before/` = live https://grokdex.net (confirmed present: home/board desktop+mobile, upload).  
`wave3-visual/evidence/after/` = local `next dev` :43127 with a **gitignored** `data/templates.json` mirror of the two live listings (Writer, Research). Not committed.

| Shot | Look for |
|---|---|
| `before/home-desktop.png` vs `after/home-desktop.png` | Shorter hero; board in first glance; 01 sunset / 02 muted; one seats-open line; no SHARE A BOT |
| `after/home-mobile.png` | Full “Grokdex”; subhead wraps; board up; Copy+Post; seats-open line |
| `before/board-desktop.png` vs `after/board-desktop.png` | No Hot/Top/New; two rows + seats-open + Skill·MCP once |
| `after/board-mobile.png` | Same; Copy+Post thumb-reachable |
| `after/upload-desktop.png` | Publish primary; no SHARE A BOT; Turnstile absent locally |
| `after/listing-mobile.png` | Title above Add rail |

## Test status

- `npm test` — **88 pass**, 0 fail
- `npx tsc --noEmit` — clean
- eslint on touched TS/TSX — clean
- Full Cloudflare `opennextjs-cloudflare build` **not** run (too heavy; types green)
