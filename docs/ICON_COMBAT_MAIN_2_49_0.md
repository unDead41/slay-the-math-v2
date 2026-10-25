# Icon loading and combat continuity — main 2.49.0

| Field | Reviewed record |
| --- | --- |
| Date | 25 October 2026, Asia/Kuala_Lumpur |
| Repository / destination | unDead41/slay-the-math-v2 / main |
| Master SOR | 1.2.0, read from actual current main before integration |
| Main at start | `68d61e75ecb241c5100fc894ee57231f00f3932f`, game 2.48.0 |
| Main tree at start | `93b9cca88b1bf6502eccf5dcc2c14a6b3b97a58d` |
| Icon feature | codex/icon-clarity-audit, `e71efe1baa603314dd22da5890e8d53c3fdbbcdd`, 2.45.1-icons.1 |
| Combat feature | combat-animation, `2837a553c7b68e7aab5dd4a134a5b352aea2dd81`, 2.45.1-combat.1 |
| Shared merge base | `6c49f3980c3a832635d4d01a6c50a8df98ac4aad`, game 2.45.0 |
| Initial Git relationship | Each feature has one unique commit and is eleven commits behind main. Both contain work not yet published on main. |
| Authorization | Ijamm requests these two updates as a continuation of the main-push task. This supersedes their earlier branch-only publication boundaries for these exact features. |
| Initial compatibility | PERLU UPDATE: current-loader test adapters and two reproduced image-recovery/fallback gaps require correction. Being behind is not the defect. |
| Full-suite candidate | `7568565cdf16a99b620e4dd77092166aa32ec56f`, tree `d92a38a2f4c61cd9bda12e8744fefe9e541fb257` |
| Final native-helper checkpoint | `ee694d2da34f400c4e38ff5410fc7d9dc1a26767`, tree `68fcc6dc705a8d9cbf75643a2c8da8f27d4f4597`; one native test setup change only |
| Final compatibility | VALID within the recorded integration, automated and native-browser scope; inherited findings and limits below remain open. |
| Publication | PENDING at this QA handoff; actual main/ref/deployment readback must be recorded separately. |

## Scope and integration

Integrate the existing visible-icon priority promotion and meaningful emergency
glyphs with the current automatic downloader. Apply the completed same-room
flicker correction, material lifecycle preservation, second-Passive continuity
and shorter combat reactions. Keep the five original V5 clips, their 75 exposure
holds, approved painters and artwork, current illustrated tutorial, both
languages, AI/data provenance and numerical/question/save/RNG owners.

The features' runtime changes combine in `dist/bootstrap.js`,
`dist/icon-readiness.js`, `dist/status-vfx.js`, `dist/combat-vfx.js` and
`dist/combat-vfx-passive.js`. A clean textual merge of these implementations is
not treated as semantic acceptance. Conflicting release/entrypoint metadata,
package scripts and append-only histories are resolved against current main;
generated metadata comes from the current build owners. Initial icon integration
has eight metadata/package/history conflicts; adding combat requires resolving
nine paths, including SOR 25. The five presentation implementations merge
textually without conflict, but the semantic checks below still find two gaps.

Original feature reports remain historical evidence, including the 1,085-test
icon run and combat's 1,088-test run before its last guard followed by 74 focused
tests, 17 resource tests and 14 browser checks. They are not the fresh combined
results for this release. See the [icon branch audit](audits/icon-clarity-audit/LATEST.md)
and [combat branch audit](audits/combat-animation/LATEST.md).

## Confirmed problems and required adaptations

| ID / category | Priority / confidence | Evidence and affected files | Correction / verification state |
| --- | --- | --- | --- |
| IC249-RECOVERY-01 / MASALAH DISAHKAN | P2 / high | A late current-image failure while initial actor preload is held releases the initial gate; older actor success subsequently hides the newer retry. The clean regression records `initialGateHeld=false`, then `panelHidden=true` with a retry button inside it. `dist/bootstrap.js`. | RESOLVED in this candidate: separate initial preparation from newer image-error ownership. Hold the initial actor gate, then preserve only failures belonging to current images; explicit successful retry clears the notice. Canonical and independent three-case regressions pass; final production continuity, icon-failure and initial-loading browser checks pass. |
| IC249-PORTABLE-01 / MASALAH DISAHKAN | P2 / high | An unannotated map bitmap converted to a portable data URL falls back to the generic warning instead of its registered map meaning. The original semantic lookup can recover hosted filenames, but not the embedded source. `dist/icon-readiness.js`. | RESOLVED: on error, also compare exact embedded resource identity across registered status/UI/map entries. Preserve explicit-key and hosted-source precedence; do not scan the whole asset catalogue or change artwork/app mechanics. Six-meaning regression and all six actual standalone map legend failures pass, with decoded distinct glyphs, unchanged saved gameplay and zero HTTP requests. |
| IC249-TEST-01 / MASALAH DISAHKAN | P2 / high | Feature fixtures expose only the old readiness API and DOM, then wait for Enter despite intentional cache denial. Main now requires the startup planner/background queue and offers Continue online under that condition. Passive instrumentation discarded optional timing arguments; a separate native setup used a fragile 50ms cross-process clock deadline. `tests/helpers/hosted-images.cjs`, `tests/combat-image-refresh.test.cjs`, `tests/icon-loading-browser.cjs`, `tests/combat-continuity-browser.cjs`. | RESOLVED for the affected helpers: adapt fixtures/entry to the actual loader, forward Passive factory options, and pause the native clock deterministically through its public API. All original behavior assertions and post-action deadlines remain. Fresh combined 1,148 Node tests and final 14-check native combat pass; retain the earlier setup failure. |

Both product reproductions retain their original failing logs. Early fixture
setup errors are distinguished from the later clean reproductions. No assertion,
historical balance fixture or frozen model/data source is weakened to obtain a
pass.

Independent focused GREEN identities, before the final combined freeze:

- Bootstrap SHA256: `a44edd71439423c9c7aacccff6c0a948dbada3b9385d0ef2d216a4063d233e44`.
- Icon readiness SHA256: `f809819218b626e45d26cf141f459b080f73a6f00bf118bc99aad2e26b4fd539`.
- Three recovery cases pass: preserve the initial gate/current retry, remove a
  failed current image before settlement, and ignore an obsolete removed image.
  The first case also exercises successful explicit retry cleanup.
- One independent fallback case checks all six embedded map meanings and passes.
- Release Manager's initial targeted canonical group passes 10/10; the broader
  prefreeze focused group passes 45/45. These are overlapping checks, not extra
  tests to add to the unique 1,148-test full-suite total below.

## Inherited findings, risks and improvements

| ID / category | Priority / confidence | State and required follow-up |
| --- | --- | --- |
| QA-248-PRELOAD-01 / MASALAH DISAHKAN, inherited | P2 / high | OPEN. Main 2.48.0 carries a transient queue-idle/retained-count completion mismatch, reproduced on the preintegration 2.47.0 baseline despite the missing snapshot URLs already being in CacheStorage. Prior failure and later successful observations remain in the [2.48.0 release](balance/master/MAIN_RELEASE_2_48_0.md). This image-recovery correction does not establish that the counter boundary is fixed. Preserve any fresh failure and inspect its actual cache/completion state. |
| CI-247-01 / MASALAH DISAHKAN, inherited | P2 / high | OPEN. The old `tests/icon-package-browser.cjs` reads release state at DOMContentLoaded before real readiness and assumes raw asset URLs despite verified Blob routing. New helper adaptations do not repair that separate old matrix. Report its execution status explicitly. |
| ICON-R1 / RISIKO BERPOTENSI | P2 / medium | OPEN. Emulated viewports, decoding and named controls do not measure pupil recognition, comprehension or physical-device performance. |
| Combat physical-device risk / RISIKO BERPOTENSI | P2 / medium | OPEN. Native Chromium results do not measure the user's Windows/phone GPU, FPS or total memory. Shorter configured reactions are not a hardware speedup guarantee. |
| LIVE-RISK-001 / RISIKO BERPOTENSI | P3 / high | OPEN, unchanged. Continue cannot reconstruct the exact original first-trigger order of multiple historical Passive entries already trimmed from the bounded log; presence and observed live order retain their existing owners. |
| Human motif/icon recognition / PENAMBAHBAIKAN, proposal | P3 / medium | A short recognition check at actual play sizes remains useful. It is a proposed validation activity, not a measured result or additional feature authorization. |
| Combined recovery and portable regressions / PENAMBAHBAIKAN, implemented | P2 / high | Keep the real initial-loader/current-image interleaving and six portable meanings in the regression set, alongside rapid-action and verified-transport checks. Their assertions protect observed behavior rather than merely restating configuration values. |

No additional confirmed issue is asserted without a reproduction. The two minor
AI data-metadata validations and wider AI generalization limitations remain with
their original [2.48.0 owner](balance/master/MAIN_RELEASE_2_48_0.md); this release
does not change or validate those models.

## Final verification and preservation

Fresh results use Node 24.22.1, npm 11.9.0, Chromium 153.0.8010.0,
Playwright 1.62.1, jsdom 26.1.0 and sharp 0.35.5 on Linux. Existing isolated
dependencies are used; no project dependency/configuration is changed.
Exact commands, environment overrides, raw output, screenshots and failed
observations are retained in [the evidence directory](verification/icon-combat-main-20261025/).
The [artifact index](verification/icon-combat-main-20261025/artifact-index.json)
verifies 103 files / 9,369,918 bytes, excluding the index itself. Root independently
checks every indexed file size and SHA256. [Machine-readable evidence](verification/icon-combat-main-20261025/evidence.json)
SHA256 is `aaee5c8d106f1113d4eabcb8c892c1196c6e725fb40b85d07b106f0a6011e27c`;
the [QA handoff](verification/icon-combat-main-20261025/QA_SUMMARY.md) records the
independent recommendation and complete limits.

| Command / scope | Actual result |
| --- | --- |
| `npm test`, including its pretest build | PASS 1,148/1,148; zero fail, skip or cancellation. Full command 416.497s; one complete run on `7568565`. |
| `npm run check` | PASS, including the current AI checks and presentation/loader syntax. Changed native helper syntax is also checked. |
| Direct map tests and validator | PASS 7/7, zero fail/skip; `node --test test/map-rng.test.cjs test/browser-global.test.cjs` followed by `node tools/validate.cjs` from `modules/map`. Validator checks 100 seeds, 200 unique maps and 12 PNG hashes. The original npm capture is incomplete; see below. |
| `npm run build:prod` and preservation probe | PASS. 760 source and 761 production manifest entries match actual hashes; 823 production files with developer AI excluded. Portable output is 312,119,608 bytes. |
| `QA_PRODUCTION=1 npm run test:icon-loading-browser` | PASS six groups: held HTTP background transfers/visible Weak priority and one fetch; real functional-icon 404s; Normal/English to Large/BM; actual standalone utility and all six map fallbacks; all registered SVG meanings decode at 28/44/64px. Saved gameplay remains identical. |
| `npm run test:combat-continuity-browser`, final replay | PASS 14/14 with the final native helper. Both 1366px and 390px have zero loader flashes, retained actor/VFX canvases, impact within 150ms and no obsolete queue. Second Passive retains the existing circle; dialog/Motion Off and exact independent engine/save/RNG comparisons pass. |
| `npm run test:alyssa-browser` | PASS all five clips/75 exposures, seven viewport bounds, both-stage/boss registration, real card/damage outcomes, dialog/Motion Off/reduced-motion, Canvas/atlas fallback and actual portable zero-network playback. |
| `node tests/dynamic-verified-browser.cjs` | PASS under blocked worker, denied disk cache and rejected raw asset URLs: actual Passive/pose/reset, all 31 Codex images and current 23 tutorial chapters/screenshots/card previews decode through verified Blobs; saved game unchanged. |
| `TUTORIAL_QA_PROD=1 TUTORIAL_QA_OFFLINE=1 npm run test:tutorial-browser` | PASS both browser scripts: all 23 chapters/12 practical chapters, current 98-media scope, BM/English, phone/short-landscape layouts, keyboard/focus/zoom, storage/media failure, timed Mystery safety and actual standalone card practice with zero HTTP. |
| `QA_DIST=release-prod npm run test:preload-browser` | PASS nine groups: 75% important package/100% hard core, foreground Practice, pause/resume, automatic completion, cache eviction recovery, warm reuse, truthful storage-denied online entry and hard-core/optional error recovery. This successful observation does not close the inherited transient counter finding. |

Portable SHA256:
`7e6535b7d31971df6e6c1c2f89e2781b7b3649b8c1977554516065c36148619a`.
Source manifest ID is `4fdcd87829dbfa5fc3b8c3f8`; production is
`4d9ada6701bc5b7ef6befda2`. The extra production entry is the existing developer
access boundary, not a changed game asset.

Independent complete Git comparison finds the same five presentation JS files
and three generated `dist` metadata files, with no changes in assets, modules,
integrations, numerical/save/RNG, language, audio, actor animation or tutorial
owners. All 708 current main asset files are preserved. All 49 AI source hashes
and model/data bytes remain unchanged; Easy/Medium/Hard models still report
READY. This is compatibility evidence, not a new learning/generalization result.
Every main package command is retained, with icon checks extended and two native
commands added. Main decisions/changelog remain complete ordered subsequences.
All three original pinned main/icon/combat commits are ancestors of the local
combined candidate. The review uses the complete native Git diff, not a capped
API changed-file list.

Root visually inspects actual BM/Large fallback status, standalone map legend,
390px Alyssa/combat and desktop two-Passive captures. Automated pose geometry
covers 1366x900, 1920x1080, 3440x1440, 3840x2160, 390x844, 320x740 and 844x390.
These captures do not establish pupil recognition or physical-device performance.

### Failed observations and evidence reuse

The first combat native command exits 1 after ten successful desktop/phone
checks: the third fixture's `clock.pauseAt(Date.now()+50)` target has become past
across the process boundary. It is not relabelled as a complete native PASS.
The corrected helper uses `setFixedTime(T)` then `pauseAt(T)` then
`setSystemTime(T)` and controlled `runFor(50)` before actions. A separate native
probe deliberately inserts 150ms between clock calls and verifies exact paused
Date/performance/timer state plus a subsequent 100ms manual advance. Product
source and all post-action 150ms/lifecycle/assertion windows are unchanged. The
final full native replay passes all 14 checks.

Native helper SHA256:
`b10c9472cf60bad89906bd0cbaaad14eec661dc8553dec60cf2f7033f63a8654`.
The exact `7568565` to `ee694d2` delta is this native `.cjs` setup only. It is not
imported by the Node `*.test.cjs` suite. The closing snapshot proves no Node
test/helper, runtime, generated, data or configuration delta, so the full Node
suite is not needlessly repeated. The affected native command is rerun instead.

The initial `npm run test:maps` metadata reports exit 0, but its persisted log
contains only command headers and cannot substantiate counts or validator
execution. Its cause is not established. Keep that incomplete capture; the
separate direct commands above provide the complete final 7-test and validator
evidence. Do not infer results from the original headers.

Later report/authority/evidence edits are reviewed as a separate documentation
delta. Prove identical runnable/test/data/config/generated bytes to `ee694d2`
before publication; record the final concrete tree in the handoff.

## Limits and publication handoff

MODEL.zip could not be made available and was not read. The installed repository
V5 assets are available for the scoped integration checks. The attached Form 4
textbooks/DSKP are outside this presentation/resource scope and were not used.
NOT_RUN: pupil/human recognition study; physical Windows/phone FPS, GPU or total
memory measurement; MODEL.zip comparison; live Google receiver; new independent
AI campaigns/holdouts; the separate historical `test:icons-browser`/complete PR
matrix and a live public-site browser inspection. The unchanged numerical/AI
owners justify retaining their earlier evidence without replaying campaigns;
their prior limits remain. Local/native tests do not replace those validations.

Publication is restricted to this reviewed integration. Release Manager is the
team's sole main writer after coordinator review of the exact candidate and
fresh QA/audit evidence. Read main immediately before a non-forced fast-forward
with its expected old SHA, then verify actual ref/tree/version and both feature
ancestries. If main moves, reconcile and reassess affected checks. Record Pages
deployment separately from a local build or successful Git update.

If rollback is needed later, prepare a normal reviewed revert against the then
current main; do not force-push history or erase player data. No rollback action
is authorized merely by describing that recovery option here.
