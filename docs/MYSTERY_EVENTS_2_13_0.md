# Mystery Events — game 2.13.0

Ijamm requested application of the four `Slay_the_Math_Mystery_Events_v2` artwork ZIPs and the supplied v2 mechanics. Fifteen events are now connected to Mystery nodes in both stages and in Learn/Challenge. This replaces the old generic Heal/Remove encounter for newly entered rooms. Existing pending legacy Artifact gifts finish through their existing question/claim flow.

The source specification, fixed timers, rewards and penalties are retained in [the supplied SOR](mystery/source-v2/SOR_MYSTERY_EVENTS_v2.md), [mechanics table](mystery/source-v2/JADUAL_MEKANIK_MYSTERY_EVENTS_v2.md) and [JSON](mystery/source-v2/mystery-events.v2.json). These values are source gameplay proposals requiring balance playtesting, not a claim of measured balance.

## Runtime ownership

- `mystery-data.js`: supplied v2 configuration, without replacing the active bank.
- `mystery.js`: eligibility, separate event/reward RNG, persisted offers, one-attempt outcomes, transactions, effect dispatch, temporary modifiers and save validation.
- `education.js`: adapter to the active Question Bank / STM session service. Preferred IDs first, then unused questions in the same topic only. Five events per topic. Existing question content, answer bindings, hints, worked solutions and tooltip glossary are unchanged.
- `engine.js`: atomic commands, legal room entry/exit, combat and once-only commits. Final review is required before any consequence; Echo starts a saved stage-appropriate Normal encounter only on Continue.
- `mystery-ui.js` / `mystery.css`: supplied illustration beside the shared ornate panel; native buttons and existing card/dialog/toast/rich-text owners. Narrow screens show the complete scene before the panel; long card rows own their horizontal scroll. Fractions use normal MathML style at a readable size.

## Timing and persistence

The 30/45/60-second limits are fixed per event. Intro/Leave exposes no question or resource cost. Start immediately renders the in-memory question and its four interactive choices, stores the absolute deadline and records exposure. An in-session monotonic anchor survives support rerenders; hidden tabs, dialogs and Main Menu do not pause or renew the deadline. A response at/after the deadline is TIMEOUT. Wrong, timeout or abandoned attempts close the shared learning record and show the correct answer/explanation.

Optional offers require a correct response and an explicit confirmation after any target choice. Costs and every bundled effect are applied to a cloned run and validated before replacing live state. Invalid targets, insufficient payment, damaged offer payloads and double commits cannot partially mutate the run. Every target is a physical card instance, except a new-card offer which uses a distinct card definition ID.

Run format remains 1 with optional `mysteryState` version 2. It stores event/reward RNG, seen event IDs, transaction receipts, pending question/choice order/deadline/outcome, frozen reward candidates, selected option/target, queued combat modifiers and permanent Max HP sacrifice. Question exposure stays in the existing profile until explicit bank reset. Archived session provenance distinguishes timed Mystery exposure from an unfinished Artifact reservation, preserving existing Artifact resume behavior while preventing a Mystery retry from becoming a new Artifact reward attempt.

Artifact trades keep a consumed-gift ledger so opening gift/question history remains valid after ownership is exchanged; Max HP is recalculated and current HP clamped. Bargain reduces Max HP exactly once and does not subtract current HP again. The card save minimum becomes one, following v2's nonempty-deck removal rule; Shop's existing minimum ten and Filter's existing six-active-card rule remain separately enforced.

Oracle modifiers apply to the next real Normal/Elite/Boss/forced combat, sum with artifact stats, and vanish for the following combat. Hourglass Draw/Energy applies only on that combat's first turn, using the existing ten-card Hand cap and minimum-zero Energy. Saved combat reload does not reapply modifiers. Existing checkpoint/retry semantics remain; profile exposures are still unioned before the next reservation.

## Artwork provenance and recovery

`tools/import-mystery.py` checks the common configuration and supplied hashes, then writes current-scene WebP derivatives at 1920×1080 and 960×540 atomically. Runtime never preloads fifteen 8K textures. The four source ZIPs and original artwork remain unchanged. Reference Markdown hard-break whitespace is normalized without changing its content; the configuration JSON retains its original bytes. Exact source/output hashes and sizes are in `dist/assets/mystery-art.json`.

ME04's supplied, hash-matching PNG is truncated inside its final IDAT chunk. Independent zlib inspection found 4316 complete rows out of 4320. Its derivative uses those valid rows, discarding four incomplete rows of floor margin; no decoder-filled pixels enter the game. The full character, mirror, boots and scene were visually checked. All thirty runtime WebP images decode independently.

The old question-bank snapshot is compatibility reference only and is not imported. The prior glossary harmonization issue documented in `QUESTION_SUPPORT_AUDIT_2_12.md` remains assigned to the question-bank owner.

## Verification and limits

Node/DOM, browser and portable evidence is stored in `docs/verification/mystery-2-13-*.json`. Browser coverage includes every event's correct route in both stages, every incorrect route, fixed deadlines, saved review, reward confirmation, category/tier restrictions, native keyboard activation and six viewports from 320px to 4K. Automated checks use executor Chromium; no physical Windows/phone, Safari/Firefox or classroom balance playtest is claimed.

After pulling, rebuild `MAIN-SEKARANG.html` with `npm.cmd run build`, restart the server and refresh. Generated portable HTML is tested locally and is not committed as another >100 MB Git blob.
