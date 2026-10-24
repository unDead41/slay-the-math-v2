# Reports after a game question and clearer guidance

Main release **2.38.0**, 24 October2026. Ijamm explicitly authorizes merging the
reviewed education-report preview into main. This replaces the earlier
branch-only publication boundary; live Apps Script deployment remains an owner
step. The preview originated at990541d and is integrated with current
main37558d5, preserving Settings-only Developer controls.

[Current main release and fresh combined-tree verification](MAIN_2_38_0.md).
Historical report4 test results below describe that preview; the main guide
records fresh integration checks separately.

## Player flow

After a bank Predict, Artifact or Mystery question reaches Result, select
**Report a problem / Laporkan masalah**. The form fills the question ID/prompt,
question source, language, and the Hint/More Hint/worked steps actually opened.
Select a category, optionally write a comment, and select **Save report**.
**Back to result** returns focus to the original button and leaves the result
available for its ordinary Continue/claim action.

Reports have the same on-device owner and revisioned delivery queue as Practice.
Existing comments and player Reviewed ticks remain available; the game form
preserves a prior tick and does not present it as a developer decision. Ticking
Reviewed later in Practice preserves the original report language/source/help;
auto-saving an unchanged form does not silently replace that context. Worked
steps count as opened even if the player later hides them. Saving
does not enable sharing. Learning Report → Sharing remains the player's consent
and retry control. Offline reports stay pending and retry when the game is open
and a connection is available. A local/server receipt means collector acceptance,
not a claim that a developer has already read the comment.

The button is available only after resolution. Opening/saving/closing a report
does not change attempts, help use, question sampling, HP, Focus, seals, artifact
ownership, Mystery deadlines/consequences or the game save. The form is locally
scrollable, supports Escape and restores focus. Tutorial exercises do not send
real game reports; developer sandbox collection remains disabled.

## Private developer workflow

The existing private Google Sheet gains **Issues**, grouped by Question ID and
category. It shows active reports and **Pelapor unik (peranti)**. This is a count
of distinct device IDs, not verified people. Retries and newer versions of one
entry do not create extra reports. Multi-category comments contribute to each
selected category; tick-only/deleted feedback does not count as an active issue.

Edit **Status** directly in the private Sheet:
**Baharu → Sedang disemak → Selesai**. Developer notes and Fixed in version are
retained across refresh. New substantive active evidence can reopen a solved
issue; replay, older revisions, tick/timestamp changes or removal-only edits do
not. Rows with zero active reports retain their developer history.

There is no player API to read Issues or edit developer status. Owner editor
actions check the active/effective account, and the existing public collection
RPC remains status/register/batch. [Complete private Sheet guide](GOOGLE_ISSUES.md).

## Update the existing Google receiver

1. Copy the **whole current** `integrations/google-sheets/Code.gs` into the same
   Apps Script project. Keep the actual allowed origins, Script Properties and
   existing Spreadsheet/deployment.
2. Select **setupCollector → Run** in the editor using its owner account. It
   updates headers and adds Issues plus its hidden signature tab without erasing
   existing records. **refreshIssueBoard → Run** refreshes older Comments too.
3. Use **Deploy → Manage deployments → Edit → New version → Deploy**. Retain the
   same `/exec` URL. No new database, Sheet or collection project is required.
4. Enable sharing in a test game, submit one report, and check Comments and
   Issues. Test offline/reconnect before using the receiver with pupils.

The older receiver does not accept the new gameplay feedback context. Reports
remain pending until it is updated; use Sharing → Retry after updating. The
repository update does not deploy an Apps Script project or certify Google
account/organisation/quota behavior. Automated tests simulate those services.

## The 120-question clarity pass

All 40 PROB, all 40 SET and all 40 LOGIC items were reviewed in English and Bahasa
Melayu against the focused cited pages of the three supplied PDFs. The audit
records 61 distinct EN pages, 57 BM pages and 9 DSKP pages. These are selected
source pages, not a claim of rereading all three books.

The rubric is:

- **Question:** clear givens/task, explicit conditions and notation; preserve
  mathematical meaning, original numbers, choices and verified answer bindings.
- **Hint:** identify the concept and the first approach in ordinary language.
- **More Hint:** add a concrete next step, partial calculation or case test using
  the given data. Leave the final calculation/choice/verdict to the learner.
- **Reference:** retain provided values. Do not copy a computed target, selected
  answer-case column, truth verdict or answer-bearing accessible SVG title from
  the completed solution into pre-answer help. Use a filled given-data table or
  unevaluated setup; never reintroduce question-mark cells.

All 120 prompts were retained after review. **English: 66 Hint texts and 53
More Hint texts; BM: 65 Hint texts and 54 More Hint texts** were refined. **63 Hint references** were replaced with reviewed
scaffolding; safe filled references remain. Solution diagrams and all original
full English/BM solutions remain unchanged. Reference SVG titles are now derived
from their actual reference heading, not an inherited solved-result title.
Rich-text/MathML projections remain aligned; fractions retain real fraction bars.

Keep `bankVersion: form4-review-1.6.0` and all stable IDs so earlier comments,
Reviewed ticks and learning evidence remain readable. Record the compatible
editorial revision explicitly as `contentRevision: clarity-2026-10-24.1`.
Ordinary builds use the canonical bank. They do not replay the historical audit
and overwrite later author edits. The one-shot application tool is
`tools/apply-question-clarity.cjs`; its review inputs are the three topic JSONs.

The Logic source review records inconsistent examples concerning validity and
soundness in the supplied textbook pages. The bank retains the DSKP/form-based
validity distinction and its explicit valid-plus-true-premises soundness rule;
it does not silently copy a contradictory example. See the detailed Logic audit
for the exact pages and rationale. Teacher review remains appropriate there.

[Source files/page coverage and change counts](../verification/question-clarity-sources.json),
[Probability audit](../verification/question-clarity-PROB.json),
[Sets audit](../verification/question-clarity-SET.json),
[Logic audit](../verification/question-clarity-LOGIC.json).
Editorial/source checks do not establish that every pupil understands every
hint; reports and classroom review remain evidence for further improvement.

## Run main on Windows

Stop the old server with Ctrl+C, then run:

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git stash push -m "backup-before-education-main-2.38"
    if ($LASTEXITCODE -ne 0) { throw "Backup gagal." }
    git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "Fetch gagal." }
    git switch main
    if ($LASTEXITCODE -ne 0) { throw "Gagal tukar branch." }
    git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw "Pull gagal." }
    npm.cmd start
}
```

Open **http://localhost:4173**, check **v2.38.0**, and use Education
Practice for all 120 questions. For a game report, finish a Predict/Artifact/Mystery
question and open Result. Keep the stash until its contents have been reviewed.

## Verification

Final results are recorded in [the structured verification](../verification/feedback-clarity-report4.json)
and [the focused branch audit](../audits/education-report/LATEST.md).

The final frozen-runtime serial suite passed **947/947**, with zero failures or
skips. Native checks passed six report flows/18 geometry states, six full-app
question flows/18 geometry states, **720 bilingual component states**, **eight
Google boundary/reconnect flows**, all120 Practice progressions plus portable
boot, offline BM game reporting, Tutorial/portable and the production Dev Hub.
The collector services were simulated; no live Sheet deployment is claimed.
The checks include real six-consumer/language report and question flows; all 120
components in both languages; actual nested-origin Google/offline/reconnect;
legacy comments/ticks; reference/solution identities; production, portable,
tutorial, cache/source checks; and the complete serial Node/jsdom suite.

Physical-device/classroom and live Google deployment validation are separate.
MODEL.zip was unavailable; no character-model reference review is claimed.
