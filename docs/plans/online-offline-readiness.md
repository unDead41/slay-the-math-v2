# Online/Offline readiness completion plan

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
evidence and limits](../ONLINE_OFFLINE_MAIN_2_51_0.md).


Spec: latest Ijamm eight-point request, reproduced and mapped in `docs/ONLINE_OFFLINE_READINESS.md` and `docs/pet-ai/PLAY_MODE_HANDOFF.md`.
Base: d77b3e0ce87d573de89e84a9b2374df97ad625b9, main 2.49.0, Master SOR 1.2.0.
This plan records remaining work after the initial implementation and baseline suite, not a restart of that work.

## Global Constraints
Own branch only; no main push/merge/deployment. Preserve all gameplay/save/RNG, bank, original art/audio and main 2.49 continuity. One Settings choice; no pet API until explicitly Online. Complete release-bound retained CacheStorage and a worker are required for offline Ready. Document unavailable external pet/backend separately. Native QA uses disposable profiles; output relocation is environment-only. A feature-branch push is authorized by the user.

### Task 1: Finish readiness and mode edge cases
Interfaces: mode/Settings/pet cancellation, installer/worker/persistent namespace, manifest/bootstrap.
1. Read existing RED logs for capability eviction, orphaned cache, server-folder exclusion and pending pet UI cancellation; implement minimal corrections.
2. Run focused tests. Expected: every mode/install/worker/Settings contract test passes.
3. Run native storage/worker/missing-definition fault cases. Expected: no false Ready or entry through the Online gate; record missing-definition RED and correct fail-closed handling.
4. Rebuild production using the output-only QA adapter. Run `node --test tests/play-mode.test.cjs tests/play-mode-ui.test.cjs tests/offline-install.test.cjs tests/service-worker-offline.test.cjs` with DOM_QA_MODULE set. Expected: all pass. Commit implementation plus existing RED/GREEN evidence.

### Task 2: Validate cold offline and prepare Master handoff
Interfaces: production manifest/install receipts to real restarted browser; unchanged engine fixtures to combat; published branch to Master.
1. Run full browser-process close/restart acceptance, network/server stopped, HTTP cache disabled, then both stages/combat/Shop/Mystery/Predict/BM/BI/Tutorial/Practice/audio/VFX/pet. Expected: explicit successful assertions, report failures honestly.
2. Run isolated storage/worker faults, standalone portable zero-network acceptance and Online preload/continuity regressions. Expected: truthful modes/readiness with original behavior.
3. Run syntax, production builds and complete repository suite; compare unchanged gameplay/assets against base and production bytes against the tested manifest. Expected: all appropriate checks green; inherited issues remain named separately.
4. Update owner SORs, decisions/changelog, audit and pet handoff with exact evidence and limits. Commit candidate for one whole-branch read-only reviewer. Re-grade findings, one RED/GREEN fix pass for Important/Critical, complete suite after fixes. No second review.
5. Read current main again, record compatibility/base delta, push only feature branch, verify exact remote ref/tree. Expected: branch reviewable; main unchanged by this task.

## Review Focus
Check adversarial retained-storage replacement and eviction, worker restart and pinned old/new releases, first-boot Offline with absent manifest/worker, single preference across tabs and cancellation, server-only exclusions, API no-op in Offline, and whether native tests actually close the process and test every required player screen. Distinguish true production gaps from current main inherited findings, portable files, QA fault injection, unavailable external pet transport, and disk-full test-environment failures. Do not infer API availability from navigator.onLine.
