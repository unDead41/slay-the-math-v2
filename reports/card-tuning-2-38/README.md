# Card-tuning comparison

Base main: `6376a222169815af582cf55aa4794f3c809a3515`, 2.37.0. Candidate: 2.38.0-card-tuning.1, card-effects-2 / Master candidate.5. `summary.json` records 384 actual combat runs (192 matched before/after pairs); `scope.json` records unchanged definitions/domains and the frozen-v1 hash.

Last Page is selected more often but loses one ordinary and two Master wins in this small intermediate-policy sample. Recall improves Master wins by two, and ordinary Mana Barrier has a small utility gain with the same wins. Rune Strike controls and unchanged Master Mana Barrier produce identical outcomes. These are exploratory contexts, not a universal power ranking; keep the approved tuning as a candidate and do not claim Last Page's win-rate improvement.

Each context uses a constructed 12-card attack/block deck with one tested card; normal/upgraded target, Wisp/Golem/Dealer, two seeds, synthetic high Predict and no artifacts. The same private planning runtime is used on both versions so baseline telemetry is not polluted by hypothetical choice estimates. Policy, draw RNG and actual engine actions are unchanged within each source, but later choices and draw exposure may diverge.

To reproduce, prepare separate checkouts at the base and candidate and install no project dependencies. Set `CARD_TUNING_BEFORE` and `CARD_TUNING_AFTER` to those absolute checkout paths, and `CARD_TUNING_OUTPUT` to an empty output directory; run `node reports/card-tuning-2-38/compare.cjs`. It uses three workers and writes the raw contexts and summary. The original comparison used an immutable numeric-runtime copy of tracked base files.
