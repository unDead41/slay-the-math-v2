# In-game questions — verification

24 October 2026 · education-report · **2.31.0-report.3** · base **ceaaaf5**.

Status: final serial regression, native checks, production build, syntax and
post-suite integrity checks pass. Ready for branch preview.

The policy owner is tested for first-wrong availability without fabricated Hint
use, More Hint before Hint, a correct retry, exactly two wrong answers, third-answer
rejection, replay/refresh, duplicate choices and pending legacy upgrades. All120
canonical questions are exercised. Starting/Elite/Boss failure continuations,
checkpoint retry, original Focus/seal gates, event timer/penalty and strict failure
receipts are covered. Existing economy event tests exercise all15 events across
three difficulty profiles without changing their numerical values.

Actual full-app Chromium: **6 flows** (Predict/Artifact/Mystery × English/BM) and
**18 geometry checks** at 1366×900, 390×844 and 844×390. Keyboard tabs, initial help
gate, first-wrong notice, More Hint without earlier Hint, actual Hint visuals,
reload before/after lock, steps and continuation pass. Original scene rectangles
stay identical when changing tabs. No workspace/document horizontal overflow;
only the question panel/dialog and wide visual content scroll. Controls are at
least44px. Language setup is hidden inside the question and remains in Settings.

All120 in-game component check: **360 native rendered states**, Bahasa Melayu at
390×844, using actual DCArtifactUI, STMMechanicsHost and canonical game owners.
This component fixture omits only the app controller; the six flows above cover
the controller. Every item displays four choices, filled Hint/More Hint visuals,
locked answers after two wrongs and canonical worked steps, with valid saves and
no malformed text or horizontal workspace/document overflow. This found and fixed
the long-set choice grid issue in PROB-002. Long mathematics remains readable in
its own scroll area.

Practice native regression: **120 items / 4 checks / 5 viewports**, including the
portable game opening Practice with zero HTTP requests. Practice's existing
unlimited learning/review gates remain intentional; the new two-answer policy is
for the three rewarded gameplay consumers. Original pending trial/history is
byte-identical through the Practice checks.

Google native regression: **6 flows**, using the actual generated receiver with
simulated external Google services. Includes a real game question, help/retry,
explicit consent, a lost ACK after flush, offline/reconnect, root reload, tick and
comment edit/untick, duplicate prevention and phone layout. The receiver unit test
accepts two wrong answers with More Hint but no Hint, preserving Answered=1,
Wrong attempts=2, Revealed=true and no independent success. Forged correctness is
rejected. No live Google account, quota or deployment has been validated.

Maintenance simulators now stop failed trials, exclude tried event answers and
account for only actually claimed artifact Gold. Historical reports keep their
original inputs/results. The new canonical trace golden and Rest/Boss action
boundaries are documented; no card/enemy/economy values or measured pupil targets
were retuned.

Final full-suite result: **793/793 passed**, 0 failed, 0 cancelled and 0 skipped,
serial concurrency1; 395806.805ms. [Actual full output](../verification/game-questions-2-31-3-full-test.txt).

Production and integrity checks currently pass: **685 production files** identical
to dist, **78 runtime resource hashes** match all three entry pages, and **706
protected files**, including all **606 original assets**, remain exact against the
base. Authored bank/choice/source/translation content and numeric owners are in
that preserved set; only the versioned policy and UI dictionary are intentionally
excluded. Receiver is regenerated (106721 bytes); the existing Google deployment
must be updated as described in the [owner guide](GAME_QUESTIONS.md).

Review: no outstanding P0/P1 issue found in the verified flows. Ready for branch
preview; Ijamm's usability review, physical Windows/
phone testing and the live Google deployment remain separate from automation.
Main is outside this task's publication scope.

Actual screenshots:

- [Soalan dan langkah seterusnya — BM](../verification/game-questions-2-31-3/artifact-question-ms.jpg)
- [Salah pertama dan Open Help — Predict](../verification/game-questions-2-31-3/predict-retry-en.jpg)
- [Bantuan pada telefon — BM](../verification/game-questions-2-31-3/artifact-help-ms.jpg)
- [Keputusan dan langkah kerja — event BM](../verification/game-questions-2-31-3/mystery-result-ms.jpg)

Reproduction: `npm test`, `npm run check`, `npm run build:prod`,
`npm run test:game-questions-browser`, `npm run test:game-question-render-browser`,
`npm run test:google-sheets-browser`, `npm run test:education-practice-browser`.
QA uses Node24.19.0, jsdom26 and Chromium138; browser web security stays enabled.
[Machine-readable evidence](../verification/game-questions-2-31-3.json).
