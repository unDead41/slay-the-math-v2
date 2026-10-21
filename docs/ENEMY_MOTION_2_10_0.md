# Both-stage Normal/Elite motion — 2.10.0

Ijamm requested applying the two supplied Normal/Elite packs to both stages. All ten canonical non-boss enemies now use the supplied Idle, Attack, Defend, Skill and Damaged sequences: **50 clips / 263 active frames**. Existing gameplay IDs, display names, HP, intent effects, map selection, loot, saves and Alyssa's complete accepted registry are preserved.

| Stage | Type | Game ID | Source actor | Active frames |
|---|---|---|---|---:|
| 1 | Normal | wisp | Ember Mirror | 23 |
| 1 | Normal | beetle | Prism Guard | 28 |
| 1 | Normal | bat | Rune Bat | 23 |
| 1 | Elite | knight | Mirror Knight | 27 |
| 1 | Elite | shard | Shard Beast | 27 |
| 2 | Normal | weaver | Chain Weaver | 27 |
| 2 | Normal | shade | Deck Guard | 27 |
| 2 | Normal | mimic | Card Mimic | 27 |
| 2 | Elite | golem | Chain Golem | 27 |
| 2 | Elite | reaper | Rune Reaper | 27 |

## Source and import

- `NORMAL ELITE ENEMY(1).zip`, v3: SHA-256 `aaf4ea376ac0732f5305fc376a5b25d9091f5e889345d37c889509068a969a51`. All 25 native sheet hashes match the accepted Stage 1 import. All 128 source cells match the installed lossless atlases in alpha and visible pixels over black/white. Preserve existing runtime bytes and registry fields. Repack verification: [audit](animations/stage1-v3/supplied-pack-verification.json).
- `Stage_2_Normal_Elite_Enemies_Standardized_v2(1).zip`, source v2.1: SHA-256 `e959ab008e6df186fd12227fd4c683e826afeb4ad6b643477bfbf703a9692fca`. Import 25 native 2560×1728 sheets / 135 full 768px cells losslessly. Minimum internal alpha padding is 96px; sheet margin/gap is 64px. Retain source manifest, SOR, README, frame counts, baked-normalization metadata and Chain Golem correction alongside the [import audit](animations/stage2-v2/import-audit.json).

Chain Golem is authored left-facing in v2.1: headless rock body, two chest cores and a single chained ball. All five actions use `flipX=false`; no second mirror or redraw is applied. All other enemy clips retain their supplied left-facing source. Source normalization is already baked into the pixels, not a runtime transform to repeat.

`tools/import-enemy-animations.py` owns either-stage import and verification. The former Stage 1 command delegates to it. Import replaces only the selected stage in the existing registry, preserving other actors and Alyssa. `--verify-existing` writes a verification record without changing installed art or registry entries. Native PNG sheets/individual cells are compared to the resulting WebP alpha and visible pixels. Runtime omits duplicate PNGs, source review videos and previews. These derivatives do not add native-4K detail.

## Playback and fallback

The shared canvas player uses the existing fixed matrix: source `(384,578)` → floor `(800,1100)` at 2.5× on a 1600×1200 canvas, with a common enemy display scale of 0.9. Every supplied alpha bound fits this canvas. No frame-specific crop, trim, recenter or VFX-based scale is added. Grounded actors retain the shared floor; Chain Weaver retains its floating body and floor shadow.

Idle loops at 6 FPS. Attack/Damaged use 12 FPS; Defend/Skill use 10 FPS. Actions play once then return to Idle. Source frame order/counts remain intact. Stage 2 gains 25 lossless, same-source posters projected at this exact registration for loading/Canvas/texture failures. Atlas-backed enemies do not receive the legacy CSS pose transforms. Motion Off/reduced motion selects Idle frame 0, including fallback mode.

Stage 2's presentation-only intent table selects Spark → Attack, Flame Burst → Skill and Fire Shield → Defend for Chain Weaver; Dark Pulse → Attack, Mist Shield → Defend and Dark Wave → Skill for the other four. This makes each supplied action visible without editing any combat pattern or effect. Player attacks choose Damaged only after actual enemy HP loss; fully blocked hits choose Defend. No gameplay resolves on an animation frame. Existing dialog/hidden-page pause, cancellation, four-sheet decode cache and independent Alyssa player remain unchanged.

Both bosses and legacy cross-stage IDs retain their existing renderer. Alyssa's right-facing atlas/poster family, per-frame holds, boot pivots and six-frame Skill body calibration remain identical to 2.9.0. Hand capacity/hover behavior and frozen result Time remain unchanged.

## Validation

Actual command results and browser records are stored in [the release verification](verification/enemy-motion-2-10-0.json). The source audits cover all 263 enemy frames. The new regression first failed for the absent Stage 2 registry, old image fallback and missing intent mapping, then passed after implementation. Native engine comparisons verify full saved state rather than only the selected pose.

Actual results: `npm run check` and the portable build pass; all **138 unit/DOM tests pass with zero skipped**. The focused animation tests pass all 15 cases. Browser groups cover all 50 changing-pixel clips, 15 Stage 2 native intent resolutions with exact saved engine state, blocked-hit/pause/motion behavior, 25 actor/viewport cases, both fallback failure modes and offline playback. Alyssa passes seven existing browser groups with no old hero requests. All 44 checked gameplay/hand/math/map/accepted-art files match the base bytes.

Browser evidence combines the completed live-game groups with focused fit/fallback/offline runs. The initial full invocation reached its 30s portable navigation deadline after five successful groups. The final isolated offline run passes after releasing live fixtures and waiting for DOM readiness with a 60s bound. The verification JSON retains this distinction; it does not claim a clean full browser invocation.

Physical-device performance and native Windows execution are not measured here. The existing game source remains dependency-free; browser and DOM QA require their optional test runtimes. Artwork was supplied by Ijamm for this game; no separate license was supplied.

## Run the update

Pull current source, then run `npm.cmd run build` to regenerate `MAIN-SEKARANG.html` and `npm.cmd start` to serve the editable game at http://localhost:4173. The generated portable file is verified locally and is intentionally rebuilt rather than committed. `npm run test:enemy-browser` owns the focused 10-actor browser regression; `npm run test:alyssa-browser` protects the accepted hero behavior.
