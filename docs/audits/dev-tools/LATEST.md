# Dev Settings main integration audit

Date: 24 October 2026 (Asia/Kuala_Lumpur). Master SOR 1.2.0.

Main examined: `6376a222169815af582cf55aa4794f3c809a3515` (2.37.0).
Feature: `8a44068dee260ae25aa8d27b368ec796f3ff22a4` (`dev-tools`).
Scope: Settings-only Developer controls; user explicitly authorizes main publication.

Initial audit: feature change not yet on main; shared ancestor is the 2.35.0 main integration. Runtime control code merges cleanly. Three append-only SOR conflicts were resolved by retaining both histories. Main education, icon, question policy, release metadata and Master SOR updates are retained.

Confirmed issue (P2, high confidence): `tools/dev/controls.js` appended the same control group to `.main-menu-actions` and Settings. Removed the menu insertion and corrected disabled-API guidance. Existing tests required menu controls; updated them to open Settings and assert that menu controls are absent.

Risk (P2, mitigated): removing the menu controls could make unlock/save-copy entry inaccessible. Browser checks exercise Settings, password cancel/wrong/correct, persistence, Hub access and save-copy isolation.

Improvement delivered: one Settings entry point; guide and domain SOR updated. No additional issue found in the scoped final runtime diff. Existing documentation findings DOC-001/DOC-002 in `docs/audits/main/LATEST.md` remain open and outside this task.

Validation: production build and local-dev toggle browser suite passed. Production browser result recorded below after completion. Diff whitespace check passed. Only one runtime source file changes; no engine, balance, save key, asset or question-bank changes.

Limits: no full historical regression run, physical Windows/manual screen selection, live hosting or pupil validation. Publication SHA is supplied in the handoff after checking the remote ref.

Integration check: initial production runs failed on player-copy restore: generated `release-prod/education.js` did not match `dist/education.js` (missing `upgradeActiveQuestion`). A fresh sequential production build corrected the artifact; source and output SHA-256 now match `cf5987dda4826a6715ee00c24575d5f6d718157d1b904afb17777abdd65638ed`. No engine/source workaround was introduced. Iframe readiness assertions now wait for the actual API with a bounded timeout rather than assume a particular scene. The save-copy error guidance in `tools/dev/access.js` also now refers to Settings.

Final result: production/static-subpath browser suite passed after the clean rebuild, including password, Settings entry, save-copy isolation, Easy profile, Hub scenes/cards/motion, diagnostics and actual production server. Final audit status: VALID within this UI integration scope.

## Release metadata correction — 2.37.1

24 October 2026: Ijamm requests correcting the unchanged version after the Settings-only merge. Base main `1ece105903ee34c81c38a338ead01db65a834523`; Master SOR 1.2.0. Confirmed P2 metadata issue: the merged UI still displayed 2.37.0. Use package.json 2.37.1 and regenerate release.js, cache URLs and all entrypoints. Gameplay, saves and assets are unchanged. Existing DOC-001/DOC-002 findings remain open outside scope. Verification: release metadata tests and production build; no additional issue found in this metadata-only diff. Live deployment and physical devices are not verified. Main publication remains authorized.
