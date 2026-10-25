# Online/Offline player mode and complete browser installation

## Current main integration authorization — 2.51.0

Ijamm now requests listing the changes still pending and publishing them to main.
This authorizes the combined Online/Offline feature e941 and immutable registry
snapshot e057 with main 09a5 / 2.50.0 as 2.51.0, preserving current education,
VFX/Idle, numerical, save/RNG, language, AI and original-asset owners. This
supersedes the relevant branch-only boundaries below; their source pins and
original test outcomes remain history. Combined scoped compatibility is **VALID with carried P2 findings**: 175 focused
checks on 7a, 23 fresh final checks on 20b and the stated native groups pass.
Publication remains **PENDING** until actual expected-head ref readback.
No simulation campaign, collector or model update is included. [Current scope,
evidence and limits](ONLINE_OFFLINE_MAIN_2_51_0.md).


25 October 2026, Asia/Kuala_Lumpur. Master SOR 1.2.0 read from actual main first. Base main `d77b3e0ce87d573de89e84a9b2374df97ad625b9`, game 2.49.0. Work branch `fix/online-offline-readiness`; no main push, merge or deployment is authorized. Preserve the newer icon recovery/combat continuity, AI model/data provenance, V5/VFX, tutorial, original assets, voices, numerical/question/save/RNG owners.

## Initial audit

| ID | Category / priority | Confirmed evidence and response |
| --- | --- | --- |
| OFF-01 | Confirmed / P1 | `dist/sw.js` excludes navigation and explicitly does not cache HTML. Asset completion alone cannot reopen the hosted game after closing the browser offline. Include the exact HTML/shell and manifest with a complete, release-bound persistent installation. |
| OFF-02 | Confirmed / P1 | Worker `clientsById` is an in-memory Map populated by the current tab. Restart removes that knowledge before bootstrap scripts can run. Reconstruct installed releases from persistent receipts and pin offline navigation to its release. |
| OFF-03 | Confirmed / P1 | Existing manifest excludes HTML/sw and ordinary background work defers Practice. Neither its available-file counter nor session cache establishes complete offline readiness. Rehash every player file from disk, include Practice and the shell, and expose readiness only after final verification/worker capability. |
| OFF-04 | Confirmed / P2 | There is no Online/Offline preference or published pet runtime/handoff in pinned main, ai807be676 or balance/master39ee5ab. Add one canonical Settings choice and an API-gated adapter/local FAQ handoff. Do not describe the external pet/backend as integrated or available. |
| OFF-R1 | Potential / P1 | A manifest, HTML or asset can change during a deployment/download. Bind all files to exact release digests, verify stored bytes, keep namespaces separate and never silently promote a partial/new release. |
| OFF-R2 | Potential / P1 | Quota, denied storage, worker denial, cache eviction and interrupted writes can invalidate offline claims. Fail closed, show actual remaining bytes/files/failures and support resume without clearing player records. |
| OFF-R3 | Inherited / P2 | CI-247-01 and QA-248-PRELOAD-01 remain inherited open findings in current main's audits. Keep their historical failures and distinguish new results; no broad CI/balance repair is authorized here. |

## Implementation contract

One player preference is independent of the browser connection hint and actual pet API request outcome. The existing loading behavior defaults to Online for compatibility; pet API use additionally requires an explicit Online selection. Clicking the same Online option also records that choice. Offline selection blocks/aborts API work immediately. A true `navigator.onLine` never proves an internet service is available.

Online retains the important-package entry gate and bounded automatic background downloads. Offline preparation reuses the verified downloader and its release-scoped CacheStorage namespace, adding the exact shell HTML, service worker and canonical manifest. It includes all player runtime/assets, Practice, BM/BI, all registered audio, tutorial and local pet help. Backend code, API credentials, private records, developer Hub/fixtures/datasets and API responses are not offline package files. Existing public client entry code remains under its current production owner.

The release manifest supplies the offline file list/digests and offline release identity. The manifest itself is stored canonically with its digest in the completion receipt; it cannot recursively contain its own digest. Readiness requires reading and hashing the actual disk responses, successful manifest storage, final complete receipt and an active worker supporting the offline protocol. Memory hits and old completion flags never suffice. Request persistent-storage protection when available, disclose denial/best-effort retention, and revalidate after restart/return. Missing/corrupt files revoke readiness. Keep separate installed release namespaces and pin offline navigation/manifest requests to the selected installation.

Local pet help is deterministic FAQ guidance and routes learners to the existing Tutorial/Practice/hints. It does not generate new mathematics answers or change game/learning state. The optional pet transport hook is disabled until explicitly Online; without a transport or after request failure the same local help works. No backend, API key, provider deployment, free-form offline LLM, ChatGPT pet artwork or live API success is inferred.

## Verification plan

Use test-first checks for preference/API gating, cancellation/stale answers, manifest coverage, cold disk audit, corruption/missing files, quota denial, pause/resume and release isolation. Preserve the first failing evidence. Run meaningful focused checks and the final complete repository suite, syntax and production/portable builds.

Native hosted acceptance uses a persistent Chromium profile: install fully, close the browser process, stop the server/block network, relaunch with the same profile, then load the original game URL. Exercise Main Menu, both stages/combat/boss resources, Shop, Mystery, Predict, Practice, both languages, native audio decode/playback, VFX and local pet help. Keep the cache-based browser result separate from a standalone portable-file test. Network/API outages and worker/storage denial use isolated browser contexts; verify no false readiness or pet API requests in Offline. Preserve byte-identical gameplay/save/RNG fixtures. Physical-device/browser-family coverage and human audio audition remain explicit limits.

The final branch audit and pet handoff record exact source/build identities, actual results, confirmed issues, remaining risks and publication separately. No remote CI or live deployment is implied by local verification.

## Verified implementation and integration boundary

The complete hosted restart now passes14native checks on the candidate:769files/232,929,606bytes including the canonical manifest, with all85MP3tracks decoded,120Practice questions and all98unique bilingual Tutorial pictures. Separate portable, Online-preload and continuity evidence is linked in [the audit](audits/online-offline-readiness/LATEST.md), together with raw failures and limits. Current main advanced to2.49.1 after the recorded base; Master must retain its Idle root/blink fix and regenerate shared outputs when integrating. This feature branch does not claim combined-current-main verification or live external pet availability.
