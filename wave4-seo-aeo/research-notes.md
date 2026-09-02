# Grokdex — SEO + AEO audit (post–wave3 live)
Date: 2026-09-02 · Research · Facts from live HTML/headers/API only  
Base: https://grokdex.net  
Evidence: `/workspace/grokory/wave4-seo-aeo/evidence/`  
Constraint: **No invented listings.** Live catalog = Writer + Research only (API `count: 2`).

## Method
`curl` fetches: home, `/templates`, `/upload`, `/faq`, `/catalog`, both listing URLs, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `index.md`, FAQ via `Accept: text/markdown`, `/api/bots`, `.well-known/ai-catalog.json`, OpenAPI, MCP card. Comparator snapshot: `https://gtemplate.net/` + its robots/sitemap. Parsed title/meta/OG/Twitter, JSON-LD, headings, canonicals.

Live API (2026-09-02): **2** bots — Writer (`writer-n92u9t`, xHandle `andrewkittridge`, adds 1), Research (`research-q6nive`, same handle, adds 2). Both `live: true`. Skills/routines arrays empty in API.

---

## Findings (hard)

### 1. Title / meta / OG / Twitter
| Page | `<title>` | Meta description | Canonical | og:url | Notes |
|---|---|---|---|---|---|
| `/` | Grokdex — Public Grok Bot board | A public board of Grok Bot templates… | `https://grokdex.net` | matches | OG image: `/opengraph-image.png?…` (PNG 200). Twitter `summary_large_image` + separate `/twitter-image?…` |
| `/templates` | The board · Grokdex | …share links. List yours… | `/templates` | **`https://grokdex.net` (home)** | og:title/description are **site-default**, not board-specific |
| `/upload` | (share/list page) | present in HTML | `/upload` | check evidence | Upload CTA page |
| `/faq` | FAQ · Grokdex | What Grokdex is, how to list… | `/faq` | **`https://grokdex.net` (home)** | Same site-default OG title/desc/url as home |
| `/templates/writer-n92u9t` | Writer · Grokdex | Writer summary | listing URL | **matches listing** | **Per-listing** `…/opengraph-image?…` |
| `/templates/research-q6nive` | Research · Grokdex | Research summary | listing URL | **matches listing** | Per-listing OG image |

Also: home `Link` response headers advertise api-catalog, OpenAPI, llms.txt, faq, ai-catalog, MCP, agent-card, markdown alternate. `content-signal: search=yes, ai-input=yes, ai-train=yes, use=full` on responses.

**Gaps:** `/og.png` → **404**; working image is `/opengraph-image.png`. FAQ + board pages reuse homepage OG identity (weak share previews for those URLs). No `twitter:site` observed on home parse.

### 2. JSON-LD / schema
**Home:** separate scripts for `WebSite` (+ `SearchAction` → `https://grokdex.net/templates?q={search_term_string}`), `Organization`, `ItemList` (`numberOfItems: 2`, Writer + Research), **`FAQPage`** with **9** questions.

**FAQ page:** WebSite, Organization, FAQPage (same question set; on-page **H2** per question).

**Board `/templates`:** WebSite, Organization, ItemList.

**Listing pages:** WebSite, Organization, **`SoftwareApplication`** (`applicationCategory: DeveloperApplication`, author Person + `sameAs` X URL, **`Offer` price 0 USD**, `isRelatedTo` Grokdex).

**Not observed on listings:** `BreadcrumbList`, `FAQPage` per bot, `AggregateRating`.

### 3. FAQ quotability (AEO)
Home + `/faq` expose the same nine intents in FAQPage JSON-LD and visible HTML (FAQ uses H2). Full answers also in markdown: `Accept: text/markdown` on `/faq` → ~2900 bytes with all Qs (unlike The Exit’s thin `faq.md` stub).

Questions covered (verbatim names): What is Grokdex?; What is a Grok Bot?; How do I add…?; How do I list…?; Can I link my X handle?; Can my Grok Bot list itself?; Can I update a listing?; Is listing free?; Where can agents read Grokdex without HTML?

### 4. Sitemap / robots / agent discovery
**robots.txt:** Allow `/` for `*`; explicit allows for GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, Google-Extended, Googlebot, PerplexityBot, Applebot-Extended, Amazonbot, Bytespider, CCBot, cohere-ai, meta-externalagent, FacebookBot, Diffbot. `Content-Signal: search=yes, ai-input=yes, ai-train=yes, use=full`. Agentmap + Sitemap pointed.

**sitemap.xml:** **14** URLs — home, templates, catalog, upload, support, feed.xml, privacy, terms, authors, faq, llms.txt, **both template listings**, author `andrew-kittridge`. Listing `lastmod` differs from shell pages (listing-level freshness). `changefreq` set (daily/weekly/etc.).

**AEO surfaces (200):** `llms.txt`, `llms-full.txt`, `index.md`, `/api/bots`, `openapi.json`, MCP server-card, ai-catalog, RSS `feed.xml` (home alternate link).

### 5. Heading structure
- Home: **two H1 “Grokdex”** (duplicate in markup — likely header + hero).
- FAQ: one H1 + H2 per question (clean).
- Board: one H1 “The board”.
- Listings: **two H1** with the bot name (same duplicate pattern) + H2 Related.

### 6. Pack/listing pages
Both live listings: unique title/description/canonical; per-URL OG image; SoftwareApplication + free Offer; author + X `sameAs`; sitemap included. API now has **non-null xHandle** on both rows.

---

## Intent clusters (traffic — fact + labeled implication)

### Observed on-page / schema query wording (fact)
From FAQPage, upload/home copy, ai-catalog `representativeQueries`, and SearchAction:
1. **What is a Grok Bot / Grokdex** — definition + independence disclaimer.
2. **Grok Bot templates / public board / catalog** — browse/rank/add.
3. **How to list / share / upload a bot** — paste `x.ai/bot/…`, free, no account; bot self-list skill.
4. **How to add a template to my Grok account** — Preview + Add; adds = clicks.
5. **Agent-facing** — markdown/llms/MCP/`list_bot` (“list my Grok Bot on Grokdex”).

### vs gtemplate.net (live snapshot 2026-09-02)
| Signal | Grokdex | gtemplate.net |
|---|---|---|
| Title positioning | “Public Grok Bot **board**” | “Popular Grok Bot Templates — **Handpicked Daily**” |
| Density claim in UI/API | API **n=2** | Home claims **403** templates; **sitemap has 11** locs only |
| Ranking story | Browser votes / board | X popularity / handpicked |
| JSON-LD | WebSite, Org, ItemList, FAQPage, SoftwareApplication | **None** in home HTML |
| robots / AI | Explicit AI bots + Content-Signal `use=full` + Agentmap | Simple `Allow: /` + sitemap |
| List path | Free paste + agent self-list | “Connect your Grok Bot” prompt loop (prior research) |

**Implication (labeled):** Grokdex is positioned to win **“how to list a Grok Bot” / agent-native directory** intents and definitional FAQ; gtemplate currently owns **“popular / handpicked templates”** social-proof intent with far higher perceived density. Board SEO pages exist, but **n=2 ItemList** limits “directory” SERP competitiveness until unique live listings grow (aligns Analytics north star 8–12).

---

## Gaps worth Product/Engineer eyes (facts → implication)
1. **FAQ + `/templates` OG tags point at homepage** — share cards won’t name FAQ/Board.  
2. **Duplicate H1** on home and listings.  
3. **`/og.png` 404** while `/opengraph-image.png` works — fix broken refs if any remain.  
4. **No BreadcrumbList** on listings (Exit packs had them).  
5. **Catalog thinness is a ranking ceiling**, not a meta bug — honesty bar already says don’t fake density.

---

## Open questions
1. Should board/FAQ/upload get page-specific `og:title` / `og:url` / `og:description`?
2. Per-listing SoftwareApplication category always `DeveloperApplication` — intentional?
3. Invest in intent landing copy for “Grok Bot directory” vs lean on FAQPage alone?
4. Mirror gtemplate’s X-popularity framing, or stay “public ranked board + agent list” (Product call)?

## Evidence paths
- `/workspace/grokory/wave4-seo-aeo/evidence/home.html`, `faq.html`, `templates.html`, `upload.html`, `listing-*.html`
- `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `faq.md`, `index.md`, `api-bots.json`, `ai-catalog.json`
- Comparator: `gtemplate-home.html`, `gtemplate-robots.txt`, `gtemplate-sitemap.xml`

---

## Density intake addendum (2026-09-02 evening)

**X agent** ran engagement intake (`url:x.ai/bot -is:retweet`, min_likes:5, ~1,596 posts/7d). Research folded into pick list — **still draft; Andrew approves before any `list_bot`.**

| Delta | Evidence |
|---|---|
| Merged file | `/workspace/grokory/wave4-seo-aeo/X-CANDIDATES.md` (+ mirror `wave4-density/`) |
| X raw | `evidence/x-bot-shares-min5.json` |
| Merge JSON | `wave4-density/candidates-merged.json` |

**Hard facts from fold:**
- Top engagement: **Researchy** (`rQt4W2zO2Gx9lfcBjd1lj`) — already in lane list; X score 3886 (2045 likes, ~974K views on farzyness post).
- New live (HTTP 200) high-signal not in prior lane scrape: **Shepherd**, Roundtable pack (**loops**, **Chief of Staff**, **Growth Desk**, **Forge**), plus Chief Health / NYC Parent / Inbot / AI PM OS (see section B of X-CANDIDATES).
- Filtered noise: `x.ai/bot/plugin`, `x.ai/bot/guides`.
- Cross-post “everywhere” template flagged high risk.
- Lane↔X URL overlap in min_likes:5 window was thin (**3** of 41); most lane candidates still valid via weaker/older evidence — engagement rank is additive, not a replacement.

**Implication (labeled):** X rank is a good **ordering** signal for the first 8–12 unique listings; lane curation still needed for safe prefs and household/coding diversity. Catalog thinness (n=2) remains the SEO ceiling; this intake does not invent density.

**Open:** Andrew pick from section C; Designer eye-check separate from list_bot.
