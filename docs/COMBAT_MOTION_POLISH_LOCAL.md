# Combat motion polish — combat-animation branch

24 October 2026. Source baseline: main `6dc3ce366d266c33154f9b2e76afeb3bba224eca` (2.31.0).

Ijamm initially requested the eight listed animation improvements locally without a push. On 24 October 2026, Ijamm subsequently authorizes pushing the completed work to its existing `combat-animation` branch. This supersedes the earlier local-only boundary for this work. Main and the public version remain unchanged; no main merge or deployment is authorized. The branch advances from `7e0e6d7804e78a837c2e572471c11d99331d0d9a`, incorporating main `6dc3ce366d266c33154f9b2e76afeb3bba224eca` as its tested baseline, without a force-push. Runtime code and assets are identical to the previously verified local result; this publication adds authorization/status documentation only.

## Behaviour

1. Rank new debuffs, stat losses, actual shield depletion and other changes instead of taking the first four definition entries. Keep three primary groups plus one combined remainder when necessary. Retain every signed result in that remainder or its named Passive callout. Existing badges/logs stay authoritative and accessible.
2. A Passive callout owns its stat label only when the sum of its actual receipts exactly explains the net gain. Keep the surrounding hero burst, but remove the duplicate number. Mixed card/artifact grants retain their full net label. Last Ember receives the first Passive slot.
3. Separate floor rings and side arcs, reduce crowded-aura opacity, and animate opacity instead of continuous brightness filters. Keep the original registered actor canvas and floor pivot.
4. Share one presentation batch between card, Passive, status and sound feedback. Hand actions use a reversible 180ms presentation lead; enemy turns use 240ms. Compact Passive slots remain readable at 1250ms spacing. These are presentation defaults, not authored sprite event markers or engine delays. Commands/render/autosave remain synchronous.
5. A partial Block hit followed by ordinary turn-start expiry has no shatter. HP loss after absorption proves shield depletion even with a subsequent refill. Exact depletion without HP loss is inferred only when no artifact or mid-hit Passive Block grant makes the observation ambiguous. Uncertain cases use a neutral hit. Full mode adds four shards only for confirmed depletion; ordinary expiry dissolves.
6. Give all ten existing Passive motifs distinct code-native signatures around their original icons. No illustrations, atlases, status/menu icons, mappings or sprite timings are changed.
7. Select one primary synthesized SFX per committed action. Use the same presentation lead, cancel pending sound on the next action/dialog/hide/navigation/resize, keep Sound FX volume/mute, and keep audio available when visual motion is disabled. Persistent auras and Continue do not play sounds. Existing win/answer/voice/BGM routes retain their current owners. No uploaded audio files are imported or claimed auditioned.
8. Add **Combat Effects: Low / Full** to native Settings, default Full. Low has steady auras, no continuous embers, fewer transient particles, no aura glow filter and simpler Passive ornaments. Persist this UI preference in the existing settings record, without changing the run/save schema. Game Motion Off and OS reduction override both visual modes.

Also include the run start identity in card-motion snapshots, preventing another run with the same seed/encounter from replaying earlier receipts.

## Validation and limits

Focused command:

```sh
DOM_QA_MODULE=/tmp/stm-motion-qa/node_modules/jsdom node --test tests/status-vfx.test.cjs tests/card-motion.test.cjs tests/card-flow.test.cjs tests/card-combat.test.cjs tests/passive-limit.test.cjs tests/focus-passive-log.test.cjs tests/combat-compact-ui.test.cjs tests/tutorial-ui.test.cjs
```

The DOM path above is a session-owned QA dependency, not a new product dependency. Native browser checks are in `tests/combat-motion-polish-browser.cjs`; use the existing browser module/executable environment options. Without an explicit `QA_EXPECTED_MISSING_ASSETS` manifest, every HTTP error fails that check. When supplied, the report names every missing original asset and limits the claim to the available source/poster path.

Actual final results are recorded in `docs/verification/combat-motion-polish-local.json`. This source checkout was recovered after workspace maintenance. Original large binary atlases/focus frames could not be recovered through the connected file API; the tested browser uses unchanged right-facing posters. Full production/offline packaging and full animated atlas playback are not claimed. No physical-phone FPS measurement or human audio audition is claimed. MODEL.zip failed attachment materialization and was not read or applied. No changes to maths, balancing, engine rules, gameplay RNG, question sampling, save schema or artwork are intended.
