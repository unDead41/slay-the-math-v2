# Education delivery reliability — branch audit

## Current main integration authorization — 2.50.0

The current explicit user request authorizes combining combat, education and
Master Map protocol candidates with main 2.49.1 as 2.50.0. Scoped compatibility
is VALID with carried P2 findings and explicit limits; original failed commands
and later focused/native evidence remain separate. Publication is PENDING actual
main ref readback. This supersedes the relevant earlier branch-only boundary;
original source pins, histories and current main owners remain. The completed
owner pilot stays tied to source b3dc, not 2.50. [Scope, results and limits](../../ALL_CANDIDATES_MAIN_2_50_0.md).


25 October 2026, Asia/Kuala_Lumpur. Repository `unDead41/slay-the-math-v2`.
Master SOR **1.2.0**, current AGENTS/governance/decisions and relevant education,
language, UI, architecture and release owners were read before implementation.

| Reference | Snapshot |
| --- | --- |
| Main/base SHA | `6c49f3980c3a832635d4d01a6c50a8df98ac4aad`, v2.45.0 |
| Target | `codex/education-delivery-reliability` |
| Candidate version | `2.45.1-education.1` |
| Scope | Relevant fixes from the current-main audit: retry, report status/navigation, provenance and feasible receiver preparation |
| Authorization | Implement and publish this branch only; no main merge or actual Google deployment |
| Checked target | Working-tree diff against the pinned main, with 763 frozen input hashes in the verification record |
| Publication | Exact remote commit/tree/ref are read back and reported in the final handoff after publication |

**Status: VALID in the tested branch scope. Actual Google deployment and pupil/device
acceptance remain BELUM DISAHKAN.** The empty public Google URL remains an owner
setup requirement, not an invented resolved connection.

## Initial findings and final changes

| Category / ID | Priority / confidence | Evidence and outcome |
| --- | --- | --- |
| MASALAH DISAHKAN / DEL-001 | P2 / high / RESOLVED | Source stopped after five failures with no remaining timer while Wi-Fi stayed online. `learning-sync.js` now keeps a capped 60-second retry, pauses hidden/offline/disabled/stopped activity and resumes on visibility/online. Both deterministic late recovery and real HTTP batch recovery pass; exact revisions/ACK remain authoritative. |
| MASALAH DISAHKAN / DEL-002 | P2 / high / RESOLVED | A real 5,000-entry full outbox returned null/error while the Result report showed ordinary pending copy. The controller now checks enqueue results, shares BM/English delivery copy with Practice and offers existing Sharing/backup navigation on failure. Practice tracks failed publication and retries an unchanged comment on explicit Save. The local comment remains recoverable. |
| MASALAH DISAHKAN / NAV-001 | P2 / high / RESOLVED during final review | A previously closed Overview could override the new report Sharing action through saved view restoration. The actual-app regression reproduced Overview instead of Sharing. The explicit action now selects Sharing after restoring the existing report and focuses its consent control; gameplay stays unchanged. |
| PENAMBAHBAIKAN / META-001 | P2 / high / IMPLEMENTED | New reports record optional actual gameVersion/contentRevision. Game and generated Practice receive the real release and active bank revision. Old reports, unchanged autosave and review-only ticks retain original provenance or its absence; exported entry copies do not expose mutable nested provenance. Local and generated Google validators accept strict legacy/new payloads. |
| PENAMBAHBAIKAN / SHEET-001 | P2 / high / IMPLEMENTED | Comments append two version fields; Issues append two version aggregates after the existing developer fields. Replay, legacy blank metadata, zero-active history, notes/fixed-version and Selesai state remain protected. Old metadata-free signatures retain their original shape. |
| MASALAH DISAHKAN / CFG-001 | P1 for collection readiness / high / PARTLY PREPARED | The published default URL is empty and the previous template allowed only localhost. The template now also allows this project's existing `https://undead41.github.io` origin. Developer setup copy distinguishes saved config from verified delivery. The actual `/exec` URL is still missing; live setup/receipt cannot be claimed. |

The seven failing pre-fix regression cases and the final fixes are recorded; the
eighth new case also checks strict legacy compatibility. The old HTTP test that
required stopping at five attempts was updated to the newly authorized continuing
retry policy while retaining pending/receipt assertions. A new Google test's missing
Session fixture was corrected to model the real owner guard; no guard was removed.

## Remaining risks and follow-up

| ID / category | Priority / confidence | Trigger, impact and required next step |
| --- | --- | --- |
| LIVE-001 / RISIKO BERPOTENSI | P1 readiness / high for missing source config | New hosted players still need the actual project `/exec` default in their distributed build. Owner must set it through the local Developer Hub and test one real comment/edit/offline reconnect. No URL, account, Sheet or consent is fabricated. |
| DEPLOY-001 / RISIKO BERPOTENSI | P2 / high | Older deployed strict receivers reject the new optional provenance field. Deploy the complete regenerated Code.gs to the same Apps Script project/Sheet/deployment before using this candidate's versioned reports. Rejected records remain pending; do not clear journals. The new receiver still accepts old clients. |
| FIELD-001 / RISIKO BERPOTENSI | P2 / medium | Physical devices, classroom connectivity/Google quotas and pupil comprehension are not proven by automated tests. Retain the earlier teacher review of contradictory supplied Logic examples as human validation work; no new mathematical bug is inferred. |

No additional blocking issue was found in the reviewed diff. Automatic archival,
another database, CSV controls, balancing, artwork, animation or question rewrites
are outside this update. Existing collection limits remain unchanged.

## Fresh verification

[Structured record](../../verification/education-delivery-reliability/verification.json)
and raw logs identify the exact source fingerprint, environment and scope.

- **197/197 distinct focused tests pass**, zero failed/skipped: 191 owner/UI/storage/
  collector/language/generated-resource tests plus six actual Practice UI tests,
  including the complete 120-question bilingual wrong/Hint/More Hint/solution flow.
- Syntax, normal generation, production and a **306,790,565-byte** portable build pass.
- Native game reports pass **six consumer/language flows and 18 viewport states**,
  actual build/revision metadata, focus/reload, local scroll and exact game/art preservation.
- Native Google boundary checks pass **eight flows**, including dropped-response
  replay, offline edit/untick, actual game report provenance, original-language/help
  preservation after a Practice tick and private Selesai/notes preservation.
  Google services are simulated; actual nested origins/MessagePorts and browser
  security are exercised. No live Google receipt is claimed.
- Actual BM portable reporting passes with zero HTTP and no run mutation.
- Protected production/static-subpath Developer checks and the real --prod server
  pass. Collection setup remains developer-only; player reports do not gain URL controls.
- All **763 final frozen inputs** are unchanged after checks; all **626 dist/assets files**,
  canonical bank/numbers/answers and protected gameplay/animation owners are unchanged
  against the base. The shared release/cache/launcher resources are regenerated.

After NAV-001, the191-case suite, production/syntax build and native game/Google/offline/production checks were refreshed. The six Practice tests retain their unchanged standalone inputs; its generated bundle is byte-identical across that final app-only fix.

The initial environment selected jsdom30.1.3 and produced two focus failures that
also reproduce on unchanged main. The final fresh checks use the project's prior
QA version26.1.0, where both focus cases and all197 checks pass. An initial all120
run on30 was interrupted and is not counted. The Google browser harness now waits
for actual Enter after boot/reload, uses valid original resource bytes and injects
only its fictional destination as fixture configuration. Worker interception is
blocked for this mocked boundary; no game security is disabled. The report geometry
probe checks visible controls, excluding the new deliberately hidden failure action.

The full game-wide suite is NOT_RUN: this update changes feedback/delivery and its
direct consumers, not mathematics, numerical gameplay or actor rendering. No new
physical-device FPS, whole-book reread or classroom result is implied. MODEL.zip
was unavailable and was not read.

## Owner use

Follow [the same-project Google update guide](../../education/GOOGLE_ISSUES.md).
Pull this feature branch to preview it; the menu version must be2.45.1-education.1.
Before a later main merge, read main again and preserve any newer work. Publication
uses a non-forced branch ref with an expected head; main is never the update target.
