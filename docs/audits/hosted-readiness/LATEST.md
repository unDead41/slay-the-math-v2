# Automatic downloads — main integration 2.47.0

25 October 2026, Asia/Kuala_Lumpur. Master SOR 1.2.0 read from current main. Ijamm explicitly requests “push ke main kalau belum”, authorizing publication of this completed follow-up. Main is `65ccce765d1fcd43be8bd8033327764777b6993c` /2.46.0 (illustrated tutorial); feature is `82db6d57ce2f4b251601e260c0e6d861922a19a1`. Their merge base is `6c49f3980c3a832635d4d01a6c50a8df98ac4aad`.

Initial audit: the preload feature is absent from current main; both separate updates use 2.46.0. Integrate as **2.47.0**, preserve the 23-chapter/98-image/12-exercise tutorial, retain its tutorial pack rule and full-history CI checkout correction, and rebuild generated HTML/release/manifest conflicts from combined sources. All nonmetadata main runtime/artwork stays under its existing owner except the three feature-owned downloader/localization files. The feature's actual downloader and localization bytes remain unchanged. [Release scope and evidence](../../HOSTED_PRELOAD_MAIN_2_47_0.md).

Final status: **VALID for this combined release's tested runtime scope**. Fresh `npm test` passes **1,103/1,103**, zero failed/skipped/cancelled, 389892ms. Production/portable builds and runtime syntax pass. All **eight native families pass**: nine production startup/background/cache/recovery cases; strict verified images through all23 tutorial chapters/31 Codex icons with unchanged gameplay saves and zero raw requests/errors; all23 tutorial chapters/12 exercises/all98 localized image steps plus five small viewports and zero-network portable practice; actual BM desktop/phone/failure access; four recovery cases;30 retained-canvas commands with exact independent engine/RNG outcome; three boot viewports; full static/server production Developer Hub. [Fresh combined logs and receipts](../../verification/automatic-preload-main-2-47-0/integration.json). The old1,094 feature tests remain historical.

All760 source and761 production entries match their actual bytes/SHA. All760 source inputs remain unchanged after native testing. Exactly804 other main runtime/assets are byte-identical to main65ccce7, including the complete illustrated tutorial/media, numerical/question/save/RNG and V5/VFX owners. The three feature runtime files/localization source match feature82db6d5 exactly. Production manifest `dc2a2dad3275507d6158f1de` has99,838,306 important-package bytes, a74,878,730-byte target and75,122,630 selected whole-file bytes (75.24%); its98 new tutorial images retain the tutorial pack. Generated metadata conflicts have no remaining markers; diff whitespace and final source preservation pass. Tiada isu runtime tambahan ditemui dalam skop yang disemak.

Main's `fetch-depth: 0` change resolves the earlier CI-BG-01 input prerequisite. The corrected tutorial PR [run40175948204](https://github.com/unDead41/slay-the-math-v2/actions/runs/40175948204) actually passed its engine/learning/DOM and map steps, then failed the older icon browser harness; this is not a successful complete CI run. Publication and hosted success are recorded separately after readback. Physical-device performance, audio audition, classroom connections and live Google delivery remain separate checks. No new independent code review is claimed for this merge; the original review/fix evidence remains historical and the combined-source checks above were performed by the root.

Inherited CI-247-01, **P2/high, confirmed harness prerequisite**: job121116533995 fails `tests/icon-package-browser.cjs:25` with `DCRelease is not defined`. The harness reads the deferred runtime immediately after DOMContentLoaded, without waiting for or entering through the existing loader. It also expects raw icon paths, predating verified object URLs. Preserve this historical failure rather than infer a game failure or silently skip it. The current release uses explicit native readiness/background and verified-image tests for these actual behaviors. Broader migration of the historical icon/CI browser matrix remains a separate follow-up; the Pages build/deploy workflow does not run this PR-only harness.

---

# Historical automatic startup and background downloads — feature 2.46.0

25 October2026, Asia/Kuala_Lumpur. Master SOR1.2.0; base main6c49f3980c3a832635d4d01a6c50a8df98ac4aad (2.45.0), work branchfix/automatic-background-preload. User requests diagnosis of published downloads,75% important package before entry and appropriate performance improvements. This new scope is implemented on the work branch; no main publication is claimed. Main's V5/Alyssa/VFX and numerical/data/save owners remain unchanged.

Status: **VALID in this tested work-branch scope**. Final whole suite **1,094/1,094**, zero failed/skipped; syntax, production/portable builds and all seven native families pass. [Structured evidence](../../verification/automatic-preload-2-46-0/integration.json). [Design](../../superpowers/specs/2026-10-25-automatic-preload-design.md), [plan](../../superpowers/plans/2026-10-25-automatic-preload.md). The historical2.41.0 tests below are not evidence for this release.

## Confirmed findings and changes

| ID | Priority/confidence | Evidence and resolution |
| --- | --- | --- |
| BG-01 | P2/high/fixed | Published2.45 menu showed339/679 resources,93.9/218MB,0 pending. The actual code queued only menu/current-stage assets and required a manual full-download button. Enter now starts an incremental automatic queue for remaining registered game resources; Practice remains on demand. Current run gets priority over later packs. |
| BG-02 | P2/high/implemented requirement | Old native Enter had16,941,364 important bytes verified versus74,853,606 target bytes. New build metadata defines an important early-game package; whole files and all hard-core files must finish until at least75% of its bytes are verified. Boss/Stage2/Practice packs are excluded from this target. Functional icons retain semantic fallback and do not become hard blockers. |
| BG-03 | P2/high/fixed | A real-cache/HTTP unit case verified8 bytes with only4 retained after online memory eviction. Historical verified counts used to imply all were ready. Separate available/verified counts now describe actual session/disk retention. Cache denial offers explicit online continuation after essential runtime/visual readiness, without claiming75% cached. |
| BG-04 | P2/high/fixed | A real HTTP cancellation/resume regression stalled when reconnect occurred before cancelled work finished unwinding. Retry epochs now carry that retry through completion. Scene/Practice retry, network return and visible-page return resume eligible queued work; failed files stay explicitly retryable. |

## Performance and behavior

Use the same verified downloader, not a second transport. Incremental scheduling holds only one speculative transfer in combat/two on the menu, reserving foreground manager capacity. Current-room requests keep their existing priority and entry/decode deadline. New speculative work stops while hidden/offline or explicitly paused. Initial files are downloaded without decoding every texture; existing current-frame preparation, persistent canvases,32MiB compressed session cache,96MiB estimated decoded texture cache and adaptive VFX remain intact. Progress UI refreshes once per second and scheduler storage checks avoid rescanning every asset.

Current source678 files/production679 entries match exact bytes and SHA. The production important package is99,818,305 bytes; the chosen whole-file gate is75,102,629 bytes (75.24%); all hard-required core files are included. Native production passed actual75% gate, complete automatic remaining downloads, cold/warm cache, foreground Practice120 while background is paused, offline/hidden resume, online cache-denial and required/optional failure recovery. Actual files exceed the exact threshold when a whole file crosses it or independent soft-icon warming completes.75% means minimum important-package bytes, not75% of the entire218MiB catalogue or a time promise.

## Review fix pass

One fresh read-only review of6c49..0d6a350 reported0Critical/1Important/1Minor. Important BG-05: historical persistent membership survived disk/session eviction and read-access loss. The root fix pass reopens the current cache namespace and reconciles stored keys at boot, entry, recovery, queue settlement and every5 visible seconds; read loss invalidates persistence, explicit storage recovery can retry after quota is freed, and old snapshots cannot satisfy newer explicit recovery. The actual namespace-deletion browser regression failed before the fix and passes on the final byte-parity-checked production build. Periodic metadata checks do not rehash every stored Blob or spin failed downloads.

The reportedMinor stale background-failed marker is re-gradedImportant/P2 for the requested truthful download status: a successfully recovered room must not still show a failed download. Background failures are now reconciled against current availability. Root verified both and adjacent cancellation/snapshot cases RED→GREEN; focused policy/manager checks pass28/28. No second independent review or deferred minor is claimed.

Reviewer set-asides: root verifies final suite/native/build/hash/publication separately; real namespace loss is exercised while physical eviction/quota heuristics and every worker lifecycle are not; physical-device/classroom/audio and multi-version/live behavior remain unmeasured; unchanged domain/art owners are preserved rather than re-audited. No additional numerical or art changes are inferred.

## Final verification and limits

Final `npm test` passes1,094/1,094, zero failed/skipped,397621ms. Focused policy/manager checks pass28/28. Native production9 cases pass, plus recovery4/4, strict verified images through17 Tutorial chapters/31 Codex icons,30/30 persistent-canvas commands with exact independent engine/RNG outcome, all75 V5 exposures and7 viewport bounds/portable offline, full production Developer Hub and3-viewport boot. All678 source and679 production manifest entries match exact bytes/hash; all678 frozen source inputs are unchanged after the suite. [Logs, native receipts and review](../../verification/automatic-preload-2-46-0/integration.json).

The first whole suite passed1,092/1,094 with two environment failures: `balance loader isolates data and keeps player defaults unchanged` and `Spool does not mistake rejected Draw Pile candidates for hand discard` required pinned Git2800f9a, absent from the depth1 clone. Fetching that exact history object made current-main and candidate balance files each10/10 without modifying balance. The complete fresh rerun then passed1,094/1,094. Keep the initial log as failed evidence; do not label it a product fix or omit those failures.

A native failed-atlas harness initially waited only for normalEnter; it now selects the intentionally exposed online recovery and retains all poster/geometry/save assertions. One overlapping build attempt had source/production readiness files from different revisions; a serialized rebuild and explicit runtime parity check preceded the accepted final production run. Focused policy/manager checks and a native failure proved the new behavior before implementation. One earlier native run reached the cache-denial assertion and failed because the test read the numeric counter instead of its separate mode label; this was a harness selector correction, not a product failure.

180 seconds is a bounded recovery deadline, not an internet-speed guarantee. Browsers must permit storage to retain the whole package; session-only mode has a32MiB cap and only prepares currently needed resources. Explicit full download can be requested; it still cannot promise persistence after a quota error. Downloads require an open/active page; no closed-tab downloader is claimed. Cache namespaces/active old-client updates and physical-device FPS/RAM/audio remain field checks. Never force a mid-combat reload or touch player saves.

All original art/audio, V5 clip geometry/timing, VFX painters/quality, card/math/balance/question-bank/save/RNG owners compare identically to main6c49. Historical VIS-241-01 was observed on the old2.41 framing; V5 now owns actor framing. No new framegeometry or artwork change is made here. DOC-001/002 were corrected by main's2.43 language integration; the older open statements below remain historical. MODEL.zip is unavailable and was not used. The textbook PDFs are available but no new mathematical-content review is needed or claimed.

## Publication

Published candidate source [`ee11bd2`](https://github.com/unDead41/slay-the-math-v2/commit/ee11bd2b93c909e2cd90ba81458fc22e24310178), full SHA `ee11bd2b93c909e2cd90ba81458fc22e24310178`, on [fix/automatic-background-preload](https://github.com/unDead41/slay-the-math-v2/tree/fix/automatic-background-preload). Remote tree `b3619f630f8949cee1e8de61e7604d3d55295ac5` exactly matches the locally verified source/evidence tree atbf58f62516e6432b569331fdabce590ba017d691. Parent is current main6c49f3980c3a832635d4d01a6c50a8df98ac4aad. Source commit/tree/parent, branch ref and package2.46.0 were read back. Normal Git push lacked credentials; the authorized GitHub connector created exact content-addressed objects and the new ref, without a forced update.

Main was6c49 before/after publication. No main push, merge or Pages deployment was performed: the public game remains separate from this2.46.0 work-branch candidate. The following documentation-only receipt records publication; final branch/tree/version and unchanged main are read back again in the terminal handoff.

## Inherited CI follow-up

**CI-BG-01, P2/medium, potential CI failure:** `.github/workflows/menu-verification.yml` uses pinned `actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803` without a history-depth override. The [pinned action definition](https://github.com/actions/checkout/blob/d23441a48e516b6c34aea4fa41551a30e30af803/action.yml) declares default fetch-depth1, while `tools/balance/loader.cjs` requires Git2800f9a. Local depth1 reproduction failed two tests until that exact historical commit was fetched. A future PR/manual verification may need the pinned history fetched or full history enabled; no such CI run is claimed here. This inherited workflow issue is outside the runtime-download correction and is recorded for its owner. The Pages workflow builds/syntax-checks main separately. This candidate does not change either workflow.

---

## Historical2.41.0 integration audit

# Main integration — hosted resources/runtime 2.41.0

24 October2026, Asia/Kuala_Lumpur. Master SOR1.2.0. Inputs: main `b730cad0cb27b53ffbdf687d8fc9edaed143ef43` (2.40.0), feature `61ca12635ae2bd23f04400b7cc6399a9836adfd8`; local integration `cf9b594e5193a5e62507062ff4376cf799d1b0b8` plus the root review-fix pass. Ijamm now requests publishing this completed update; the prior feature-only boundary is superseded for this release.

Current main numerical/card/data/save/RNG owners, candidate.5, status Normal/Large/localization, reports and Settings-only Dev are preserved. Scope and confirmed integration findings INT-241-01–05 are in [main release](../../RUNTIME_OPTIMIZATION_MAIN_2_41_0.md). The old candidate audit below is historical and does not establish the combined result.

Status: **VALID for this combined release's tested scope**; final frozen-source suite passes **1,022/1,022**, zero failed/skipped. Main's newer icon/readiness integration, previously BELUM DISAHKAN for the candidate, is implemented and checked with84 targeted tests,13 review-fix units, native24 status states, current10 card flows and4 recovery cases. Final suite/native evidence is recorded in [verification](../../verification/runtime-main-2-41-0/integration.json). Publication is recorded separately below.

## Review and verified fixes

One fresh read-only integration review reported one Important/P2: Tutorial image output bypassed verification. No Critical/Minor findings. Root's one fix pass reproduced the raw screenshot request, routed every Tutorial screenshot/card preview through the verified bridge and verified all17 chapters (16 screenshot files), keeping the same figure on same-chapter language changes and real gameplay saves unchanged. The pass also reproduced and fixed overlapping image preparation aborting valid card/frame decodes: per-element/key jobs and unchanged-src avoidance preserve source ownership; prepared bytes decode eagerly. No second independent re-review is claimed.

Observed integration risks/fixes: the15-icon warmer used raw paths; current-source metadata/fallback was lost during patching; hard-required icons blocked usable semantic fallbacks; explicit scene/Practice retry listeners needed preservation through the actual app conflict. RED→GREEN evidence covers each. All672 source/673 production manifest entries match bytes/hash. All16 refreshed Tutorial images have94 matching runtime-input hashes. Essential required bytes are9,744,484 before entry; optional icons warm through the same verified owner with background concurrency limits.

## Tests and limitations

The completed whole suite passes1,022/1,022 in405577ms with no failed/skipped cases; all672 frozen manifest inputs remain unchanged. Syntax and production/portable builds pass. Native checks pass for hosted startup/Practice/input,4 recovery cases,30/30 retained-canvas commands with exact engine state,24 status states and10 card flows, full production Developer Hub, six bilingual Result-report flows/18 geometry states and actual BM portable mode with zero HTTP requests. Strict image routing passes31 Codex icons and17 Tutorial chapters with no raw image requests/errors and unchanged gameplay saves. Combat motion passes six summary checks, ten actual Passive paths and six viewport/quality cases: the historical candidate's844×390 summary-label failure does not reproduce on this combined current-main source. The motion report's separate profiles array is empty; no additional Master-profile coverage is inferred from it.

An earlier full attempt exited1 without a summary, during disk pressure, and remains incomplete evidence; the cause was not captured. Later tests use task-owned RAM outputs/profiles. Native harnesses were updated to wait for real pre-entry/verified-image readiness; synthetic404 routes block workers so interception actually applies. Deliberately pending images are checked as attached with a usable named button, not falsely required to be visible.

Potential visual follow-up **VIS-241-01, P3/medium**: [selected mid-action1366×768 Developer capture](../../verification/runtime-main-2-41-0/combat.png) clips the upper hero. Current-main actor framing/art/styles are unchanged, so a new optimization regression is not established. A dedicated framing check is a possible later task; no canvas/actor geometry rewrite is included or claimed.

Physical-device memory/FPS, human sound audition, pupil outcomes, whole-bank mathematical correctness and live Google deployment are not newly validated. Those are preserved domains/field checks, not grounds to change math or balance in this integration. MODEL.zip remains unavailable; PDFs are available but need no new reading for unchanged question content. DOC-001/DOC-002 remain documentation follow-ups outside this scope. The pre-existing untracked map-trial fragment is retained and excluded from publication.

Reviewer set-aside rulings: root owns native/build/suite/publication evidence; original numerical/art/bank content is checked for preservation rather than re-audited for domain quality; physical and live multi-version/audio/Google behavior remains explicitly unverified; original documentation issues and the map fragment are left untouched. No minor finding was deferred.

## Publication

Published source: [`0796afd`](https://github.com/unDead41/slay-the-math-v2/commit/0796afd2e9ead9cb87825b4decf65950a21c2a19), full SHA `0796afd2e9ead9cb87825b4decf65950a21c2a19`, tree `3bee8c9982e031685673ea27fd401293d7399302`. The remote tree equals the locally verified source/evidence tree exactly. The main ref update was non-forced with expected headb730cad0cb27b53ffbdf687d8fc9edaed143ef43. Commit/tree/ordered parents (mainb730cad then feature61ca126), main ref and exact package2.41.0 contents were read back. Feature ref was not changed.

GitHub Pages [run40091388174](https://github.com/unDead41/slay-the-math-v2/actions/runs/40091388174) built the source commit successfully; production build, runtime syntax, artifact upload and deploy/Publish game all report success. [The existing game URL](https://undead41.github.io/slay-the-math-v2/) is unchanged. This establishes the observed Pages deployment, not a new physical-device or pupil test. The following audit-only commit records this receipt; final ref/tree/version and its Pages run are read back separately in the terminal handoff.

---

## Historical feature-candidate audit

# Runtime optimization — current branch audit

24 October2026 UTC. Branch `fix/hosted-readiness-input`, candidate **2.39.0**, Master SOR **1.2.0**. Initial update base `bcd90da6f1a6362449ca031fbaf9cada82aa4a92`. Read/integrated main `1ece105903ee34c81c38a338ead01db65a834523`, then newer main `cb1bbcf688d9556b55bc8fe5522b5b652309640c` (2.38.0). Local implementation commits `1aae6ac`, `c89efe6`, `8f899f5`; latest-main integration `00bfe4b`. These local SHAs identify work history, not a claim of remote publication.

User authorization: update recommendations1–3 and publish this feature branch. No main merge, main push or Pages deployment. Main's Settings-only Developer controls and education-report/hint update are retained. Read the [approved scope](../../sor/25_RUNTIME_OPTIMIZATION.md), [candidate guide](../../RUNTIME_OPTIMIZATION_2_39_0.md) and [structured evidence](../../verification/runtime-optimization-2-39-0/integration.json).

**Status: VALID for the three approved optimizations on the testedcb1bbcf integration; BELUM DISAHKAN for combination with later mainade5d3a.** Final post-review-fix full suite passes977/977, zero failed/skipped,408645ms. The historical2.38.0 audit follows below; its old suite limitation is superseded only for this freshly checked candidate, not rewritten as historical success.

## Confirmed findings

| ID | Priority / confidence | Evidence and action |
| --- | --- | --- |
| OPT-01 | P2 / high / fixed | Combat previously replaced both actor canvases on every render (native0/30 retained commands). `dist/dom-patch.js` and `dist/app.js` now keep canvases/controllers within the same run/stage/room/enemy and nondecreasing turn. Native30/30 retained, actual card/End Turn state equals an independent engine transaction. Card transactions replace battle data, so battle-object identity intentionally does not own presentation. |
| OPT-02 | P2 / high / fixed | With persistent cache unavailable, prepare plus three reads downloaded/hashed one resource four times. `dist/asset-readiness.js` now returns fresh Responses over immutable verified session Blobs; measured1 network/1 digest.32MiB LRU prefers background eviction and preserves verification/cancellation/isolation. |
| OPT-03 | P2 / high / fixed | Four decoded textures did not describe retained memory. `dist/animation.js` uses estimated RGBA bytes,96MiB, shared current-clip ownership and preferred idle retention. Rejected/late loads, release, byte pressure and active-only oversize are tested. |
| OPT-04 | P2 / high / fixed | Retaining a disabled Predict button also retained the old focus target. `close()` now rejects a disabled connected target and restores End Turn. The actual existing UI regression passes without weakening the test. |

| OPT-05 | P2 / high / fixed after independent review | Fighter reset images, Passive cue icons and supplier Artifact HUD/Codex bypassed the verified transport with raw URLs. The new native regression reproduced five raw requests with worker/cache denied. Direct image consumers now use existing imageElement; the supplier URL bridge gives pending images a per-key placeholder and checks their current source before attaching verified bytes. Final native check shows zero raw requests, all31 Codex images decoded and exact gameplay save equality (excluding the presentation-only Artifact tracker). |

## Verification, review and limits

Targeted checks on the combined main snapshot pass114/114, zero skipped; syntax and production/portable builds pass. Native hosted readiness, complete production static Dev Hub, six bilingual Result-report flows/18 geometry states and actual BM portable reporting pass. One fresh read-only whole-branch review reported OPT-05 as the sole Important/P2 finding; no Critical/Minor findings were reported. One root fix pass addressed it, with a native RED→GREEN regression. Recovery tests pass after the fix. Final source passes977/977, syntax and production/portable build checks. All668 source-manifest entries and669 production entries match exact bytes/SHA. Production app equals the expected Settings-only instrumentation of source; other changed runtime files match directly. Fresh identical-build control/persistent runs retain0/30 versus30/30 canvases, command p50/p95=6.4/9.6 versus4.4/7.8ms; timings are small local samples, not a phone FPS guarantee. Reports include identical per-file hashes. Original initial timing samples remain available separately.

An initial targeted run found OPT-04 (105/106); the fix then passed50 UI/persistence cases and the later combined114 checks. A separate retry overlapped a generator and read an incomplete mechanics file; its test-file failure is retained and superseded by the serialized post-build run. The first whole-suite attempt on the older main snapshot was explicitly stopped when main advanced. New report/motion browser harnesses needed to wait for Enter after boot/reload; those setup errors are retained rather than described as product failures.

Original `dist/assets` and the15 protected gameplay/question/status/tutorial owners compare identically to maincb1bbcf; new main tutorial captures are retained. No asset regeneration, numerical balance, RNG, canonical bank or save-schema change is introduced by this branch. The pre-existing untracked map-trial fragment is excluded.

Risks carried forward: physical phones/classroom connectivity remain unmeasured (DEVICE-01); pinned-manifest live deployments may require a user reload for replaced uncached future resources (UPDATE-01); older project disk-cache namespaces remain retained (CACHE-01). New32/96MiB budgets describe private retained Blobs/decoded pixels, not total browser/GPU RAM. Current-only oversize is reported and remains visible. No adaptive VFX, canvas resizing, save-write rewrite or question sharding is included.

### Later main snapshot and scope ruling

During final validation, main independently advanced to `ade5d3a21e55b9d2911bfa935c8095c95801bd8c` (2.39.0), adding explained status labels/size preference, three icon variants, icon readiness, VFX localization and tutorial captures. Master SOR remains1.2.0 and was read at that exact SHA; the compare API and current main handoff were read. This candidate freezes the testedcb1bbcf integration. The new icon-readiness schedule overlaps resource ownership and requires a deliberate combined check before any main release; **combined compatibility withade5d3a is BELUM DISAHKAN**. Do not replace latest-main icon/status owners with this older snapshot. Publishing this feature ref does not undo or modify main.

The existing combat-motion browser passed all ten real Passive paths and six real-action viewport/quality cases, then failed its synthetic four-summary-label aboveHP assertion at844×390. The identical failure reproduced with incremental patching disabled, establishing a baseline issue on this candidate'scb1bbcf UI. No status/VFX/CSS change is made here. Main's newer2.39 handoff reports its own passing VFX checks; that evidence is not transferred to this branch. Record this candidate limitation for later integration rather than claiming the whole native VFX suite passed.

Reviewer set-aside rulings: final suite/publication are root-verified separately; physical-device RAM/audio/FPS and live multi-version deployment remain unverified; the synthetic summary probe is the explicit baseline limitation above. No silent set-aside or second independent review is claimed.

## Publication

Published source: [`4cb5e38`](https://github.com/unDead41/slay-the-math-v2/commit/4cb5e3855c2e3f7567b637cdef3ec1b6234be20f), full SHA `4cb5e3855c2e3f7567b637cdef3ec1b6234be20f`, tree `cdf03423930335d2e1b3c317b0082a7e6ca6a637`. GitHub tree equals the locally tested source tree exactly. Ref update was non-forced with expected headbcd90da6f1a6362449ca031fbaf9cada82aa4a92; ordered parents are that old feature head and integrated maincb1bbcf688d9556b55bc8fe5522b5b652309640c. Source commit/tree/parents and feature ref were read back. Main remained `ade5d3a21e55b9d2911bfa935c8095c95801bd8c` before/after the push. This following audit-only update records publication; it does not change runtime. Final feature/main refs are read back again in the terminal handoff. No main mutation or Pages deployment was performed.

---

## Historical2.38.0 readiness audit

# Hosted readiness — branch audit and handoff

24 October 2026 UTC. Repository `unDead41/slay-the-math-v2`. Branch `fix/hosted-readiness-input`, candidate **2.38.0**. Master SOR **1.2.0**.

| Reference | Verified snapshot |
| --- | --- |
| Initial main 2.36.0 | `50d3af423cdc2240e949f4ddf29e023865304b65` |
| Main integrated during work, 2.37.0 | `6376a222169815af582cf55aa4794f3c809a3515` |
| Initial local implementation / recovery checkpoints | `c06de595a1c41e481d212c966dc7b18acfdc4b82` / `5952053` (local work history, not claimed as published commits) |
| Final source identity | [Published source `8068ce7`](https://github.com/unDead41/slay-the-math-v2/commit/8068ce7535f1073eeb7bd4bdb3333896333fb1dc), full SHA `8068ce7535f1073eeb7bd4bdb3333896333fb1dc`, tree `6cfa5c302441f983d06e5238f5ea183384d82c1b`, identical to the tested local source tree. Manifest/input evidence: [integration.json](../../verification/hosted-readiness-2-38-0/integration.json). The following audit-only commit changes no runtime. |
| Authorization | Implement and publish this feature branch only. No main push, merge, deployment or renamed game. |

Status: **VALID within the targeted resource/input/build checks; BELUM DISAHKAN for a fresh complete regression-suite verdict**. This is a branch candidate, not a physical-device or pupil validation. Source publication and its exact Git tree are checked separately from runtime tests. The branch is published as a review candidate with this explicit validation limit; no main publication is authorized.

Master SOR, AGENTS, relevant SOR owners, main's documentation audit and icon integration report were read. The original read/audit preceded the work; main subsequently advanced and its current SOR 1.2.0/icon changes were incorporated without replacing their owners. Main audit DOC-001/DOC-002 remain document follow-ups outside this resource task.

## Confirmed problems and their disposition

| ID | Priority / confidence | Evidence, file and result |
| --- | --- | --- |
| LOAD-01 | P1 / high / fixed | Native regressions reproduced paused Practice retry, obsolete Practice panel completion and an unbounded decode after download. `dist/bootstrap.js` now resumes explicit retries, owns panel operations and bounds complete pre-entry preparation to 180 seconds. Late work cannot commit a map entry. Raw saved gameplay is identical after failure. |
| LOAD-02 | P1 / high / fixed | Prepared images previously used a second raw URL. Current scene images, CSS backgrounds and `dist/animation.js` consume verified Response bytes through object URLs. Native boot passes with Service Workers blocked, cache denied and every raw asset request rejected. |
| UI-01 | P1 / high / fixed | Downloads covered Practice navigation. `dist/boot.css` restricts floating download/audio controls to the menu; native Practice navigation and the production Hub pass. |
| DEV-01 | P1 / high / fixed | The existing developer adapter captures `DCEducationPractice.createDocument` at startup. The hosted lazy marker initially left it undefined. Plain/file/developer mode now eagerly sequences the existing factory; hosted player mode stays lazy. Local dev, generated portable and the full production Hub scenario suite pass. |
| INPUT-01 | P1 / high / fixed | The all-120-question DOM stress test ran out of its default Node heap with the subtree observer. `dist/input-guard.js` now delegates input events instead of retaining replaced question trees. All BM/English question and comment tests pass without increasing the heap limit. Native input behavior remains tested. |
| VIEW-01 | P2 / high / fixed | At 320px, the shell before game CSS was 322px wide. The shell now owns its box sizing and scroll limit. Native checks cover 320×740, 844×390 and 1920×1080 before deferred CSS; landscape Enter is reachable. |
| BASE-01 | P2 / high / fixed | Main advanced to the icon 2.37.0 release during work. Both histories are retained, current icons/status handling survive, and this branch candidate moves to 2.38.0. No bitmap, audio, engine, question-bank or numerical owner differs from that main. |

The independent review was performed on the initial implementation; subsequent root review checked the fixes, combined diff and newer-main integration. No second independent review is claimed. No additional confirmed issue was found in the final reviewed scope.

## Potential risks and limits

| ID | Priority / confidence | Basis and next check |
| --- | --- | --- |
| DEVICE-01 | P2 / medium | Chromium automation and DOM stress tests do not establish physical phone memory, speaker output, classroom connectivity or the friend's original silent session. Test those devices before main publication. |
| UPDATE-01 | P2 / medium | Active play pins one manifest. Replacing an uncached future resource during a live deployment can make the old client reject the new bytes; a user reload may be needed. Do not force reload during combat. A real multi-version Pages deployment was not performed. |
| CACHE-01 | P3 / high | Cache can be denied/evicted. Verified unchanged files are reused across project manifests, but older namespaces are retained. The code does not delete player saves or all-origin caches, and counters do not prove full offline readiness. |

## Improvements and scope rulings

- Implemented: required core before the menu, real file/byte progress, explicit Enter/Sound activation, three-minute recovery, actual-run/map priorities, later heavy Boss resources, optional full download and lazy Practice presentation.
- Deliberately deferred: per-seed question-bank payload splitting. The canonical bank is synchronous engine/save-validation input and selection also depends on live exposure/session state. All 120 questions remain available; only the heavier Practice renderer is downloaded on opening. A further split needs a separate metadata/presentation contract and validation design.
- Optional future P3 work: project-cache retention with active-client protection, and measured field startup/memory telemetry. These are proposals, not automatic implementation instructions.

## Actual verification

[The verification record](../../verification/hosted-readiness-2-38-0/integration.json) gives exact counts, source hashes, manifest sizes and raw logs. The earlier whole-suite attempt passed 927 tests and failed its 120-question UI file with an observed heap exhaustion. After the observer fix, that file and input guard pass all seven focused tests without increasing the heap. Six generated-resource checks and the isolated unchanged collector’s 12 tests also pass. A later combined attempt ended without summary; the other-file rerun stalled after collector output and was stopped. Those attempts are retained as incomplete evidence. A completed fresh whole-suite `npm test` pass is not claimed; it remains a prerequisite for a later main-release decision.

Syntax and production builds pass. Native checks cover cold/warm subpath startup, deferred Practice/Boss transfers, all 120 Practice options, native selection, stalled-entry save equality, actual decoded first actor frames, 180-second recovery, quota/worker denial, explicit retry, stale completion, short/narrow boot, portable zero-dependent requests, local developer mode and the existing complete static production Hub scenarios. Related manifest/entrypoint/build checks were repeated after the shell-only responsive CSS adjustment.

Original `dist/assets`, canonical mechanics/questions/card values, engine/map/RNG, status/VFX/AI owners and tutorial implementation are unchanged against the integrated main. Preserve the pre-existing untracked map-trial fragment; it is excluded from publication.

## Review and publication

Use [the candidate guide](../../HOSTED_READINESS_2_38_0.md) to run the branch locally. GitHub Pages still follows main; no live-site change is claimed. Source commit `8068ce7535f1073eeb7bd4bdb3333896333fb1dc` was published on `fix/hosted-readiness-input` and read back from GitHub. Its tree matches the reviewed local tree exactly. This audit-only follow-up records that publication; the final ref and unchanged main are read back again before the handoff. No main mutation or Pages deployment was performed.
