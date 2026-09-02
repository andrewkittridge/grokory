# Grokdex wave 4 SEO/AEO + traffic — RESULT

Branch: `wave/4-seo-aeo`  
Base: `main` @ `02e7e00`  
Product: `wave4-seo-aeo/product-notes.md` · Research: `research-notes.md`  
Writer: `wave4-seo-aeo/drafts/` · Bar: `VISUAL-BAR.md` (feel only; did not block)  
Public brand: **Grokdex** only  
Draft PR only — not merged, not deployed.

## What landed (A)

### 1. Page-specific OG on `/faq` and `/templates`
Share cards cloned the homepage (`og:url` / `og:title` / `og:description` = grokdex.net).

- `pageMetadata()` now sets title, description, canonical, `og:url`, and matching Twitter title/desc per page.
- FAQ OG image is `/faq/opengraph-image` (no longer the home card).
- Board already had `/templates/opengraph-image`; title/desc/url now match “The board”.

**Paths:** `src/lib/site.ts`, `src/app/faq/page.tsx`, `src/app/faq/opengraph-image.tsx`, `src/app/templates/page.tsx`

### 2. Duplicate H1
Live HTML had two `h1` “Grokdex” on home (Suspense fallback + hero) and two bot-name `h1`s on listings (phone title + desktop card).

- Home fallback wordmark is a `p`, so streamed HTML has one `h1`.
- Listing: one real `h1` (visible on phone, `sr-only` on desktop). Desktop card title is a visual `p` with `aria-hidden`.

**Paths:** `src/components/hero-wordmark.tsx`, `src/components/landing-hero.tsx`, `src/app/page.tsx`, `src/app/templates/[slug]/page.tsx`, `src/components/lock-title.tsx`

### 3. `/og.png` 404
Working image is `/opengraph-image.png`. `/og.png` now **308**s there (Next redirect + middleware).

**Paths:** `next.config.ts`, `src/middleware.ts`

### 4. `BreadcrumbList` on listings
JSON-LD: Board → listing. Visible crumb was already `Board / {name}`.

**Paths:** `src/lib/json-ld.ts`, `src/app/templates/[slug]/page.tsx`

### 5. `twitter:site`
No stable Grokdex handle. `TWITTER_SITE` is unset; `twitterMeta()` omits `site`.

**Paths:** `src/lib/site.ts`, `src/app/layout.tsx`

## What landed (B)

Three Writer pages, dark board feel (LockTitle, hairline cards, sunset step rings, one white primary CTA). Mood inventions ignored: no review queue, no “submit for approval”, no orange Share, no fake density.

| Path | Title | Primary CTA |
|---|---|---|
| `/guides/how-to-list` | How to list a Grok Bot on Grokdex | Share a bot → `/upload` |
| `/guides/what-is-grokdex` | What is a Grok Bot / What is Grokdex | Browse bots → `/templates` |
| `/guides/how-to-add` | How to add a template to your Grok account | Browse bots → `/templates` |

Also: HowTo JSON-LD on the two how-tos; sitemap + `llms.txt` + markdown (`Accept: text/markdown`); footer **How to list**; FAQ **Guides** list.

**Paths:** `src/lib/guides.ts`, `src/components/guide-doc.tsx`, `src/app/guides/[slug]/`, `src/lib/agent.ts`, `src/app/sitemap.ts`, `src/components/site-footer.tsx`, `src/app/faq/page.tsx`

## Never (held)

No fake seeds. No density claims. No Grokory in UI/meta. No ads/Featured louder. No `twitter:site` invention. No merge / deploy.

## Unfinished

- Designer bar was layout-feel only; pages use existing board chrome, not the mood’s orange Share / review-queue copy.
- Local after screenshots show the Next.js **N** dev indicator. Production will not.
- Catalog / upload / authors still inherit some homepage OG fields (out of ship-now; Product named FAQ + board).
- Founding catalog thinness (n=2) is still the ranking ceiling.

## Evidence

`wave4-seo-aeo/evidence/after/` = local `next dev` :43127 (gitignored `data/templates.json` mirror of Writer + Research). Not a production deploy.

| File | Look for |
|---|---|
| `faq-og.txt` | `og:title` FAQ · Grokdex; `og:url` `/faq`; FAQ OG image |
| `templates-og.txt` | `og:title` The board · Grokdex; `og:url` `/templates` |
| `home-h1.txt` | **H1 count: 1** (hero wordmark) |
| `listing-breadcrumb.txt` | **H1 count: 1**; BreadcrumbList Board → Writer |
| `og-png.txt` | `/og.png` 308 → `/opengraph-image.png` (200 PNG) |
| `twitter-site.txt` | no `twitter:site` |
| `how-to-list-desktop.png` | Writer how-to; numbered steps; Grokdex only |
| `what-is-grokdex-desktop.png` | Two definition cards; independence line |
| `how-to-add-desktop.png` | Preview / Add; adds = clicks |
| `guides-og.txt` | Page-specific OG on all three |

## Test status

- `npm test` — **97 pass**, 0 fail
- `npx tsc --noEmit` — clean
- eslint on touched TS/TSX — clean
- Full Cloudflare `opennextjs-cloudflare build` **not** run (too heavy; types green)
