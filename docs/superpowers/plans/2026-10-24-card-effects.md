# Card effects Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline. Steps use checkbox syntax; user already approved execution and feature-branch publication.

**Goal:** Apply the approved card audit with working, clearly described effects and preserved prior saves.

**Architecture:** Add one versioned card adapter after the existing single-target adapter and after Master candidate construction. Bind the synchronous engine/card resolver to current or archived ordinary definitions by run version. Keep percentage calculation and phase expiry in card-combat; presentation consumes those definitions.

**Tech Stack:** JavaScript UMD/CommonJS, Node test runner, existing browser QA.

**Spec:** ../specs/2026-10-24-card-effects-design.md

## Global Constraints

Branch only: balance/card-effects-20261024. Preserve IDs/artwork/audio/questions/enemies/economy/map and historical evidence. No main ref update. New numbers are candidate tuning. Keep genuine card RNG and atomic transactions. All player copy BM/English.

## Review Focus

1. A pending old choice resumes under old definitions; previews match those definitions.
2. Multi-hit percentage effects survive every hit and decay at the correct phase, including reapplication and skipped attacks.
3. Last Ember never recreates spent Block or retains it twice after swapping/refresh.
4. Search fallback cannot create cards or loop/reshuffle indefinitely.
5. Upgraded growth counters and inactive history validate at the new cap and after reactivation.

## Task 1: Versioned effects and real-engine regressions

Files: tests/card-effects.test.cjs, tests/fixtures/card-effects-legacy.json, tools/cards/effects.cjs, tools/cards/effects.json, tools/import-cards.cjs, tools/build-master-balance.cjs, dist/card-combat.js, dist/engine.js, tools/balance/master/config.json.

Interfaces: adapter(source, {profile}) produces effectsVersion and an ordinary legacyEffectsData snapshot; DCCardCombat.withRun(run, callback) binds synchronous resolution; newRun records cardRulesVersion.

- [x] Capture actual prior-save fixtures; write tests with literal expected damage/carry/search results and run them RED.
- [x] Implement the adapter, version binding, phase status resolution, emergency carry and search fallback; generate current data.
- [x] Run new regressions GREEN and archived ordinary tests; commit.

## Task 2: Presentation and release integration

Files: dist/combat-status.js, dist/tutorial-data.js, tools/import-cards.cjs, package.json, generated runtime/entrypoints, relevant existing tests, docs/sor/{03,04,23,DECISIONS,CHANGELOG}.md, docs/CARD_EFFECTS_2_33_0.md.

Interfaces: status descriptions read the active rule definitions; card kit uses numeric plan values; fresh ordinary/Master versions retain exact archived snapshots.

- [x] Add UI tests for percentage/duration and emergency carry; run RED.
- [x] Update BM/English text, badges, build adapter integration, release identity and intentional numerical expectations. Preserve archival tests under the archived runtime.
- [x] Run complete npm test, syntax checks and production build; fix material failures and commit.

## Task 3: Review, runtime evidence and branch publication

- [x] Run real browser ordinary/Master card interactions, multi-hit percentages, reload and legacy-save continuation; bounded deterministic balance probes without relabeling historical metrics.
- [x] Obtain one fresh whole-branch review; resolve material findings with regression tests.
- [ ] Record actual checks/limits, commit, publish only the feature branch and verify its remote tree/head. Confirm main was not changed by this work.
