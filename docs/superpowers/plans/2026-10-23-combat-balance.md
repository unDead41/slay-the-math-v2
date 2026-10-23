# Combat/Card Synergy Implementation Plan

> **For agentic workers:** Execute natively with superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Measure all 40 cards and the specified Lite synergy cohort on the real engine, with reproducible evidence and an isolated candidate for Master.

**Architecture:** A Node-only module loader isolates baseline and experimental data. Both use the actual engine, save validator, execution plan, choices, Predict and artifact hooks. Optional definition fields support explicit upgrades; absent fields preserve existing player behavior. Reports never enter the player UI.

**Tech Stack:** Node.js built-ins, existing CommonJS game engine, node:test, JSON/CSV/Markdown.

**Spec:** User instruction (23 October 2026), source package `STM_Balance_SOR_v1_2_20261023`; CP-01–17 and BAL-01–40. Exact pinned sources copied under `tools/balance/specs/`.

## Global Constraints

- BASE_COMMIT: 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7; work branch balance/combat.
- Preserve IDs, artwork, audio, questions, legacy saves, three-active-Passive swap/history.
- No main push/merge; no price/loot implementation; candidate data is development-only.
- SOR numbers are hypotheses. Easy/Medium/Hard 90/70/50 are human full-run targets.
- Primary screen: 780 distinct pairs + 40 duplicates. Lite: 1,200 Medium + 960 Easy/Hard + 640 triple encounters per build, before explicitly labeled extensions.
- Keep real Energy, once/turn Focus, actual choice windows and actual enemy damage/seals.
- Utility U=100*win+20*finalHP/maxHP-min(10,playerTurns/2), after win-heal, before room rewards. Never add draw/Block proxies to U.
- Harness bounds: 100 turn cycles, 500 committed plays, 10,000 API/evaluator steps; censored exploratory U=-10, final ranking withheld. Policy errors have null U.

## Review Focus

- An unpaid or interrupted choice must not duplicate costs or rewards: assert cancel/restore and UID conservation.
- Passive reactivation must preserve trigger history and upgraded one-time gifts: exercise full-cap swap, restore and reactivation.
- Focus comparison must hold initial resources fixed: compare spend-on-target against save for next best eligible choice.
- A sealed boss must terminate through actual Predict or disclosed no-Predict censoring, never forced HP/seal changes during a simulation.
- A censored/error variant must not vanish from a factorial mean or become a student loss: retain denominators, suppress final scores.

### Task 1: Isolated loader and baseline

Files: `tools/balance/loader.cjs`, `tools/balance/specs/`, `tests/balance-combat.test.cjs`.

- [x] Read project owners, SOR v1.2 and actual engine; create isolated checkout.
- [x] Write failing loader/isolation/replay tests.
- [x] Copy exact SOR inputs and record hashes/provenance.
- [x] Implement `loadEngine({build,difficulty}) -> {E,C,A,CC,data,Q}` using isolated CommonJS evaluation.
- [x] Verify unchanged baseline tests before interpreting differences.

### Task 2: Explicit candidate execution

Files: `dist/card-combat.js`, `dist/engine.js`, `tools/balance/candidate.cjs`, tests above.

- [x] Add tests for explicit per-instance upgrades, first-hit stat budget, delayed draw, upgraded Passive gifts/history, boss locked phase/Guard rage and Brooch actual Block.
- [x] Implement optional definition fields and experimental config without activating them in player builds.
- [x] Map all 40 candidate cards, 12 enemies and combat artifact values from the supplied SOR.
- [x] Verify actual deltas, costs, validator/restore and legacy tests.

### Task 3: Benchmark and measurements

Files: `tools/balance/combat.cjs`, `tools/balance/run.cjs`, `tools/balance/report.cjs`.

- [x] Implement seed-matched fixed-slot factorials, public-state policy, bounded choice completion and actual Predict.
- [x] Log utility/outcome vectors, resources, trigger/choice coverage, build/source/seed/deck/policy and censor/error reasons.
- [x] Audit 40 x four states and context boundaries; screen 820 pairs, run Lite and ordered/Focus/artifact/risk extensions.
- [x] Expand suspicious cases to 50+ seeds in at least two contexts; do not auto-nerf from a heuristic tag.

### Task 4: Reviewable handoff

Files: `docs/balance/combat/`, domain-owner appendices, decisions/changelog.

- [x] Generate before/after 40-card table and measured ICP/CCP/Focus records with uncertainty and context.
- [x] Document all artifacts/enemies, coverage, omissions, policy limitations and cross-domain requests to Master.
- [x] Run syntax, regression, deterministic reproduction, integrity diff and complete contract tests.
- [x] Commit on balance/combat and make branch/deliverables available; never merge/push main.


## Completion qualifications

Tasks completed as a development experiment, with concrete limits in docs/balance/combat/VALIDATION.md and REVIEW.md. Atomic evaluator instrumentation and complete artifact trigger exposure remain partial; production activation, save version migration and human/campaign validation are deferred to Master. Historical measurement snapshots are retained for exact provenance after review fixes. New tests for review findings were run RED then GREEN. Existing prior implementation tests were re-run, not claimed as newly observed RED in this resumed session.
