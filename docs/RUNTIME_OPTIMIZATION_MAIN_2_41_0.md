# Hosted resources and runtime optimization — main 2.41.0

Ijamm now requests publishing the completed update. Inputs: main `b730cad0cb27b53ffbdf687d8fc9edaed143ef43` (2.40.0) and feature `61ca12635ae2bd23f04400b7cc6399a9836adfd8` (2.39 candidate), shared ancestor `cb1bbcf`. Master SOR1.2.0 and current main/card/status/resource audits were read first. This main-release instruction supersedes the historical branch-only boundary for this completed scope.

The combined release retains current main card-effects-2 and Master candidate.5 values, old save archives, bilingual question reports/help, Normal/Large status descriptions/fallbacks and Settings-only Developer access. No additional numerical, bank, RNG or save-policy change is introduced.

## Resulting behavior

Essential code and first-screen artwork prepare before Enter, with verified file/byte progress and a180-second recovery deadline. Functional icons use verified optional preparation plus named semantic fallbacks, so an unavailable icon does not prevent entering the game. Later rooms/Boss resources prepare by actual run priority; Practice presentation loads on demand. The canonical120-question bank remains synchronous engine input. No per-seed bank payload split is claimed.

Combat retains actor canvases/controllers in the same encounter and patches changed HP/cards/status. Verified immutable session Blobs use a32MiB budget; decoded actor textures use96MiB estimated RGBA with active ownership and preferred idle. Current-only oversize is reported rather than blanking actors. These are retention budgets, not total browser/GPU memory.

## Integration findings

| ID | Priority | Confirmed problem and resolution |
| --- | --- | --- |
| INT-241-01 | P2 | Main's15-icon warmer used raw URLs, bypassing verified bytes. Native RED recorded all15; it now delegates to the shared verified image owner at background priority60, leaving foreground transfer capacity. |
| INT-241-02 | P2 | DOM reconciliation removed current-source icon state/fallback. A real icon-controller/patcher regression failed, then passed with owned metadata/fallback preserved and changed resources retried correctly. Both explicit Practice/scene retry listeners are retained. |
| INT-241-03 | P2 | Hard-gating an unavailable functional icon prevented Enter despite available semantic fallback. Native404 RED reproduced the blocked gate; icons are now soft core, with source-checked pending/ready/failure notifications. Essential code/backgrounds stay required. Recovery4/4 passes including named Block/Focus fallbacks. |
| INT-241-04 | P2 | Independent integration review found Tutorial screenshot/card images outside the verified path. Native RED rejected its release-valued URL; all Tutorial markup now uses the shared verified bridge, preserving portable assets and same-chapter figures. |
| INT-241-05 | P2 | Repeated preparation reassigned the same image source and aborted valid decodes. A native Tutorial card/frame case showed positive naturalWidth with failed state. Per-element/key job ownership, unchanged-src avoidance and explicit decode of verified bytes resolve it; all17 chapters decode correctly under hash-only routing. |

One fresh read-only integration review reported INT-241-04 as the sole Important finding, no Critical/Minor. Root verified one fix pass; the earlier feature review remains separate historical evidence. Do not describe a second independent re-review.

## Verification and limits

The final frozen-source suite passes **1,022/1,022**, zero failed/skipped. Targeted checks pass84/84 and review-fix units13/13; syntax and production/portable builds pass. Native checks pass for hosted readiness, four recovery cases,30/30 retained-canvas commands,24 status states,10 bilingual card flows, production Developer Hub, Result reports/portable mode and all17 Tutorial chapters under strict verified-image routing. Combat motion passes six summary checks, ten Passive paths and six viewport/quality cases, including the historical candidate's landscape stress case. Exact hashes and logs are recorded in [structured evidence](verification/runtime-main-2-41-0/integration.json) and [current audit](audits/hosted-readiness/LATEST.md). The branch's prior977-test result is historical; it does not substitute for this combined release. All16 actual Tutorial screenshot files were freshly captured after the image fix, with94 matching runtime input hashes.

The first full-suite attempt exited1 with a partial log and no summary during disk-pressure conditions; its cause was not captured and it is not accepted as a verdict. Final logs and browser profiles use task-owned RAM scratch. A status harness initially waited for a deliberately hidden pending image; it now checks attached pending state and the usable named control. No game behavior was weakened to satisfy that selector.

Physical devices, pupil outcomes, human sound audition and live Google deployment remain unverified. The existing Google receiver update remains an owner action. Older disk-cache namespaces remain; a live pinned-manifest client may need a user reload if an uncached file changes in a later deployment. No forced mid-combat reload is added. MODEL.zip remains unavailable; the BM textbook PDF is now available but no new model or mathematical-content validation is needed or claimed for this integration.

VIS-241-01 is a scoped visual follow-up: the selected1366×768 mid-action Developer capture clips the upper hero. Actor framing/art/styles are preserved against current main; this observation is not established as a new optimization regression. No unrequested geometry change is included.

## Release use

Pull main, restart the existing server and verify2.41.0. The existing Pages URL remains the same. Repository publication, Pages workflow success and actual public deployment are verified separately; the publication receipt records their observed status.
