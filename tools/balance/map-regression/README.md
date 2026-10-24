# Current Master map regression pilot

This runner now targets audited main `45d2378302196d9b0b79af7b371e6f16d4f5768c` / game2.41.0 and `master-1.5.0-candidate.5`. The branch prerelease is2.42.0-balance.1. Its config records the source baseline; each execution fingerprints the actual runtime, protocol and analysis. It changes no production numbers.

Use a fresh output for a new source/protocol. This one-seed smoke runs all three profiles, combines their tables without pooling scores, and verifies each profile:

```bash
node tools/balance/map-regression/run.cjs --difficulty all --seed-limit 1 --workers 1 --max-seconds 180 --out reports/local-map/new-refresh
python3 tools/verify-map-advanced.py reports/local-map/new-refresh/easy
python3 tools/verify-map-advanced.py reports/local-map/new-refresh/medium
python3 tools/verify-map-advanced.py reports/local-map/new-refresh/hard
```

The default output is `reports/map-balance/master-refresh-20261024/map-regression`. Omit `--seed-limit` for all100 registered seeds. Use `--difficulty easy`, `medium` or `hard` for one tier; after separate runs call `combine` with that same output directory. `--resume` requires identical source, config and schedule and keeps every recorded outcome.

The fixed full schedule is five route policies plus high/low/skip Predict once per seed:800 campaigns per tier/2,400 total. Capture at most one actual uniform-reference entry per seed/stage and replay all three nominal ranks with identical state/RNG/clock. Stage2 is a survivor bank; entries are never fabricated. N1 is a regression pilot with wide uncertainty, not repeated calibration. Workers and time budgets remain explicit config/CLI limits; limits are censored, never losses.

All200 map snapshots and5,500 structural routes are checked. Nominal ranks use the existing pressure reference, not a prediction of current damage. Feedback uses real engine settlement; high/low are synthetic knowledge models and skip changes Predict/seals/Focus jointly. Resource/score populations and bounds remain explicit. Pupil90/70/50 and universal card power are unmeasured.

Fresh telemetry tags `shopGoldSpentBasis=GROSS_CHECKOUT_SPENDING`, including full Purse checkout charge and its separate Gold credit. Historical raw records without that marker retain their net-action interpretation; they must not be relabeled. See [repeated current protocol](../map-recheck/README.md) and [Master refresh handoff](../../../docs/balance/master/REFRESH_2026_10_24.md).

Historical v1.5 (game2.40.0) data, restore scripts, original commands and closed results belong to the [pinned Map branch](https://github.com/unDead41/slay-the-math-v2/tree/364a844879b8cd9463c4771eac15291a3fd22075/reports/map-balance/validation-v1.5) and its [historical README](https://github.com/unDead41/slay-the-math-v2/blob/364a844879b8cd9463c4771eac15291a3fd22075/tools/balance/map-regression/README.md). Those archives are not bundled in this branch. Restore and verify them from that source, keeping their original contexts and net spending labels.
