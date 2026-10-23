# Map Balance Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. Execution is confined to the user's isolated `balance/map` checkout.

**Goal:** Deliver reproducible per-seed/per-route map analysis and a bounded canonical-engine pilot for Master, without changing player gameplay.

**Architecture:** Enumerate every complete route from the registered maps and evaluate a clearly named, versioned pressure estimate. Run a separately labelled pilot through the existing engine with a frozen visible-information card policy and a feedback-only question policy. Export CSV/JSON, source differences, SOR and handoff; keep all audit data outside player assets.

**Tech Stack:** Node.js built-ins, existing CommonJS game engine, node:test, CSV/JSON.

**Spec:** User's map-domain brief in this conversation; `modules/map/SOR/01_MAP_RNG.md`; input package `STM_Balance_SOR_v1_2_20261023.zip`, SHA to be recorded in the report. Previous Map CP SOR 1.1 informs the contextual-score and internal-only rules.

## Global Constraints

- Base commit: `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`; branch `balance/map`; never merge or push to main.
- Preserve two stages, ten levels each, Mystery level 5, Rest level 9, Boss level 10, room quotas and registered snapshots.
- Card/enemy/economy values are inputs from other domains. Candidate v1.2 values are not silently enabled.
- No player UI or save changes; no import from production code into audit reports.
- Distinguish structure, estimated pressure, engine pilot and student results.
- Default pilot: eight fixed sampled campaigns per catalogue seed, before results are inspected. Pilot scores are provisional; no pupil win-rate claims.

## Review Focus

- Graphs with merges must preserve every distinct route and correctly weighted uniform-exit probabilities.
- Lowest HP may occur before a later Rest; a final aggregate must not hide an earlier resource deficit.
- Question feedback, bounded card choices and Passive swap must terminate without reading hidden answers/draw order.
- Stage 2 conditional outcomes and censored/error cases must not be counted as ordinary independent full-run wins/losses.
- Large CSV/JSON exports must preserve null versus zero, provenance and deterministic reruns; production files must remain untouched.

### Task 1: Structure and contextual estimates

**Files:** Create `tools/balance/map/{config.json,structure.cjs,score.cjs}` and `tests/map-balance-structure.test.cjs`.

**Interfaces:** `enumerateRoutes(map)` returns `{id,nodeIds,probability}`; `analyzeMap(seed,stage,config)` returns a seed summary and route rows; `riskScore(wins,trials)` returns provisional CP and Wilson interval or null for no trials.

- [x] Write and run failing tests for merged-route enumeration/probabilities, reserved levels, all 200 maps, recovery timing, three reachable roster offsets and no-trial scoring.
- [x] Implement read-only enumeration, fixed-baseline estimates, exact coverage and contextual score helpers.
- [x] Run the targeted tests, then commit the independently testable analyzer.

### Task 2: Canonical-engine replay

**Files:** Create `tools/balance/map/{policy.cjs,replay.cjs}` and `tests/map-balance-replay.test.cjs`.

**Interfaces:** `chooseCombatAction(view)` consumes only visible hand/intent/plans/choices; `runCampaign({runSeed,mode,routePolicy,forcedRoutes,limits,trace})` returns status, planned routes, actual room traces, stage outcomes and reproducibility metadata.

- [x] Write failing tests for deterministic replay, immutable policy views, connected path entry, feedback-only answers and bounded censoring.
- [x] Implement normal engine actions for combat, Predict, artifact education, Mystery, Shop, Rest and stage transitions; never directly resolve damage/rewards.
- [x] Validate states through the existing engine and keep errors/censoring separate from losses. Run tests and commit.

### Task 3: Audit/export and source differences

**Files:** Create `tools/balance/map/{audit.cjs,export.cjs,source-audit.cjs}` and `tests/map-balance-export.test.cjs`.

**Interfaces:** CLI `node tools/balance/map/audit.cjs --out reports/map-balance/base-2800f9a --trials-per-seed 8`; exporter writes seeds/routes/campaigns/trials/nodes and manifest JSON/CSV, with a complete coverage/error ledger.

- [x] Write failing tests for CSV round trip, deterministic manifests, null/zero preservation and error-denominator handling.
- [x] Implement fixed-budget sampler, reports and comparison with the v1.2 input specification. Record the package hash and baseline values.
- [x] Run all 100 seeds and all legal structural routes; run the fixed pilot and representative forced-route diagnostics within the declared budget. Persist partial status if a budget is reached.
- [x] Commit reports and tests after independent totals/coverage checks.

### Task 4: SOR, handoff and whole-branch verification

**Files:** Create `modules/map/SOR/04_MAP_COMBAT_POWER.md`, `docs/MAP_BALANCE_HANDOFF.md`; append domain links/decisions/changelog without replacing existing content.

- [x] State formula, profile, current-runtime versus candidate differences, easiest/median/hardest estimate and observed replay coverage, limitations and cross-domain requests.
- [x] Run analyzer/replay/export tests, map-module validation, root suite and syntax checks. Record any environment prerequisite issue separately from code failures.
- [x] Obtain one fresh whole-branch review as required by the execution skill, fix material findings with regression coverage, commit and publish only `balance/map`.

## Progress and decisions

Ledger: `docs/superpowers/plans/2026-10-23-map-balance-progress.md`. This is map tooling and reporting, not implementation of combat/economy tuning.
