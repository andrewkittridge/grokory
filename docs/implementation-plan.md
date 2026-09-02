# Grokdex implementation plan

Dated 2 September 2026. Branch from current `main` (`3fadcf3`, optional X handles). This is an ordered backlog for follow-up work, not a product pitch.

The board is still founding: **2 live listings** (Writer, Research) against a floor of **8**. Do not buy ads, restore seed bots, or add chrome that needs a full catalog to make sense.

## What already ships

| Surface | Behavior |
|---|---|
| Board | Hot / Top / New, job filters, `?q=` / `?tag=`, founding OPEN seats |
| List | Paste `https://x.ai/bot/…` on `/upload`. Title, author, description, skills, routines come from the x.ai preview. No account. |
| Re-paste | Same share URL can attach the **first** X handle. Other fields still hit “already listed.” |
| Votes | Cookie `grokdex_voter`. One ballot per browser per bot. IP rate limit. |
| Paid | Tips (no rank). Featured pin, max 3. Category boost, max 2 per job. Webhook fulfills, not the success page. |
| Trust | Hourly cron refreshes identity + live/down. Report is mailto `report@grokdex.net`. |
| Agents | MCP `/mcp` and `POST /api/bots`: search, get, list. Proof is a live share URL. |
| Share | Post on X only after a successful list (`listed-banner`). |

## Constraints (do not break)

- **No Grokdex accounts.** No Sign in with X, Clerk, or email login. Cookies, share-URL possession, and MCP stay the identity model.
- **Listing stays free.** Paid placement is labeled and does not change organic hot/top/new.
- **No fake seed data.** Empty jobs stay OPEN seats until real share URLs land.
- **Independent catalog.** Copy must not imply xAI or SpaceXAI affiliation.
- **X handle is a public label.** Unverified. First handle sticks. Do not add a verified badge without a new proof scheme.
- **Adds count clicks**, not confirmed installs. Keep saying that.

## Do not build now

- Comments, weekly email digest, or anything that needs an address book.
- Sign in with X / claim-via-OAuth.
- Changing or clearing an X handle (write-once is the anti-spoof).
- Search pagination, trending tags, embed widgets, bot comparison.
- Google Search ads until ~8–12 real listings across jobs.
- Restoring `seed-jarvis` or any curated origin.

---

## 0. Close gaps on what just shipped

Small, should land with or before workstream 1.

| Gap | Fix |
|---|---|
| Linking an X handle later does not revalidate `/authors/[slug]` | Call `revalidatePath` for the author slug in `publishListing` when `linked: true` (PR #2 leftover). |
| Live Writer and Research have `xHandle: null` | Product, not code. Re-paste each share URL with `@handle` on `/upload`. |
| Skills and routines stay empty | x.ai share pages embed identity in RSC, not Skills/Routines lists (`fetch-bot.ts`). Keep the “preview on x.ai” copy. Do not invent skills. Optional later: store whatever the hourly check can parse; do not fake lists. |
| Tag chips on a listing page filter the board; rank rows do not show tags | Fine at 2 listings. Add row chips only after workstream 2. |

---

## 1. Update existing listings

**Why first.** PR #2 already treats a duplicate share URL as a write when an X handle is new. Tags, note, category, and a manual identity refresh still 409. Cron already overwrites title/author/description/skills from x.ai; humans cannot trigger that, and they cannot fix a wrong job.

**Credential.** Possession of the public share URL. Same as listing and handle-attach. Turnstile stays on the HTML form. Agents keep the live-preview gate.

**Behavior**

1. Re-paste a listed share URL on `/upload` (or `POST /api/bots` / MCP `list_bot`).
2. Look up the live x.ai preview.
3. Apply:
   - Identity from x.ai (title, author, description, og image, skills, routines, live).
   - Optional Grokdex fields if sent: category, tags, note, submittedBy.
   - X handle still write-once via `linkXHandleIfEmpty`.
4. Do **not** change slug, id, createdAt, score, adds, featured, or boosted.
5. Return 200 with `updated: true` and `listingUrl`. Identical no-op payloads can still 200.

**UI**

- `/upload` when lookup finds an existing bot: “This bot is already listed” plus fields for job, tags, note, and optional first handle. Primary button: **Update listing**.
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

- Re-pasting Writer with a new category and tags updates the row and listing page.
- A second different X handle still fails.
- Cron and manual refresh share the same identity merge (`checkedIdentity` rules).

---

## 2. Share and discover

Useful once listings can stay accurate. Cheap. Helps fill empty jobs by making each listing something people actually post.

| Item | Implementation |
|---|---|
| Post on X from every listing | Reuse `listingPostText` + `x.com/intent/tweet` from `listed-banner.tsx` in `add-procedure.tsx` / `listing-trust.tsx`. |
| Authors index | New `/authors` listing unique `authorName` (and handles). Pages already exist at `/authors/[slug]`. |
| Clickable skills | `?skill=` on `/templates`, same pattern as `?tag=`. `filterTemplates` already searches skill text; add an exact filter. Chips on the listing page already wrap tags; do the same for skills. |
| Related bots | Keep same-job as the default. If that list is empty, fall back to overlapping tags/skills so a lonely Writing bot is not an island. |

Skip RSS-per-category and keyboard shortcuts until the catalog is bigger.

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

Also fix OpenAPI: `POST /api/bots` on a listed bot should document 200 update, not only 201/409.

---

## 5. Later — wink, not OAuth

From the X-handle discussion. Only after workstream 1 exists (need a refresh loop).

**Winked (unverified → weakly proven):** Grokdex shows a short code on the listing. The bot puts that code in its public x.ai description. Hourly `check-links` (and manual refresh) sees it and sets `winkedAt`. Label: “Listed by this bot” vs human paste. Not a verified checkmark, not Sign in with X.

Tweet-the-listing-URL is v2 of the same idea. Do not mix it into workstream 1.

---

## 6. After the founding floor

README already sets the gate: ~8–12 real listings across jobs.

Then, and only then:

- Unpause **Add** Google Search (US, ~$10/day). Keep Share → `/upload` as the primary.
- Consider a homepage “jobs still open” strip only if seats remain.
- Featured/boost become worth showing more loudly; they already work.

Until then, filling empty jobs (Work, Founder, Coding, Sales, Ops, Creative, Learning) is the product. Code cannot list bots the owner does not share.

---

## Suggested first implementation PR

**Title:** Re-paste a listed share URL to update it.

Scope: workstream **0 + 1** only.

1. Revalidate author pages when a handle is linked.
2. `updateListingFromShare` in the store.
3. `publishListing` returns 200 on metadata update.
4. Upload form existing-bot state + `?updated=1` banner.
5. FAQ / terms / skill / OpenAPI one-liners.
6. Tests: create, update tags/category/note, refresh identity, reject handle overwrite, agent 200 vs 201.

Out of scope for that PR: Saved, authors index, skill query param, MCP vote, wink.

## How to execute

Follow-up agents should implement one workstream per PR, in order 0+1 → 2 → 4 refresh → 3 → 5. Do not re-ask which track unless the owner names a different one.
