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
