# Runtime Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Ijamm's three approved changes: preserve combat actor canvases, reuse verified resources in a bounded session cache, and budget decoded textures by memory.

**Architecture:** A small DOM patcher updates changed combat nodes while retaining actor canvases/controllers within the same encounter. The existing verified transport gains a private immutable Blob LRU; the existing actor loader gains a weighted LRU with current-clip ownership and preferred idle retention. Engine transactions and synchronous save ownership stay unchanged.

**Tech Stack:** Existing JavaScript/DOM/Canvas/Fetch/Web Crypto, Node tests/jsdom and native Chromium. No runtime dependency.

**Spec:** `docs/sor/25_RUNTIME_OPTIMIZATION.md`; Ijamm's explicit UPDATE of recommendations 1–3.

## Global Constraints

- Work/publish only `fix/hosted-readiness-input`; no main mutation/deployment.
- Preserve original artwork/audio bytes, actor timing/pivots, engine values, question/RNG/save semantics.
- Preserve current main `1ece105903ee34c81c38a338ead01db65a834523` Settings-only Developer controls; Master SOR 1.2.0.
- Session budget 32 MiB compressed verified blobs; decoded texture budget 96 MiB estimated RGBA. These are cache budgets, not claims about total browser RAM.
- Current visible clips take precedence over eviction. An explicitly reported active-only oversize exception preserves display; idle clips are preferred within budget.
- Deferred recommendations (adaptive VFX, canvas resolution and save-write optimization) are out of scope.

Current integration snapshot: main advanced tocb1bbcf688d9556b55bc8fe5522b5b652309640c (2.38.0) during final checks. Integrated locally as00bfe4b, preserving education-report/hint owners. Candidate remains2.39.0.

## Review Focus

- Cache quota denied, sequential consumers, mutated response bodies and mismatched manifests never reuse unverified bytes.
- Background downloads cannot evict current foreground resources unnecessarily; eviction and destroy release owned cached data.
- Texture eviction never drops a visible clip; failed/late loads and released owners cannot retain old encounters indefinitely.
- Same seed/enemy at a new run/room, battle exit, resource retry and reduced-motion changes recreate only the appropriate owners.
- DOM patching preserves canvas identity and updates actual hand/status/language/disabled state, while gameplay and saves match an independent engine run.

### Task 1: Verified session cache

**Files:** `dist/asset-readiness.js`, `tests/asset-readiness.test.cjs`.
**Interfaces:** Existing `fetchAsset`/`prepare` signatures remain; `memoryBudgetBytes` config and memory counters in `stats()` are additive. Return fresh Responses over immutable verified blobs.

- [x] Write and run RED tests for sequential cache-denied reuse, once-per-session digest, body isolation, byte-budget eviction/background priority, failed verification and manifest isolation.
- [x] Implement the 32 MiB LRU; retain only successfully verified bytes. Keep transport cancellation/retry/scoping.
- [x] Run all transport/manifest tests GREEN and record measured request/hash counts; commit focused task.

### Task 2: Decoded texture budget

**Files:** `dist/animation.js`, `tests/texture-cache.test.cjs`, `tests/visual-preload.test.cjs`.
**Interfaces:** Existing actor `mount/create/preload/forgetPreload` remain. `createTextureCache({load,budgetBytes})` provides `load`, `retain(owner,current,idle)`, `release`, `forget`, `stats`; default actor cache uses it.

- [x] Write and run RED tests for weighted eviction, current-owner protection, idle preference, owner release, rejected/late loads, oversized images and same-path dedup.
- [x] Implement 96 MiB estimated RGBA LRU, player ownership and teardown; preserve original animation output/timing.
- [x] Run existing animation/first-frame tests plus new cache tests GREEN; commit focused task.

### Task 3: Persistent combat presentation and final integration

**Files:** create `dist/dom-patch.js`; modify `dist/app.js`, entrypoint/build metadata and check list; add `tests/combat-persistence.test.cjs`, `tests/runtime-optimization-browser.cjs`; update SOR/audit/evidence.
**Interfaces:** `DCDomPatch.patch(element,html)` reconciles keyed nodes, preserves matching actor canvas contents/state, and edits only changed DOM. Actor ownership spans only the same run/stage/room/enemy and nondecreasing turn; retry can force replacement.

- [x] Write and run RED DOM tests for actual HP/hand/status changes with identical actor canvases, owner replacement across scenes/runs, and save/RNG equality.
- [x] Capture native baseline at parent snapshot: actor mount/decode counts and command duration distribution on a fixed controlled combat sequence.
- [x] Implement incremental patching and retained actor controllers, including resource retry and new-encounter cleanup.
- [x] Run relevant DOM/animation/card/status/readiness and native integration tests; run project `npm test` and report every failure/incomplete attempt accurately. Build/check sequentially and verify all manifest hashes and protected files.
- [x] One fresh whole-change code review, one verified fix pass for Important findings; update audit with measured outcomes and limitations, commit and publish feature branch with an expected-SHA lease; read back both refs.

Completion evidence: final977/977, denied-cache dynamic images/recovery and paired native checks; source4cb5e3855c2e3f7567b637cdef3ec1b6234be20f /treecdf03423930335d2e1b3c317b0082a7e6ca6a637 published to the feature ref and read back. Mainade5d3a21e55b9d2911bfa935c8095c95801bd8c untouched. Later-main icon integration and physical-device validation remain explicit limits in the branch audit.
