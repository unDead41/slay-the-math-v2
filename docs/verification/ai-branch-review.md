# AI branch review — 24 October 2026

A fresh read-only reviewer inspected the actual engine, AI, server, reports, UI and tests against the branch spec. No Critical issues; three Important findings, reproduced and fixed:

1. Battle objects are replaced on every immutable transaction, so WeakMap-based receipt dedupe recounted prior receipts. The real control had 10 plays / 9 Energy / 27 HP damage, but incorrectly reported 55 / 50 / 199; a campaign reported 1865 against 179 committed plays. The meter now uses the surviving global committed-play ordinal and the newest resolved receipt. Tests compare all counts/costs/damage against actual live receipts and campaign committed totals.
2. An older GET /jobs response could arrive after a new job started, hiding the active job and disabling Cancel. Mutation generations invalidate stale list responses. The browser test delays an actual HTTP response, starts another real worker, then releases the response and checks selection/URL/buttons/history.
3. CSV lacked detached provenance/configuration. Each row now includes job/source/agent/engine/definition identity, mode/Predict/cards/enemy/upgrade and job status. A regression verifies the standalone columns.

All three had RED failures and GREEN fixes. Focused final tests: 18/18; actual AI browser control/history/race/reload/export/cancel/save/mobile workflow passed. Final full-suite/build/source-bound cohort checks are in ai-branch.json, not inferred from this review. No second review seat was used after the fix pass; covering regressions verify fixes.

Reviewer-declined items were ruled explicitly: pupil win rates, exhaustive combinations, physical devices and policy optimality remain unverified; five-job history is intentionally memory-only. Stop jobs before editing/rebuilding source and restart after code edits; immutable hot reload is outside scope. Actual final production/remote checks are implementer acceptance gates.

Pre-fix evidence cohorts were excluded because their usage telemetry was wrong. The initial full run also lacked historical BASE Git objects and is not claimed as passed. Those original Git objects were restored; the pinned baseline tests then passed 10/10 without changing their expected values.
