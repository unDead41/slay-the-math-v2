# Dungeon Edition 2.1 — integration record

User brief: reproduce the supplied dark dungeon/gold main-menu reference with Alyssa
on the right; apply the supplied enemy models, actions and map icons; deliver source
in a ZIP with Windows terminal instructions. The subsequently supplied map module
and its SOR supersede the earlier five-level topology for new runs.

## Implemented owners

| Surface | Owner | Source/effect |
| --- | --- | --- |
| Main menu | `app.js: homeView`, `scene.css` | Supplied screenshot composition; independent live controls and actual arena art |
| Alyssa | `visuals.js`, `assets/alyssa-*.webp` | New transparent standing sheet: front/back/left/right; front in menus, right in battle |
| Ember Mirror | `visuals.js`, `battleFeedback` | New transparent model and 2×2 action sheet; Attack/Defend/Skill/Damaged |
| Other roster models | `config.js`, original source assets | All existing ordinary/elite/boss/NPC identities retained; CSS reactions use their current model |
| Node seals | `mapIcon` and `visuals.js` | All six original icon identities, transparent WebP runtime derivatives |
| Map RNG | `modules/map/src/map-rng.js`, byte-identical `dist/map-rng.js` | Upstream module 1.0.0, 100 catalogue seeds; supplied tests/data/SOR retained |
| Map adapter | `dist/map.js` | Converts rest/mystery to existing camp/event actions; legal outgoing edges only |
| Save/transition | `engine.js` | Snapshot persisted under route version 3; engine save schema remains 1 |

## Save and seed behavior

A new run selects `STM-001`–`STM-100` using `(uint32 run seed % 100) + 1`.
The numeric run seed still owns combat draws. Stage-specific map generation uses
the selected catalogue ID; viewing, selecting or restoring a map never consumes
combat RNG. A full raw map snapshot is stored in `route.snapshot` at stage start.
The runtime validates that snapshot and adapts it for display; Continue never
replaces it with a newly generated graph. Stage 2 receives a new stage-specific
snapshot and checkpoints it with the current HP, deck, counters and combat RNG.

New runs have ten rooms per stage, twenty rooms total. The supplied rules require
Mystery at level 5, Rest at level 9 and Boss at level 10. Exact whole-map quotas:

| Initial paths | Shops | Elites | Rests, including level 9 |
| --- | --- | --- | --- |
| 3 | 1 | 4 | 2 |
| 4 | 2 | 6 | 3 |
| 5 | 3 | 7 | 4 |

Only connected next-level rooms can be entered. Preview changes no gameplay state.
The map opens near the current available row and retains its scroll during preview.
No seed/stage inspector is exposed during an active game.

Routes 1, 2 and legacy saves retain their old five-level topology, including their
stage-two progression and retry. Choose **New Run** to use the new ten-level maps.
Route snapshots reject invalid quotas/edges, unsupported versions and unexpected
node IDs before any imported text can reach map attributes.

## Asset processing

`source-art/` contains unchanged copies of the three new transparent sheets.
`tools/import-scene-assets.py` mechanically crops them, preserves alpha, registers
Ember Mirror poses on a padded common canvas, and exports the six runtime seals.
It requires Pillow only and records original SHA-256/crop rectangles/output sizes
in `dist/assets/scene-assets.json`. Original icon square/FHD PNGs remain in the
map module. No screenshot is used as a fake clickable page and no new artwork is
claimed generated. Source art stays limited to its actual native resolution.

Battle poses follow already-resolved outcomes. Damaging cards show the enemy's
Damaged pose; blocked hits show Defend. End Turn selects Attack or Skill from the
resolved intent; a live enemy Block displays Defend. The pose timeout only restores
the idle image. HP, draw order, energy, rewards and autosave never wait for it.
Motion Off and OS reduced motion disable decorative movement.

## Boundaries

Only Ember Mirror has a newly supplied dedicated action sheet. Other enemies use
their existing model with CSS strike/guard/skill/recoil movement. Alyssa's four
existing action poses are retained from the prior MC source pack; the new sheet
supplies standing views. This is pose swapping, not frame animation or a 3D rig.
Other card/maths systems, soundtrack and combat/economy tuning retain their owners.
Probability is playable; algebra/indices and the separate proposed 40-card roster
are not introduced by this task.

## Delivery and validation

`MULA-DI-SINI.md` explains installation, the changed-file map, commands and limitations.
`APPLY-UPDATE.ps1` can apply the package to a matching existing project after backing
up every overwritten file. It leaves unrelated files and Git metadata in place.
Windows PowerShell execution must be confirmed on the user's Windows machine.
See `docs/VERIFICATION_2_1.md` for the actual checks performed for this release.
