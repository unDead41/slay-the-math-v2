# Master validation — game 2.27.0

Evidence collected on 23 October 2026. Final checks below are completed before remote publication; pending items are not represented as passes.

| Check | Actual result |
| --- | --- |
| Original main baseline | 486/487 passed initially; the one failure was missing Sharp. Its complete 9-test file subsequently passed with both supplied dependency paths. |
| Three specialist branches merged on 7afb0aa | 611/612 initially passed; the same missing Sharp environment issue. |
| Master suite before analytics main update | 619 tests passed, zero fail/skip. |
| Master campaign/retry/factorial regression | 7 tests passed, including exact captured-entry Stage 2 replay; two tests were added after the 619-test invocation began. |
| Candidate browser smoke before analytics merge | All three profiles passed real menu/gift-question/map/battle/Predict/reload/save/image checks in Chromium; zero page/resource errors. Serverless Chromium single-process context teardown initially failed; rerun with multiprocess Chromium passed. |
| Map module | 7 tests passed; validator passed 100 seeds / 200 maps / 200 unique layouts and source PNG hashes. |
| Campaign experiments | 180 initial + 180 calibration + 360 holdout = 720 primary terminal attempts plus 18 verification replays. Zero invalid/censored. Pupil rates unmeasured. |
| Fresh card power | 624 paired/factorial cases / 1,632 encounters; all 40 normal/upgraded cards, 10 selected pairs, 4 triads. Zero invalid/censored. |
| Archived evidence integrity | Five manifests, exact planned/raw task identities, source snapshot SHA-256 and per-trial engine hashes verified by `tools/balance/master/report.cjs`. |
| Analytics main compatibility | Main b67298b merged with unchanged measured engine dependency bytes. Later review strengthened two validators; all 18 repeated holdout cells match exactly. Original assets, the 120-question bank JSON, audio and motion files compared without changes. |
| Final combined suite after review fixes | **707 passed, zero fail/skip**, direct `node --test tests/*.test.cjs` against the completed production build. |
| Final syntax and production build | `npm run check` and `npm run build:prod` passed. Production player files generated; offline build 295,614,657 bytes. |
| Final Chromium check | All three profiles passed menu, actual gift question, route/battle, Predict reservation, reload, save and decoded-image checks. Zero page/resource errors. New Run uses the explicit public seed 2000000020 for repeatability. |
| Final whole-branch code review | Complete: three findings fixed and independently closed; 3 focused reviewer checks passed. [Review record](REVIEW.md). |
| Post-review behavior comparison | 18/18 held-out seed20 cells exactly matched before/after validator fixes across status, final/room snapshots, RNG/action trace and metrics. |

Runtime dependencies here: `NODE_PATH=/tmp/stm-audio-qa/node_modules:$CODEX_PRIMARY_RUNTIME_NODE_MODULES` supplies JSDOM, Sharp and Playwright. `QA_CHROMIUM_MODULE=@sparticuz/chromium` supplies the local Chromium binary. No game dependency installation or student data collection was enabled.

Limits: no real pupil win-rate validation, physical-device/audio audition or exhaustive combination proof. Historical specialist reports keep their original contexts. See [handoff](HANDOFF.md) for the holdout cell results and interpretation.

Final command output is preserved under [validation logs](validation/whole-suite.log), alongside the browser, production, syntax, map and targeted-regression logs. No requested work is waiting on a permission step; remote branch/tree verification is recorded when publication succeeds.
