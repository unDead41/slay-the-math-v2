# Current main integration — 2.38.0

Ijamm now authorizes main publication. The latest integration audit, exact parents,
resolved conflicts and fresh tests are maintained in
[MAIN_2_38_0.md](../../education/MAIN_2_38_0.md). The report4 branch audit below is
retained as historical evidence; its earlier branch-only boundary is superseded.

# Education report and clarity — focused branch audit

| Field | Snapshot |
| --- | --- |
| Date | 24 October 2026 |
| Repository | unDead41/slay-the-math-v2 |
| Authorized target | education-report only; no main merge or live Google deployment |
| Runtime base | 990541d57c6df96cefb21eddc7a365d1d989a74d, game2.37.0 |
| Previous remote branch | af03f38ca252c17b72ed55d4dd779b00e7923d52 |
| Main rechecked | 6376a222169815af582cf55aa4794f3c809a3515 |
| SOR read | 1.1.0 at the initial base; latest1.2.0 and its main audit read before final publication |
| Proposed snapshot | 2.37.0-report.4 working-tree diff; published SHA verified in final handoff |
| Status | VALID within the tested education scope; live Google/physical devices remain BELUM DISAHKAN |

The old education-report work is already merged through main50d3af4. This
branch fast-forwards that ancestry to runtime base990541d and adds the requested
education work. Main's newer6376a22 commit changes six documentation files only;
its exact compare was read. The branch is behind that documentation commit,
which is distinct from a demonstrated functional incompatibility. This preview
does not overwrite main. Main audit DOC-001/DOC-002 (stale AGENTS topic/MC
summaries) remain open outside this task; current vision/design owners and
Ijamm's actual education scope take precedence. MODEL.zip was unavailable;
original game artwork is retained and no model-reference audit is claimed.

## Before/after findings

| Category / ID | Priority / confidence | Evidence, affected files and outcome |
| --- | --- | --- |
| MASALAH DISAHKAN / EDU-001 | P1 / high | Pre-answer support selected a completed solution table and inherited answer-bearing SVG title for affected bank items. `learning/support-visual.mjs`, `visual-renderer.mjs` and canonical bank now use 63 reviewed given-data/unevaluated references and safe reference titles. All120 original answers/facts and full EN/BM solutions remain bound to their baseline. |
| MASALAH DISAHKAN / EDU-002 | P2 / high | Finished game results previously had no direct feedback control. `dist/mechanics-host.js`, three real consumers and new `dist/question-report.*` now provide Result-only, bilingual reporting with a frozen ID/language/source/help context and unchanged game saves. |
| MASALAH DISAHKAN / EDU-003 | P2 / high | Existing receiver projected individual Comments without the requested developer action list. `tools/google-sheets/receiver.gs` now groups private Issues by question/category, counts distinct devices and preserves owner status/notes. Player review markers do not control triage. |
| MASALAH DISAHKAN / EDU-004 | P2 / high | A current false steps flag lost the fact that steps had been opened then hidden; later Practice review ticks could replace a game's report context. The canonical feedback owner now derives ever-opened steps from events and preserves context on tick-only changes. Unit and final actual Google flow cover these cases. |
| MASALAH DISAHKAN / QA-001 | P3 / high | One legacy harmonized test assumed the first SET017 reference row meant outside-region missing data. It now checks actual semantic rows, supplied values13/11/5 and the unevaluated union setup, plus SET009's genuinely unspecified region. Focused8/8 passed; no supplied values were invented. |
| RISIKO BERPOTENSI / GOOGLE-001 | P1 / high | An older deployed receiver rejects the new gameplay feedback context. Copy the whole generated Code.gs into the same owner project and deploy a new version before expecting game reports in the live Sheet. Current code retains unacknowledged reports. No live account/deployment is available here. |
| RISIKO BERPOTENSI / SOURCE-001 | P2 / medium | Supplied Logic pages contain contradictory validity/soundness examples; exact EN84–85/BM76–77 PDF pages are recorded in the Logic audit. Retain explicit DSKP/form-based validity and valid-plus-true-premises soundness. Classroom/teacher understanding remains to be assessed. |
| PENAMBAHBAIKAN / EDU-005 | P2 / high | Requested staged scaffolding implemented across all120: Hint introduces concept/approach; More Hint adds concrete next calculation/case without printing the final target/verdict. EN66/53 and BM65/54 texts refined. Editorial review is not proof of every pupil's understanding. |

No additional issue was found in the checked scope. No unrelated card/balance,
RNG, save identity, artwork, player CSV or public issue-management API change was
introduced. Unique device IDs are not claimed as verified pupil counts.

## Verification and limits

[Final structured evidence](../../verification/feedback-clarity-report4.json),
[source coverage](../../verification/question-clarity-sources.json),
[owner/player guide](../../education/FEEDBACK_CLARITY.md) and
[private Google guide](../../education/GOOGLE_ISSUES.md) identify actual checks,
source pages, files and manual receiver update steps. The final frozen-runtime serial suite passed947/947 (zero failed/skipped).
Native verification passed six report/18 geometry states, six full-app question/18
geometry states,720 bilingual real-component states, eight Google boundary flows,
all120 Practice progressions and portable boot, BM portable reporting, Tutorial
plus portable, and production/static Dev Hub. The eight Google flows include a
resolved issue that remains resolved after Practice changes language and ticks
Reviewed; original game language/prompt/help remain unchanged. Original607 artwork/audio files,15 protected
runtime owners, full EN/BM solutions, tutorial runtime captures, generated cache
hashes and production parity are checked against the stated base.

Google Sheets/Apps Script services are simulated in automated boundary tests;
no live Google deployment, physical-device or classroom validation is claimed.
The 720-state render check uses actual consumer components in both languages,
with the app controller omitted; separate full-app flows cover all three
consumers. Test harness selector mistakes during added Google scenarios were
corrected and rerun; those timeouts did not demonstrate a product defect.

Final code/data diff and whitespace were checked. The remote feature ref
remainedaf03f38 before publication; latest main6376a22 had no runtime delta.
Only the education-report ref is authorized to move. After the authorized branch push, verify
remote tree/package/ref and record the published SHA in the user handoff.

## Publication readback and later main update

Published runtime commit: `3ba47d424329fc647b86895e3e37d5a8f40ad305`.
Remote tree: `7a4ad5905edb84de71c9c737d835728417f9a735`; remote package version:
`2.37.0-report.4`. Exact feature ref/tree/version and the matching local index
were read back after the non-forced, expected-SHA branch update. Tracked files
were clean; the two unrelated map-trial temporary files were retained.

During that final readback, main had independently advanced from 6376a22 to
`37558d5a53d62e457c076b2444a1b71e8b42e50b` (2.37.1). Its three-commit delta was
read through the GitHub compare API. It changes Developer controls to Settings
only, their access copy/browser checks, release entrypoints/version and related
SOR/audit documents. It does not change the question bank, hint/localization
owner, game Result controller, feedback validator, Google receiver or delivery
owners. This preview retains its explicitly tested 990541d runtime base and the
old Dev-control placement; it does not undo the newer main branch.

Git divergence is distinct from an education defect: this branch's reported
947 tests and native checks apply to its published runtime, not a hypothetical
merge with 2.37.1. A future main integration must preserve the newer Settings-only
Developer implementation, resolve version/generated launchers/SOR deliberately,
and verify that combined tree. Combined 2.37.1 integration remains BELUM DISAHKAN;
no main merge is requested or performed here. This final note changes audit
text only and does not change the tested runtime or version.
