# Deep extension verification


## Deep extension final verification — 23 October 2026

- Full underlying unit suite: **518 passed, 0 failed, 0 skipped**, including all five campaign tests, using `NODE_PATH=/tmp/stm-audio-qa/node_modules:$CODEX_PRIMARY_RUNTIME_NODE_MODULES node --test --test-concurrency=2 tests/*.test.cjs`. Duration 232113 ms. Raw output: [deep/unit-suite.log](deep/unit-suite.log).
- Additional final targeted suite: 17/17. `npm run check`, all deep tool syntax checks, Python compile and staged diff whitespace check pass.
- 1,800 adaptive paired flows; 600 controlled-route flows; 165,888 card offers / 525,312 slots; 3,720 event timing cases; 5,400 fresh HP/Gold boundary cases; 240 Rest cases; 24 cumulative HP→MaxHP cases; 18 adaptive plus six route representative traces. All flow Gold deltas conserved and source/receipt/RNG invariants held.
- Four final plots visually inspected. Independent read-only code/model review ran 16 tests and found the cumulative coverage gap/ambiguous time metric; final API regression was observed RED then GREEN, cumulative coverage added and metadata corrected. Report and figures self-reviewed.
- Environment limitation: `npm test` portable prebuild was terminated `Killed` (memory). Initial direct run lacked jsdom; final full unit run uses the existing QA dependency path and passes. No successful new portable rebuild or new browser QA is claimed. Production files/numerical tuning are unchanged by the deep extension.
- Details, decisions/costs, raw seeds and remaining NEEDS_INPUT: [deep/REPORT.md](deep/REPORT.md), [deep/DECISIONS.md](deep/DECISIONS.md).
