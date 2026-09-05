# Backfill sample (local fixture from live `/api/bots`, 2026-09-05)

Lane before is the stored field. Existing rows had none, so normalize defaulted to `other`. Freeform tags were not rewritten. Source is marketplace (known share id from the 2026-09-04 marketplace scrape) → matching human tag → keyword on title+summary → Other.

Product should confirm marketplace-over-tag cases: last30days (tag `research` → Product), Researchy (tag `research` → Engineering), Company Docs Q&A (tag `ops` → Sales).

| Listing | Tags before | Lane before | Lane after | Source |
| --- | --- | --- | --- | --- |
| Research (`research-q6nive`) | — | other | Research | keyword |
| Chief of Agents (`writer-n92u9t`) | writing, drafts, copy | other | Writing | tag |
| Engineer (`engineer-ezo9ls`) | — | other | Engineering | keyword |
| Writing Bot (`writing-bot-gj4wan`) | — | other | Writing | keyword |
| Product (`product-3p03gr`) | — | other | Product | keyword |
| figma bro (`figma-bro-vhmdji`) | — | other | Design | keyword |
| last30days (`last30days-txb-fy`) | research | other | Product | marketplace |
| Researchy (`researchy-i2hvae`) | research | other | Engineering | marketplace |
| Alfred (`alfred-p7gh6h`) | ops | other | Ops | marketplace |
| Fantasy (`fantasy-dakddn`) | fantasy, sports | other | Personal | tag |
| Image Gen Bot (`image-gen-bot-phpqtg`) | — | other | Media | keyword |
| dr eggbot (`dr-eggbot-93goz3`) | — | other | Other | other |

All 58 listings: personal 9 · other 6 · media 3 · product 4 · ops 5 · engineering 8 · marketing 9 · writing 2 · design 3 · sales 8 · research 1
