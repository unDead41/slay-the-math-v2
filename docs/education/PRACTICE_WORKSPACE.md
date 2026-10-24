# Education Practice workspace — education-report

Current main integration: [2.36.0 and Windows/Google instructions](MAIN_2_36_0.md). The branch scope/results below remain historical evidence.

User request, 24 October 2026: simplify the 120-question Practice as well as the Learning Report, remove player CSV/import controls, let each question be ticked and commented on, keep the existing Google destination and developer-only setup. Continue education-report; do not update main.

Implementation choice: tick means **Reviewed / Sudah disemak**, independent of correct answers, help and learning evidence. Comments do not require a tick. Provide All / Not reviewed / Reviewed / With feedback filters, a readable question list, and separate Question / Feedback views. Keep the existing quiz, hint gates, Basics, sources, language and optional saved Learning session. Collapse secondary practice controls; remove the parchment switch and oversized introduction. One disclosed JSON recovery action stays in the shared report.

Shiro inspection of the existing source: P1 oversized hero and multiple control rows precede the question; P1 question targets are only 29px high; P1 feedback sits below the full support/solution content. Keep the ink/gold palette, authored mathematics, canonical reducers and shared report. Validate native desktop/phone/short landscape, keyboard, comments, all120 marks, reload, offline/retry and exact Google receipts.

Review flag storage is an optional boolean on the existing local feedback record. Older comments default to false and remain readable. The common DCLearningDelivery boundary used by host startup, Practice and destination replay uses the existing strict feedback schema: a reviewed record adds the stable `[REVIEWED] ` marker to its Question field, keeping the original user comment and all 2000 characters intact. The local original question stays unchanged. No new receiver field/category/protocol, database or Apps Script redeployment is required. Unticking keeps any comment/categories and sends the newer state; unticking an otherwise empty entry uses the existing deletion receipt. Tick-only feedback does not create mathematical attempts, mastery, Focus, rewards or run exposure.

Receiver configuration remains in Developer Hub. The URL is public browser configuration; the private Sheet stays controlled by its owner. Delivery still requires consent, retains offline pending entries and resumes while the same game is open. Do not claim live Google account/quota validation from simulated services.

Preview version: **2.31.0-report.2**.

Base: education-report 35610a5 (2.31.0-report.1). Main was observed at 6dc3ce3 at task start; do not write it or copy this older feature branch over it. Unknown untracked report temporary files from checkout are outside scope and must not be committed.

## Work

- [x] Baseline existing feedback/report flows, then reproduce missing mark/view behavior.
- [x] Extend the feedback owner and strict-compatible transport; preserve comments and recovery.
- [x] Simplify Practice and implement the per-question list/tick/feedback filters in BM/English.
- [x] Verify all120 flags, deletion/edit/reload, corrupt/quota, consent/offline/Google bridge and native geometry/focus.
- [x] Build and run required serial regression; preserve original assets/core/bank bytes.
- [x] Publish only education-report with current version/cache, screenshots, evidence and guarded Windows commands.

## Try it on Windows

Stop the old game server with Ctrl+C. This block backs up tracked local edits and stops if Git reports an error. The backup stays in stash; do not blindly apply generated files from it over the new build.

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git stash push -m "backup-before-practice-workspace"
    if ($LASTEXITCODE -ne 0) { throw "Backup gagal." }
    git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "Fetch gagal." }
    git switch education-report
    if ($LASTEXITCODE -ne 0) { throw "Gagal tukar branch." }
    git pull --ff-only origin education-report
    if ($LASTEXITCODE -ne 0) { throw "Pull gagal." }
    npm.cmd start
}
```

Open http://localhost:4173 → Education Practice. Check the terminal/menu version **2.31.0-report.2**. Use the same browser/address to retain local marks, comments and existing browser Google destination. Hard-refresh if the old UI remains.

Developer setup: `npm.cmd start dev` → http://localhost:4174 → Dev ON → Developer Hub → Education collection. Reuse the same Apps Script /exec URL; run the player on port4173 for actual collection. A project URL saved only in an uncommitted config file may be in the backup stash; re-enter it in the Hub if needed. Existing browser-specific destinations are preserved. To distribute a changed default, rebuild/publish release-prod. No live Google account is configured by this branch publication.

[Verification and screenshots](PRACTICE_WORKSPACE_VERIFICATION.md). Previous report preview evidence remains historical under docs/LEARNING_REPORT_VERIFICATION.md; it describes report.1, not this new test run.
