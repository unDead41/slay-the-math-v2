# Economy Deep Validation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans inline, with one fresh final reviewer. User has authorised execution of all six follow-up areas.

**Goal:** Reproducible evidence about evolving deck offers, spending, answer behaviour, recovery and route reward risk, plus long transaction regression coverage.
**Architecture:** Add offline experiment modules around existing E/Eco/X/Q owners; production changes only for demonstrated defects. Keep original evidence and publish an extended report alongside it.
**Tech Stack:** Node.js/node:test, actual game modules, Python/Matplotlib for report figures.
**Spec:** docs/economy/DEEP_VALIDATION_DESIGN.md

## Global Constraints

Branch balance/economy, original base 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7. No merge/push to main. No Combat stat, question RNG or map topology changes. CP UNMEASURED. Existing economy version and frozen saves retained unless a demonstrated fix requires versioned adaptation.

## Review Focus

- Survivorship: distinguish stop/end cash from completed-only cash and never label HP-budget exhaustion game defeat (Task 2).
- Artifact wrong answers permit retry; Mystery deadline is strict and wrong answers settle once (Tasks 2/3).
- An evolving deck must not alter opened receipts or make legitimate refresh invalid (Tasks 1/3).
- Price changes from acquiring discounts affect remaining quotes and preserve sold stock and exact single rounding (Task 3).
- Tag-ready proxies and heuristic buying rules must not be described as CP, optimal play or a pupil win rate (Tasks 1/4).

### Task 1: Diverse deck offer experiments
Files: tools/economy/deep-common.cjs, deep-offers.cjs; tests/economy-deep-tools.test.cjs.
Interfaces: createFixture(name,seed,difficulty,support,context); describeCard(run,id,receipt); summarize(values); studyOffers(seeds) -> rows/paired/checks.
- [ ] Write hand-checked tests: attack-only Shield Shot missing block; real Clear Mind enables Last Page; owned Passive/third copy proxy exclusion; paired source/rarity/deck immutable.
- [ ] Run node --test tests/economy-deep-tools.test.cjs. Expected RED for missing APIs.
- [ ] Implement fixtures, pure metrics and actual source sampling; run test. Expected PASS.
- [ ] Commit task with ledger evidence.

### Task 2: Adaptive cashflow and recovery models
Files: tools/economy/deep-flow.cjs, deep-events.cjs; tests/economy-deep-flow.test.cjs.
Interfaces: consumes Task 1 metrics; simulateFlow(options) -> summary/trace; studyEvents(seeds) -> results; surveyMap(seed,stage) -> exact path summaries.
- [ ] Write hand-checked tests for fixed-time deadline differences, artifact wrong/retry ownership, Gold conservation, adaptive heal vs upgrade, stop classification, controlled route validity and known price decisions.
- [ ] Run node --test tests/economy-deep-flow.test.cjs. Expected RED for new APIs.
- [ ] Implement real-owner transactions and declared damage fixtures; run test. Expected PASS. No hidden future loot access in policy.
- [ ] Commit with ledger evidence.

### Task 3: Stateful transaction coverage and fixes
Files: tests/economy-stateful.test.cjs; production owners only if a test exposes a defect.
Interfaces: real E/Eco/X/Q and existing test fixture builders; saved snapshots restored after each legal transaction.
- [ ] Exercise long buy/reload/discount/remove/transform/free-remove sequences, duplicate ownership, full deck/minimum deck, once-only claims and question/shuffle independence.
- [ ] Run targeted tests. Existing behaviour may pass; each observed runtime defect gets a specific RED regression before its fix.
- [ ] Run affected and full suites; commit and ledger actual findings.

### Task 4: Recorded experiments, report and handoff
Files: tools/economy/deep-study.cjs, deep-report.py; docs/economy/deep/*; SOR/HANDOFF/VERIFICATION/DECISIONS/CHANGELOG.
Interfaces: consumes Task 1/2 study APIs, writes compact raw results and detailed representative traces, exact manifests and tables.
- [ ] Run 128 offer seeds and 100 paired flow seeds per difficulty/policy, all-event timing/cost matrices and exact read-only route survey. Expected no invariant violation; empirical outcomes may be unfavourable and must be reported.
- [ ] Generate/inspect charts and tables; record findings/NEEDS_INPUT without arbitrary tuning.
- [ ] Full npm test/check, diff check; fresh whole-extension review; fix material findings RED→GREEN; publish balance/economy and package final report.
