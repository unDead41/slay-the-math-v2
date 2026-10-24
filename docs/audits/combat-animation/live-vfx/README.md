# Live VFX verification — 2.44.0

Date: 24 October 2026 UTC / 25 October 2026 Malaysia. Main baseline: `f59e9e915e4107627c48a13240bb959fcb2e1a61`. Scope: the live integration described in [the release contract](../../../COMBAT_VFX_LIVE_2_44_0.md), not the older standalone-only publication.

## Checks actually run

| Check | Result and evidence |
| --- | --- |
| Project suite, `npm test` | 1,073 tests; 1,068 PASS, 5 environment failures, zero skipped. [Unedited first-run log](full-suite.log). Three failures were caused by a deliberately sparse report directory; two could not resolve installed `sharp`. These are not hidden as application passes. |
| Environment recovery | Restore the complete tracked `reports` tree and include the existing runtime dependency path. All three report-dependent cases pass in the [16-test recheck](environment-rechecks.log); both image cases pass across that recheck and the final focused run. [Intermediate recovery log](recovered-checks.log) retains the first still-missing-Sharp failure. |
| Final relevant regression | **104 PASS, 0 FAIL, 0 skipped**: live projection/compositor/UI, existing status VFX, combat statuses, persistence, game DOM and icon-package tests. [Log](final-focused.log). This includes changes made after the initial project-suite run. |
| Resource/cache contracts | **14 PASS, 0 FAIL** against the final source/build. [Log](resource-tests.log). Current manifest hashes are checked against actual file bytes. |
| Final portable boot | **1 PASS, 0 FAIL**, real generated HTML boots without external scripts/styles and embeds the original images. [Log](portable-test.log). This is a DOM boot, not native portable-pixel or offline-cache certification. |
| Syntax | `npm run check` PASS, plus final `node --check` on the compositor, status adapter and QA builder after their last changes. [Project syntax log](syntax.log.gz). |
| Build | `npm run build:prod` PASS after the last runtime change. [Build output](production-build.log). The production copy includes all five VFX JS/CSS files and their required, ordered resource hashes. |
| Reviewed painter preservation | `cmp` confirms all three field modules match the approved preview sources byte-for-byte. `rebuild.py --check` and `verify.cjs` pass: 60 pure-field loop variants, 1,440 identity-independent ordered triples, 11,580 finite geometry samples and all 21 embedded original images preserved. These mathematical/source checks do not by themselves certify live-game pixels. |
| Native production-module harness | All ten actual-trigger save cases render their expected unique Passive ID on both canvas layers with nonempty pixels. Three-trigger order `[4,0,1]` differs from equip order and remains correct. 390px Low uses the same order and has `scrollWidth=clientWidth=390`. [Machine-readable observations and exact runtime hashes](native-browser.json). |
| Native body/floor and action | Both actor layers have nonempty body VFX and zero alpha at/below their source floor in the no-Passive case. A real keyboard Rune Guard action spends one Energy and adds 6 Block; the three Passive layers remain. Dialog and Motion Off show all four surfaces paused, followed by successful resume. [Screenshot](native-runtime.jpg), [observations](native-browser.json). |

The original TDD runs first failed on the missing behaviour. Later native review found positive replacement-shield expiry, existing-shield gain, Thorns hit/expiry continuity and crowding during fades. Their failing cases remain in [the red log](final-lifecycle-red.log.gz); the final 104-test log records them green. The smaller earlier [renderer log](renderer-tests.log) is historical and not substituted for the final run.

## Reproduction environment

The project has no new browser/runtime dependencies. Existing test dependencies were made available through:

```sh
export TMPDIR=/dev/shm/stm-vfx-test-tmp-0a6170ee0c25
export NODE_PATH=/workspace/scratch/6386acd1b751/language-work/qa/node_modules:/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules
npm test
```

The raw full run used only the first Node path and a sparse checkout, explaining the five environment failures. Recovery restores the complete checkout and adds the second dependency path; no assertion, numeric expectation or source asset is changed to make these pass. The second run targets those failures plus relevant final changed areas, not an invented second full-suite pass. Both source and generated builds are identified by the hashes in `native-browser.json` and `preservation.json`; publication commit/ref is verified and identified in the handoff. The ten-motif/body/phone captures precede only the final Canvas-less fallback guard: their four Canvas modules and stylesheet remain byte-identical. The supported Canvas action/state and final screenshot were repeated after that guard, with both production manifest identities retained.

Native QA used the managed preview's exact `http://terminal.local:4173/` URL and an explicitly local fixture shell generated by `tools/qa/build-live-vfx.cjs`. Its 14 saves pass `E.validate`; ten derive Passive triggers through real engine actions. Production JS/CSS and original assets are copied unchanged. The shell excludes the resource bootstrap because this HTTP origin has no `crypto.subtle`; production code is not patched for that environment limitation. The helper cannot write directly into `dist` or `release-prod` and its output is not shipped in either build.

## Limits retained

- Native transient hit/expiry selector sampling missed brief phases and timed out. Their exact sequencing/material arguments are proved by deterministic compositor and real-receipt tests; do not call the missed samples a native visual pass.
- Physical-device FPS/GPU/memory, Windows/local-machine operation, final human motif recognition and full hosted resource/download/offline acceptance are not tested here. CPU draw samples in the JSON are host-specific draw cost, not device FPS.
- The existing save log cannot recover exact first-trigger order between multiple old receipts once all those receipts are trimmed. Actual trigger counters restore presence; the live observed order is retained. See the release contract's fallback rule.
- MODEL.zip was unavailable and was not used; attached mathematics PDFs are outside this task. No model-consistency or mathematical-content audit is claimed.

No additional confirmed application defect remains within the reviewed live-VFX scope. The physical-device and historical-order limits remain open and explicit.
