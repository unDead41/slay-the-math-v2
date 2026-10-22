# Question feedback — Education 2.15.0

Education Practice on Main Menu now places an improvement form below every question. All 120 questions can be tried and commented on without starting a dungeon run. This update stays on `education`.

## Player experience

The form says **“Yes, we do read your comments.”** Players can select multiple categories: unclear Hint, unclear More Hint, too difficult, confusing question, disordered worked steps, unclear diagram/table, or something else. A plain-text comment is optional, with a 2,000-character limit. A category alone is valid. Edits save automatically; **Save comment** confirms them. Returning to a question shows its saved comment for editing.

**Main Menu** in the game wrapper and **Finish practice** inside the folio open the same native exit dialog. It explains that comments help improve questions, hints, diagrams and worked steps; shows the total; offers download/share; and lets players keep reviewing or return to Main Menu. Cancelling retains input and focus. The game accepts a close message only from its actual same-origin folio frame.

## Collection and delivery

Comments are saved on this browser/device. They are **not automatically sent** to Ijamm, even when internet is available. No receiving address, server or account is configured by this update, and the interface states this explicitly beside export and in the exit dialog.

- **Download comments (.csv)** exports all saved question comments in an Excel-friendly UTF-8 file, with quoted multiline text and spreadsheet-formula neutralization.
- **Download JSON** preserves the structured report for later analysis/import.
- **Share comments** uses native file sharing when the browser/device supports it. The player chooses the recipient/app. Otherwise it downloads the CSV with instructions to send it to Ijamm. Cancelling sharing keeps every comment.

Players can save and download offline, then send the file via their preferred app when connected. This creates a concrete collection path without implying that unsent comments have already reached the developer. Downloading or sharing does not clear the local copy.

Each export records question ID, bank version, topic, difficulty, question text, selected categories, comment, timestamps, practice mode, question state and opened support. No name, email, run save, combat history or device identifier is requested/exported. One editable entry is kept per question and bank version.

## Storage and build

`slay-the-math.question-feedback.v1` is separate from learning progress, rewarded exposure history and active run saves. Resetting Review or Learning does not clear comments. Writes merge fresh browser data to preserve other questions edited in another tab. Corrupt stored comments are kept rather than overwritten. Storage/quota failure retains new comments in memory and displays a download-before-leaving warning.

The canonical source modules are `learning/question-feedback.mjs`, `learning/question-feedback-ui.mjs` and `learning/question-feedback.css` under `modules/mechanics/source/QUESTION_BANK/`. The existing builder embeds them in the isolated folio and the portable game. The live bank remains 1.6 with the same stable answers, curriculum references and filled Hint values. No runtime package or network request is added.

## Verification

The 2.15 checks cover all 120 independent forms, persistence after reopening, edits, multi-category comments, empty input, storage failure/recovery, corrupt-data preservation, cross-tab merging, CSV safety, native-share cancellation/fallback, and preservation through Hint/Review/Learning reset. The host test rejects unrelated frame/origin close messages and preserves the saved run.

Real browser QA exercised Main Menu → Education Practice → comment → exit popup → cancel/confirm → reopen. A 390px game frame verified the form and exit dialog fit without horizontal overflow. Automated native-share tests use stubs; OS-specific recipient selection and physical Windows/mobile testing remain manual. Result details: `docs/verification/question-feedback/report.json`.
