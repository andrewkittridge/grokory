# Grokdex — wave 4 SEO/AEO visual bar

Owner: Designer · Audience: Engineer / Writer · Status: **locked** (Andrew yes A+B)  
Live: https://grokdex.net @ `02e7e00` · Brand: **Grokdex** only  
Product: `product-notes.md` · Research: `research-notes.md`  
Moods: `mood-guide-desktop.png` · `mood-guide-phone.png` · `mood-guide-what-is.png`

---

## Thesis

Discoverability without fake density. **A** fixes page identity (OG/H1/og.png). **B** ships three real guides that match the wedge: public board + free list + agent self-list — not gtemplate handpicked. Visual job: one quiet **guide template** that feels like the dark board, plus honest share previews.

Moods are **layout / chrome feel only**. Keep live truths: paste `x.ai/bot/…`, free, no account, agent Skill/MCP, adds = clicks not installs, n=2 honest. **Ignore** mood inventions (review queues, “submit for approval,” “all categories,” fake density, Grokory).

---

## A. Page identity (mostly Engineer; visual checks)

1. **Page-specific OG** on `/faq` and `/templates` — title/desc/url match the page, not home.  
2. **One H1** on home and on listings (no header+hero double).  
3. **`/og.png` 404** — dead refs out; working `/opengraph-image.png` (or redirect).  
4. **BreadcrumbList** on listings — Catalog/board → listing. Soft.  
5. **`twitter:site`** — only if stable handle exists; else skip.

Evidence: share-preview stills or meta dumps for FAQ + board; home H1 count; og.png → 200 or gone.

---

## B. Guide page template (Designer bar)

Mood: `mood-guide-desktop.png` / `mood-guide-phone.png` / `mood-guide-what-is.png`

Shared template for all three traffic pages:

| Page | Intent |
|------|--------|
| How to list a Grok Bot on Grokdex | Paste share URL · free · agent self-list / MCP |
| What is a Grok Bot / What is Grokdex | Definition + independence disclaimer |
| How to add a template to your Grok account | Preview + Add · adds = clicks not installs |

### Template rules

- **One H1** — page title only.  
- Dark board system: black/near-black, white/grey type, sparse orange accent (same family as board).  
- Short intro → numbered steps or definition block → **one** primary CTA (Share a bot or Browse) — not six Share surfaces.  
- Footer hush held from wave3 (no all-caps SHARE band).  
- No fake listings, no Featured, no seed bots, no ads chrome.  
- Phone: same template, thumb CTAs ≥48px, Menu pattern OK.

Writer owns copy as Andrew after titles; Designer eye-checks template + OG feel, not prose.

---

## Preferred build order (one draft PR)

1. A fixes (OG / H1 / og.png / breadcrumbs / twitter:site if handle)  
2. Guide template shell  
3. Three pages with Writer copy (or Engineer placeholders matching Product titles if copy late)  

Evidence: `wave4-seo-aeo/evidence/after/`
- FAQ + board OG identity vs home  
- Each guide desktop + phone  
- Home / listing H1 single  

---

## Hard no

- Fake seed bots / invented catalog density  
- Thin doorway spam · ads before ~8–12  
- Dual Grokory brand · invented skills  
- Chasing gtemplate “handpicked” story  
- Merge without Andrew yes  

---

## Handoff

Writer: draft 6–8 after Product titles (optional same wave).  
Engineer: one Grok draft PR on **Jarvis’s computer** for A (+ B).  
Designer eye-checks. Draft only — no merge ask.
