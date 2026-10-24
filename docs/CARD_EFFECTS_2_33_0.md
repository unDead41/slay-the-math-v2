# Card effects — 2.33.0

Ijamm explicitly approved applying every proposal from the 40-card audit on 24 October 2026, with publication to a new feature branch only. Base main: 264a60e / 2.32.0. Delivery branch: balance/card-effects-20261024. This update does not authorize a main merge.

## Current card rules

| Effect/card | Ordinary and Master behavior unless specified |
| --- | --- |
| Vulnerable | +50% Attack damage for every hit in the affected attack phase. Stacks are duration, maximum three phases. |
| Weak | −25% Attack damage for every hit in the affected attack phase. Stacks are duration, maximum three phases. |
| Percentage order | Combine Weak and Vulnerable on stat/upgrade/Focus-modified damage, floor once, then Defense, boss seals and Block. Fixed HP damage remains fixed. |
| Weak Point | Damage first, then Vulnerable; current-turn follow-up attacks benefit. Without other modifiers, 4 + 9 + 9 = 22 versus three Rune Strikes for 18. |
| Cinder Guard | 1 Energy, 4 Block + one Weak phase. Focus +3 Block; upgrade +2 Block. |
| Last Ember | Its unused emergency Block survives the next player reset once. Later enemy hits consume it normally; spent Block is never recreated. Combine retention caps by maximum. |
| Growing Flame / Battle Rhythm | 1 Energy; gain +1 stat after every three relevant cards, cap +4. Upgraded: every two cards, cap +5. First-activation cadence/cap survive replacement, including a differently upgraded copy. |
| Mana Reading | 1 Energy, Draw 2 now and 1 next turn, Exhaust. Focus +1 immediate card; upgrade +1 delayed card. |
| Deep Study | 1 Energy, Draw 3, Exhaust. Focus/upgrade each add one draw. |
| Burning Page | 0 Energy, bounded replacement choice, Exhaust. Focus adds two replacement opportunities; upgrade adds one. |
| Rune Armor | 1 Energy, +1 Defense. Upgraded first activation additionally grants 3 Block. |
| Clear Mind | 1 Energy, +1 Draw each later turn. Upgraded first activation additionally draws one card. |
| Card Search | The existing bounded category search still pays Energy. If no card matches, draw one ordinary fallback card, subject to real deck/Hand availability. No refund/retry loop. |
| Twin Shot — Master | 4+3; Strength, Focus and upgrade apply to the first hit only. Ordinary Strength allocation is unchanged. |

Enemy Vulnerable and player Weak decay after the player phase. Enemy Weak and player Vulnerable decay after the enemy phase. A skipped/zero-attack phase still consumes a duration. Applying another stack extends duration, never percentage potency.

## Owners and compatibility

`tools/cards/effects.cjs` and `effects.json` own this versioned revision. The ordinary importer applies it after the single-enemy adapter. Master builds its earlier candidate from the archived pre-effects ordinary data, then applies the revision, avoiding duplicated Mana Reading queues or unrelated ordinary-mode changes.

New ordinary runs record `cardRulesVersion: card-effects-1`. Existing unmarked ordinary runs retain archived definitions throughout their run, including Energy costs, Shop prices, card previews, paid pending choices, per-hit flat statuses and saved receipts. The synchronous reentrant resolver/config binding changes no stored HP, RNG or resolved result. Retry retains the run's rules. New Run selects the current rules. Original saves use their existing storage key and are not silently rewritten into new effects.

Master advances to `master-1.4.0-candidate.4`, with a separate versioned save identity. Earlier Master save keys and all historical numeric reports remain untouched. Default historical map replay explicitly uses the archived ordinary cartridge; an explicit Master runtime uses its own definitions. Do not present archived power tables as measurements of this revision.

Stable IDs, selected card/artifact illustrations, actor motion, audio, enemies, difficulty numbers, price tables, map topology and question selection are preserved. New ordinary Shop offers still use the existing Energy-cost price bands, so revised Energy costs can change a new offer’s derived price; existing offers retain their original prices. Master rarity prices are unchanged. BM/English card text, glossary, previews, changed status details and tutorial text describe the new rules. Ordinary old-rule previews retain their old values.

## Verification

New tests were observed failing before implementation. Coverage includes percentage multi-hit/duration/rounding/mitigation, extension caps, Last Ember remaining Block and reload, different-copy growth history, fallback search, current draw/Passive values, archived pending choices and Shop prices/previews. The original 111-card cohort remains as archived ordinary-rule compatibility coverage; current-rule tests are separate.

Final suite, build, browser and bounded probe results are recorded in `docs/verification/card-effects-2-33-0.json`. New numerical values are playtest candidates. Pupil full-run 90/70/50 targets and universal card rankings are not measured by these checks.
