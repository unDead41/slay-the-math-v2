# Current-runtime Map Recheck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. One fresh whole-change reviewer follows implementation. Steps use checkbox syntax.

**Goal:** Recheck all 100 map seeds against current main and publish reproducible specialist evidence to balance/map for Master.

**Architecture:** Fast-forward the isolated feature checkout to the inspected main, which already contains the old map audit. Extend the existing worker runner to inject the canonical integrated Master runtime. Reuse fixed public routing and greedy combat policies, record current difficulty/definition/source hashes, and regenerate reports with the actual final-boss Gold convention. Keep historical datasets unchanged.

**Tech Stack:** Node 24, worker_threads, existing Master loader and replay, JSONL/CSV/JSON, Python stdlib verifier.

**Spec:** Latest user request to recheck changed map balancing and push balance/map; MASTER_SOR_PROJECT.md; modules/map/SOR/04_MAP_COMBAT_POWER.md; docs/sor/23_MASTER_BALANCE.md.

## Global Constraints

- Main snapshot 990541d57c6df96cefb21eddc7a365d1d989a74d (2.37.0); feature starting head5480273cb28752741f3043f8d23753aa0374902d is its ancestor,42 commits behind. All inspected specialist branches are already ancestors of main.
- Only publish balance/map with expected-head lease. Do not mutate main, other branches, gameplay numbers, question bank, topology, save formats, artwork or player UI.
- Preserve two stages/ten levels, Mystery5/Rest9/Boss10 and all100 catalogue seeds. Preserve v1.2/v1.3 datasets as historical evidence.
- Use canonical loadMaster/createReplay binding master-1.4.0-candidate.4; no invented tier overlay. Keep combat/reference acquisition policy fixed; high/low Predict oracle disclosure remains mandatory.
- Fixed per difficulty: uniform4/seed; avoid-Elite/reward/Shop/health-recovery2 each; high/low/skip Predict2 each on health-recovery.1,800 full campaigns per tier,5,400 total. Four unique uniform entry states per seed/stage, each on three nominal rank paths. Stage2 entries are actual survivors only.
- Ranks remain pre-outcome structural/pressure reference ranks; no outcome-based relabeling. CP provisional, contextual and distinct from card ICP/CCP.
- Eight workers maximum per profile,7,200 seconds per invocation,120 seconds per task,100 combat turns/500 plays/10,000 API actions. Resume only identical context; no outcome-dependent resampling. Errors/censor stay separate and unscorable in unresolved scope.
- Predict/artifact/Mystery obey actual two-attempt engine settlement; no forced answers/rewards. Targets pupil90/70/50 remain unmeasured.

## Review Focus

- A requested difficulty must execute the actual integrated runtime and reject a mismatched captured profile.
- Profile/definition identity, source hashes and state/RNG/clock must survive capture and matched replay without fabricated Stage2 arrivals.
- Current two-attempt failures must settle without retry loops or artificial Focus/seal rewards; historical default traces must remain stable.
- Shop artifact affordability and usable final Gold must use actual candidate prices/grants, not legacy constants.
- Partial/censored paths, repeated seeds, shifted reference methods and conditional Stage2 rates must retain correct denominators and uncertainty.

### Task1: Runtime-aware experiment and resource adapter

**Files:** Add tools/balance/map-advanced/runtime.cjs and tests/map-balance-current.test.cjs; modify worker.cjs, experiments.cjs, telemetry.cjs, report.cjs, check.cjs.

**Interfaces:** runtimeFor(config) returns cached canonical runtime/replay/provenance for master, retaining historical default otherwise. Task options carry runtimeBuild. Context pins actual runtime/source/protocol and profile. summarizeScope/pairedDifference accept explicit postRunBossGrant, defaulting to historical behavior.

- [x] RED tests: a Master worker entry has correct difficulty/HP/Gold/definition and mismatch rejection; actual engine artifact price affordability; zero final-boss grant keeps Gold; declared cohort/pair identities; current failure settlement.
- [x] Implement the minimal optional adapter/report arguments without changing gameplay/default policies. Validate all200 graphs against retained snapshots.
- [x] GREEN old/new audit tests plus Master/question contracts; small real-engine smoke, commit.

### Task2: Fixed current-profile matrix and independent verification

**Files:** Add tools/balance/map-recheck/{config.json,run.cjs,README.md}; extend tools/verify-map-advanced.py; reports/map-balance/v1.4/{easy,medium,hard} and validation-v1.4.

**Interfaces:** run.cjs invokes the existing fixed runner once per tier with pinned config; outputs existing per-seed/per-route/report schemas. Python verifies exact task sets, identities, raw hashes, source/checkpoint provenance, scopes, CP/Wilson and CSV cells independently of Node aggregation.

- [x] RED regression checks for tier readiness and changed-runtime reference interpretation, conditional/censored scopes and no fabricated paired inputs.
- [x] Run all100 seeds for each tier; retain errors/censor rather than fabricating losses. Verify persisted journals and regenerate reports only from those records.
- [x] Independently verify exports and collect actual route/recovery/Shop/boss/Predict results, commit.

### Task3: Master handoff, fresh review and feature publication

**Files:** Add docs/MAP_BALANCE_V1_4_HANDOFF.md and compatibility/provenance report; update Map SOR/index, root index, decisions/changelog and this plan ledger.

- [x] Report VALID/PERLU UPDATE/CONFLICT/BELUM DISAHKAN per finding, full inspected SHAs, Git relationships, old-vs-current limitations, changed files and input ownership.
- [x] Run root npm test with required temporary test dependencies, map tests/validation, syntax and production build/exclusion checks. No gameplay diff relative inspected main.
- [x] One fresh read-only reviewer; fix material findings RED→GREEN and rerun appropriate suite.
- [x] Recheck main/feature heads and affected inputs, publish only balance/map with a lease, verify remote tree and handoff.
