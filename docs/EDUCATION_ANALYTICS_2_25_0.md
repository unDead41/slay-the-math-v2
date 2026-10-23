# Education analytics preview — 2.25.0-analytics.1

Historical branch guide. Ijamm subsequently authorized main integration as 2.26.0. Use the [current main update and backend guide](EDUCATION_ANALYTICS_2_26_0.md) for setup; the branch/version instructions below describe the original preview.

Feature branch: `education-analytics`, based on main 2.24.0 (`2800f9a`). This release is for review before any integration into main.

## Try the branch on Windows

Stop the old server with Ctrl+C. Keep any local edits before changing branches:

```powershell
git status -sb
git stash push -m "backup-before-education-analytics"
git fetch origin education-analytics
git switch -c education-analytics --no-track FETCH_HEAD
npm.cmd start
```

Fetching this branch explicitly and creating it from FETCH_HEAD also works for a checkout configured to fetch only main. If your local education-analytics branch already exists, use `git switch education-analytics` followed by `git pull --ff-only origin education-analytics` instead of the creation command. Do not restore an old stash over generated files just to start the game. The stash remains available for a separate review.

Open `http://localhost:4173` and choose **Learning Report** from Main Menu, Settings or Education Practice. The version on the menu must read **v2.25.0-analytics.1**. Close older game tabs before testing this branch.

`npm start` continues to serve the ordinary game. Reports, comments, offline recording and downloads work without a database. No package installation or login is required.

## Try collection and reconnection

The optional receiver requires **Node.js 22.13 or later** for its built-in SQLite module. Stop the ordinary server first, then run:

```powershell
node -v
npm.cmd run start:analytics
```

Use the **same** `http://localhost:4173` address so browser records remain available. Open Learning Report and choose **Enable sharing** / **Aktifkan perkongsian**. It sends recorded attempts, guidance use and question comments to this receiver; no name, email or account is requested. Sharing starts off.

1. Answer questions and save comments with sharing paused or while disconnected.
2. Records remain on the device, with a visible pending count.
3. Reconnect with the receiver running. The open game retries; **Send pending records** also retries immediately.
4. If the game was closed offline, reopen the same address. Sending resumes then, not while the browser is closed.
5. The queue clears only for the exact revision confirmed after a SQLite commit. Editing a comment while an earlier version is being sent keeps the new edit pending.

Localhost does not need Wi-Fi: the game and receiver can run on one PC offline. A receiver hosted on another computer needs a reachable connection. A live Wi-Fi indicator alone does not mean a receiver is configured. The ordinary static server or portable HTML cannot collect data centrally; the UI keeps local records and offers exports.

Production builds reject SQLite/DB files accidentally placed in the public game tree before copying any release files.

The receiver binds to `127.0.0.1` by default. Its data is in `tools/analytics/data/education.sqlite`, outside the public game files and ignored by Git. Leave the terminal open during collection. Closing the terminal stops the receiver; it does not delete the database. No cloud service, public deployment, class roster or teacher account is created by this branch.

For a later managed deployment, an operator can set `STM_ANALYTICS_DB`, `STM_ANALYTICS_HOST`, `PORT`, and the exact external `STM_ANALYTICS_ORIGIN` when a reverse proxy changes the public origin. Do not place the database inside `dist` or `release-prod`. A school deployment needs its own hosting, access/retention policy and backups; this branch does not silently configure these.

## Extract records

Players can download CSV or JSON from Learning Report even without a receiver. JSON contains the full local evidence, saved comments, pending sending records and an owner-session recovery snapshot; it excludes collection credentials. Recovery snapshots are local exports only and are never enqueued for transmission. Existing per-question comment CSV/JSON downloads and native Share remain available.

The receiver operator can export the collected database from a second terminal:

```powershell
npm.cmd run analytics:export -- --format json --output education-data.json
npm.cmd run analytics:export -- --format csv --output education-data.csv
```

Use `--db C:\path\education.sqlite` if the receiver uses a different database. Exports include client identifiers and submitted diagnostics, without client secrets or secret hashes. There is no public HTTP route to download everyone's records. Keep exported player data out of Git.

## What the report means

| Item | Meaning |
| --- | --- |
| Questions answered | Occurrences with at least one actual submitted answer, including an unfinished wrong attempt. |
| Wrong attempts | Wrong submissions, not the number of different weak topics. |
| First try, no help | First submission is correct before Hint, More Hint, Basics or an answer reveal. |
| Correct with help | A correct answer using the owner's ordered guidance evidence. |
| Correct after retry | A correct answer after an earlier wrong submission. It can also be counted as correct with help. |
| Answer revealed only | Solution shown with no submitted answer; excluded from answer accuracy. |
| Different questions | Distinct canonical question IDs, separate from repeated occurrences. |
| Steps opened | Steps were opened at least once, including when subsequently closed. |

Chapter bars show independent first-try answers divided by answered occurrences. Empty topics show **Not assessed**. Groups with fewer than three different answered questions show **Not enough evidence**. Suggestions require enough distinct evidence and link to the actual Basics lesson and related questions. These are practice diagnostics, not official DSKP Tahap Penguasaan or a formal weakness diagnosis.

Default **Game + Practice** excludes Review, where answers may be exposed. Review can be inspected separately. New Run creates a new occurrence context; Retry preserves its run identity and does not recount carried answers. Explicit Learning reset or Restart Review creates a new session while preserving earlier evidence. Rerendering, opening a report, changing language, exporting and reloading do not create attempts.

The report observes existing ordered owner events rather than rewriting questions. An older save is captured when first observed; timestamps describe capture time. The system does not invent past answer times, elapsed answer durations or historic attempts that were never stored. Current-run filtering excludes inherited lifetime-only records. The game and Practice keep their existing separate question selection and save ownership.

## Curriculum sources

The bank remains `form4-review-1.6.0`, with the same 120 stable IDs, seeds, prompts, answers, hints, visuals and BM/English question content. The analytics registry adds readable names for the **28 SPs / 9 SKs already used by this bank**, rather than claiming full Form 4 coverage.

| Topic | Chapter | DSKP printed pages | PDF pages (1-based) |
| --- | --- | --- | --- |
| Penaakulan Logik / Logical Reasoning | 3 | 42–45 | 56–59 |
| Operasi Set / Operations on Sets | 4 | 48–49 | 62–63 |
| Kebarangkalian Peristiwa Bergabung / Probability of Combined Events | 9 | 68–70 | 82–84 |

Source: KPM / Bahagian Pembangunan Kurikulum, **DSKP KSSM Matematik Tingkatan 4 dan 5**, September 2018, supplied as `03-DSKP-KSSM-MATEMATIK-TG-4-dan-5.pdf`. BM SK/SP labels are transcribed from that source; English SK/SP labels are concise working translations. Each registry item and exported aggregate includes source/page metadata. Existing textbook-based question content is not replaced or retranslated by this feature.

## Ownership and limits

- `learning-analytics.js` observes canonical session snapshots and owns versioned learning evidence, session continuity and report/CSV projections. It never reserves a question or consumes game RNG.
- `learning-curriculum.js` owns the selected SK/SP names and source references.
- `learning-sync.js` owns consent, durable pending revisions and exact receiver acknowledgements. The receiver receives only allowlisted canonical evidence/comments. Browser data is client-authored diagnostic data, not anti-cheat evidence.
- `analytics-ui.js` and `analytics.css` provide one escaped Ink report for host and Practice. Dialogs/table regions own scrolling, without enlarging background art. Transport updates preserve keyboard focus and expanded report sections.
- Existing browser storage, comments and gameplay saves stay intact. Unreadable original bytes are preserved. Failed writes retain new records in memory with an export warning. Closing such a page before export can lose unsaved records.
- Learning storage has a 5,000-occurrence bound and pending delivery admits up to 5,000 entries. Simultaneous tab writes can temporarily exceed admission capacity; existing records remain exportable and further additions are blocked with a warning. Quota can be reached earlier; there is no silent eviction. Keep an export/backup instead of relying on unlimited browser storage.
- Records belong to this browser and address. Changing computer, browser, HTTP port or `localhost` to an IP address changes the storage origin. There is no cross-device account sync in this preview.
- Developer sandbox uses temporary storage and blocks collection even when its toggle is off. Ordinary production/portable builds include reports but no developer controls or private database.

## Verification

The final verification record and screenshots are recorded in `docs/EDUCATION_ANALYTICS_VERIFICATION.md` after the targeted review and release checks complete. Physical Windows testing, classroom interpretation and cloud deployment remain outside this branch's automated verification.
