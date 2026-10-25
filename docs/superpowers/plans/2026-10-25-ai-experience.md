# AI Experience and Efficiency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Improve existing developer AI with safe cheaper projections, useful public choices and validated empirical acquisition guidance; publish balance/master only.

**Architecture:** A portable experience/validation module supplies strict runtime-bound data and a small acquisition model. Combat scoring reuses exact projections and reasons over public choices. Existing agent/deck/replay interfaces remain backward compatible; no player runtime tuning.

**Tech Stack:** Node/CommonJS, actual Master engine, node:test/jsdom and Chromium/Playwright.

**Spec:** docs/superpowers/specs/2026-10-25-ai-experience-design.md

## Global Constraints

- Main6c49f3980c3a832635d4d01a6c50a8df98ac4aad /2.45.0; destination balance/master only, expected old b281dc69e752f84424b81d0d051644b9da154dd9.
- Preserve Mastercandidate.5, numbers, saves/RNG/questions/assets and current language/VFX/motion. Keep AI Node developer-only and legacy specialist defaults.
- Keep schema3 and existing CSV positions; append new metadata. Use prerelease2.46.0-ai.1 through shared release generation.
- No stale-label fitting, test-seed leakage, outcome-dependent resampling or universal/pupil-rate claim.

## Review Focus

- Stale, missing, corrupt or cross-difficulty experience must fall back safely without changing legality or player state.
- Choice ranking must account for payment and revealed cards without reading actual hidden order or canonical answers.
- Model fitting must distinguish complete factorial pairs, duplicate contexts, censors and unseen validation seeds.
- Cached projections must preserve actual Weak/Defense/Block semantics, costs, chosen actions and the bounded simulation/observation boundary.
- Optional experiment fields and history/CSV/source fingerprints must remain compatible with older reports and strict developer-server validation.

---

### Task 1: Experience exchange and current-source evidence

**Files:** create tools/ai-playtester/experience-data.cjs, tools/ai-playtester/experience-cli.cjs, docs/balance/SIMULATION_DATA_HANDOFF.md, tests/ai-experience-data.test.cjs; capture producer/evidence under docs/balance/master/ai-data-20261025/ and reports/ai-playtester/data-20261025/. Update package scripts later with the feature.

**Interfaces:** runtimeKey(provenance) -> deterministic key; normalizeReports(reports,{domain,split,source}) -> observations; writeBundle(out,bundle) refuses existing output; readBundle(out) verifies hashes/count/unique identities; fitModel(bundle) returns bounded per-runtime card/pair priors and training provenance.

- [x] Capture current baseline agent3 reference holdouts/campaigns before AI edits, preserving original options/statuses/hashes. Generate fixed reusable scenario recipes from old card reports, not old labels.
- [x] Write real report/data regressions for source mismatch, tampered files, duplicates, missing factorial masks, censored null utility, heldout exclusion and hand-computed single/pair fitting. Run RED on absent module.
- [x] Implement minimal typed validation/normalization/fitting and fresh-directory I/O; include concrete Map/Economy JSONL examples and branch instructions in the Markdown contract.
- [x] Run the data tests and existing source/report tests; commit independently testable data support.

### Task 2: Public tactical choices and cheaper projections

**Files:** modify tools/ai-playtester/agent.cjs, create tools/ai-playtester/choice-policy.cjs and tests/ai-choice-efficiency.test.cjs. Update source identity/check script for the helper when integrating.

**Interfaces:** shared choice policy receives x,run and the existing exact immediate scorer; returns legal string/UID/read-ahead value. public known-card pool includes revealed choices. No extra unmetered engine actions. Agent version sampled-turn-search-4.

- [x] Reproduce actual Search passing a lethal Attack, Burning Page keeping an unplayable reveal, paid choice ranking and revealed-zone reconstruction errors; verify run/RNG immutability and hidden-order independence. Count real enemyDamage calls before/after a fixed Attack-hand decision.
- [x] Implement safe projection reuse and public composition/payment-aware choice ranking; retain existing caps and use the same policy inside rollouts and actual choices. Use canonical IDs where touched.
- [x] Run all core AI/strategy/effects/choice tests; compare costs/valid actions and measured projection counts; commit.

### Task 3: Runtime-gated acquisition model and replay calibration

**Files:** create tools/ai-playtester/experience.cjs, tools/ai-playtester/experience-model.json, tests/ai-experience-policy.test.cjs; modify deck-policy.cjs, experiments.cjs, report.cjs, cli.cjs, package scripts and developer AI summary copy as needed.

**Interfaces:** createExperience(x,{enabled,model}) -> status,id,deckAdjustment(deck); createDeckPolicy(x,{experience=true}) defaults compatibly and reports guidance. normalizeOptions accepts experience:on/off only; report metadata/source identity include the bundled model/helper and actual guidance status.

- [x] Write RED tests for missing/corrupt/stale/cross-profile fallback, exact bounded card/pair contributions, duplicate-pair cap and actual offer decision/read-only state; old report/CSV fields retain their positions.
- [x] Integrate conservative adjustments and explicit metadata; add CLI export/train/read commands with fresh-output guards. No arbitrary model path in server options.
- [x] Replay fixed training recipes on current agent4 with guidance OFF for all three profiles; retain raw reports, manifests and normalized data. Fit and install the source-bound model on this review branch.
- [x] Run predeclared paired OFF/ON campaigns at seeds701/702, preserving every result. Promote the default model only if invalid/censors do not rise and aggregate terminal utility does not fall. If it fails, keep guidance OFF/fallback and record the unsuccessful candidate, without retuning on validation.
- [x] Run focused acquisition/report/server tests; commit.

### Task 4: Final verification, audit and branch publication

**Files:** update docs/AI_PLAYTESTER.md, docs/sor/20_DEVELOPER_TOOLS.md, docs/sor/23_MASTER_BALANCE.md, DECISIONS/CHANGELOG, docs/audits/balance-master/LATEST.md; generated version metadata; docs/balance/master/AI_DATA_2026_10_25.md and evidence directory.

**Interfaces:** pinned source registry, fixed before/after and OFF/ON reports, fresh final-source fingerprints and expected-head publication.

- [x] Record dataset coverage, source eligibility, actual tactical improvements, projection/time measurements and heldout outcomes without overstated learning/accuracy claims.
- [x] Generate2.46.0-ai.1 metadata, run final whole Node suite, full syntax, build/production and actual AI-browser/export/history/cancel/isolation checks; preserve original runtime/art/source bytes except expected generated metadata.
- [x] Fresh strongest-model whole-branch review; grade findings, one RED/GREEN fix pass for Important/Critical and green suite, record rulings/minors. No re-review.
- [ ] Refresh source/main refs and scoped diff; push exact tested tree to balance/master with expected old SHA, no force; read back branch/tree/parents/version, main unchanged by this task. Retain branch/worktree for user review.
