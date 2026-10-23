# Education analytics verification

Historical preview verification. Main integration with 2.25.1 is recorded separately in [2.26.0 integration verification](EDUCATION_ANALYTICS_MAIN_VERIFICATION.md). The original authorization boundary and results below apply to the preview only.

Target: **2.25.0-analytics.1**, branch `education-analytics`, based on main `2800f9a` / 2.24.0. No main integration is authorized by this release.

## Automated checks

| Check | Result |
| --- | --- |
| Original main baseline | 472 passed, 0 failed, 0 skipped |
| Analytics/curriculum owner | 28 focused tests passed |
| Sync and real HTTP/SQLite receiver | 32 focused tests passed |
| Practice source and actual generated folio | 14 focused tests passed |
| Actual host menu/Predict/Settings/export/Retry | 10 focused tests passed |
| Full `npm test` regression | 555 passed, 0 failed, 0 skipped (serial run) |
| Final display/build guards | 10 host tests and 3 release tests passed after the full run |
| Final `npm run check` | Passed |
| Production build / unchanged output regeneration | Passed; all 65 hashed resources match dist, with no Dev/private database files |

Environment: Node24.19.0, jsdom26.1.0 supplied through `DOM_QA_MODULE`. The game has no new runtime npm dependency. The final full suite runs one test file at a time to bound memory during the exhaustive MathML/portable audits; no checks are skipped. Two earlier overlapping runs ended a DOM worker without an assertion failure; individual focused checks passed, so the final release uses serial file execution.

The final two small follow-ups show learning-storage warnings on Main Menu even without a run, and reject private database files before production copying. Their complete affected host/release suites passed after the 555-test regression; no engine/bank/audio behavior changed.

The MathML audit independently passed all three checks: both host and Practice render all120 questions in English/BM, with240 localized question projections,480 hint/solution visuals and6,579 native MathML equations per surface profile. Fractions, powers, set groups and rich-text namespaces retain their authored structure, with zero author layout overrides. Canonical bank bytes remain unchanged.

## Evidence and regressions

- Hand-counted mixed answers distinguish actual wrong submissions, independent first try, help, correction after retry, reveal-only and pending records. Guidance opened after an attempt does not rewrite that attempt. Opening then closing Steps retains historical use.
- All120 IDs bind to the active bank's28 SPs,9 SKs,30 skills and existing Basics modules. Default reports exclude Review, deduplicate multi-SP totals and require three distinct answered IDs before focused revision suggestions.
- Real Predict controls submit a wrong answer, reveal Hint, then correct; reload/report/export do not add attempts or change gameplay. Settings language changes preserve the question and RNG. Older1.4 saves use confirmed run receipts without mutating/migrating their saved education state.
- Actual Retry changes the engine start time but aliases to the original learning session; reload still reports one occurrence. Genuine New Run, explicit Learning reset and Restart Review remain distinct.
- Interleaved storage setter tests exercise distinct observations, stale same-occurrence writes, alias writes, delayed payload journals and delayed ACK projections. Immutable snapshots recover after reopening. SHA256 IDs are checked against Nodecrypto vectors, including Unicode.
- Capacity tests preserve all existing evidence and reject further admissions. Concurrent last-slot writes temporarily yield5,001 pending entries; all remain readable/exportable with a capacity warning. Corrupt aggregate bytes remain unchanged while healthy journals can still be exported. Quota/permission failures keep new observations in memory with a warning.
- Actual HTTP/SQLite tests cover registration/authentication, body/schema/metadata validation, same-origin isolation, transaction rollback, equal-revision conflicts, one conflict rebase/retry, old revisions, partial/stale/malformed ACKs and a lost response after durable commit followed by client/collector reopen.
- Generated-folio tests use the real modules and inherited `about:srcdoc` origin/base. They cover Learning/reopen/reset/Review, comments/tombstones, exact latest-revision confirmation, explicit Save consistency, keyboard focus, native selected text, expanded disclosures and exports.
- A receiver-only error stays unavailable/offline; local storage failures receive their own warning. Thrown capture/enqueue errors cannot prevent original Practice or gameplay owner saves/rendering. Local JSON includes owner-session recovery and excludes capability secrets; these recovery snapshots are not transmitted.
- Production validation found and removed an untracked database left by an earlier rejection experiment; it was never staged/published. The builder now refuses SQLite/DB files in the public tree before copying, and a temporary-root regression proves that stale output is removed while the source database is preserved. A clean rebuild and deterministic regeneration passed; portable size 295,440,182 bytes.
- Ordinary game, questions, music/voices, cards and save reducers remain unchanged. Developer memory storage and network guards prevent collection in Dev sessions.

## Actual browser and receiver exercise

Using the managed Chrome preview of the actual game and optional receiver:

1. Opened Learning Report from Main Menu and Settings without a run. Confirmed the visible prerelease version, Ink presentation, independent dialog scroll and sparse-evidence wording.
2. In Education Practice Learning, opened Hint, submitted a wrong answer for PROB-020, opened More Hint, then submitted the correct answer. Main report after reopening showed answered1, wrong1, independent0, support1, retry1.
3. Created a sample English comment, enabled sharing, observed pending2 until the receiver confirmed pending0, and independently exported SQLite to verify one learning record and one comment without credential fields.
4. Changed question language in Settings to BM and opened the Malay report. Its counts, chapter names and SK/SP controls remained available. Added a BM comment from the actual generated frame and confirmed successful delivery.
5. Stopped the receiver, edited the BM comment while the loaded game remained open, and observed one pending record. Restarted the receiver and reopened the game at the same address: it automatically reached pending0. The operator JSON export contained three logical records (one learning and two comments), including the latest BM edit from the interruption, with no credential fields.

The report screenshot was inspected in the browser output. The screenshot file did not synchronize into the workspace, so no broken image attachment or fabricated screenshot artifact is included.

## Review and limits

An independent read-only code review reproduced and rechecked fixes for Retry duplication, historical Steps use, async focus loss, conflicting-revision ACKs, concurrent journal writes and capacity recovery. It reported no unresolved Critical or Important findings in the bounded re-review. The final small offline-state/exception guards have focused regression coverage.

Physical Windows/device display, real Wi-Fi adapter events, classroom interpretation and central cloud hosting were not independently exercised. Online-event retry is covered with the actual HTTP receiver in tests; native browser interruption/reopen is described above. No cloud resources, teacher accounts or official assessment levels are supplied. A receiver must be configured/running for central collection. The unavailable MODEL.zip is outside this analytics change.
