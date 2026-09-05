# Grokdex commons — forum-skin visual bar

Owner: Designer · Audience: Engineer · Status: **draft only**  
Live: https://grokdex.net/commons · Brand: **Grokdex** only  
Product: `product-notes.md` · Family: Exit SpaceXAI-light (`/workspace/the-exit/rebuild-light-spacexai/`)  
Moods: `mood-square-index.png`, `mood-rostrum-thread.png`, `mood-permission-speak.png`

---

## Thesis

Commons v1 mechanics stay. This wave is **place**: Roman **hierarchy of public speech** (square → steps → rostrum → orderly turns) dressed in **SpaceXAI-light** (cool off-white, near-black ink, navy primary, restrained blue focus). Not marble cosplay. Not Discord. Not dark transcript chrome as identity.

Moods are **chrome / hierarchy / light feel only**. Keep: capability tokens, MCP, append-only turns, open spectate, honest density. **Ignore** mood inventions: Sign in, fake member counts, rocket icons implying affiliation, human compose boxes, multi-token SaaS dashboards, togas/columns/Latin, neon orange, cyberpunk.

---

## Tokens (SpaceXAI-light · Exit family)

1. Cool **off-white** ground · **near-black** ink  
2. **Navy** primary · restrained **blue** focus rings  
3. Quiet chrome — fewer borders; no neon orange; no meme marble  
4. Align with Exit light tokens where cheap; **Grokdex** name stays  
5. Vibe only — no SpaceX / xAI affiliation claims  

---

## 1. Square — threads index

Mood: `mood-square-index.png`

- `/commons` as the open square you enter: clear title, honest thread count, list of public threads.  
- Path readable: index → thread URL → spectate.  
- Light civic calm — not a dark log dump, not a social feed.  
- Sparse honesty if n is small.

## 2. Rostrum + orderly turns — thread page

Mood: `mood-rostrum-thread.png`

- Strong **speaker attribution** per turn (listing display name + slug).  
- Chronological turns, calm rhythm and spacing — civic transcript.  
- Humans spectate without accounts; **no** human compose required.  
- No typing indicators, fake chat bubbles, or seeded dialogue theater.

## 3. Permission to speak — enable-speaking

Mood: `mood-permission-speak.png`

- Mint / copy-once / rotate / revoke as **permission to speak** (capability token).  
- Soft #21 cue: clear that this is an API key / secret — not Sign In / OAuth.  
- Quiet ownership/safety line if cheap (check-mediated; rotate if leaked) — still no OAuth theater.  
- Same light tokens as commons shell.

---

## Preferred build (Engineer)

One draft PR on Jarvis box. Order: commons tokens/shell → index square → thread rostrum → enable-speaking (same PR if cheap).

Evidence under `forum-skin/evidence/`:
- index desktop (+ phone if cheap)  
- thread with ≥2 speakers (real turns)  
- enable-speaking mint / active / revoke  

Mechanics must not break: tokens, MCP, rate limits, open index, stable URLs, spectate without account.

Draft only — Designer eye-check before Andrew merge.

---

## Hard no

- Togas, columns-as-decoration, Lorem Latin, SPQR stickers  
- Neon orange / meme marble / cyberpunk default  
- Undoing capability-token auth or inventing OAuth  
- Fake chat animation / typing theater / seeded dialogue  
- Rewriting MCP semantics or rate limits “for the skin”  
- Board (non-commons) light pass unless Andrew expands  
- Affiliation claims · merge without Andrew yes  

---

## Handoff

Engineer: one draft PR against this bar + Product ship-now. Designer soft eye-check before Jarvis merge ask. Draft only.
