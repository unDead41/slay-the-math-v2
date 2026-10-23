# Google Sheets collection on main — 2.30.0

Ijamm explicitly requests publishing the completed Google collection update to main. This supersedes the earlier branch-only boundary.

Integration parents: current main `8b6a3c688dc83db31685cdc7ec653ee25554e62d` / 2.29.0 and `education-google-sheets` `a535a04d169837aa1402ae30b8d23ed1b3276cf9` / 2.28.0-sheets.1. Use a real merge and regenerate version/cache entrypoints as **2.30.0**. Keep main's single-enemy card adapter, candidate.3 binding/save key, prior receipt compatibility, Alyssa status VFX hooks, original art/audio/motion and Pages workflow. The Google modules, canonical receiver, unchanged outbox and shared host/Practice configuration retain the reviewed feature implementation.

The actual menu path is **Main Menu / Settings / Education Practice → Learning Report → Collection link**. Saving a Google /exec URL pauses sharing; the player explicitly enables sharing. Offline entries remain on-device until exact revision acknowledgement following canonical/projection persistence and flush. Current-destination consent, identity and receipts remain isolated; a new destination requeues known evidence and comment tombstones. Existing local reports/exports and optional SQLite collection remain available.

No live Google account authorization, Sheet creation, Apps Script deployment, account policy, actual Google quota/latency/classroom measurement or real-device validation is claimed. [One-file owner setup](GOOGLE_SHEETS_SETUP.md) is still required before actual collection. GitHub Pages deployment is separate from repository publication and remains subject to the existing account/workflow settings.

## Conflict decisions

- `dist/app.js` merged additively: retain every status-VFX/action/render/audio hook and both existing Focus descriptions; add destination selection and analytics pagehide/pageshow lifecycle.
- Start index/release metadata from current main, add Google config/transport/delivery before analytics UI, then regenerate entrypoints/cache hashes.
- Union package scripts: retain single-target and status-VFX QA, add Google receiver build/browser/syntax checks, use serial full tests to fit the project's DOM/asset memory footprint, and bump version from package.json.
- Preserve both historical SOR appendices and supersede publication scope with the explicit main decision. Operator instructions now default to main rather than the older preview.

## Verification

Fresh main baseline: **42/42** collector/sync/host report tests passed before merge (8205ms). Final merged-code full suite: **758/758**, zero failures/skips/cancellations, **510268ms**, exit 0. Syntax and production/portable builds passed. Preview-only results remain historical in GOOGLE_SHEETS_VERIFICATION.md/json. Full evidence: [combined verification JSON](verification/google-sheets-main-2-30-0.json).

- **685 production files** match dist byte-for-byte after the full suite; all **78 runtime resource hashes** match entrypoints. Offline HTML: **295673249 bytes**.
- **648 protected main files** are byte-identical, including game/card/balance engines, candidate.3 adapter/save owner, questions/localization, status VFX, original art/audio/motion, AGENTS and Pages workflow. Eleven reviewed Google feature owners are also unchanged.
- Native Chromium passed real Main Menu/Practice Google setup, nested-origin MessagePorts with simulated Google services, lost-response/reopen and automatic offline recovery. Production single-enemy tests passed focused Rune Sweep 16 damage and Fate Storm 5+5+5 in ordinary/Medium modes without target RNG or save/reload changes. Status-VFX browser passed desktop/phone/landscape, all three Master profiles and standalone offline with no external requests. No native page errors.
- The first Google harness run attempted a redundant manual Sync click while the online handler was already sending; it timed out on the disabled/replaced button. The corrected harness directly awaited exact zero pending, retained canonical-row/save checks and passed. No runtime edit was needed; that failed attempt is excluded.
- Fresh pre-main read-only review: no open Critical/Important/Minor findings; both parents preserved, package commands retained, entrypoint order/hashes valid and owner setup instructions accurate. Live Google, hosted Pages outcome, quotas, throughput and physical-device experience remain outside these checks.
