# Combat animation — live integration 2.44.0

| Field | Current record |
| --- | --- |
| Date | 24 October 2026 UTC / 25 October 2026 Malaysia |
| Repository | unDead41/slay-the-math-v2 |
| Reviewed main / base | `f59e9e915e4107627c48a13240bb959fcb2e1a61`, game 2.43.0 |
| Reviewed main tree | `fb1db4ee736d37c6b3b053840d7cfc75439e4840` |
| Local integration branch | combat-animation-live, created clean on that exact main |
| Publication targets | combat-animation, then main, continuing Ijamm's combat main instruction |
| Master SOR read | 1.2.0 from current main before changes; AGENTS, domain owners and prior audit read |
| Current scope | Apply the reviewed Shield V3 / Passive V10 / stat-barrier V9 fields to actual combat |
| Compatibility | **VALID within the tested integration scope**, with the explicit limits below |
| Publication identity | Exact resulting commit/ref is verified after publication and identified in the handoff |

Ijamm now requests “saya nak semua VFX diapply dalam game saya ni please”. This supersedes the runtime preview-only boundary in the historical audit below. The existing main-push instruction applies to this continuation of the same combat work; no hosted Site deployment or unrelated mechanics change is performed. [Runtime contract and release](../../COMBAT_VFX_LIVE_2_44_0.md), [exact fresh evidence and commands](live-vfx/README.md).

## Before-change review

Main contains the approved preview but its production `status-vfx.js` still uses the older SVG presentation. The approved painters do not receive actual combat receipts and do not render on enemies. Existing stable actor canvases, canonical status projection, card-motion labels/SFX, save/RNG and bilingual owners must be retained. The old combat-animation publication is already an ancestor of this main; basing the integration on pinned current main avoids replacing newer language, balance, education and icon work.

The separate older local checkout has unrelated uncommitted SOR edits. Those edits are preserved; this task uses a fresh checkout. The initial new branch was clean. Final changes are limited to presentation integration, its tests/QA helper, generated release/resource entrypoints, package version/check script and related owner/audit documentation.

## Confirmed problems and final actions

| ID / category | Priority / confidence | Evidence and impact | Final action / status |
| --- | --- | --- | --- |
| LIVE-001 / MASALAH DISAHKAN | P2 / high | Main's reviewed V10 fields were standalone; actual battle did not use them. | RESOLVED: read-only receipt/status adapter plus persistent front/back compositor for each eligible actor. All ten real Passive triggers and both-actor native pixels verified. |
| LIVE-002 / MASALAH DISAHKAN | P2 / high | A log-only restore loses a previously triggered Passive once its old entry is trimmed. A new failing test reproduces this without mutating the save. | RESOLVED for presence: project existing engine trigger counters. Preserve observed live order; deterministic fallback and irrecoverable historical-order limit are documented, not hidden as exact reconstruction. |
| LIVE-003 / MASALAH DISAHKAN | P2 / high | Targeted tests/native review expose disappearing Shield during action lead, positive replacement Block incorrectly expiring, existing Shield re-forming on top-up, and Thorns fading before its queued expiry. | RESOLVED: retain pending-impact material, expire only when Block is gone, pulse existing shield, and keep Thorns formed until the queued retraction. Relevant regression tests pass. |
| LIVE-004 / MASALAH DISAHKAN | P2 / high | Last-frame diagnostics could remain playing after scheduling stopped; a Canvas-less environment attempted unsupported contexts. | RESOLVED: publish final empty diagnostics and retain readable badges/labels without old decorative floor effects when Canvas 2D is absent. Scheduler/DOM tests pass. |
| ENV-001 / MASALAH DISAHKAN, environment | P2 / high | Initial 1,073-test run: three missing report-fixture failures and two unresolved `sharp` imports. Root storage constraints led to sparse reports and an incomplete dependency search path. | RESOLVED: restore tracked reports and use installed test dependencies. All five cases pass in the recorded targeted rechecks; retain the initial 1,068/5 result rather than claiming an all-green first full run. |

## Risks and improvements

| ID / category | Priority / confidence | State, basis and limit |
| --- | --- | --- |
| Previous RISK-001 / RISIKO BERPOTENSI | P2 / high | CLOSED for the implemented integration: actual statuses/receipts, canvas retention, player/enemy ownership and canonical save/RNG have fresh tests. This does not certify all devices or the whole game's resource bootstrap. |
| Previous RISK-002 / RISIKO BERPOTENSI | P2 / medium | OPEN: host CPU draw timing is not physical-device FPS/GPU/memory. Native 390px rendering is checked; real phone/Windows hardware remains unverified. |
| LIVE-RISK-001 / RISIKO BERPOTENSI | P3 / high | OPEN: the bounded existing log cannot reconstruct exact order among several already-trimmed first triggers on a fresh Continue. Presence is correct; live-session order is retained; no save-schema change is introduced. |
| Previous IMP-002 / PENAMBAHBAIKAN, proposal | P3 / medium | OPEN: human recognition of all ten ornaments at gameplay scale remains useful and is not inferred from automated ID/pixel checks. |
| LIVE-IMP-001 / PENAMBAHBAIKAN, implemented | P2 / high | Earlier draw-cost adaptation, approximately 0.8/0.4 MP Full/Low buffers, fixed stat lanes, fading-effect crowd budgets and no idle RAF reduce cost while retaining motif identity. Native host samples and their limits are recorded. |

Tiada isu tambahan ditemui dalam skop yang disemak. No engine, card/stat numerical rules, save schema, RNG, original assets/icons, language bank, AI, economy, education or map owner is modified.

## Fresh final checks

- Initial project suite: **1,068 PASS / 5 environment failures / 0 skipped** out of 1,073; all five failing cases subsequently pass after environment repair.
- Final relevant regression after the last runtime corrections: **104 PASS / 0 FAIL**. Report-dependent/status-explanation recovery: **16 PASS / 0 FAIL**. Final resource checks: **14 PASS / 0 FAIL**. Final portable boot: **1 PASS / 0 FAIL**.
- `npm run check`, final changed-file syntax checks and `npm run build:prod` pass. Required scripts/styles, final content hashes, portable embedding and source/production resource bytes are checked.
- Approved painter modules are byte-identical to preview sources. Preview rebuild and 60-loop/1,440-triple/11,580-sample contracts still pass. Original source art/icons and numerical owner files are preserved in the final Git diff.
- Native production-module harness: all ten real-trigger Passive cases have correct IDs and nonempty front/back pixels; three layers follow actual receipt order `[4,0,1]`; 390px Low has no document overflow; body-only buffers have zero floor alpha for both actors. Dialog/Motion Off pause, resume and an actual keyboard Rune Guard action are observed. [Exact observations and runtime hashes](live-vfx/native-browser.json), [final screenshot](live-vfx/native-runtime.jpg).
- Final diff, whitespace, repository links, build outputs, guarded/non-forced branch publication and actual remote main are reviewed before/after publication. Do not substitute the historical preview screenshot or test counts below for this new code.

## Limits and handoff

Native QA uses unchanged production game modules in a local fixture shell; the managed HTTP host lacks secure-context Web Crypto, so native full resource/bootstrap/cache/offline acceptance is **BELUM DISAHKAN**. Production code is not modified to compensate. Brief native hit/expiry selector samples timed out; their exact phases/queue order are verified by deterministic compositor and real receipt tests, not called native visual passes. Physical hardware performance and final human recognition remain open. MODEL.zip was unavailable and not read; mathematics PDFs are outside scope.

Version **2.44.0** includes live combat integration. The release contract gives normal production build/start instructions and a no-schema-migration rollback. Publish only after fresh checks and current-head review; use a non-forced fast-forward and verify both actual remote refs. The resulting full SHA is part of the final handoff, not a self-referential value guessed inside this commit.

---

The following is the archived preview-only publication audit. Its scope and no-runtime statements describe that earlier snapshot and are superseded above.

# Combat animation — V10 preview branch audit

## Main publication addendum — 25 October 2026

| Field | Record |
| --- | --- |
| Target | main |
| Main before publication | 2aea9057eba8ce0c23c5fdd203dfe12637c1d871 |
| Feature snapshot | e1775c673d3b663273ce8ab2d9d9e4df28d27fc6 |
| Main/feature relationship | Feature is one commit ahead, zero behind; direct fast-forward ancestry |
| Master SOR | 1.2.0, reread from current main |
| Scope/status | VALID — exact standalone V10 preview plus publication documentation |

Ijamm now explicitly requests pushing the completed update to main. This supersedes the feature-only boundary in the original report below. Publish the reviewed feature snapshot and its publication-status documentation; keep the preview outside production runtime. The original report is retained as the initial branch audit and must not be read as current publication permission.

Fresh pre-publication review confirms the 24-file feature diff is limited to previews and related SOR/audit records. The follow-up changes only these six text documents: this report, the preview README, SOR_README, SOR 11, DECISIONS and CHANGELOG. The exact HTML, gallery, JavaScript/CSS modules, fixtures and recorded native evidence remain identical to the feature snapshot. Preserve the main `dist`, modules, assets, scripts, tests, package and release tree entries.

Fresh checks for this publication: portable source rebuild check, Passive geometry/order/preservation checks, exact file/blob hashes, repository-relative links and final tree/diff review. The contract run covers 60 loop variants, 1,440 shared-base ordered triples and 11,580 finite samples. The existing native evidence remains scoped to the exact unchanged HTML, not a new production-game or device test. Production/full-game tests are NOT_RUN because no production code/data/build input changes.

**Initial/final findings:** no additional confirmed issue was found within this main-publication diff. VFX-001 / PUB-001 / PUB-002 remain resolved as documented below. RISK-001 (future gameplay integration), RISK-002 (physical-device performance) and proposed IMP-002 (human recognition check) remain open within their stated limits. Main publication does not close them or imply the preview is installed in live combat.

Publication uses a commit descended from the reviewed feature, followed by a non-forced update of main guarded by its expected old SHA. The current remote main ref, commit ancestry and unchanged production tree entries are verified after the update; the final commit is identified in the handoff. If main advances before the guarded update, reconcile its new snapshot before retrying.

| Field | Record |
| --- | --- |
| Date | 25 October 2026, Asia/Kuala_Lumpur |
| Repository / target | unDead41/slay-the-math-v2 / combat-animation |
| Master SOR read | 1.2.0, from current main before changes |
| Main base commit | 2aea9057eba8ce0c23c5fdd203dfe12637c1d871, game 2.43.0 |
| Main base tree | 305ece58da59b628a26267348f7fdb89ef8d57b4 |
| Previous branch head | b422a184b000f1042d378251e24a5d0d34415225 |
| Initial Git relationship | Previous branch is an ancestor of main; 46 commits behind, no unique commits |
| Scope | Publish completed offline V10 preview, editable sources, gallery, SOR and this audit |
| Compatibility status | VALID within this standalone preview/publication scope |

## Authorization and prior evidence

Ijamm requests pushing the completed work to the assistant branch if it has not been pushed. This authorizes the existing `combat-animation` branch, not main integration or deployment. Earlier V4–V10 no-push notes describe the earlier preview phase and are superseded for branch publication by DEC-20261025-COMBAT-V10-BRANCH.

Read current main Master SOR, AGENTS, governance, owner SOR 11, decisions, QA guidance and the main documentation audit before preparing this update. Main's documentation audit records the later resolution of DOC-001 / DOC-002; no new fix to those owners is needed here. There was no combat-animation folder in the current main audit directory, so this is the first scoped preview publication report. The prior game-polish report remains historical under COMBAT_MOTION_POLISH_LOCAL.md.

The new commit uses the complete current main tree as its base. The old branch head is already an ancestor, so the update preserves its history without a force push. Existing game files, main's BM/English support, numerical/status rules, original assets, production resource manifests and package/release version are inherited unchanged. New preview files sit outside production `dist`, modules, tests and build tooling.

## Confirmed problems and actions

| ID | Priority / confidence | Initial evidence and impact | Action / final state |
| --- | --- | --- | --- |
| VFX-001 | P2 / high | V9 screenshot of Blazing Spirit, Growing Flame and Last Ember showed similar leaf/flame ornaments, weakening recognition. | Completed V10 uses guarded swords, six-petal radial flowers and two-lobed cracked hearts; same-layer colour/grayscale review confirms distinct silhouettes. See SOR MOT-28–29 and native evidence. |
| PUB-001 | P2 / high | GitHub combat-animation at b422a18 was 46 commits behind current main. The previous runtime polish is already merged; copying that old checkout would regress newer owners. | Build publication on pinned main 2aea905 and add only preview/documentation files; retain all current runtime tree entries. |
| PUB-002 | P2 / high | The delivered preview and source modules were outside Git; the scratch build script used absolute scratch paths and untracked baseline files. A branch push of only the four SOR edits would omit the work. | Add exact delivered HTML, gallery, editable modules/CSS, portable rebuild and compact preservation fixtures under previews/combat-vfx. Source rebuild/checks do not require the scratch workspace or production build. |

## Potential risks and improvements

| ID | Category | Priority / confidence | Evidence, limit and follow-up |
| --- | --- | --- | --- |
| RISK-001 | RISIKO BERPOTENSI | P2 / high | This preview projects example states and static actor artwork. Connecting it to current gameplay receipts, persistent canvases and current bilingual status explanations requires a separate integration review; publication alone does not install or validate that integration. |
| RISK-002 | RISIKO BERPOTENSI | P2 / medium | The preview has Auto/Low/Full and bounded rendering, but desktop browser CPU timings are not physical-phone/GPU FPS. Check real target devices before production acceptance. |
| IMP-001 | PENAMBAHBAIKAN, implemented | P2 / high | Add the portable source check and same-layer grayscale gallery so another reviewer can reproduce and compare the actual motifs without depending on screenshots or colour alone. |
| IMP-002 | PENAMBAHBAIKAN, proposal | P3 / medium | A short human recognition check of the ten motifs at gameplay scale would measure legibility beyond the current visual review. This proposal does not block the authorized branch preview. |

No additional confirmed issue was found within the reviewed publication diff. No unrelated runtime correction or art replacement was performed.

## Checks and evidence

- `python3 previews/combat-vfx/rebuild.py --check`: main preview and downloadable gallery match their editable sources without scratch-path dependencies.
- `node previews/combat-vfx/verify.cjs`: sixty exact geometry endpoints, smooth seam position/velocity, 1,440 shared-base ordered triples, interrupted reorder/removal, 11,580 finite geometry samples, preserved stat/barrier/Shield/actor renderer and all 21 original embedded images. Six inline scripts parse and the HTML has no external fetch dependencies.
- Delivered HTML identity: SHA256 `5e644a6b6dbfdf3a7f86ae65165c4cbfae458bdb83effc5141af87843d6e1e0a`, 5,224,925 bytes. The branch HTML is byte-identical to the reviewed V10 delivery. Packaging changes do not alter its rendering.
- [Exact-preview native evidence](v10-preview-verification.json): all sixty Canvas endpoint variants have identical, nonempty pixels; ten-motif Full/Low colour/grayscale inspection; three-trigger player/enemy floor and top views; order swap; one/two/three layers; 390×844 narrow iframe with no horizontal document overflow; paused render callback count zero. This evidence was captured during the immediately preceding V10 preview task, not a fresh production-game test.
- Final publication diff is restricted to `previews/combat-vfx/`, `docs/audits/combat-animation/`, SOR_README and SOR 11 / DECISIONS / CHANGELOG. Current main file content is retained while the local preview records are added; production source/config/assets/version are not replaced.
- Repository-relative links and the scoped file list are checked before publication. Ref SHA and unchanged main are verified through the connected GitHub API after the branch update; the resulting commit is identified in the final handoff.

## Not run and limits

The production build/full game regression are NOT_RUN for this publication: no production code/data/build input is changed relative to the pinned main. Existing main test counts are historical and are not reported as newly run here. Production-game adoption, real-device FPS/memory, human SFX feel and final user visual approval remain separate.

MODEL.zip could not be made available and was not read. Retry the upload if it is needed for a later model/motion task. The attached mathematics PDFs are outside this VFX publication scope and were not used.

Direct local Git fetch was BLOCKED by an incomplete recovered object database (`487 unresolved deltas`); publication uses GitHub's tree/commit APIs against the exact pinned main tree, followed by a non-forced, expected-head-guarded update of combat-animation. This does not rewrite the local working files or main. No deployment is performed.
