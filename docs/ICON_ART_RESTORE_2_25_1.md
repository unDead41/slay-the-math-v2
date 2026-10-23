# Original card and artifact artwork restored — 2.25.1

Ijamm requests the previous card/artifact icons while retaining the current buff/debuff and UI/menu icons. The 2.23 all-icon import had replaced all 40 card illustrations through the generated card adapter and all 31 artifact illustrations through shared aliases. The original selected files were still intact; no replacement artwork is generated.

## Active artwork

| Family | Current owner | Result |
| --- | --- | --- |
| 40 card illustrations | `dist/assets/card-assets.json.runtimePaths` | Original selected source derivatives, matching the pre-icon-package card adapter at `83a1aeee80ff0488758f94451f7afd1c27500988` |
| Seven portrait/auxiliary frames | Same card manifest | Existing original paths and bytes retained |
| 31 artifact illustrations | `dist/artifact-data.js` and `dist/assets/artifact-assets.json` | Original selected source derivatives in HUD, details and source Codex |
| UI/menu, map, buff/debuff/status and topic symbols | `dist/icon-assets.js` | Published 2.24.0 mappings and image bytes retained |

`tools/import-cards.cjs` now generates its adapter directly from the original verified manifest. The explicit icon importer restores canonical card/artifact mappings after importing the reviewed catalogue. Both original and reviewed card/artifact filenames resolve to the approved originals through the shared resolver, including embedded offline data. Reviewed variants remain archived in the catalogue and are not active card/artifact illustrations.

The canonical `ui`, `map`, `status` and `topics` mapping JSON has SHA-256 `1bf09671147cad741b62447aff83195a96533c39e3cfb99be00c64b5f173dd65`, identical to main 2.24.0. Original image bytes are checked against their existing conversion manifests; image files are not edited.

## Combat motion and integration

This release also publishes the reviewed 2.25.0 Draw/Discard/Exhaust flights and all ten Passive trigger cues from `combat-animation`, under Ijamm's explicit main publication request. Motion uses the restored card illustrations. Card/artifact IDs, values, RNG, save schema, audio, actor clips and questions are unchanged by this correction. [Motion ownership and behavior](CARD_MOTION_2_25_0.md).

## Verification

Fresh combined-tree results are recorded in `docs/verification/combat-main-2-25-1.json`, with actual production and offline browser reports. Regression coverage checks every card/artifact mapping, original asset hashes, unchanged UI mappings, ordinary regeneration, explicit reimport scope, and real HUD/Codex rendering online and embedded offline. Browser coverage also exercises motion and all ten Passives with the restored artwork. Earlier 2.25.0 reports remain historical records for that feature tree.

Automated desktop/phone browser checks do not claim human approval of animation feel or physical-device playback.
