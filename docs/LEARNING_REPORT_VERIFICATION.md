# Learning Report preview verification

Branch `education-report`; version `2.31.0-report.1`; base `d76ad6e26ada3b3aea98db0b4d0462f3f6f026a4` (main 2.30.0). Ijamm requests branch-only publication. This change does not publish to main or deploy a Google receiver.

## Result

The same three-view journal is used by Main Menu, Settings and generated Practice. Player CSV/native CSV-sharing actions and receiver URL inputs are removed. One JSON recovery download remains. Developer Hub configures the public project default through a local development-only endpoint. Existing browser destinations and delivery journals survive; adoption of a changed default is explicit and pauses consent.

## Verification

| Check | Actual result |
| --- | --- |
| Unchanged-base targeted report/Practice/feedback/developer tests | 42 passed; 0 failed/skipped |
| Syntax (`npm run check`) | Passed on corrected source/generated tree |
| Production build (`npm run build:prod`) | Passed; 685 production files byte-identical to dist |
| Entry resources and release version | 78 resource hashes valid; root/MAIN entrypoints match dist; version 2.31.0-report.1 |
| Native report | 3 flows passed; 9 view/viewport samples; no page errors |
| Native Google boundary regression | 4 flows passed; no page errors; service boundaries simulated |
| Native Developer Hub and toggle | Both scripts passed, including sandbox isolation, refresh, card/motion/combat and narrow viewport |
| Protected original assets and core owners | 635 files byte-identical to base, including all 606 dist assets |
| Complete serial Node/jsdom suite | 770 passed; 0 failed/cancelled/skipped/todo; 621897 ms |

Native report checks use the actual local player/developer servers, actual game menu and generated Practice, English/BM, 390×844, 844×390 and 1366×900. They assert local dialog bounds, no document/journal horizontal overflow, reachable close, unchanged background-art geometry, exact game-save bytes, comment exit→Sharing navigation and retained text. The corrected Practice storage refresh preserves selected text `[1,3,backward]` and actual table scrollTop 140 in native Chromium. DOM regression additionally covers horizontal scroll and a second curriculum table/disclosure.

The actual operator UI rejects invalid input, saves a valid fake QA Google URL, distributes the project default to a fresh player without URL controls or automatic consent, and restores the original blank configuration in finally. Player and production deny developer routes. Google boundary tests retain lost-acknowledgement replay, one durable row, pending data after reopening, Practice offline→online resume and no credentials in frame URLs. Browser web security is enabled in accepted report/Google runs.

## Review and corrections

A fresh whole-branch read-only review found no Critical issue, one Important state-retention gap and one Minor contradictory storage message. Both were reproduced in actual generated Practice. Two regressions first failed as expected, then both passed after the bounded fix. Shared state now retains search selection and identifiable inner table scroll; comment-only storage errors reach Sharing and exit messages say the comment remains in the open page. Both languages retain that memory-only comment in JSON recovery. No known review finding remains open. [Original review and resolution](verification/learning-report-review.md).

Excluded evidence: an early native harness selected a hidden header Settings button; a later development POST was rejected because inherited `--disable-web-security` omitted Origin. The harness now clicks the visible menu control and retains browser security; the product's strict Origin check was not weakened. A fetch-based forged-Host test was replaced with raw HTTP because fetch normalised Host. An old CSV selector in an intermediate flow test was updated to the intended JSON backup and the exact test reran green. These failed harness/test attempts are not counted as accepted checks.

Machine-readable evidence: [final verification JSON](verification/learning-report-2-31-preview.json). Full serial test output: [770-test log](verification/learning-report-2-31-full-test.txt).

## Preview images

- [Desktop overview](verification/learning-report-2-31-preview/desktop-overview.png)
- [Phone details](verification/learning-report-2-31-preview/phone-details.png)
- [BM sharing](verification/learning-report-2-31-preview/bm-sharing.png)
- [Phone Practice](verification/learning-report-2-31-preview/phone-practice.png)
- [Developer collection setup](verification/learning-report-2-31-preview/developer-collection.png)

The screenshots contain seeded QA evidence and a fake receiver address, not real player records.

## Limits

No live Google account/deployment, real Google quota, hosted Pages release, classroom or physical Windows/mobile device is verified. Local tests cannot establish those outcomes. Sharing runs while the game is open; a closed browser cannot send queued records. The receiver URL is public browser configuration; the private Google Sheet's sharing permissions remain the owner's responsibility. The branch ships a blank project URL and does not configure the user's Google account. Existing selectable setup-fix deployments can be reused because the receiver protocol is unchanged.

No artwork/audio/motion, combat/balance, question content, RNG, canonical analytics/sync schema or ordinary saved-game schema is changed. The unavailable earlier MODEL.zip was not used; this layout work uses the actual repository and existing approved assets.
