# AI Playtester — main integration

24 October 2026 (Malaysia). Ijamm explicitly requests publishing the completed AI update to main, superseding the earlier ai-only boundary.

Merge main `d5533ad14568ace062642adcb67809a878e665e7` with ai `807be6763cac1bc97134f86031d42e5dc720d6d1`. The tool includes actual support/cost measurements, sampled three-turn Expert planning and synergy-aware reward/Shop/upgrade/removal decisions. Retain game 2.32.1, supplied menu music, current combat presentation and all production gameplay/profile owners. Only two append-only SOR files conflicted; both histories are retained. No gameplay code conflict required resolution.

Run `npm.cmd run start:dev`, then open <http://localhost:4174/__dev/ai/>. The AI runs locally without an API key; it remains excluded from player/production/offline builds. [Operator guide and limitations](AI_PLAYTESTER.md).

## Verification

Fresh merged-tree checks passed: **820/820 full tests**, no skipped/cancelled tests; syntax checks; actual AI browser with four Expert encounters, history/export/reload/stale-response/cancel checks and 1440/750/390 viewports; and Developer Hub/toggle browser checks. Player storage sentinels remained unchanged.

Production was built in an isolated export with all **1,859 tracked inputs byte-identical** at export time. All **823 protected game/module/entrypoint files** remain unchanged; **706 public production files** match dist. Generated offline excludes AI, and real production GET/POST AI routes all return 404. Final verification documents were added afterward without changing runtime inputs.

The game/AI source fingerprint remains `d010faa0bb405a10dd2066f1444bd07b9d5d847fc7a62a34d78d1e30f84d6c4d`: it binds the measured engine and AI inputs, not visual assets or the complete repository tree. All 14 merged AI implementation files match the published ai branch; all 54 existing main commands are retained. Main's combat animation and menu MP3 are preserved by the protected-file check.

[Machine-readable result](verification/ai-main-2026-10-24.json) and [actual logs](verification/ai-main-2026-10-24/) distinguish this fresh integration verification from historical branch cohorts.

## Limits

Heuristic strategy is not trained ML. Exhaustive combinations, physical-device behavior and actual pupil 90/70/50 win rates remain unverified. Code publication does not establish a successful hosted deployment or configure Google collection.

## Release version 2.33.0

Ijamm questions why the AI feature update left the game version unchanged. Identify the new feature release as **2.33.0**, using a minor increment from 2.32.1. The original integration commit `f190faf` and its verification above remain historical facts. This follow-up updates package.json and regenerates the shared release metadata and all three launch pages, including the offline and production builds. Runtime rules, AI logic and save identities remain unchanged.

Fresh release-specific checks passed: **49/49 release, entrypoint and UI tests**, syntax, production build and real Chromium startup/menu/Settings checks in Player, Dev and Production. All seven version-bearing package/runtime/production files identify 2.33.0; all 706 public files match dist. Only four generated release/launcher files changed among 823 protected files. A truncated temporary offline artifact was regenerated; its complete 302,886,092 bytes remained unchanged across the passing checks. No implementation or test code needed modification. Details are recorded in [ai-release-2-33-0.json](verification/ai-release-2-33-0.json). The 820-test result above belongs to the original integration; it is not a new full-suite claim for the version-only follow-up.
