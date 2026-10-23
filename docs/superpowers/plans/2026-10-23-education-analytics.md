# Education Analytics Implementation Plan

> **For agentic workers:** Use focused parallel domain tasks under dispatching-parallel-agents, then root integration and a fresh whole-branch review. Steps use checkbox syntax.

**Goal:** Build reviewable offline learning reports and reconnection-safe collection on education-analytics, leaving main unchanged.
**Architecture:** Existing immutable learning events feed a separate analytics store/report. A separately owned revisioned outbox delivers opted-in snapshots/comments to an optional same-origin SQLite collector. Shared UI renders host and folio reports.
**Tech Stack:** Existing vanilla JS/UMD, localStorage, native HTML/CSS/SVG, Node HTTP/SQLite, node:test/jsdom.
**Spec:** docs/superpowers/specs/2026-10-23-education-analytics-design.md

## Global Constraints

- Branch only; base main 2.24.0; branch version 2.25.0-analytics.1.
- Preserve all 120 source questions, run RNG, saves, source art and MUSIC(5).
- No cloud project creation or claim of cloud deployment.
- Minimum evidence is three distinct answered question IDs; no official TP labels.
- Same-origin collection default off; server acknowledgement required before sent.
- Review and Dev sandbox cannot inflate normal progress or send fixture data.

## Review Focus

- Rerender/reload/new-run inheritance must not duplicate one real answer.
- Pending wrong answer and reveal-only record must have correct denominators.
- Partial/lost acknowledgements and newer queued edits must survive retries/reopen.
- Corrupt/quota storage must preserve original bytes, warn and permit export.
- Public collector cannot read other players, overwrite newer revisions or expose operator exports/secrets.

### Task 1: Analytics/curriculum owner

Files: dist/learning-analytics.js, dist/learning-curriculum.js, tests/learning-analytics.test.cjs and curriculum source/audit if needed.
Interfaces: createStore/capture/records/report/exportData/csv/getSessionId/startSession/error from spec.
- [ ] Write hand-derived red tests for 120 metadata bindings, topic/SK/SP totals, pending wrong/support order, minimum distinct evidence, Review separation, reload/new sessions, same-origin merge and corrupt/quota export.
- [ ] Run red tests and record expected missing behavior.
- [ ] Implement pure derivation/persistence and verified DSKP curriculum registry.
- [ ] Run focused tests; report exact result and ownership to root.

### Task 2: Outbox/collector owner

Files: dist/learning-sync.js, tools/analytics/collector.cjs, tools/analytics/server.cjs, tools/analytics/export.cjs, tests/learning-sync.test.cjs, tests/analytics-collector.test.cjs.
Interfaces: outbox createClient/enqueue/setEnabled/status/flush/start/stop and HTTP contract from spec; root owns package scripts/server.cjs.
- [ ] Write red real-store/HTTP tests for offline pending, reload, exact revision ACK, lost response after SQLite commit, partial ACK, newer edits, auth/stale upsert and safe exports.
- [ ] Implement minimal outbox and SQLite receiver with export CLI.
- [ ] Run focused tests and document runtime/endpoint integration to root.

### Task 3: Folio capture/feedback integration

Files: modules/mechanics/source/QUESTION_BANK/learning/preview.mjs, preview.html, question-feedback-ui.mjs and optional new folio analytics CSS/test file. Root owns builder and shared UI modules.
Interfaces: consume analytics and sync APIs from spec, shared DCAnalyticsUI renderer contract to be finalized with root. Same-origin store keys, no parent run mutation.
- [ ] Add red interaction tests for actual Learning/Review/feedback capture, reset identity, reopen and no duplicate evidence.
- [ ] Add truthful syncing/exit messages and report entry, preserve exports and user text.
- [ ] Run focused tests after build integration; coordinate dependencies with root.

### Task 4: Root host/report/build integration

Files: dist/app.js, dist/analytics-ui.js, dist/analytics.css, dist/index.html, builders, package.json, root launchers and tests/analytics-ui.test.cjs.
- [ ] Add red DOM tests for Main Menu/Settings entry, real question/Hint records, empty/report filters/CSV, stable game state and disabled Dev collection.
- [ ] Implement shared accessible Ink report with topic bars, SK/SP table, trend, Basics/review links, sharing status and exports.
- [ ] Integrate scoped capture before save, folio modules and portable/production builds; use prerelease version.
- [ ] Run full npm test, syntax, deterministic/production build and native browser tests with managed preview.

### Task 5: Documentation/review/publication

- [ ] Update owners SOR02/10/13/15, DECISIONS/CHANGELOG and a branch-specific Windows guide with real start/export instructions and limits.
- [ ] Fresh whole-branch review; reproduce/fix Important findings; repeat full suite when runtime changes.
- [ ] Commit and publish education-analytics with exact tested tree; verify main ref unchanged by this work.
