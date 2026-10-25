# Combat continuity — branch 2.45.1-combat.1

## Main integration authorization — 2.49.0

Ijamm now requests publishing the completed icon-loading and combat-continuity
updates to `main`, continuing the preceding main-publication instruction. This
supersedes their 2.45.1 branch-only boundaries below for this combined release.
Current main 2.48.0, automatic downloads, the 23-chapter / 98-image / 12-practice
tutorial, AI/model, approved V5 art, numerical/save/RNG and language owners remain
protected. Original source SHAs, failed/passing records and branch limits below
remain history. [Pinned integration, required adaptations and fresh evidence](../../ICON_COMBAT_MAIN_2_49_0.md).

Combined scope status is **VALID with inherited P2 findings carried**. Fresh
Node verification passes **1148/1148** on `7568565`; final native continuity
passes **14/14** with the setup-only atomic-clock helper at `ee694d2`. Product,
Node-test/helper, configuration and generated inputs are unchanged between those
checkpoints; the single non-imported native helper delta has its own fresh replay.
[Exact commands, retained failures, hashes and limits](../../verification/icon-combat-main-20261025/evidence.json).
Publication remains **PENDING** until the authorized remote ref/tree/version
readback. CI-247-01 and QA-248-PRELOAD-01 remain inherited P2/open; the current
preload PASS does not establish a counter fix. MODEL.zip remains unavailable
and unread; physical-device and human-recognition limits remain.


| Field | Reviewed record |
| --- | --- |
| Date | 25 October 2026, Asia/Kuala_Lumpur |
| Repository / target | unDead41/slay-the-math-v2 / combat-animation only |
| Current main / isolated work base | `6c49f3980c3a832635d4d01a6c50a8df98ac4aad`, game 2.45.0 |
| Remote combat branch before update | `702be96cfc776a81057e6e53d950e5c5af931e88`, one ancestor commit behind main |
| Local working branch | combat-animation-fix, created from the exact current main |
| Master SOR | 1.2.0, read from main before changes; current AGENTS, governance, decisions, motion/runtime owners and prior VFX/Alyssa audits reviewed |
| User request | Troubleshoot intermittent VFX/flicker, check updated MC motion, shorten formation/hit timing; update the branch first |
| Compatibility | VALID for the final scoped checks below, subject to physical-device and historical-order limits |
| Publication | Branch only, non-forced expected-head update; actual resulting ref/SHA is read back in the handoff |

This update does not merge main or deploy a game. The previous 2.44 live-integration
and 2.45 MC audits describe their tested snapshots. Their successful isolated
checks did not establish rapid-action continuity through the production loader
and transient label-host replacement; the new reproductions below do.

## Confirmed problems and corrections

| ID / category | Priority / confidence | Reproduction / affected owner | Action and final state |
| --- | --- | --- | --- |
| CFX-001 / MASALAH DISAHKAN | P2 / high | The production room key includes the list of visible image URLs. Playing/drawing cards changes that list, re-enters `scene-preparing` and hides the entire header/game despite retained canvases. Native main 2.45.0 records five class-mutation flash observations in each desktop/390px sequence. `dist/bootstrap.js`, `dist/boot.css`. | FIXED: room identity follows run/stage/scene/depth/node/enemy; same-room images still use verified preparation without a blocking gate. Current decoded images are reused. Native final sequences record zero flashes. No CSS/actor resize is introduced. |
| CFX-002 / MASALAH DISAHKAN | P2 / high | Capture, mount and play each clear renderer events. Recreating a detached label host also invokes full renderer cancellation after a new hit has been scheduled. A Rune Guard followed by another card loses formation; an enemy impact can be suppressed. `dist/status-vfx.js`. | FIXED: action labels/SFX retain their cancellation ownership while same-room material lifecycles survive. Replacing detached label DOM does not stop the compositor. Dialog/scene/hidden/Motion Off cleanup remains. Unit reproductions and actual native commands pass. |
| CFX-003 / MASALAH DISAHKAN | P2 / high | Adding the second Passive restarts the global field introduction, dropping the already visible first seal to zero entrance. Native prior samples include entrance 0 with real Rune Armor -> Blazing Spirit triggers. `dist/combat-vfx.js`. | FIXED: only the first live circle has a global introduction; later layers interpolate their own weights/positions while the base stays visible. Actual receipt order remains `[4,0]`. |
| CFX-004 / MASALAH DISAHKAN | P2 / high | 1–1.7s one-shots plus 180/240ms leads are slow relative to subsequent commands. Same-status events queue behind old formations; formation completion switches to an unrelated steady clock and can jump the chain orbit. `dist/combat-vfx.js`, `dist/status-vfx.js`. | FIXED: complete source one-shots traverse short windows, current reactions replace obsolete same-status queues, Block top-ups keep existing formation, same-receipt Thorns hit still precedes expiry, and the steady loop inherits the material phase. Both-actor deadlines, ordered retraction and phase continuity pass. |
| CFX-005 / MASALAH DISAHKAN, review of the new refresh path | P2 / high | A valid same-room image failure originally updated the retry control while its parent panel stayed hidden. A dedicated final RED test reproduces missing recovery; an obsolete removed-image failure must not surface later. `dist/bootstrap.js`. | FIXED before publication: expose nonblocking retry for a current image, ignore detached/current-source-mismatched failures, retain room visibility. Final targeted and native resource checks pass. |

## Timing and preserved ownership

| Presentation | Live combat timing |
| --- | --- |
| Card / enemy cue lead | 40ms / 60ms |
| Shield formation / other barriers | 0.38s / 0.48s |
| Shield or Thorns hit | 0.28s |
| Shield break | 0.58s, including the full source fragment fade |
| Expiry | 0.45–0.58s; same-receipt Thorns hit + expiry stays below one second |
| Stat response | 0.42s |
| Passive first intro / layer transition | 0.45s / 0.35s |

These timings do not delay commands or resolve gameplay. Retain all unique
motifs, fixed stat lanes, Passive-only floor, actor-neutral ownership and existing
adaptive budgets. Shield/orbit painter bytes remain unchanged. The runtime
Passive controller gains optional timing parameters; its geometry, motifs and
default standalone-preview timings remain unchanged. Preview source/HTML bytes
are preserved, rather than regenerated with game-specific pacing.

The source V5 animation player, registry, all 75 exposure holds, projection,
posters, CSS and all 626 original asset files are byte-preserved against current
main. No new hero redraw or numerical/card/education/language/save/RNG change.
[Actual protected owners](continuity/preservation.json),
[final build identities and hashes](continuity/build-preservation.json).

## Fresh verification and evidence boundaries

- `npm test`: **1,088 PASS / 0 FAIL / 0 skipped**, including the eight new material
  regressions. This run predates only the final CFX-005 image-recovery guard/test;
  do not describe it as a rerun of that final guard.
- After CFX-005, **74 PASS / 0 FAIL / 0 skipped** across image refresh, live
  compositor/projection/UI, status VFX, combat persistence, actor/source timing,
  texture and icon-readiness owners. Final resource tests: **17 PASS / 0 FAIL / 0 skipped**.
- Final `npm run check` and `npm run build:prod`: PASS. All 678 source and 679
  production manifest entries match actual SHA-256 bytes; portable output is
  306,786,217 bytes. No independent hosted deployment is claimed.
- Actual final production browser: **14/14 continuity checks pass** at 1366px
  and 390px. Zero room-loader flashes, retained surfaces, immediate impact,
  preserved live formation, no obsolete queue, continuous second Passive,
  dialogs/Motion Off and exact independent engine/save/RNG results.
- The final production Alyssa suite: **PASS**, all five clips / 75 exposures, seven viewport bounds, both-stage/boss support, unchanged engine outcomes, Motion Off/dialog pause, atlas/Canvas fallbacks and portable offline playback. Physical-device FPS and
  anatomy perfection are not inferred from renderer checks.
- Final hosted-readiness browser passes cold core, deferred Practice/boss,
  Practice 120, warm cache, 180-second recovery, native input and unchanged
  pre-entry save/RNG. Initial navigation still waits for decoded actors.
- Raw RED logs and native main observations are retained alongside final logs,
  reports and a final screenshot. [Evidence and exact commands](continuity/README.md).

The intermediate native run after the first fixes still missed enemy impact:
the detached-label-host path had not yet been corrected. A dedicated RED unit
then proved that root cause; its correction passes in the final browser. Native
clock installation was moved before runtime navigation and the fixture arranger
was corrected to read the engine's replaced battle object. Those harness
corrections are not counted as product fixes or successful earlier runs.

## Remaining risks and improvements

| ID / category | Priority / confidence | Current state |
| --- | --- | --- |
| Prior physical-device risk / RISIKO BERPOTENSI | P2 / medium | OPEN: native Chromium and emulated viewports do not measure the user's Windows machine/phone GPU, FPS or total memory. No physical-performance guarantee. |
| LIVE-RISK-001 / RISIKO BERPOTENSI | P3 / high | OPEN and unchanged: a fresh Continue cannot reconstruct exact first-trigger order among multiple already-trimmed historical entries. Existing counters preserve presence; live observed order remains stable. No save-schema rewrite. |
| Prior ornament recognition / PENAMBAHBAIKAN, proposal | P3 / medium | OPEN: human recognition of every motif at actual gameplay size remains useful. This update preserves their approved geometry. |
| CFX-IMP-001 / PENAMBAHBAIKAN, implemented | P2 / high | Add the actual production continuity regression so future loader/MC/VFX changes are checked together, rather than relying solely on retained canvas identity. |

Tiada isu tambahan ditemui dalam skop yang disemak. The existing approved source
drawing/proportion variations are preserved; no new atlas or registration fault
was found in the fresh motion checks. MODEL.zip remains unavailable and was not
read. The repository contains the actual installed V5 assets, so troubleshooting
does not depend on that attachment. Mathematics PDFs are outside this scope.

Before publication, review final diff/links, check current main and combat refs,
then publish only the combat branch using its expected old head. Read back the
remote commit/tree/ref and confirm main remains unchanged. The resulting SHA is
reported separately, not guessed self-referentially inside this document.

---

Historical audits follow. Their main-publication permissions and timing values
apply to those earlier completed sets, not to this branch-only correction.

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
