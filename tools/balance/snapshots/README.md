# Measurement source snapshot

The long measurement batch began before two review fixes: upgraded Passive description values and choice-budget classification. These exact sources preserve the engine provenance hash in the retained measurement records. To reproduce that batch use `STM_BALANCE_REPLAY_MEASURED=1 STM_BALANCE_OUTPUT=... node tools/balance/run.cjs candidate` (or baseline).

Normal harness execution uses the reviewed fixes. Historical budget code must not be used for new interpretation if a choice budget is hit: the historical classifier returns INVALID instead of censored. Retain its record, withhold ranking and rerun with current harness. The display-only source change does not alter resolution. No player build imports this directory.
