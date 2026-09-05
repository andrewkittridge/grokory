# Grokdex implementation plan

Dated 2 September 2026. Categories (job filters, job lanes, category boosts, `list_categories`) were removed: the board is a single ranked list, boost is a labeled board strip (max 2), and listing no longer asks for a job. Auto-inferred browse **lanes** (chip filter on the same board, `?lane=`) are not that product: they do not boost rank and are not separate boards.

The board is still founding: **2 live listings** against a floor of **8**. Do not buy ads, restore seed bots, or add chrome that needs a full catalog to make sense.

## What already ships

| Surface | Behavior |
|---|---|
| Board | Hot / Top / New, `?q=` / `?tag=` / `?skill=`, founding OPEN seats with paste + agent self-list |
| List | Paste `https://x.ai/bot/…` on `/upload`. Title, author, description, skills, routines come from the x.ai preview. No account. |
| Re-paste | Same share URL **updates** the listing: identity from x.ai, tags, note, submittedBy. First X handle attaches. A second handle **409s**. Form primary is **Update listing**. Redirect `?updated=1`. |
| Votes | Cookie `grokdex_voter`. One ballot per browser per bot. IP rate limit. |
| Paid | Tips (no rank). Featured pin, max 3. Board boost, max 2. Webhook fulfills, not the success page. Marks stay quiet until the 8–12 floor. |
| Trust | Hourly cron refreshes identity + live/down. Report is mailto `report@grokdex.net`. Empty skills/routines chrome is hidden (x.ai preview does not expose lists — do not invent). |
| Agents | MCP `/mcp` and `POST /api/bots`: search, get, list, refresh. `list_bot` publishes or updates. Proof is a live share URL. OpenAPI documents **201 create / 200 update / 409 handle conflict**. |
| Share | Post on X / copy on listing pages, rank rows, and the post-list success banner (share is the hero CTA). Captions are Grokdex-only. |
| Authors | `/authors` index + `/authors/[slug]`. Revalidate on publish, update, and first-handle attach. |

## Constraints (do not break)

- **No Grokdex accounts.** No Sign in with X, Clerk, or email login. Cookies, share-URL possession, and MCP stay the identity model.
- **Listing stays free.** Paid placement is labeled and does not change organic hot/top/new.
- **No fake seed data.** Empty seats stay OPEN until real share URLs land.
- **Independent catalog.** Copy must not imply xAI or SpaceXAI affiliation.
- **X handle is a public label.** Unverified. First handle sticks. Do not add a verified badge without a new proof scheme.
- **Adds count clicks**, not confirmed installs. Keep saying that.

## Do not build now

- Comments, weekly email digest, or anything that needs an address book.
- Sign in with X / claim-via-OAuth.
- Changing or clearing an X handle (write-once is the anti-spoof).
- Search pagination, trending tags, embed widgets, bot comparison.
- Google Search ads until ~8–12 real listings.
- Restoring `seed-jarvis` or any curated origin.

---

## 0. Close gaps on what just shipped

**Shipped.** Author pages revalidate on handle link and metadata update. Empty skills/routines UI is hidden. Null handles show a quiet “add @handle” affordance (never invented).

| Gap | Status |
|---|---|
| Linking an X handle later does not revalidate `/authors/[slug]` | Done — `revalidateListing` includes `/authors` and `/authors/[slug]`. |
| Live Writer and Research have `xHandle: null` | Product, not code. Re-paste each share URL with `@handle` on `/upload`. |
| Skills and routines stay empty | Parser cannot invent. Cards and listing pages hide the chrome when arrays are empty. One honest line remains in agent markdown. |
| Tag chips on a listing page filter the board; rank rows do not show tags | Fine at 2 listings. Add row chips only after workstream 2. |

---

## 1. Update existing listings

**Shipped.** Re-paste on `/upload`, `POST /api/bots`, and MCP `list_bot` updates an existing listing. Tags, note, identity refresh, and first-handle attach return 200. A second X handle still 409. Cron and `refresh_bot` share the same identity merge (`checkedIdentity`).

**Why it mattered.** PR #2 treated a duplicate share URL as a write only when an X handle was new. Tags, note, and a manual identity refresh used to 409. Cron already overwrote title/author/description/skills from x.ai; humans could not trigger that.

**Credential.** Possession of the public share URL. Same as listing and handle-attach. Turnstile stays on the HTML form. Agents keep the live-preview gate.

**Behavior**

1. Re-paste a listed share URL on `/upload` (or `POST /api/bots` / MCP `list_bot`).
2. Look up the live x.ai preview.
3. Apply:
   - Identity from x.ai (title, author, description, og image, skills, routines, live).
   - Optional Grokdex fields if sent: tags, note, submittedBy.
   - X handle still write-once via `linkXHandleIfEmpty`.
4. Do **not** change slug, id, createdAt, score, adds, featured, or boosted.
5. Return 200 with `updated: true` and `listingUrl`. Identical no-op payloads can still 200.

**UI**

- `/upload` when lookup finds an existing bot: “This bot is already listed” plus fields for tags, note, and optional first handle. Primary button: **Update listing**.
- After success, redirect to `/templates/{slug}?updated=1` (mirror `?listed=1`).
- Listing page: a quiet “Refresh from x.ai” that is the same re-paste with empty optional fields (form + Turnstile), not a new secret endpoint.

**Code (expected)**

- `src/lib/listing.ts` — stop returning `already_listed` when the bot exists and an update is requested. Split `publishListing` into create vs update.
- `src/lib/templates-store.ts` — `updateListingFromShare` (Neon + file store). Invalidate list cache.
- `src/lib/actions.ts` / `src/components/upload-form.tsx` — existing-bot state.
- MCP / OpenAPI / skill `list-a-grok-bot` / FAQ / privacy: re-paste updates metadata; it is not a second listing.
- Tests in `listing.test.ts` and `templates-store.test.ts`.

**Do not**

- Let agents change identity without a successful live preview.
- Allow overwriting an X handle.
- Add listing passwords or edit tokens.

**Done when**

- Re-pasting Writer with new tags updates the row and listing page.
- A second different X handle still fails.
- Cron and manual refresh share the same identity merge (`checkedIdentity` rules).

---

## 2. Share and discover

Useful once listings can stay accurate. Cheap. Helps fill empty seats by making each listing something people actually post.

| Item | Status |
|---|---|
| Post on X from every listing | **Shipped** — `ShareListing` on listing trust, rank rows, and post-list success (Post on X is the hero CTA). |
| Authors index | **Shipped** — `/authors` plus `/authors/[slug]`. |
| Clickable skills | Exact `?skill=` exists. Do not advertise skill chips on the board until parse yields skills. |
| Related bots | Overlapping tags/skills, then other hot listings so a lonely bot is not an island. |

Skip RSS feeds and keyboard shortcuts until the catalog is bigger.

---

## 3. Cookie saved shortlist

Same pattern as votes, not a new account.

- Cookie `grokdex_saved` (UUID or signed list of template ids — prefer a second cookie id + `saves` table, mirroring `votes`).
- Star/save on rank rows and listing pages.
- Board filter **Saved** next to Hot / Top / New (`/templates?sort=saved`).
- Saving is not a vote and does not change score.

Wait until there are enough listings that “come back later” is real. After workstream 1–2 unless the catalog jumps.

---

## 4. Agent vote and refresh

Today agents can list and read. They cannot vote or ask Grokdex to re-fetch x.ai.

| Tool / route | Notes |
|---|---|
| `refresh_bot` | Same update path as workstream 1 with empty optional fields. Rate-limit with list (8/hour/IP) or a tighter refresh bucket. |
| `vote_bot` | **Do not add** until there is a voter story that is not “forge a cookie.” Cookie votes from MCP would be trivial to game. If this ships, it must be a separate, disclosed, heavily rate-limited signal (or skipped). Prefer skip. |

So: **refresh yes** (it is the agent form of workstream 1). **Vote no** unless a later plan defines anti-abuse.

OpenAPI: `POST /api/bots` documents **200 update**, **201 create**, and **409** handle conflict.

---

## 5. Later — wink, not OAuth

From the X-handle discussion. Only after workstream 1 exists (need a refresh loop).

**Winked (unverified → weakly proven):** Grokdex shows a short code on the listing. The bot puts that code in its public x.ai description. Hourly `check-links` (and manual refresh) sees it and sets `winkedAt`. Label: “Listed by this bot” vs human paste. Not a verified checkmark, not Sign in with X.

Tweet-the-listing-URL is v2 of the same idea. Do not mix it into workstream 1.

---

## 6. After the founding floor

README already sets the gate: ~8–12 real listings.

Then, and only then:

- Unpause **Add** Google Search (US, ~$10/day). Keep Share → `/upload` as the primary.
- Featured/boost become worth showing more loudly; they already work.

Until then, filling the board is the product. Code cannot list bots the owner does not share.

---

## Suggested next implementation PR

**0 + 1 already ship on main.** Do not rebuild them.

The pick-list draft (`feat/picklist-honesty-share`) is honesty + share + OPEN-seat agent path + quieter paid marks. Draft only — no merge, no production deploy.

Later, in order: cookie shortlist (3) after catalog density · wink (5) after a refresh loop exists in production · ads only at 8–12 real listings.

## How to execute

Workstreams 0+1, listing share, authors index, `refresh_bot`, and OpenAPI 200 are on main. Follow-ups should not re-buy that work. Density to 8–12 is mostly real share URLs, not chrome.
