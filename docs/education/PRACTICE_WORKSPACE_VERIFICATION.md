# Education Practice workspace verification

Preview **2.31.0-report.2**, branch **education-report**, based on **35610a5**. Main was observed separately at **6dc3ce3** and is outside publication scope. This report records the new Practice work; the previous report.1 verification remains historical.

## Implemented behavior

All120 questions have a native Reviewed checkbox, independent of correct/incorrect outcomes. Marks and optional comments share the existing feedback owner, survive reload and untick independently. Not reviewed, Reviewed and With feedback filters support returning to unfinished review. The Question and Feedback views preserve the selected question; the comment is reachable without scrolling through quiz support. Language and saved-session controls move under Practice options; the parchment switch/large hero are removed. Existing source references, canonical Hint/More Hint/Basics/solution rules and ordinary game-save tools remain.

No player CSV/import/native CSV-sharing or Google URL input is present. Developer setup remains in the local Developer Hub. One disclosed JSON recovery action stays in the shared Learning Report. The existing receiver protocol is reused: a reviewed entry prefixes the outbound Question value with `[REVIEWED] ` and preserves the exact user comment, including its full 2000 characters. The optional local flag stays in JSON recovery; no new receiver field, database or redeployment is introduced.

## Evidence

| Check | Actual result |
| --- | --- |
| Baseline feedback/report/Practice | 13 passed, 0 failed/skipped |
| New model/UI regressions | Missing mark behavior and separate views reproduced before implementation; targeted 30-test batch passed |
| All120 mark protocol contracts | Every item passed the unchanged strict Google feedback validator; 2000-character comments preserved |
| Stale-tab mark | Latest other-tab comment and categories preserved; only review flag changes |
| Quota/corrupt feedback | Memory-only marks remain exportable; malformed saved flags preserve the original bytes |
| Native compact workspace | 3 flows; 6 view/viewport samples; no page errors, local drawer scroll, 44px checkbox targets and phone comment reachable |
| Native Google boundary | 6 flows; offline tick/comment and untick/edit update the same row; no page errors; services simulated |
| Native all120 quiz/support/portable | 120 questions, 4 checks and 5 viewports passed; zero page errors and zero offline network requests |
| Native report/developer/toggle | Final report3 flows/9 geometry samples and both developer scripts passed |
| Syntax and production build | Passed on final runtime source |
| Full serial Node/jsdom | 778 passed; 0 failed/cancelled/skipped/todo; 359846 ms |
| Protected original assets/core/receiver | 640 files byte-identical to base, including all606 dist assets and the live receiver/bridge/validator; the delivery wrapper intentionally owns the new common projection |

Native workspace viewports are 1366×900, 390×844 and 844×390 (the Practice frame uses the remaining area below the game's header). It covers actual Main Menu→Practice, question-list checks without navigation/answers, BM switch, filters, view/focus preservation, reload, untick retaining comments, sharing/exit cancellation and exact game-save invariance. The phone screenshot was rereviewed after moving language into options and optional categories below the textarea; the comment now begins within the first Feedback screen.

Accepted report/Google/workspace browser runs keep browser web security enabled. Google tests execute the actual generated receiver in V8 and actual nested-origin MessagePorts, mocking only external Google services. They do not establish live account/deployment/quota behavior.

The final producer audit also covered host startup: app.js replays raw saved comments. A Practice-only projection would have exposed the optional local flag to the strict receiver. The added host-reopen delivery regression failed first; the single projection now lives at the common delivery boundary and retained-destination replay. The actual Google native test reloads the host after receiving a marked comment, then reopens that reviewed question, updates it offline and verifies one row with exact ACKs. Targeted final owner/UI tests passed40/40. app.js, canonical Sync and receiver code remain unchanged.

A separate native keyboard regression reproduced clipping of the list button's focus outline. An inset focus rule fixes it; native ArrowDown now focuses PROB-002 with a visible2px outline. The final full run follows both fixes. The all120 native quiz run preceded these final presentation/feedback-boundary fixes; its canonical quiz/support code and data were unchanged, and final native/full regressions cover the changed boundaries.

## Shiro fix review

The large hero, tiny grid and long combined feedback page were concrete implementation problems. The final native screenshots retain the established ink/gold identity and present the current question ID, independent review mark and two task views clearly. The first phone pass still pushed comments below the fold; the second layout fixes that. No remaining P0/P1 layout issue is known from the tested sizes. All verification gates passed. Ready for feature-branch preview; main publication is not authorized.

Excluded runs: the rebuilt test environment initially lacked the old Chromium module path and extracted graphics libraries; those harness dependencies were restored. A legacy all120 browser script was interrupted while unobservable and again before adopting the same runtime flags as the other native checks. The accepted script yields between questions, reports progress and retains every original support/answer/visual assertion. An earlier partial serial run was interrupted to add the focus fix, and another to correct the host producer boundary; neither is counted as a completed pass. The old six-menu-button assertion was updated to the seven existing buttons including Learning Report. Product Origin/security checks were not relaxed.

## Limits

No live Google account, actual classroom, Google quota or physical Windows/mobile testing is claimed. Data sends only with consent while the same game is open; queued entries survive offline/reopen according to the existing delivery owner. The URL is public browser configuration; the private Sheet remains controlled by its owner. Canonical question content/evaluators, gameplay, reward/RNG, audio/art/motion, main and the receiver code are not changed. Attached textbooks/DSKP were available but no content rewrite was needed for this UI task. MODEL.zip was unavailable and not used.

## Screenshots

- [Desktop question](../verification/education-workspace-2-31-2/desktop-question.png)
- [Desktop feedback BM](../verification/education-workspace-2-31-2/desktop-feedback-bm.png)
- [Phone question BM](../verification/education-workspace-2-31-2/phone-question-bm.png)
- [Phone feedback BM](../verification/education-workspace-2-31-2/phone-feedback-bm.png)

Screenshots contain synthetic QA marks and comments. [Machine-readable final evidence](../verification/education-workspace-2-31-2.json) and [full778-test output](../verification/education-workspace-2-31-2-full-test.txt).
