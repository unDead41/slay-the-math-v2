# Education Practice — 2.14.0

The main menu now opens **Education Practice** without creating or replacing a run. It uses the reviewed 120-question folio, backed by the same active bank as Artifact trials and Mystery challenges.

## Content and sources

Question Bank 1.6 (`form4-review-1.6.0`) replaces the earlier 1.4 bank content. All 120 question IDs, seeds, choice IDs, letters, order and correct keys remain stable. Prompts, explanations, support and teaching definitions adopt the reviewed package. `modules/mechanics/question-alignment.json` records those compatibility checks rather than claiming the old wording is unchanged.

The attached English/BM Form 4 textbooks and DSKP are identified by filename/hash and exact PDF/printed page references in the bank's `sourceRegistry` and per-question `harmonization.sources`. Original source mapping, report and discrepancies are retained under `modules/mechanics/source/QUESTION_BANK/harmonization/`. These are authored learning items, not official KPM questions or proof of complete DSKP coverage. Textbook pages are not redistributed.

The host continues reconciling the nine Artifact definitions to the actual engine. The same reconciled STM_SHARED registry builds the game and practice document. Question teaching definitions do not replace canonical Artifact effects or numbers.

## Player flow

- **Review questions:** browse all 120, filter by topic/difficulty/text, answer, reset or view a solution.
- **Learning session:** save the current question, support events and practice evidence; reserve unseen questions adaptively. No automatic recycling.
- Wrong answers give specific feedback. Opening Hint then submitting a wrong answer unlocks More Hint. A wrong answer before Hint does not unlock it retroactively.
- Full solutions follow a correct answer or the explicit **View solution & finish** action in practice. Worked steps stay behind **Show Steps**. Artifact claims still require a correct answer and the existing final Claim transaction.
- Basics checks are unscored. Underlined terms support pointer, keyboard and tap; English/BM teaching meanings are available in the folio.

The original `?` cells were authored unfinished workspaces, not editable table inputs. Following Ijamm’s latest two screenshots, **Hint 1 now displays the actual values immediately** in every table/Venn diagram. The coin/die table shows all eight pairs, including `(H,1)` through `(T,4)`, without `?` cells. Other tables show their calculated reference values; Venn regions show their elements/counts. Truly unspecified regions say **Not given** rather than inventing a value. Answer ticks/shading and the Venn “Included in answer?” column remain part of the completed solution. More Hint keeps these filled values and adds the authored detailed method. The final answer panel and Claim still follow their normal state gates. This supersedes the earlier unfinished-workspace/one-cell proposal.

Artifact and Mystery question screens also include the harmonized context, Given/Find and source references. Editorial source notes that could disclose the answer appear only after the question closes. Existing Mystery deadlines, penalties and single-attempt rules remain specific to Mystery; practice has no timer or combat reward.

## State and build ownership

Practice uses `slay-the-math.education-practice.v1`. It never merges into the rewarded exposure key `duel-cube-question-history.v1` or the active run `duel-cube-math.v1`. Review lives for that open practice page; Learning survives leaving/reloading. Returning to Main Menu restores focus to Education Practice; Continue resumes the original run.

The folio runs in its own same-origin document so its layout and tooltip owner are isolated from the game UI. Its generated template receives the active `STMMechanics.data` when opened, so there is no second question bank to maintain. CSP blocks external resources. No runtime dependency or account is added.

Save/profile readers accept the previous shipped bank versions 1.0/1.4 and compatible 1.5 alongside 1.6. A real 1.4 pending-trial fixture verifies attempts, choice order, support and exactly-once Claim remain valid.

`npm run build` regenerates mechanics, the practice template and the offline game. `npm test` builds first because its existing portable tests consume that output. The old tracked portable HTML was stale and lacked current motion assets. A current full build is about 228 MB, exceeding [GitHub's 100 MiB per-file limit](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github); `MAIN-SEKARANG.html` is now an ignored local build output. All source/assets remain in Git. `npm start` plays the updated game directly; `npm run build` creates the single offline HTML locally.

## Verification

Actual results and screenshots are recorded in `docs/verification/education-practice/`:

- `npm test` with jsdom supplied through `DOM_QA_MODULE`: **184 passed, 0 failed, 0 skipped**. Its pretest regenerates the complete build.
- `npm run check`: every game script and the generated practice template pass Node syntax checks.
- `tests/education-practice-browser.cjs`: **all 120 questions** exercise wrong-before-Hint locking, filled Hint 1, later wrong/More Hint, correct answer, three worked steps and completed visuals. Diagram IDs remain unique across Hint/More Hint/solution. Five widths (320, 390, 844, 1280, 3440) have no page overflow. Pending practice survives reload and active run/rewarded history stay byte-identical. The real single offline HTML opens practice with 120 questions and zero HTTP requests.
- `tests/map-integration-browser.cjs` in mechanics-only mode: actual Artifact Claim, wrong feedback, support/reload, Basics, skill evidence and exactly-once reward; all **120 questions, 240 visual stages, 360 wrong feedback entries and 120 More Hints** render in Chromium.
- `tests/menu-fit-browser.cjs`: **11 viewports**, six menu actions, original scene lifecycle, keyboard/focus, dialogs and saved-run preservation.
- `tests/mystery-browser.cjs`: **30 correct paths** (15 events in both stages), **15 incorrect paths**, six widths and timer/reload/support/settlement checks.
- `git diff --check`: clean.

Physical Windows/browser-device testing is outside this automated Linux/Chromium check.
