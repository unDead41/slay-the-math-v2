# Whole-branch Learning Report review

Reviewed education-report's current uncommitted implementation and untracked source/tests against d76ad6e26ada3b3aea98db0b4d0462f3f6f026a4 (main 2.30.0). Read-only review; no edits to repository, index, HEAD or branches, no builds or full test suite. Read AGENTS, design/plan/progress, preview documentation, shared renderer/CSS, host and source Practice integration, delivery default adoption, developer endpoint and Hub, receiver setup wrapper, and relevant changed tests. Generated bundles were not exhaustively reread.

## Findings

### Important — asynchronous Practice storage refresh discards selection and table scroll

Locations: `dist/analytics-ui.js:48–56`; `modules/mechanics/source/QUESTION_BANK/learning/preview.mjs:85–100,530`.

The Practice storage listener calls a full report render. captureState retains query text, filter, view, disclosure state and focused control, but omits search selectionStart/selectionEnd/selectionDirection and inner `.analytics-table-scroll` offsets. Replacing the report recreates the search input and bounded scroll containers. A cross-tab storage write while a player is editing a filter moves their caret/selection to the end; a player reading a long question or curriculum table jumps back to its top/left. Restoring only the dialog scrollTop does not cover these independently scrollable tables.

Actual generated Practice reproduction (jsdom, no repository mutation): focus search `PROB-`, select range [1,3], set question table scroll [140,25], dispatch storage event. Afterward focus survives but selection is [5,5] and table scroll is [0,0]; no page errors. Any storage key triggers this path.

Fix: capture and restore input selection and stable-identity inner scroll offsets during full renders, or update relevant data without replacing unaffected controls/containers. Add a storage-event regression for both selection and internal scroll, supplementing the existing text/focus/row-count assertions.

### Minor — quota-only comment failure contradicts new saved-on-device copy

Locations: `modules/mechanics/source/QUESTION_BANK/learning/question-feedback-ui.mjs:73,89`; `modules/mechanics/source/QUESTION_BANK/learning/preview.mjs:59–63`.

The new exit summary and standalone finish acknowledgement unconditionally say comments are saved on this device even if store.flush() failed. The comment delivery note says the opposite. The shared Sharing view does not include the comment store error in analyticsStatus, so a failure limited to comment storage may also show the healthy 'Saved on this device. Sharing is off.' state. This undermines the explicit quota-truthfulness requirement at the point a player decides whether to leave.

Actual generated Practice reproduction: throw on writes only to `slay-the-math.question-feedback.v1`, type a comment and open exit. Comment key remains absent. Summary says '1 question has a comment saved on this device', while delivery note says 'Comments could not be saved on this device'. Opening Sharing shows 'Saved on this device. Sharing is off.'

Fix: condition exit/finish copy on comment store error, expose that error to report status, and continue directing the player to the existing JSON recovery file. Add a targeted comment-only storage-failure assertion.

## Other assessment

No Critical findings. The local developer write path uses loopback peer and canonical local host checks, exact Origin for POST, bounded JSON, exact shape, normalized URL, revision comparison and synchronous same-directory atomic replacement. The route is only wired in development. Explicit default adoption follows existing destination isolation/pause behavior and retains old journals. The owner wrapper uses the requested active/effective identity guard without returning a Sheet address. Player URL/CSV controls are removed while one shared JSON backup remains. Changed tests retain meaningful storage-preservation, consent, comment, no-send, and credential-exclusion assertions; the missing selection/scroll and comment-only quota assertions explain the findings above.

## Verdict and limits

Hold feature-branch publication until the Important state-retention finding is corrected and verified; fix the small quota-copy inconsistency in the same bounded pass. Thereafter publication readiness still depends on the coordinator's final full serial regression, syntax/build/hash/preservation checks and evidence completion. No main publication is approved or implied.

The coordinator reports native report/Google QA passing, including nine view/viewport samples, real BM/Practice, developer setting distribution and player route denial; this reviewer did not rerun those suites. Declined to judge live Google account/deployment behavior, Google quota, real classroom use, physical Windows/mobile devices, or final release artifacts not yet built/verified. No claim of live collection success.

## Coordinator resolution

Both findings were reproduced by regressions on the actual generated Practice (2 RED), fixed in the shared report state and feedback presentation owners, and rerun (2 GREEN). Selected text/direction, independent curriculum/question table scroll and disclosures survive storage refresh. A comment-only quota failure shows save-error in Sharing, temporary-page wording at exit and a JSON file containing the memory-only comment in English/BM. Native Chromium confirms actual selection and scroll retention. Complete serial verification is recorded in the companion final verification document.
