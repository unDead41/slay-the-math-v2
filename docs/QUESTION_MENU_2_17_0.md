# Question menu — 2.17.0

Ijamm requests internal scrolling instead of artwork zoom when Hint/More Hint grows, an Ink question menu with a compact rich-text legend, and separate current-run/lifetime coverage.

## Result

- Artifact and Mystery encounters occupy the available viewport below the actual header. Their question panels scroll vertically, including on phone and landscape layouts. Artwork stays within a fixed scene. A stable encounter key preserves panel scroll through selection, Hint, review and other rerenders; new questions/runs start at the top. Focus still brings newly opened guidance into view.
- Live questions use the folio Ink palette. A small, translated Math term / Game term / Calculation legend uses the existing pink dashed, green dashed and purple dotted key. Education Practice and the existing hosted folio default to Ink; its Page style control remains available.
- **This run** counts distinct IDs in this run's Artifact completion/pending records and Mystery settlement/pending records. New Run starts at 0/120; opening its first question gives 1/120. Hint, wrong answers, language changes and reload do not increment coverage.
- **Lifetime** displays the retained union of profile exposure IDs. Old 36/120 history remains lifetime history, without appearing as 36 questions opened in a new run. Learning Progress explains the two records. Lifetime belongs to the same browser/origin, and Export retains the established accumulated exposure history.
- Existing run receipts supply the run count, so there is no extra counter or save migration. Existing question selection/no-repeat behavior, unfinished reservation recovery, assessment, deadlines, rewards and transaction validation remain unchanged. Education Practice still has its separate learning/review record.

## Verification

215 Node/jsdom tests pass, 0 failures and 0 skipped. Build regenerates the current entry points, question language, folio and portable file; syntax checks pass. Added regression coverage exercises prior 35-question history -> current run 1/lifetime 36 -> reload/support -> New Run 0/lifetime 36 -> next question 1/lifetime 37. Combined Artifact/Mystery counts persist through settlement and older saves. A pre-existing randomly selected BM prompt check compared raw MathML text spacing; it now compares content without presentation whitespace.

The actual user's browser was inspected before the fix: viewport 2560×1305, document 2505px, artwork 2426.86px tall, panel overflow visible. In managed Chromium QA, the same viewport after the fix has a 1305px document and 1227px artwork before/after Hint. At 1280×720 the artwork remains 642px while panel content grows from 1324px to 1773px after Hint and 2229px after More Hint. Worked steps and BM switching also retain scene geometry. Artifact and Mystery phone 390×844 and landscape 844×390 checks have no document overflow and internally scrolling panels.

[Geometry evidence](verification/question-scroll-2-17-0.json) · [Ink screenshot](verification/question-menu-ink-2-17-0.jpg)

The after-fix QA uses real engine-generated fixture saves and real game scripts/styles. The user's Windows checkout has not been modified locally by this session; it needs to pull the published main commit and refresh. Native sharing, full Windows browser execution and OS behavior are outside this change's verification.
