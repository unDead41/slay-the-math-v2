# Map regression v1.5 — fixed 2.40.0 pilot

Pin main `b730cad0cb27b53ffbdf687d8fc9edaed143ef43`, game2.40.0 and canonical Master `master-1.5.0-candidate.5`. This follows the already-published v1.4 cohort at8606616, which remains immutable evidence for candidate.4/game2.37.0. Do not pool versions or replace their contexts.

Before outcomes, fix100 registered seeds, allfive routing policies once per seed, and high/low/skip Predict once per seed on health-recovery. Its feedback control is the same health-recovery route case. That is800 full campaigns per difficulty/2,400 total. Capture at most one actual uniform-reference entry per seed/stage and replay allthree nominal ranks with identical state/RNG/clock. At most1,800 stage replays total; Stage2 entries exist only for actual survivors. N1 is a regression pilot with wide uncertainty, not the repeated primary study or pupil calibration.

Use two workers per tier, three separate tier processes (six aggregate workers). Limits remain100 combat turns,500 plays,10,000 API actions,120 seconds/task and7,200 seconds/invocation. Resume only missing IDs with identical context; never replace a loss or censor, widen an outcome-dependent limit or resample for a better result. Versioned config and runner are included in protocol fingerprints.

```bash
node tools/balance/map-regression/run.cjs --difficulty easy
node tools/balance/map-regression/run.cjs --difficulty medium
node tools/balance/map-regression/run.cjs --difficulty hard
node -e "require('./tools/balance/map-regression/run.cjs').combine(require('node:path').resolve('reports/map-balance/v1.5'))"
python3 tools/verify-map-advanced.py reports/map-balance/v1.5/easy
```

Use `--seed-limit 1 --out /absolute/scratch/smoke-v15` for smoke; `--resume` preserves the same context. Run the verifier for allthree profiles. Prior study details, route/answer/acquisition policies, contextual CP formula, censor/null conventions and net Shop outflow limitations remain in `../map-recheck/README.md`. This is a bundled runtime/card/profile regression; differences cannot identify an isolated map or card effect. No production tuning or player UI CP is introduced.

## Closed results and exact source

The complete fixed cohort has2,400 campaigns +1,683 matched replays,4,083 records,0 engine/policy error/invalid and21 Easy skip censors. Allthree independent integrity checks PASS; Easy score gate FAIL only for censoring. Stage2 entry banks100/95/66 make117 nominal rank scores unavailable. Same-context recovery retains every complete recorded outcome; final missing-record repairs use1 worker. See the handoff and validation-index for exact histories.

Restore the65-file source archive before verifying/replaying this cohort after later runtime changes:

```bash
python3 reports/map-balance/validation-v1.5/restore-source.py /tmp/stm-map-v15-source
python3 /tmp/stm-map-v15-source/tools/verify-map-advanced.py reports/map-balance/v1.5/easy
python3 /tmp/stm-map-v15-source/tools/verify-map-advanced.py reports/map-balance/v1.5/medium
python3 /tmp/stm-map-v15-source/tools/verify-map-advanced.py reports/map-balance/v1.5/hard
node /tmp/stm-map-v15-source/tools/balance/map-regression/run.cjs --difficulty all --out /tmp/stm-map-v15-replay
```

The source archive omits player assets and primary records; the repository retains the complete data. Three cold full-trial replays match exactly, adding no independent samples. N1 per seed yields coarse CP points and wide intervals; Master needs repeated current-runtime entries for final ranking.
