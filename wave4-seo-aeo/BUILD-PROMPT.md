# Grokdex wave 4 SEO/AEO + traffic — Grok Build (draft PR only)

Repo: `andrewkittridge/grokory` · Base: `main` @ `02e7e00`  
Branch: `wave/4-seo-aeo`  
Product: `wave4-seo-aeo/product-notes.md` · Research: `research-notes.md`  
Writer drafts: `wave4-seo-aeo/drafts/` (how-to-list, what-is-grokdex, how-to-add)  
Live: https://grokdex.net · Brand: **Grokdex** only  
**Jarvis box only.**

## A — Schema / page fixes
1. Page-specific OG on `/faq` and `/templates` (not homepage clone)
2. Duplicate H1 — one H1 on home and listings
3. `/og.png` 404 — remove dead refs or redirect to `/opengraph-image.png`
4. `BreadcrumbList` on listings
5. `twitter:site` — skip if no stable handle

## B — Three traffic pages from Writer drafts
6. How to list a Grok Bot on Grokdex ← `drafts/how-to-list.md`
7. What is Grokdex / What is a Grok Bot ← `drafts/what-is-grokdex.md`
8. How to add a template to your Grok account ← `drafts/how-to-add.md`

Use existing dark board feel; don’t block on Designer bar. Wire routes + nav/footer links sensibly. No fake seeds/density claims.

## Hard no
Fake seeds, doorway spam, ads before floor, Grokory dual brand, inventing skills, **no merge/deploy**.

## Evidence
`wave4-seo-aeo/evidence/after/`: faq OG meta dump, templates OG, home H1, listing breadcrumb, three new pages desktop.  
Write `wave4-seo-aeo/RESULT.md`. `npm test` + `npx tsc --noEmit` green.

## Deliver
Draft PR titled like “Wave 4: SEO/AEO hygiene + how-to-list / what-is / how-to-add”. Do not merge or deploy.

## Designer bar (locked mid-draft)
Also follow `VISUAL-BAR.md` + moods `mood-guide-desktop.png`, `mood-guide-phone.png`, `mood-guide-what-is.png` for the three guide pages — dark board feel, calm hierarchy, not a redesign.
