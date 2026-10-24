# Master Balance and AI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Consolidate the three specialist findings into source-correct Master tooling and better AI acquisitions, publish balance/master only.

**Architecture:** Preserve current main/candidate.5 runtime. Selectively adopt the Map adapter and Economy telemetry, then add a focused artifact policy and frozen-offer Mystery policy behind existing opt-in replay hooks. Keep historical specialist datasets in their original branches and cite their pinned SHAs.

**Tech Stack:** Node24/CommonJS, actual game engine, node:test, local Chromium/Playwright.

**Spec:** docs/superpowers/specs/2026-10-24-master-balance-refresh-design.md

## Global Constraints

- Destination balance/master only; do not update main or other remote branches.
- Preserve Mastercandidate.5/card-effects-2, all numerical profiles, original assets, questions, map and save identities.
- No universal CP, exhaustive-combination or pupil90/70/50 assertion.
- New output and policy+engine hashes; no historical overwrite/resume.
- Prerelease2.42.0-balance.1 uses shared generated release metadata.

## Review Focus

- Legacy callers must retain their original runtime and policy defaults.
- Acquisition credits within paid transactions must satisfy gross earned-minus-spent equals actual Gold delta.
- Duplicate/stronger discounts and pure-cash purchases must not create fictitious positive value.
- Transform must compare the actual frozen replacement and reset upgrade, including a ten-card deck.
- Planning must leave live state/RNG/observed action counts unchanged; optional decline and mandatory choices must remain legal.

---

### Task 1: Current Master map and economy observations

**Files:** adopt tools/balance/map-advanced/{runtime,worker,experiments,report,check}.cjs, tools/balance/map-{recheck,regression}/, tools/verify-map-advanced.py and tests/map-balance-current.test.cjs from Map; combine tools/balance/map-advanced/telemetry.cjs with Economy gross accounting; add focused tests/master-refresh-economy.test.cjs. No legacy source snapshots or numerical config replacement.

**Interfaces:** runtimeFor(config), runtimeContext(config); createTelemetry({E,A,cardMerit,hash},run); report explicit postRunBossGrant default preserves legacy.

- [x] Import the eight Map contracts first; add the real Purse gross payment test from Economy. Run on untouched code and record the expected RED evidence.
- [x] Adopt the explicitly bound Map tooling/configs and combine canonical runtime quote with gross credit accounting; preserve legacy quote fallback.
- [x] Run Map/current, new economy, Master and legacy replay/report regressions; assert zero failed tests. Commit this independently testable adoption.

### Task 2: Marginal AI artifacts and frozen Mystery options

**Files:** create tools/ai-playtester/artifact-policy.cjs; modify deck-policy.cjs, agent.cjs/version, experiments.cjs/source identity, map/replay.cjs; tests/ai-playtester-deck.test.cjs and tests/ai-playtester-acquisition.test.cjs. Extend check:ai for the new module.

**Interfaces:** createArtifactPolicy(x) returns score(run,id,{price}), futureValue(run,id), choose(run,ids,{allowSkip}); createDeckPolicy(x) exposes artifact(run,ids,options), transform(run,transforms,candidates,options), mystery(run,event,pending) alongside existing methods. Replay calls these optional methods outside act(), then observes only actual selections/claims.

- [x] Write real-engine regressions: reject a Purse purchase costing more than40 grant; reject redundant Seal under Contract; value free gifts/maxHP; select actual positive transform at deck10 and account upgraded loss; optional negative outcomes decline; mandatory options remain legal; inputs/offers/RNG unchanged. Confirm failures on old behavior.
- [x] Implement artifact future-effect heuristics with explicit units and no unconditional baseline; use exact runtime price and marginal strongest discount. Route actual free/Boss artifact choices through the optional policy while preserving default replay.
- [x] Evaluate Mystery legal frozen options on cloned states with real select/claim operations, then choose/decline by the documented quality/resource heuristic. Never capture simulated effects as actual.
- [x] Bump agent sampled-turn-search-3; bind the new artifact source into full identity. Preserve JSON schema3 compatibility.
- [x] Run focused AI effects/deck/strategy/actual-action, map/economy/replay tests checks. Native AI panel verification belongs to Task 3 final build. Commit the implementation.

### Task 3: Fresh Master evidence, final audit and branch publication

**Files:** docs/audits/balance-master/LATEST.md, docs/balance/master/REFRESH_2026_10_24.md, docs/balance/master/refresh-20261024/, reports/master-balance/refresh-20261024/, relevant owner/SOR/README/changelog/decisions; package and shared generated version files.

**Interfaces:** existing AI experiment/CLI, source hash/CSV/actual receipts; source-branch registry with exact SHAs and unchanged/superseded findings.

- [x] Record source registry and independent audit outcomes; characterize exact runtime parity for Map v1.5 and identify obsolete Combat/Economy labels without changing old evidence.
- [x] Generate prerelease metadata; run fresh matched current campaigns across3tiers, representative skills/routes/Predict and selected current-card factorial cases into a new directory; verify raw status/cost/Block/Gold/source invariants and retain censored cases.
- [x] Run final full suite, syntax, map validation, production build, native AI and selected Master/profile/production isolation checks. Record logs and counts from actual outputs; no fresh full-suite claim before footer+exit0.
- [ ] Fresh-context whole-branch review; address Important/Critical findings in one RED→GREEN fix pass and document remaining risks/rulings.
- [ ] Final scoped diff audit and ref freshness check; create exact tested tree/commit and fast-forward balance/master with expected prior SHA, no force. Read back tree/ref and main unchanged. Keep worktree/branch for review; no main push.
