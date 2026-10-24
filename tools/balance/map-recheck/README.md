# Current Master map repeated recheck

This runner targets audited main `45d2378302196d9b0b79af7b371e6f16d4f5768c` / game2.41.0 and `master-1.5.0-candidate.5`. Branch prerelease2.42.0-balance.1 uses actual runtime/protocol fingerprints. Production numerical values are unchanged.

Choose a fresh output; never overwrite or relabel an old cohort:

```bash
node tools/balance/map-recheck/run.cjs --difficulty all --seed-limit 1 --workers 1 --max-seconds 180 --out reports/local-map/new-recheck
python3 tools/verify-map-advanced.py reports/local-map/new-recheck/easy
python3 tools/verify-map-advanced.py reports/local-map/new-recheck/medium
python3 tools/verify-map-advanced.py reports/local-map/new-recheck/hard
```

The default output is `reports/map-balance/master-refresh-20261024/map-recheck`. Omit `--seed-limit` for all100 seeds; select `--difficulty easy`, `medium` or `hard` for one profile. `--resume` only fills missing IDs under the same source/config/schedule; losses and censors are retained.

The full schedule per tier is400 uniform feedback campaigns,200 each avoid-Elite/reward/Shop/health-recovery, and200 each high/low/skip Predict on health-recovery:1,800 per tier/5,400 total. Feedback controls reuse health-recovery repetitions. Up to four unique uniform entry states per seed/stage feed three matched nominal ranks. Stage2 entries require actual survivors. Matching preserves starting HP/deck/Gold/artifacts/RNG/clock within a triplet, not across profiles.

Before trials,200 map snapshots must match the retained hashes and5,500 routes remain enumerated. The pressure ranks are provisional, not current damage predictions. The real Master loader supplies profiles, cards, enemies, loot, Rest and Mystery. Identity mismatches fail integrity. Master final Boss grants0, so its reports do not deduct legacy60 Gold.

Canonical Shop prices determine affordability. Fresh observers tag gross checkout spending and separately count Purse acquisition credit. Old raw records without that accounting marker retain their historical net-action label. No historical Gold observations are upgraded by changing a label.

Feedback uses the current engine's settlement rules. High/low use canonical keys as explicitly synthetic knowledge models; skip removes Predict/seal progress and Predict-earned Focus while starting/Passive/artifact Focus can remain. This is not an isolated Focus experiment or measured pupil ability. Limits stay fixed before outcomes; a limit is censored, never a loss. Independent integrity PASS can coexist with a failed score gate and null CP. Stage2 populations are conditional, and pilot estimates do not establish pupil90/70/50.

Use the [smaller current regression pilot](../map-regression/README.md) for a quick check. Historical candidate.4/game2.37 v1.4 instructions, restore scripts and frozen results belong to the [pinned Map branch archive](https://github.com/unDead41/slay-the-math-v2/tree/364a844879b8cd9463c4771eac15291a3fd22075/reports/map-balance/validation-v1.4) and its [historical README](https://github.com/unDead41/slay-the-math-v2/blob/364a844879b8cd9463c4771eac15291a3fd22075/tools/balance/map-recheck/README.md). They are absent locally and require their own exact restored source. Keep their contexts and original accounting unchanged.
