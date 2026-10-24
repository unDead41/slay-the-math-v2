# Map experiments v1.3

Historical v1.3/default baseline instructions. The current integrated three-profile recheck uses [map-recheck](../map-recheck/README.md) and its v1.4 outputs; the optional Master worker adapter is now implemented. The old full-tier-unavailable statements below describe the original/default baseline, not current main.

Developer analysis only. No player UI or production gameplay parameter reads these outputs.

```bash
node tools/balance/map-advanced/experiments.cjs --out reports/map-balance/v1.3 --workers 2 --max-seconds 3600
node tools/balance/map-advanced/check.cjs reports/map-balance/v1.3
python3 tools/verify-map-advanced.py reports/map-balance/v1.3
```

Use `--seed-limit 2 --out /absolute/scratch/path` for a smoke run. Resume an interrupted fixed schedule with the same command and `--resume`. Changed runtime, policy, configuration, seed population or reference inputs reject resume; use a fresh directory. Corrupt/incomplete JSONL is rejected, never silently dropped. Returned errors/censored trials stay unknown, fail the integrity gate and are not replaced by more favourable samples. A worker wall timeout is recorded and the remaining fixed tasks continue on a replacement worker.

The default schedule is fixed before outcomes: 8 uniform campaigns per seed, 4 each for avoid-Elite/reward/Shop/health-recovery, and 2 each for high/low/skip Predict on health-recovery. All policies share runSeeds by repetition; feedback controls are reused. This is 3,000 full campaigns for 100 seeds. Campaign comparisons pair the shared Stage 1 entry; later route/reward/RNG divergence is part of the combined route effect.

Uniform runs capture actual post-starting-artifact Stage 1 states and actual survivor Stage 2 states, including the real inter-stage artifact/heal. Each unique entry is replayed on the three structural pressure ranks with identical deck, HP, Gold, owned artifacts, engine state, clock and policy RNG states. Stage 2 is a conditional survivor population, not a fresh stage or an equal-sized fabricated bank. Rank names come from the v1.2 **estimate**, and are not reassigned after seeing wins.

Routing sees public room categories, edges, HP and Gold; no hidden enemy/event/Shop-offer identity. Heuristic utility weights in `route-policy.cjs` define the reference policy, not a calibrated player model or card power. Health-recovery prefers Rest below/equal 50% HP. Shop policy uses a 60 Gold budget heuristic; actual affordability, purchases and spend are measured separately. The existing visible-information combat/reward/Rest/Shop policies are retained.

Predict feedback samples untried visible answers and follows feedback. Synthetic high/low models use the canonical answer key to produce target first-attempt correctness 85%/25%; they make one attempt and close after an error. Their `syntheticOracleUsed` labels are mandatory. Skip never opens Predict. Actual correctness/Focus are reported; target probabilities are not measured pupil ability. Mystery and artifact questions retain the original policy in every scenario. Candidate Combat Node profiles and an economy candidate are now available as domain inputs; the combined full Easy/Medium/Hard campaign adapter is not integrated into this map worker. Requesting a tier here fails with `NEEDS_COMBAT_MASTER_ADAPTER`. [Delivery readiness](../../../reports/map-balance/integration-readiness-v1.3.json) records the reviewed commits; they remain unapplied to these baseline trials.

Predict also opens boss seals. `dist/engine.js` floors ordinary damage against a sealed boss at 1 HP. Skip therefore tests the Predict/seal prerequisite and Focus together, not pure Focus dependence. High/low changes can also alter later seal timing, question exposure, RNG and rewards. A separate Focus-only combat-policy contrast belongs in the Combat/Master follow-up; do not attribute these map results solely to Focus.

Scores use `map-log-risk-1.0.0`: `p=(wins+0.5)/(resolvedTrials+1)`; `CP=1000*ln(1/p)/ln(1/0.7)`. Wilson95 intervals use unsmoothed wins/trials, reverse-transformed for CP. Zero trials or an unresolved error/censor in scope produces null CP. Zero-win uncertainty has an unbounded upper CP endpoint (`null` plus `cpUpperUnbounded`). A 0.7 anchor defines scale, not an achieved target. Never compare CP across different entry populations, policies, modes, difficulty inputs or balance versions without the context. A map CP is not the power of one card.

| Output | Meaning |
| --- | --- |
| `context.json`, `trials-index.json`, `trial-*.jsonl` | Versioned source/input/protocol hashes; raw canonical-engine trials, captured states and per-record hashes. Shards capped at 4 MiB. |
| `entry-bank.json` | Metadata linking each immutable entry to its raw source checkpoint; includes missing-survivor population truth. |
| `policy-summary`, `policy-stage-summary`, `policy-comparisons`, `predict-summary` | Campaign/stage outcomes, paired route-policy discordance and equal-repetition Predict sensitivity. |
| `seed-policy-summary` | Per-seed/per-stage/per-feedback-policy scores. Stage 2 rates are conditional on reaching it. Resource means include observed prefixes; stage endpoints stop at that stage. |
| `matched-route-summary`, `matched-contrasts` | Repeated matched stage route outcomes/CP/Wilson uncertainty; paired differences include actual boss entry HP/Gold/deck/upgrades/artifacts. |
| `route-coverage` | All structural routes, planned/started/ten-node visits separately. Adaptive death prefixes are not assigned an invented full route. Unmeasured CP stays missing. |
| `recovery-windows` | Actual Elite and Mystery-failure HP-loss windows, previous/next Rest, HP, combat load, legal Rest distance, deaths and actual healing. A reachable Rest does not mean it was reached or healed. |
| `risk-reward` | Actual conditional room resource/deck/artifact gains and losses. Repeated visits and survivor selection prevent isolated causal claims. Deck merit is a policy proxy, not ICP/CCP. |
| `difficulty-drivers` | Structural pressure flags plus observed death/affordability/penalty/rank-inversion flags. Small-N point inversions are provisional. |
| `difficulty-readiness`, `quality-gate` | Pending domain inputs and integrity results. PASS does not certify game balance or pupil 90/70/50 targets. |
| `analysis-provenance`, `manifest` | Separately hashed report code and all exported files. Analysis-only fixes can regenerate reports from unchanged raw trials. |

Every tabular output has CSV and JSON. Missing values are blank/null, distinct from observed zero. Room HP/Gold use actual signed action deltas. Campaign final Gold and a second value excluding the unusable final-boss grant are both retained; boss entry is always before the boss reward. Recovery decisions can forgo an upgrade, which is counted explicitly.

For a later balance version, rerun this fixed schedule into another directory, then:

```bash
node tools/balance/map-advanced/check.cjs reports/map-balance/next --compare reports/map-balance/v1.3
```

The comparator refuses changed methods/seeds/configuration. Same-method changed runtime is labelled explicitly and the old 800-trace gate becomes `NEEDS_NEW_REFERENCE`; reviewed balance changes require a new reference, not false claims of compatibility. Inspect actual differences before Master accepts them. Re-run root/map tests and the independent verifier; do not merge domain inputs automatically.
