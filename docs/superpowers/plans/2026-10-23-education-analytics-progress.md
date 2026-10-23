# Progress — education analytics

Plan: 2026-10-23-education-analytics.md. Base: main 2.24.0, 2800f9a. User authorizes implementation now in a branch; no main update.

Implementation judgment: start with player reports and an optional self-hosted SQLite collector because no cloud project/account is configured. Classroom accounts/teacher web dashboard remain future scope; operator CSV/JSON export is included. This makes offline/reconnect reviewable end-to-end without creating paid/external resources.

Interface preflight: analytics emits immutable changed record snapshots -> root/folio revisioned outbox. Both share same-origin keys and merge on read/write. Root owns all builders and shared report UI to avoid file conflicts. Sources remain immutable.

## Integration checkpoint

- Baseline: 472/472 existing tests, zero skips/failures on main 2.24.0 before changes.
- Implemented host Main Menu/Settings report, real Predict capture, shared Ink renderer/CSS, exports, source folio embedding and prerelease version.
- Initial bounded checks passed44/44; host regression suite now8/8, including Retry/reload continuity, focus restoration and analytics failure isolation from core saves.
- Native browser exposed about:srcdoc Location/origin differences; effective inherited origin is now handled by folio and sync owner. Final generated rebuild/browser recheck pending.
- Independent read-only review found Retry duplicate evidence, concurrent read/write data loss, false ACK for conflicting revisions, focus loss and Steps historical-use reporting. Retry/focus/Steps fixes implemented; durable journals and conflict recovery are in progress with failing repro tests first.
- First full-suite run:520/522 passed, zero skips. One generated-folio test had an overbroad test regex ("until confirmed" was mistaken for acknowledgement); corrected by its owner. The all-question MathML audit child failed under the expanded concurrent load, with no assertion message. Rerunning separately; test runner concurrency limited to2 to keep full-suite memory bounded. No full-suite success claimed yet.
- Added player/operator guide and owner SOR/decision/changelog entries. No main ref updates, cloud resources or source-bank changes.

## Final freeze and release preparation

- All bounded review findings fixed/rechecked: persisted Retry aliases; historical Steps use; focus/selection/disclosure preservation; immutable analytics and outbox journals; exact-signature ACKs; HTTP409 collision rebase; concurrent-capacity recovery and healthy-journal recovery beside corrupt aggregates.
- Focused final checks: analytics28, transport/collector32, Practice14, host9; all passed with zero skips. Final Practice guards separate network/local errors and preserve owner saves when analytics fails; local JSON ownerRecovery is never transmitted.
- Actual browser and SQLite exercise verified EN/BM reporting, sample wrong/Hint/More Hint/correction, opt-in pending2→confirmed0, BM comments, receiver interruption pending1→reopen confirmed0, and operator export of3 logical records without credentials.
- Overlapping full runs ended a heavy DOM worker without an assertion report. Current final full suite runs serial file execution, with no other test process or preview server running. Production sources are frozen; final npm test/check/build and deterministic output verification are the remaining release checks.
- Main remains at2800f9a /2.24.0. Native feature-branch publication is pending final checks; content-addressed runtime blobs have been prepared without moving any branch ref. No main/cloud changes.


## Release validation complete

- Serial full regression:555 passed, zero fail/skip,1,080,125.96ms. Final small Main Menu storage-warning hookup and production private-database preflight followed with 10/10 host and 3/3 release tests passing.
- Clean production build passed. Regeneration is idempotent; all 65 hashed runtime resources and release-prod copies match. No Dev controls or private database remain in production. Engine/bank/audio bytes match main 2.24.0. Portable output295,440,182 bytes remains ignored.
- The final production inspection found an untracked database from an earlier rejection experiment under dist/new-data; it was never staged/uploaded. Removed that test artifact and added/verified a production refusal guard before rebuilding.
- Final Git publication is feature-branch only, with exact local/native tree equality and a leased ref update. Main must remain at2800f9a.


## Published feature branch

Implementation commit 374abb14c2008272e1ec9da98c4e86b94aec8fd4 was published to education-analytics with a leased fast-forward, and fetched back with exact tree 645c747b7d3854ca96dbf2c026a5f4b2ecc15eeb equality. Remote main remains 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7. Windows instructions now fetch the feature ref explicitly and create from FETCH_HEAD without requiring an upstream mapping, supporting repositories configured to fetch main only. No main merge/update occurred.
