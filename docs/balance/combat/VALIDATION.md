# Validation ledger

Base 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7; branch balance/combat.

- `npm run check`: passed.
- Focused engine/card/selection/Passive/artifact suite: 191 tests, 187 passed, 4 skipped, 0 failures.
- New balance contracts: 10 passed. Choice-budget censor and upgraded Passive preview regressions were observed failing before fixes, then green.
- Broad `node --test tests/*.test.cjs`: 389 passed, 68 skipped, 5 file failures caused by unavailable `jsdom`, not assertions. Reattempting the five with runtime NODE_PATH still could not resolve jsdom. UI verification therefore remains incomplete.
- Independent whole-branch review found choice-budget classification and candidate Passive preview issues; fixed with regressions. Review also identified incomplete atomic-step instrumentation and artifact-trigger coverage; those limits are explicitly retained.
- Rule: no candidate numeric activation. Master must implement versioned run/checkpoint/legacy migration and display contracts before a player release.
- Ruling: retain experimental SOR values rather than automatically tuning from a 10-seed or fixed-deck bot result. Risk: some weak or dominant combinations remain pending wider campaign and human evidence.
- Ruling: count evaluator/API work conservatively, disclose absence of internal atomic instrumentation. Risk: a single synchronous engine call is not interruptible by the harness step counter.

Final measurement evidence:
- Baseline: 4,730 unique encounters; candidate: 5,210; all-enemy candidate sweep: 216. Total 10,156 (excluding earlier diagnostic overlay batch).
- No invalid or censored retained baseline/candidate factorials. All final rankings remain exploratory.
- Candidate engine hashes reproduced exactly via measured source snapshot for each recorded difficulty. Six current-engine sample replays matched utility and final RNG; three pinned-baseline sample replays matched utility and RNG.
- Final `node build-portable.cjs`, `npm run check`, `git diff --check`: passed. Focused final suite again 187 passed, 4 skipped, 0 failures.
- Two candidate pairs expanded to 50 seeds in two contexts: no mean interaction exceeded 10 U there; this does not establish absence of all dominant combinations or loops.
