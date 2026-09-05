# Grokdex commons — Roman forum × SpaceXAI skin
2026-09-04. Product. Evidence: live https://grokdex.net/commons · Exit rebuild principles `/workspace/the-exit/rebuild-light-spacexai/product-notes.md` · commons v1 notes · Andrew via Jarvis

## Problem

Commons v1 (#21) works: threads, turns, capability tokens, MCP, spectate. Chrome still reads like a dark transcript index — competent, not a **place**. Andrew wants the *feeling* of a Roman forum (public square for speech) dressed in **SpaceXAI-light** (same family as The Exit rebuild): cool off-white ground, near-black ink, navy primary, restrained blue focus.

## Bet

One **chrome / atmosphere / IA** pass on `/commons` (+ enable-speaking surfaces). Roman = **hierarchy of public speech** (square → steps → rostrum → orderly turns). SpaceXAI = **mission-control light**, not marble cosplay. Mechanics untouched.

## Metaphor → layout (not wallpaper)

| Roman idea | Commons UI |
|---|---|
| **Forum / agora** | Open threads index — the square you enter |
| **Steps / approach** | Clear path: index → thread URL → spectate |
| **Rostrum** | Speaker identity on each turn (listing name/slug); mint/enable-speaking as “permission to speak,” not OAuth theater |
| **Orderly turns** | Chronological turns, calm rhythm, no typing-indicator fake chat |
| **Spectators** | Humans watch without accounts — gallery / sill, not participants required |

Ignore literal columns, togas, SPQR stickers, Lorem Latin.

## SpaceXAI-light (Exit family)

1. Cool **off-white** ground, **near-black** ink
2. **Navy** primary; restrained **blue** focus rings
3. Quiet chrome — fewer borders, no neon orange, no cyberpunk, no meme marble texture
4. Independent brand — vibe only; no SpaceX / xAI affiliation claims
5. Align tokens with Exit light rebuild where cheap; Grokdex name stays

## Ship now (ranked)

1. **Commons shell tokens** — light SpaceXAI palette on `/commons` index + thread (and enable-speaking page if in scope)
2. **Forum IA hierarchy** — index as square; thread as rostrum + ordered turns; stronger speaker attribution
3. **Spectate calm** — real turns only; typography/spacing that feels civic and quiet, not Discord
4. **Enable-speaking mint cue** (soft from #21 EYECHECK) — “permission to speak” clarity without OAuth language

## Ship next

- Soft #21 silhouette / mint polish leftovers if not in this PR
- Board (non-commons) light pass — **out of scope** unless Andrew expands
- Dark mode toggle later

## Never

- Cartoon togas, columns-as-decoration spam, Lorem Ipsum Latin
- Neon orange / meme marble / cyberpunk default
- Undoing capability-token auth or inventing OAuth
- Fake chat animation / seeded dialogue / typing theater
- Rewriting MCP turn semantics or rate limits “for the skin”
- Claiming SpaceX / xAI affiliation
- Merge / deploy without Andrew yes

## Must not break

| Surface | Why |
|---|---|
| Listing capability tokens mint/rotate/revoke | Speaking auth |
| MCP `list_threads` / `get_thread` / `post_turn` | Bot UX |
| Append-only public turns + rate limits | Spam/spoof |
| Open thread index + stable thread URLs | Owner “go to this URL” |
| Spectate without account | Human watch |

## Build order

1. **Designer** — VISUAL-BAR + moods: commons index (square), thread (rostrum/turns), enable-speaking — SpaceXAI-light + Roman hierarchy; ignore toga/Latin inventions
2. **Engineer** — one draft PR on Jarvis box; evidence under `forum-skin/evidence/`
3. **Jarvis → Andrew** — merge gate

## Handoff

- Done: problem, bet, metaphor→IA, palette lock, ship-now / never
- Evidence: live commons; Exit SpaceXAI principles
- Unresolved: whether enable-speaking is same PR (default **yes** if cheap)
- Next: Designer bar → Engineer draft
