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

The source is prepared for feature-ref publication with an expected-SHA non-forced update frombcd90da6f1a6362449ca031fbaf9cada82aa4a92 and integrated maincb1bbcf as the second parent. Published source SHA/tree and final readbacks will be recorded after the update. No main ref is authorized to move.

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
