# AI Strategy Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver the three approved AI effects/planning/deck-building improvements on branch ai.

**Architecture:** Real-action observation produces per-card support metrics. Bounded sampled engine rollouts evaluate Expert choices. An opt-in deck policy supplies campaign acquisition decisions; legacy replay stays compatible.

**Tech Stack:** Node/CommonJS, native node:test, existing Playwright QA, existing private Master runtime.

**Spec:** docs/superpowers/specs/2026-10-24-ai-strategy-design.md

## Global Constraints

- No new dependency or game-version bump; developer tools only.
- Preserve production files, numerical balance, question logic, player saves, main and legacy replay.
- Three sampled worlds, three turns, three plays/turn, fourteen transitions/root/world, six root cards plus End Turn; <= 300 transitions.
- Report named effect units and contextual paired outcomes; no universal CP or pupil-rate claims.
- New callbacks opt-in; schema 3 and a new agent version identify this update.

## Review Focus

- Actual immutable card transactions/choices may replace objects: no recount or planning contamination.
- Partial/capped draws and zero-damage enemy turns: report only actual effects and consumed statuses.
- Carry, terminal Block and multi-hit prevention: source ledger must reconcile without double credit.
- Hidden order/RNG changes and asymmetric rollout truncation: decisions must remain public-state based and budgets equal.
- Duplicate Passives, deck minimum and Gold exactly equal to price: choices must remain legal and explainable.

### Task 1: Actual support effects

**Files:** create tools/ai-playtester/effects.cjs, tests/ai-playtester-effects.test.cjs; modify experiments.cjs, report.cjs and replay.cjs.

**Interfaces:** createEffectsTracker(x) -> {capture(run, fn), snapshot(), dispose()}; capture returns fn's value and collects effects only after success. Optional replay observeAction(run, fn) and onCombatPlay retain existing callbacks. Snapshot exposes per-card effect fields/ratios and mitigation totals.

- [x] Write real-engine tests: Rune Guard + Tower Shield against a 5-damage Master Wisp grants 20, absorbs 5, expires 15; Cinder Guard reduces incoming by 2 before Defense/Block; delayed/Passive draws count actual Hand moves; failed actions/planning produce no telemetry.
- [x] Run new tests and record missing feature failures.
- [x] Implement staged scoped observer, FIFO Block/status ownership, receipt-cost accounting and optional actual-action capture.
- [x] Run effects + existing AI/replay tests; require no failures and cost/Block reconciliation.
- [x] Commit the tested task.

### Task 2: Deck synergy policy

**Files:** create tools/ai-playtester/deck-policy.cjs, tests/ai-playtester-deck.test.cjs; modify replay.cjs and experiments.cjs.

**Interfaces:** createDeckPolicy(x) -> {reward(run, keys, upgraded), shop(run), camp(run), upgrade(run, candidates), remove(run, candidates)}. Decisions include reason; reward key nullable; shop kind card/artifact/remove/leave with index/uid. Optional replay deckPolicy and bounded onDeckDecision callback.

- [x] Write actual runtime tests for Block–Shield Shot/retention, duplicate Passive skip, best marginal upgrade, safe removal, exact affordability and live campaign application.
- [x] Run tests and observe missing decisions/incorrect current acquisition.
- [x] Implement mechanic-derived deck quality/marginal scoring and legal selectors; connect opt-in replay hooks including Mystery targets.
- [x] Run deck + effects + existing replay tests; legacy calls stay unchanged.
- [x] Commit the tested task.

### Task 3: Multi-turn Expert

**Files:** modify tools/ai-playtester/agent.cjs; create tests/ai-playtester-strategy.test.cjs; update existing agent tests for the new documented horizon.

**Interfaces:** createAgent(x,{skill}).decide(run) retains kind/uid/focus and adds horizon/samples/budget/explanation. LIMITS describes three-world/three-turn rollout limits. No live mutation or hidden RNG/order dependency.

- [x] Write real-engine tests: setup Passive has future value; lethal guard and current lethal still work; sample worlds differ; hidden order/RNG changes produce equal decisions; future enemy turns and draw cards actually get evaluated within budget.
- [x] Run tests and observe current-turn-only failures.
- [x] Implement safe public-pool sampling, equally bounded continuation, support-aware immediate priorities and visible choice resolution.
- [x] Run strategy + all AI tests; reconcile actual telemetry against committed plays after search.
- [x] Commit the tested task.

### Task 4: Reports, documentation and end-to-end validation

**Files:** tools/dev/playtester/{app.js,index.html,style.css}, report.cjs, package.json; tests AI browser/report coverage; AI guide, SOR20/SOR23/DECISIONS/CHANGELOG, fresh verification evidence.

**Interfaces:** schema3 JSON, existing outcome CSV with new identity; support columns and efficiency records; deck decision trace plus sampled planning explanation. Old reports retain empty/unknown fields without fabricated zeros.

- [x] Write report/browser assertions for actual Block/mitigation/draw metrics, zero-cost null ratios and source-bound exports.
- [x] Observe RED before UI/report implementation.
- [x] Implement tables/explanations and update new-file syntax/test commands and docs.
- [x] Run focused tests, actual AI and existing developer browser tests, full npm test and syntax. Expected every test passes; any failures recorded and fixed.
- [x] Run fresh campaigns/pairs, production build and protected-file/route checks. Record actual counts/limits, source hashes and raw evidence.
- [x] Fresh whole-change reviewer checks spec and Review Focus. Fix Important findings with RED→GREEN and green suite; record any remaining limitations.
- [x] Prepare and commit final tested code/evidence for ai-only publication.

Publication and remote tree/main verification are the final external actions after this commit; the final handoff records their actual result.
