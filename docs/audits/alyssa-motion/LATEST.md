# Alyssa V5 — main integration audit / 2.45.0

| Field | Reviewed record |
| --- | --- |
| Date | 25 October 2026, Asia/Kuala_Lumpur |
| Repository / publication target | unDead41/slay-the-math-v2 / main |
| Main base / local source SHA | `702be96cfc776a81057e6e53d950e5c5af931e88`, game 2.44.0 |
| Main base tree | `aeb860424e1dd84e2c4f716b9b0495e9f1a1c477` |
| Isolated working branch | `codex/alyssa-motion-v5`, based on that main |
| Master SOR read | 1.2.0 from current main, followed by AGENTS, governance, decisions, design, animation/art/asset/QA/runtime owners and relevant prior audits |
| User authorization | Approved V5 review, apply all five motions in game, push directly to main |
| Final compatibility | **VALID within the verified motion integration scope**, subject to the limits below |
| Publication | Non-forced update guarded by the reviewed main head; resulting commit/ref is read back and identified in the final handoff |

## Before and after review

Main still used five six-frame Alyssa clips, with six-element Skill scale
correction and the old matching posters. V5 was approved separately and had not
been installed. No existing Alyssa-specific current audit folder was present;
the older 2.8/2.9 motion documents and current 2.44 live-VFX audit were read as
history, not presented as new verification. Latest main, not an old animation
branch, owns the language, balance, resource loader and persistent controllers.

The approved pack supplies 75 exposure slots / 68 unique native rasters. Its five
atlases are copied unchanged. One shared projection replaces the prior hero
registry, retaining `mc_01`, name, facing, figure-size ratio and both stages.
Enemy/boss registries and all their source image bytes remain unchanged.
Five matching posters, a model-owned VFX body height, source provenance, an
importer and source/player/native checks complete the integration. Release,
resource, portable, production and tutorial outputs are regenerated.

Two unrelated untracked temporary files were present immediately after clone
under music and map-report directories. They are preserved and excluded from
the change. No user save or unrelated module is altered.

## Findings and actions

| ID / category | Priority / confidence | Evidence and impact | Final action |
| --- | --- | --- | --- |
| AM-001 / MASALAH DISAHKAN | P2 / high | Main's hero registry still has six exposures per action, while the newly approved V5 review has fifteen. Installing only the pictures would retain incorrect source rectangles, timing and old posters. | RESOLVED: exact V5 atlas import, all 75 rectangles/holds, common projection and five same-source fallback posters. Source hashes and native playback verified. |
| AM-002 / MASALAH DISAHKAN | P2 / high | Native desktop review of the integration exposed the overhead Attack being clipped. The compact/status UI's actual ground inset is 190px in the reviewed desktop state; assuming the older 96px inset still leaves the highest pose above the theatre. | RESOLVED: common proportional actor height cap reads actual `--ground-y`. It uses the complete pose set, not current-frame bounds. Seven viewport checks show every source alpha bound inside the arena and horizontal viewport, with fixed floor/aspect ratio. |
| AM-003 / MASALAH DISAHKAN | P2 / high | The live VFX fallback table measures the old Idle poster at 539px; the new registered poster measures 558px. Retaining the old value would size materials against the replaced model. | RESOLVED: importer records hero `bodyHeight`; compositor reads that registry measurement and retains legacy fallbacks for other actors. Ownership regression and live compositor checks pass. |
| AM-R01 / RISIKO BERPOTENSI | P2 / high | Applying the old six-frame Skill `scales` array to V5 would apply normalization twice and misalign the fifteen-pose clip. | PREVENTED: new hero registry has no per-frame scales. Source-driven tests advance every exact hold boundary and check one projection for all five clips. |
| AM-R02 / RISIKO BERPOTENSI | P2 / medium | Automated viewports/texture accounting do not measure physical Windows/phone GPU, FPS or every crowded artifact/status presentation. | OPEN acceptance limit: check target devices. No physical-performance guarantee is made. |
| AM-R03 / RISIKO BERPOTENSI | P3 / high | Approved AI-authored source drawings retain small proportion/detail variations at high zoom. | Retain the approved bytes and record this limit; no unrequested redraw or claim of perfect anatomy. |
| AM-I01 / PENAMBAHBAIKAN | P2 / high | Source-gated import, matching fallbacks, measured VFX units and a byte-identical isolated re-import make the approved result reproducible. | IMPLEMENTED within this integration. |
| AM-I02 / PENAMBAHBAIKAN | P3 / medium | A short physical-device review of crowded combat would complement native browser evidence. | PROPOSAL only; not an extra gameplay change or a release certification. |

No additional issue was found in the final reviewed scope. Existing 2.44 VFX
receipt/history limits, numerical balance, question content and unrelated
documentation findings remain with their existing owners.

## Actual verification

- [Import audit](../../animations/alyssa-v5/import-audit.json): exact approved ZIP
  hash, all 75 native RGBA hashes, five byte-identical runtime atlases, sixteen-pixel
  alpha padding, every projected canvas bound, same-source posters and unchanged
  enemy/boss registry hash. Source resolution is explicit; no native-4K claim.
- [Isolated reproduction](import-reproduction.json): re-importing into a temporary
  fixture produces nineteen files byte-identical to this integration, preserving
  the original baseline audit and every other actor.
- [Unit/source/lifecycle checks](unit-validation.json): **64 unique scoped tests
  pass**, zero skipped. Nine files contribute 53 passing tests; the final renderer
  rerun contributes 11. Coverage includes exact exposure boundaries, fixed floor,
  source rectangles, all enemy/boss compatibility, texture budgeting, stale loads,
  VFX ownership/lifecycle, retained UI, resource integrity and release/cache URLs.
- `npm run check`: PASS. Importer and new browser-test syntax also parse. Four
  final generated-resource/release tests pass after tutorial capture/build.
- `npm run build:prod`: PASS. The fresh portable output is 306,783,562 bytes;
  production has the same current animation registry and source atlas hashes.
- [Native production browser evidence](browser-validation.json): all five actual
  clips render every source exposure; current Rune Strike/Rune Guard/Quick Study
  actions and HP-loss/fully-blocked reactions match an independent engine clone,
  including exact save/RNG/card state. Actor canvases survive those rerenders.
  Dialog pause, Motion Off, OS reduction, both stages and both bosses pass.
- All 75 projected bounds fit at 1366×900, 1920×1080, 3440×1440, 3840×2160,
  390×844, 320×740 and 844×390. Native visual review confirms the overhead sword
  is complete on desktop. Floor alignment and canvas aspect ratios are checked.
- Real production bootstrap/fetch/decode paths are exercised. Canvas-unavailable
  and deliberately failed-atlas cases display the verified V5 poster. Fresh
  portable playback animates without HTTP requests. No browser exceptions or
  retired hero requests are recorded.
- The existing tutorial capture tool regenerates all sixteen actual-UI images
  with isolated fixtures and records runtime input hashes in
  [its manifest](../../tutorial/screenshots.json). Only changed image bytes are
  included in the diff; these are player guide assets, not personal records.

Environment/harness failures were not counted as passes: the first environment
lacked jsdom, then the new VFX test stub lacked the existing actors map. Install
jsdom 26.1.0 only in the isolated QA directory and correct the stub; the final
renderer run passes. Earlier browser attempts exposed the real clipping issue
and assumptions about Idle's initial loop phase, paused-clock target latency,
query-string request matching and waiting for the loader to reveal fallbacks.
Those checks were corrected without weakening source ordering, frame coverage,
engine equality or pose bounds. The final production report passes all checks.

## Commands and final diff boundary

```sh
python3 tools/import-alyssa-v5.py /path/to/ALYSSA_15_Frame_Sprites_v5.zip
npm run build:prod
npm run check
node --test --test-concurrency=1 tests/animation.test.cjs tests/enemy-motion.test.cjs tests/boss-motion.test.cjs tests/texture-cache.test.cjs tests/live-vfx.test.cjs tests/live-vfx-renderer.test.cjs tests/live-vfx-ui.test.cjs tests/asset-readiness.test.cjs tests/asset-manifest.test.cjs tests/release-build.test.cjs
node --test tests/live-vfx-renderer.test.cjs
node tools/capture-tutorial.cjs
node --test tests/asset-manifest.test.cjs tests/release-build.test.cjs
npm run test:alyssa-browser
git diff --check
```

The actual environment used explicit `NODE_PATH`, `BROWSER_QA_MODULE`,
`SHARP_QA_MODULE` and `QA_CHROMIUM_EXECUTABLE` paths to installed QA dependencies.
The large full-game suite is NOT_RUN: this update changes presentation/assets,
not mathematical evaluation or numerical/save rules. The checks above target
actual affected boundaries instead of claiming historical game-wide counts.

Final diff is limited to Alyssa assets/registration, shared pose headroom, the
VFX model-measurement read, importer/tests, generated release/resource/entry
files, tutorial pictures and these owner/source/audit documents. The complete
main tree is retained as the publication base. Source art is not mirrored or
redrawn during integration; original enemy/boss/card/artifact/audio pixels,
gameplay, language and save owners are preserved.

MODEL.zip was not available and was not read. Retry that upload if needed for a
later model task. The attached mathematics PDFs are unrelated to this change.
Hosted deployment and physical-device performance are outside this verification.
The resulting main commit/ref is verified after the guarded publication and
reported in the handoff; no force push or history rewrite is used.
