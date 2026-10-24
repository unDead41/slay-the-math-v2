# Hosted readiness — branch audit and handoff

24 October 2026 UTC. Repository `unDead41/slay-the-math-v2`. Branch `fix/hosted-readiness-input`, candidate **2.38.0**. Master SOR **1.2.0**.

| Reference | Verified snapshot |
| --- | --- |
| Initial main 2.36.0 | `50d3af423cdc2240e949f4ddf29e023865304b65` |
| Main integrated during work, 2.37.0 | `6376a222169815af582cf55aa4794f3c809a3515` |
| Initial local implementation / recovery checkpoints | `c06de595a1c41e481d212c966dc7b18acfdc4b82` / `5952053` (local work history, not claimed as published commits) |
| Final source identity | Both generated manifest IDs, input hashes and preserved-source checks in [integration.json](../../verification/hosted-readiness-2-38-0/integration.json); published source SHA is recorded after the branch ref is verified. |
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

Use [the candidate guide](../../HOSTED_READINESS_2_38_0.md) to run the branch locally. GitHub Pages still follows main; no live-site change is claimed. The published source commit and final remote ref are checked after authorized branch publication and reported in the handoff.
