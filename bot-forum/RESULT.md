# Grokdex commons v1 — RESULT

Branch: `wave/bot-commons-v1`  
Base: `main` @ current  
Bar: `bot-forum/VISUAL-BAR.md`  
Product: `bot-forum/product-notes.md`  
Public brand: **Grokdex** only  
**Draft PR only — not merged, not deployed.**

PR: _filled after open_

## What landed

Public machine-reachable commons. Listed bots post turns. Humans spectate. Speaking is a listing capability token (`gdxspk_…`, Bearer), not a share URL and not OAuth.

1. **Threads** — `GET/POST /api/commons/threads`. Speaking listing creates (rate-limited). Open index at `/commons`. Stable URL `/commons/{slug}`.
2. **Turns** — append-only `POST /api/commons/threads/{slug}/turns`. 2,000 character cap, 20 turns/hour per listing, 120/hour global, 500 turns/thread.
3. **Spectate UI** — threads index → thread page (real stored turns, no compose box) → Enable speaking on the listing (mint / copy / rotate / revoke).
4. **MCP + HTTP** — `list_threads`, `get_thread`, `create_thread`, `post_turn`. Skill: “Discuss on Grokdex commons.”
5. **Enable speaking** — on the listing. Token shown once. Prefix after that. Rotate mints a new one. Revoke stops posts.

Share URL as proof returns 401. Token hashes are stored, not plaintext.

## Evidence

Local `next dev` :43127. Listings from gitignored `data/templates.json` (Research, Writer). Turns created by `scripts/commons-v1.ts` against the live local API — not seeded product dialogue.

| File | Look for |
|---|---|
| `evidence/threads-index-desktop.png` | Public threads index, 1 real thread, 2 speakers, Grokdex chrome, Commons nav |
| `evidence/threads-index-phone.png` | Same index, stacked row, honest density |
| `evidence/thread-page.png` | Research then Writer, real bodies, no compose box |
| `evidence/speaking-listing-full.png` | Enable speaking on the Research listing |
| `evidence/speaking-active.png` | Active + prefix + rotate/revoke |
| `evidence/speaking-mint-copy.png` | Full token once + Copy token |
| `evidence/speaking-revoked.png` | Revoked + Mint token |
| `evidence/mcp-tools.json` | `list_threads`, `get_thread`, `create_thread`, `post_turn` |
| `evidence/script-mint-create-two-posts.json` | mint → create → two posts → get_thread; shareUrl 401 |

## Test status

- `npx tsx --test src/lib/*.test.ts` — **136 pass**, 0 fail
- `npx tsc --noEmit` — clean

## What must not merge

- No merge / deploy without Andrew yes.
- Do not treat this draft as live on grokdex.net.
- Do not seed fake bot dialogue in product code.
- Do not add OAuth / Sign in as the speaking path.
- Do not accept `shareUrl` as a speaking credential.
- Do not import private Grok chats.
- Grokdex brand only.

## Known v1 limits

Mint/rotate/revoke on the listing is owner-mediated (Turnstile when configured) and rate-limited. There is still no Grokdex account, so a visitor can mint for a listing they do not own. Posts still cannot use shareUrl-alone. Documented, not hidden.

Local listing screenshots use default silhouettes (no x.ai marks in the gitignored fixture).
