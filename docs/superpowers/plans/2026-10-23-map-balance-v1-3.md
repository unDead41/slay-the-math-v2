# Map Balance v1.3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline. One fresh whole-change reviewer follows implementation. Steps use checkbox syntax.

**Goal:** Implement the user's six accepted map-balance improvements with reproducible canonical-engine evidence and a Master handoff.

**Architecture:** Extend the existing developer replay with visible-category routing, recorded stage-entry replay, Predict ability scenarios and read-only telemetry. A worker-based experiment runner creates fixed campaign cohorts, then compares the same easy/median/hard paths from captured valid entry states. Aggregate recovery, risk/reward, driver and regression reports independently of production gameplay.

**Tech Stack:** Node 24 built-ins, existing CommonJS engine, node:test, JSONL/CSV/JSON, Python independent export checks.

**Spec:** User's six-item request in this conversation; `modules/map/SOR/04_MAP_COMBAT_POWER.md`; current baseline `d70b409b4da2ecf52ec60a0356df52bc1bab632b` on isolated `balance/map` checkout. The original runtime base remains 2800f9a; no main integration.

## Global Constraints

- Preserve other chats, two stages, ten levels, Mystery 5, Rest 9, Boss 10, quotas, snapshots, saves and player UI.
- Card/enemy/economy stats are inputs; no invented Easy/Medium/Hard overlay. Mark unavailable full difficulty inputs NEEDS_COMBAT_MASTER_ADAPTER.
- Route and combat policies see public room categories/edges/HP/Gold and visible combat information only. Synthetic Predict knowledge profiles explicitly disclose canonical-answer-key use; baseline feedback policy remains oracle-free.
- Matched route comparisons use immutable engine-valid captured stage-entry states, same seed/deck/HP/Gold/artifacts/RNG per rank. Divergent route RNG consumption remains a disclosed confound; no causal claims about individual room rewards.
- Fixed budgets: uniform reference eight campaigns/seed; four campaigns/seed for each of avoid-elite, seek-reward, seek-shop, health-recovery; two campaigns/seed for each high/low/skip Predict on health-recovery. 3,000 full campaigns total. Eight independently created Stage 1 entries/seed, and up to eight unique runSeed Stage 2 entries from uniform reference arrivals, each replayed on all three rank routes. Missing arrivals remain missing.
- Per-combat/global action limits remain 100 turns/500 plays/10,000 API actions. Batch budget 3,600 seconds/invocation, two workers by default, checkpoint/resume identical context; no result-based stopping.
- All rates/CP remain provisional synthetic-policy evidence. Final pupil Easy/Medium/Hard 90/70/50 validation belongs to Master.

## Review Focus

- Dynamic policies must never enter a disconnected node or read hidden enemy/event/offer identities.
- Stage-entry capture/replay must not mutate a source state, reroll a map or fabricate a Stage 2 survivor; starting clock and stats must remain coherent.
- Predict skip/wrong scenarios must not deadlock, retry to accidental perfection, or report target probability as observed pupil accuracy.
- Recovery opportunity differs from actual healing; event penalties, combat deaths, Shop affordability and post-stage Gold must retain their actual denominators.
- Worker completion, errors/censoring, conditional entry availability, matched pairs and old-reference drift must remain distinguishable; changed inputs invalidate resume.

### Task 1: Replay controls and observations

**Files:** Modify `tools/balance/map/replay.cjs`; create `tools/balance/map-advanced/{route-policy,question-policy,telemetry,scenarios}.cjs`; tests `tests/map-balance-advanced-replay.test.cjs`.

**Interfaces:** `chooseRoute(view,policy,rng)` returns connected node/reason/scores. `runCampaign(options)` adds routePolicy, predictProfile, initialState, captureCheckpoints, stopAtEntry and stopAfterStage; legacy defaults retain action hashes. `captureMetrics/observeAction` record actual state deltas without writes. Difficulty guard accepts actual baseline only until a full owner adapter exists.

- [x] Write RED tests for visible-only routing choices, low-HP recovery, controlled high/low/skip Predict, invalid difficulty, immutable captured entry and paired stage completion; compare literal historical trace hashes.
- [x] Implement controls using existing canonical API actions; keep default behavior compatible. Capture deck/HP/Gold/artifact/RNG states and resource/event/Shop/Focus metrics.
- [x] GREEN targeted and old tests; commit with ledger evidence.

### Task 2: Fixed experiments and matched entry bank

**Files:** Create `tools/balance/map-advanced/{config.json,worker.cjs,experiments.cjs,storage.cjs}` and `tests/map-balance-advanced-experiments.test.cjs`.

**Interfaces:** `buildCampaignTasks(seeds,config)` creates fixed shared-seed cohorts; `buildMatchedTasks(bank,ranks,config)` creates rank triplets with identical entry hashes. `runExperiments(options)` runs two workers, checks a fixed wall budget, persists sharded JSONL/checkpoints/context/bank and deterministic task IDs.

- [x] RED tests for cohort counts, same-seed pairing, absent Stage 2 entry, worker terminal/censor behavior, changed-context resume rejection and JSONL round trip.
- [x] Implement task generation, worker scheduling and resumable exports; entry records are deduplicated by runSeed and never created by editing game state.
- [x] GREEN tests and small real-engine smoke; commit.

### Task 3: Recovery, risk/reward, explanations and regression gates

**Files:** Create `tools/balance/map-advanced/{report.cjs,check.cjs,README.md}`; tests `tests/map-balance-advanced-report.test.cjs`; independent verifier `tools/verify-map-advanced.py`.

**Interfaces:** `buildReport(trials,bank,context)` exports policy/Predict/seed/matched/recovery/Shop/risk-reward metrics and driver flags. `checkReport(report,reference)` returns hard integrity failures separately from pending calibration/input warnings. Primary compatibility gate compares all 800 uniform reference status/action hashes with v1.2 at unchanged runtime inputs.

- [x] RED tests for stage-conditional denominators, per-rank matched input consistency, actual healing vs opportunity, death/penalty windows, zero-affordability and regression drift.
- [x] Implement reports, uncertainty and automatic checks; publish the exact missing full difficulty inputs and Economy branch provenance without importing its gameplay files.
- [x] Run all 100 seeds with declared budgets; independently verify exports and source/trial hashes; commit datasets.

### Task 4: SOR, Master delivery and final checks

**Files:** Update Map SOR 04, root/module indices, relevant SOR 09/12, decisions/changelog; create `docs/MAP_BALANCE_V1_3_HANDOFF.md`, plan ledger and validation logs.

- [x] Document each accepted item, actual counts/coverage, repeated route estimates vs engine results, source controls, pending difficulty and risks.
- [x] Run targeted tests, map validation, root suite with concurrency 2, syntax and production exclusion checks; preserve prior reports as historical inputs.
- [ ] Obtain one fresh code review, address material findings RED→GREEN and run the appropriate suite. Commit and publish only balance/map with an expected-head lease; verify remote file tree and no gameplay diff.

## Progress

Ledger: `docs/superpowers/plans/2026-10-23-map-balance-v1-3-progress.md`.
