# Combat card motion — 2.25.0

Requested by Ijamm, 23 October 2026 (Malaysia). Developed and reviewed as 2.25.0 on `combat-animation` from main `2800f9a` / 2.24.0. Ijamm's subsequent explicit instruction authorizes publishing this work to main; it supersedes the initial branch-only delivery boundary. The follow-up card/artifact artwork restoration ships with this motion in 2.25.1; see [artwork restoration](ICON_ART_RESTORE_2_25_1.md).

## Piles

- **Draw:** a dungeon card back travels from the real Draw pile and turns into the full source card at its hand position. Multiple draws overlap with a 32ms stagger.
- **Discard:** the full card arcs and contracts into the real Discard pile. End Turn includes every remaining hand card, even if the same UID is immediately shuffled and drawn again.
- **Exhaust:** the full card contracts into the Exhaust pile with an orange glow and seven deterministic embers. Exhaust is only a combat destination; this visual never removes a card from the run deck.
- **Shuffle:** a face-down stack shows the actual count moving from Discard to Draw; it does not reveal identities or order. Hidden Card Search skips also stay face down.
- **Other existing transfers:** Recall returns from Discard, confirmed revealed choices move to their actual destinations, and Passive activation/replacement uses the active badge rail. Native dialogs remain the interaction owner.

Individual Draw lasts 220ms, Discard 280ms, Exhaust 400ms and reshuffle 240ms. These are reversible presentation choices, not gameplay balance values. Successive groups use actual transfer order; the same UID cannot visually occupy two simultaneous flights.

## All ten Passives

Every new canonical `passive-trigger` log entry pulses that Passive's source icon and briefly names the actual result. Existing logs/details remain available after the cue fades.

| Passive | Actual trigger owner | Visual feedback |
| --- | --- | --- |
| Blazing Spirit | First activation | Warm Strength seal; actual Strength gained |
| Growing Flame | Every third resolved Attack, within its existing combat cap | Ember growth seal; actual Strength gained |
| Swift Step | First activation | Gold agility arcs; actual Agility gained |
| Battle Rhythm | Every third resolved Defend, within its existing combat cap | Gold rhythm arcs; actual Agility gained |
| Rune Armor | First activation | Shield-shaped rune seal; actual Defense gained |
| Lasting Shield | Turn-start retention of existing unspent Block | Shield seal; actual Block kept, not the maximum cap |
| Grimoire Ward | First resolved Skill that turn | Ward shield; actual Block granted |
| Ember Core | Resolved focused card while the enemy still lives | Ember seal at the enemy; actual HP damage after caps/seals |
| Clear Mind | Its real next-turn draw phase | Stacked-card seal; actual cards drawn, including zero |
| Last Ember | Existing living-HP threshold, once per combat | Emergency ember seal; actual Block and capped Focus gain |

Ongoing attributes do not pulse on every subsequent turn. Waiting Passive activation only flies to the active rail. Reusing saved progress, trigger limits, cancellation and the existing three-active-Passive cap retain their current mechanics. Two or three simultaneous cues stack on a tall arena; short arenas show them sequentially to preserve card/action space.

## Architecture and lifecycle

`card-flow.js` is an optional per-action journal in a WeakMap. It adds no fields to a run or save, invokes no callbacks and reads no random source or clock. Existing transfer sites record copied card identities after moving them. `cardAction` and `mysteryAction` fork observation for their cloned run; only a validated, committed clone merges its journal. Failed choices/transactions produce no visual transfers.

`app.js` captures the previous visible card/pile positions before the synchronous action. The engine resolves, validates and the normal renderer saves the result before `card-motion.js` schedules presentation. The motion module never calls the engine. Continued saves and ordinary rerenders have no journal to replay; trigger receipts use the previous combat-log sequence within the same encounter.

The controller clones entire source portraits, strips action targets/IDs and uses an inert, aria-hidden, pointer-transparent overlay. Drawn real cards keep their layout space and are restored when their flight ends or is canceled. The existing live combat log and all keyboard/native modal controls stay authoritative. Motion Off, OS reduced motion, hidden/pagehide, dialog opening, navigation, resize and the next action remove transient visuals and restore hidden cards. Missing Web Animations support falls back to the static UI.

The existing supplied illustrations and frames are reused. In 2.25.1, all 40 selected original card illustrations and 31 original artifacts replace the 2.23 reviewed variants, while the current painted UI/status/map/topic icons remain. MODEL.zip was unavailable and is not imported. There are no changes to card values, upgrades, Focus, RNG, combat timing, actor sprite clips, audio, math questions, save format or rewards.

## Verification

Recorded after the final implementation in `docs/verification/card-motion-2-25-0.json`. Commands are `npm run check`, the full `npm test` suite with the existing optional jsdom harness, `npm run test:card-motion-browser`, and `npm run build:prod`. Browser QA uses actual saved engine fixtures, the normal UI, and real Web Animations paused only by the test harness for deterministic inspection of short flights. It exercises all ten trigger paths, full-portrait clones, capped gains, Recall, reshuffle, rapid input, motion settings, desktop/phone/landscape and resize cleanup.

Automated browser/visual checks do not claim physical-device playback has been tested. Main publication is authorized by Ijamm's follow-up request. The original feature verification remains a historical record; fresh combined integration checks are recorded in `docs/verification/combat-main-2-25-1.json`.
