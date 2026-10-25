# Combat continuity evidence — 25 October 2026

## Main integration authorization — 2.49.0

Ijamm now requests publishing the completed icon-loading and combat-continuity
updates to `main`, continuing the preceding main-publication instruction. This
supersedes their 2.45.1 branch-only boundaries below for this combined release.
Current main 2.48.0, automatic downloads, the 23-chapter / 98-image / 12-practice
tutorial, AI/model, approved V5 art, numerical/save/RNG and language owners remain
protected. Original source SHAs, failed/passing records and branch limits below
remain history. [Pinned integration, required adaptations and fresh evidence](../../../ICON_COMBAT_MAIN_2_49_0.md).

Combined scope status is **VALID with inherited P2 findings carried**. Fresh
Node verification passes **1148/1148** on `7568565`; final native continuity
passes **14/14** with the setup-only atomic-clock helper at `ee694d2`. Product,
Node-test/helper, configuration and generated inputs are unchanged between those
checkpoints; the single non-imported native helper delta has its own fresh replay.
[Exact commands, retained failures, hashes and limits](../../../verification/icon-combat-main-20261025/evidence.json).
Publication is **VERIFIED** as main integration
`aedfdb4d5eef4fe64ff1ef6fbd969e673aa2dba5`, game2.49.0.
[Actual ref/tree/version, feature ancestry and Pages readback](../../../verification/icon-combat-main-20261025/publication.json).
Pages run40188472242 completed successfully for that exact integration; public
browser inspection is NOT_RUN. CI-247-01 and QA-248-PRELOAD-01 remain inherited
P2/open; the current preload PASS does not establish a counter fix. MODEL.zip
remains unavailable and unread; physical-device and human-recognition limits remain.


Base: main `6c49f3980c3a832635d4d01a6c50a8df98ac4aad` / 2.45.0.
Candidate: 2.45.1-combat.1, combat branch only.

## Commands

QA dependencies were installed outside the repository: jsdom 26.1.0,
Playwright and a Chromium executable. Supply `NODE_PATH`, `DOM_QA_MODULE`,
`BROWSER_QA_MODULE` and `QA_CHROMIUM_EXECUTABLE` as needed for your environment.
The default CDN browser download was truncated; the npm-distributed Chromium
binary was usable. This is an environment detail, not a game failure.

```sh
npm test
node --test tests/combat-image-refresh.test.cjs tests/live-vfx-renderer.test.cjs tests/live-vfx-ui.test.cjs tests/live-vfx.test.cjs tests/status-vfx.test.cjs tests/combat-persistence.test.cjs tests/animation.test.cjs tests/texture-cache.test.cjs tests/icon-readiness.test.cjs
npm run check
npm run build:prod
QA_OUTPUT=/tmp/stm-vfx-continuity node tests/combat-continuity-browser.cjs
QA_REPORT=/tmp/stm-vfx-continuity/alyssa-motion.json node tests/alyssa-v5-browser.cjs
CHROMIUM_PATH=/path/to/chromium READINESS_SCREENSHOT=/tmp/stm-resource-ready.png node tests/hosted-readiness-browser.cjs
node --test tests/asset-readiness.test.cjs tests/asset-manifest.test.cjs tests/release-build.test.cjs
node previews/combat-vfx/verify.cjs
python3 previews/combat-vfx/rebuild.py --check
git diff --check
```

## Evidence

- `before.json`: actual main production game, eight failed continuity assertions;
  not the standalone VFX preview. The initial setup-error run is not a pass.
- `native-final.json`: final production continuity observations, 14/14 checks.
- `alyssa-final.json`: final production motion/source/viewport/fallback/offline check.
- `preservation.json`: exact original asset and owner comparisons against main.
- `build-preservation.json`: final source/production hashes and portable size.
- `.log.gz`: losslessly compressed command output, including the initial
  intentional RED tests and the full 1,088-test result. The full run precedes
  only the final image-recovery guard; the final 74-test run and native resource
  suites cover that guard. Do not relabel the old full count as a second run.
- `passive-layers.jpg`: final actual production game with real Rune Armor then
  Blazing Spirit triggers, same approved model/artwork.

Browser instrumentation wraps painters to observe their real returned state
without changing rendering. Engine equality is checked independently after each
actual command. Timestamps and viewport samples are not hardware FPS guarantees.
All browser fixtures use isolated save contexts; no user's Windows saves change.
