# Learning Report preview — education-report

Version **2.31.0-report.2**, based on main **d76ad6e / 2.30.0**. Ijamm requests branch-only publication; main is not updated.

## Player flow

- **Overview / Ringkasan:** answered occurrences, different question IDs, first-try answers without help, chapter tracks and revision suggestions.
- **Details / Perincian:** help/retry/wrong counts, SK/SP, recent sessions and question history. Show answered questions first; choose all 120 IDs or search an ID when needed.
- **Sharing / Perkongsian:** opt-in consent, pending/received/offline state and one JSON backup under **Data and backup**. Raw receiver addresses/errors and URL setup controls do not appear in the player's report.
- Question comments and the exit popup use **Sharing settings / Tetapan perkongsian** to open this same view. Comment text and its local save/delete behavior stay unchanged. No in-game CSV download/import/native CSV-sharing controls remain; ordinary game-save import/export stays available.

The JSON backup remains for offline/quota/corrupt-storage recovery. It includes known learning evidence, comments, the current destination's pending entries and current owner recovery; it excludes device capabilities and credentials. It is not a combined export of every old destination journal. The game had no CSV importer; the removed CSV UI was export/native file sharing. Historical pure CSV formatters and the external collector export tool remain compatible, outside the player flow.

## Education Practice update

All120 questions now have an independent **Reviewed / Sudah disemak** checkbox. Use the list filters for Not reviewed, Reviewed or With feedback, or search a question ID. Switch between Question and Feedback to reach the comment without scrolling through every hint/solution. Language, mode and saved-session controls are under Practice options. No player CSV/import or Google URL setup is added.

Review marks do not count as correct answers, mastery or run exposure. Comments remain editable without a tick; unticking keeps them. They use the existing consent/offline queue and private Google Sheet. The Sheet's Comments → Question value starts with `[REVIEWED] ` for a ticked entry; the original free-text comment remains unchanged. No new receiver field or redeployment is needed. [Full guide and latest verification](education/PRACTICE_WORKSPACE.md).

## Developer setup

Run `npm.cmd start dev`, open `http://localhost:4174`, turn **Dev ON**, then **Open Developer Hub → Education collection**. Paste the Apps Script `/exec` URL and choose **Save Google Sheets connection**. This changes only the public project default in `dist/learning-collection-config.js`. Test actual collection using the player command `npm.cmd start` on port 4173. To distribute the setting, rebuild `release-prod` with `npm.cmd run build:prod` and publish that build.

The configuration endpoint is development-only, loopback-only and same-origin. It validates the existing strict Apps Script URL format, rejects stale edits and writes only the known configuration file by atomic replacement. It does not read player saves or send Google records. Sandbox progress stays temporary.

The receiver address is public browser configuration, not a secret. Google Sheet ownership/access remains private. Existing browser destination choices, credentials, consent, acknowledgements and old journals are retained. A player may explicitly adopt the organiser's current Google default; doing so pauses sharing and carries observations into the new destination without inheriting old receipts.

The supplied receiver now has selectable `setupCollector` plus private `setupCollector_`. Keep both names unchanged. The public entry checks active/effective Google account identity before setup and returns no private Sheet URL to callers. Existing deployment URLs from the already-delivered setup correction can be reused; the receiver protocol has not changed. Full setup: [Google Sheets guide](GOOGLE_SHEETS_SETUP.md).

## Try this branch on Windows

Stop the old server with **Ctrl+C**, then run in the project folder:

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git stash push -m "backup-before-education-report"
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

Use the same browser and `http://localhost:4173` address to retain local player records. Previewing this branch may add real local learning observations when you answer questions, just as the current game does. Switching code branches does not clear browser storage.

## Verification

The work began with **42/42** targeted tests on unchanged main. The final regression, native browser geometry/offline checks, generated asset hashes, preservation checks and review are recorded in the branch verification document. Native Google tests simulate Google service boundaries; local checks do not establish live Google deployment success, classroom access, quota or physical Windows/device behavior. No artwork, combat/balance, question content, RNG or save-schema changes are part of this preview.
