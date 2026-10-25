# QA handoff — release 2.48.0

**Recommendation: VALID for the scoped AI integration, with an inherited P2 follow-up.** No demonstrated new P0/P1 integration blocker. Preserve all actual FAIL records; do not call the whole CI matrix green or the race fixed.

Tested commit `b2af6c7f0bab227be7da48b63bc48d3b41faf32b`, tree `09486f7440a37fcb014fdd59094c0ad612d4084b`; main `2b81a2cd80532324a76581563874a9ecd797cc42`, feature `39ee5ab08d7f60ba9392bff0c3c3cab8eceefe91`. Master SOR1.2.0. Node24.22.1/jsdom26.1.0/Playwright1.62.1/Chromium153.0.8010.0/Linux; full Git history and pinned historical balance object present. No dependency install.

| Check | Actual result |
| --- | --- |
| `npm test`, including pretest build | 1130/1130 PASS, fail0/skip0/cancel0; one full run |
| `npm run check` | PASS |
| `npm run test:maps` | 7/7 PASS, no skips;100seeds/200maps/12PNG hashes validate |
| `npm run build:prod` | PASS |
| Guarded exchange and independent Python verifier | 528observations/1152cells,264entries/3profiles; invalid0/censor0 |
| Identity and boundaries | 49source hashes match;3profiles READY/same model; safe zero fallbacks; only3protected generated metadata diffs;12AI GET/POST endpoints404 |
| Native AI/Master/production Dev | PASS; AI4encounters/history/export/cancel/player sentinels at1440/750/390;all3Master profiles;static/production Dev isolation |
| Production/portable tutorial and access | PASS;23chapters/98localized images/12practice;BM/phone/landscape/keyboard/focus/storage failure/zero-network portable |
| Fixed24-state projection replay | PASS equal choices/transitions;14628→4302 projections. Local median23.91→18.62ms only |
| Fixed12-campaign OFF/ON gate | PASS;6matched pairs/6wins each,invalid0/censor0;utility670.041→677.374. One Hard702case22→44HP; not general win rates |
| Preload original command | Initial actualFAIL759/760;unchanged sequential rerunPASS all9checks/760available |

**QA-248-PRELOAD-01: P2/open/inherited.** On exact main2.47.0 the first boundary probe reproduces758/760 although all760are verified, no downloads active/queued/failed. Missing snapshot URLs `assets/ground-rune_bat-defend.webp` and `assets/ground-rune_bat-skill.webp` both already exist in persistent CacheStorage. The next inspection, before our explicit diagnostic reconcile, automatically reports all761manifest files available. This supports a transient retention-count/test-completion boundary, not missing downloaded bytes. Candidate diagnostic and3boundary probes pass;baseline collection stops at its first actualFAIL. No runtime or assertion changes were made. Future owner QA should observe a bounded settled-retention condition rather than queue emptiness alone, keeping the full availability assertion.

Both manifests have761identical URLs and the same startup plan; only the174-byte versioned release.js digest differs. Loader/readiness bytes are unchanged. Supported user impact is a brief counter/readiness snapshot undercount; no lost asset, blocked tested player flow, save loss or RNG drift was observed. Carry this P2 outside the AI payload. CI-247-01 and two P3 data checks remain open;historical icon/whole PR matrix NOT_RUN.

Production823files excludes developer AI/model. Offline312112645bytes, SHA256 `a6feafd7d6d9241962ad477548c2ae290da8a4dd9b55e51d008c53a5147b404a`. Runnable paths still exactly match the tested commit. Publisher docs-only edits started after QA released the clean checkout; later test reuse requires identical runnable bytes. Main readback at close remains2b81a2cd.

`evidence.json` includes exact commands, environment, outcomes, full identity/model/gate/probe details and limitations. `artifact-index.json` hashes this folder; logs, external executed diagnostics, gate raw data and real screenshots are retained. Physical Windows/mobile, MODEL.zip matching, live Google/Pages, pupil targets and general policy superiority remain unverified. Root owns publication GO.
