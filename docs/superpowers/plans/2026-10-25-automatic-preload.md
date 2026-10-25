# Automatic preload implementation plan

> For agentic workers: use superpowers:executing-plans inline, with one fresh whole-branch reviewer after implementation. Track steps below.

**Goal:** prepare75% of important bytes before entry and automatically prepare the rest without starving interaction.
**Architecture:** extend existing verified asset manager with a pure startup plan, retention-aware progress and bounded incremental background queue. Bootstrap owns lifecycle/UI; manifest builder owns package membership.
**Tech stack:** existing JavaScript/Node/Fetch/CacheStorage, existing browser QA; no runtime dependency.
**Spec:** docs/superpowers/specs/2026-10-25-automatic-preload-design.md

## Global constraints

75% measured bytes;100% required core;180-second recovery; no eager Practice/Boss startup;32MiB compressed session/96MiB decoded texture budgets unchanged; no artwork/VFX/engine/math/RNG/save changes. Existing isolated clone and work branch; no unrelated user's files.

## Review focus

- Cache denial/eviction must not produce a false cached/offline-ready claim.
- Hidden/offline/manual pause must not pause foreground room/Practice requests.
- Failed or stale async completion must not clear a new queue entry or mutate gameplay.
- Startup fallback is allowed only after required runtime/visual completion.
- Source/production/portable, hash URLs, latest V5/VFX and BM copy must remain consistent.

## Task1 — policy, retention and incremental queue

Files: dist/asset-readiness.js, tools/build-asset-manifest.cjs, tests/asset-readiness.test.cjs, tests/asset-manifest.test.cjs, tests/background-download.test.cjs.
Interfaces: startupPlan(manifest) -> {urls,beforeMenu,totalBytes,targetBytes,selectedBytes,ratio}; manager.progress(urls) -> byte/file verified/available counters; manager.available(url) -> boolean; manager.reconcile({retryStorage}) -> fresh retention snapshot; createBackgroundQueue({manager,canRun,limit,onChange}) -> enqueue(url,priority), retry(), pump(), stats(), destroy().
- [x] Write and observe failing tests for a hand-derived unequal-size75% plan, current room promotion, one/two transfer limits, pause and foreground capacity, cached versus evicted session resources, retry after failure.
- [x] Implement shared policy and manager/queue behavior; builder emits startup metadata. Required core precedes optional selection; late classes excluded from startup.
- [x] Run focused Node tests and record results; commit the independently testable policy.

## Task2 — actual entry and automatic lifecycle

Files: dist/bootstrap.js, dist/boot.css, dist/index.html if needed; modules/localization/game.ms.json; tests/automatic-preload-browser.cjs and existing recovery tests; generated entrypoints/release/manifest via owners.
Interfaces: consume startup metadata/policy and background queue fromTask1. Online fallback only after hard-core runtime ready. UI uses verified and available counters; automatic queue starts on Enter, pauses/resumes on visibility/network/manual controls, room priority is promoted.
- [x] Write and run native regression showing missing75% and no automatic completion on old source; record actual old behavior.
- [x] Add75% gate and explicit online fallback, incremental remaining downloads, retry/reconnect/lifecycle and truthful localized progress. Preserve Practice lazy, foreground resources, first-frame decode and saved transactions.
- [x] Verify native source/production, cache denial/slow/error/return, menu EN/BM/narrow and real scene/save/actor behavior. Run syntax/production/portable builds and exact hash validation.
- [x] Run final full npm test with jsdom available, no skipped tests silently accepted. One fresh reviewer, root RED→GREEN fix pass if needed; update SOR/audit, version2.46.0 candidate and commit.

Remote publication follows the user's instruction for the concrete result; do not overwrite a moved main head or describe a work branch as the deployed game.

Final result:1,094/1,094, zero failed/skipped; focused28/28, all seven native families, syntax/build/hash checks pass. One fresh review; both findings fixed in one root pass with RED→GREEN evidence. Exact source/production counts678/679; original V5/VFX/game/math/save/RNG owners unchanged. Initial shallow-history failure retained and resolved by fetching the pinned historical object, no balance change. Publication remains separately recorded.
