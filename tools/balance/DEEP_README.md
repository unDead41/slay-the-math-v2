# Deep combat test harness

All commands run from repository root, on balance/combat. Original game base: 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7. Production definitions/IDs/assets/questions are unchanged.

```sh
node --test tests/balance-combat.test.cjs tests/balance-deep.test.cjs
node tools/balance/stress.cjs
node tools/balance/deep-run.cjs evolved
node tools/balance/deep-run.cjs resource
node tools/balance/deep-run.cjs setup
node tools/balance/deep-run.cjs setup_clean
node tools/balance/deep-run.cjs risk_followup
node tools/balance/deep-run.cjs cluster
node tools/balance/deep-run.cjs dilution
node tools/balance/deep-run.cjs reload
node tools/balance/deep-run.cjs campaign_reviewed
node tools/balance/deep-run.cjs hard_followup
node tools/balance/deep-analyse.cjs
```

Use a separate checkout for fresh experiments: these commands replace their named cohort under docs/balance/combat/deep-results. Default 4 workers; STM_WORKERS changes hardware parallelism only. Each part is raw gzip JSONL; manifests pin source snapshots and engine provenance. Risk targets were selected by absolute clean-setup ICP, then frozen for the 50-new-seed follow-up. Tag priority is never substituted for measured power.

Artifact probes: call probeAll(build) from artifact-probes.cjs and save both builds. Candidate must pass; baseline Spool negative scope probe deliberately records the known baseline finding rather than hiding it.

Campaign uses real current loot/prices/rest and declines Mystery before Start. Constructed decks do not imply acquisition rates. Human win targets require a separate integrated release and playtest. Work limits censor a case; they do not turn it into a loss.
