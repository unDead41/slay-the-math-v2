# Combat polish 2.9.0

Requested by Ijamm on 21 October 2026. References: 162435/162438 show defeat Time changing from 7:15 to 7:37; 162533 shows the separated hand requiring a long horizontal row.

## Skill consistency

The runtime used one scale for all source cells, while the six Skill body silhouettes differed in crown-to-boot height. The existing importer now records body-crown landmarks excluding fire/cards, and derives a uniform per-frame correction about each supplied boot pivot. Corrected body height is 446px within 0.001px before the common hero projection. Factors: 1, 1.015945, 1.093137, 1.064439, 1.044496, 1.030023.

All five source atlases and five right-facing posters remain byte-identical. No redraw, mirroring, trimming, frame replacement or timing change occurs. All 30 projected alpha bounds still fit the 1600×1200 canvas. The native browser filmstrip was inspected alongside source cells and matrix/body-size tests. Both stages and all five right-facing fallback actions retain their previous owners.

## Frozen results

Defeat previously did not set `finished`, so summaryView used Date.now every time results rendered. Defeat, Stage 1 clear and final victory now capture the timestamp in the engine result transaction. Summary reads that saved timestamp; menu, Learning Record, refresh/export/import do not change it. Stage 2 continuation clears the intermediate timestamp before its checkpoint.

Existing elapsed wall-clock behavior during an unfinished run is retained. Older result saves missing a finish timestamp are stamped once on restore and saved by the app. Their original death time is unavailable because the previous version never stored it; no historical duration is invented. Existing victory timestamps are preserved. Save version remains 1 and timestamps are validated.

## Hand capacity and interaction

- `DCConfig.HAND_LIMIT` owns the limit, set to 10 as reversible implementation tuning.
- Normal/card/artifact draws all stop before taking an extra card or shuffling when full. Excess stays in its pile. Draw feedback and calculation history report actual movement.
- Restore keeps legacy hands loadable, moving excess instances to the top of Draw in their original hand order without RNG, triggers or card loss.
- cardView remains the shared card renderer. New hand.js/hand.css scope only the live rail, with overlap when needed and a minimum 44px exposed step; phones keep local scrolling.
- Pointer movement schedules a 140ms dwell; one card rises and neighbors shift over 180ms. Layout changes do not choose a new candidate, and ResizeObserver updates preserve a pending dwell.
- Native keyboard focus reveals cards immediately; disabled cards have an inspection tab stop. 0 plays the tenth card. Touch activation remains native and commits once.
- Dialogs, hidden pages and replacement renders cancel pending hover. Motion Off and OS reduced motion remove transitions. Disabled cards remain opaque so lower card text does not show through.

The user authorized a cap, overlap and delayed hover. The exact 10/140ms/180ms/44px values are implementation defaults, recorded as proposals in DECISIONS rather than claimed as user-specified numbers. Reward, Shop, Collection and the navy/gold/parchment visual identity retain their shared owners.

## Verification

- 134 engine/DOM tests passed, zero failures and zero skips (including the new cap, legacy save, timer, Skill and tenth-card regressions).
- 6 hand/result/Skill browser groups passed, including a real running-clock hover check and six viewport sizes from 320px to 4K.
- Existing Alyssa suite: 7 groups passed, including all five right-facing fallbacks, both stages, reduced motion and offline portable startup with no HTTP requests.
- Existing combat suite: 7 groups passed; screen-fit suite: 7 viewport cases passed.
- Source/runtime hash and projected-alpha audit passed: 30 frames fit; source atlases/posters unchanged.
- Syntax check, portable build and premium static audit passed (zero findings).

See [machine-readable evidence](verification/combat-polish-2-9-0.json). Commands are also available in package.json. The DOM suite requires jsdom via DOM_QA_MODULE; the QA host used its installed Chromium via QA_CHROMIUM_EXECUTABLE. No dependency is required to play the game.

The official designmd lint command could not complete in the restricted host (25s timeout). Existing DESIGN.md frontmatter/tokens are unchanged. The premium static audit and project-owned runtime checks are recorded separately; static auditing does not replace browser verification.

## Update

Pull main, regenerate MAIN-SEKARANG.html with `npm.cmd run build`, restart `npm.cmd start`, then refresh localhost:4173 with Ctrl+F5. The generated portable HTML exceeds GitHub's single-file limit and is deliberately regenerated locally from the reviewed source instead of committed.
