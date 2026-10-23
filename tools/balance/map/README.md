# Map balance audit

Developer-only, read-only analysis of the actual registered map generator plus a bounded campaign pilot using `dist/engine.js`. No production code imports this folder. The normative scope and formulas are in [Map SOR v1.2](../../../modules/map/SOR/04_MAP_COMBAT_POWER.md); results and handoff are in [MAP_BALANCE_HANDOFF.md](../../../docs/MAP_BALANCE_HANDOFF.md).

## Reproduce

Use Node 24, this branch and its source data. No npm dependency is needed by the audit itself. Run from the repository root:

```sh
node --test tests/map-balance-*.test.cjs
node tools/balance/map/audit.cjs --out reports/map-balance/new-context --trials-per-seed 8 --diagnostic-replays 3 --max-seconds 1800
node tools/balance/map-campaign-pairs.cjs reports/map-balance/new-context reports/map-balance/new-pairs
python tools/verify-map-balance-report.py reports/map-balance/new-context --pairs reports/map-balance/new-pairs
```

Use a fresh output directory for a fresh audit. The checked-in baseline output is `reports/map-balance/base-2800f9a`. To continue a partial output, repeat its exact settings with `--resume`. Existing checkpoints cannot be overwritten accidentally; a changed context is rejected. Even the balance reference JSON is verified against its archived member digest before running. Resume checkpoints are trusted local files; they are not an interface for importing untrusted trial data.

| Option | Default | Meaning |
| --- | --- | --- |
| `--out` | `reports/map-balance/base-2800f9a` | Output directory; `dist`/`release-prod` forbidden |
| `--trials-per-seed` | 8 | Fixed pilot campaigns per catalog seed, 1–8192 |
| `--seed-limit` | 100 | First N registry IDs, 1–100; partial coverage disclosed |
| `--diagnostic-replays` | 3 | 0–3 estimated easy/median/hard campaign plans |
| `--sampler-seed` | 42 | Deterministic uint32-class sampler input |
| `--max-seconds` | 1800 | Wall-clock budget per invocation, checked between campaigns |
| `--resume` | off | Reuse completed trial IDs only with identical context |

`config.json` owns audit parameters/versions and limits. Gameplay constants remain in their existing runtime owners. Input `inputs/balance-v1.2-reference.json` is a candidate design reference, never a difficulty overlay. To evaluate an implemented combat/economy branch, use another checkout/context/output and record the new runtime hashes. Do not silently reuse this baseline label for changed stats.

## Outputs

| File | Contents |
| --- | --- |
| `context.json` | Complete version/seed/policy/parameter inputs and source/tool/input SHA-256 fingerprints |
| `source-differences.json` | Runtime vs Balance v1.2 candidates; all 40 cards, 12 enemies, 31 artifacts and 15 events |
| `maps.json` | All generated node/edge snapshots and map hashes |
| `seeds.csv/json` | One row per `(seed, stage)`; structural ranks, provisional stage CP, coverage, pilot boss-entry averages |
| `routes.csv/json` | Every complete legal path, uniform-exit probability, pressure estimate, room/chains/recovery, pilot/diagnostic counts |
| `campaigns.csv/json` | Full two-stage pilot W/N and provisional CP per seed |
| `trials.json` | Exact runSeeds, planned routes, actual room/state transitions and outcomes; first pilot includes API actions |
| `nodes.json` | Pilot entry/death/unresolved counts and conditional failure rates |
| `summary.json` | Totals, denominators, coverage, aggregate pilot, limitations and budget completion |
| `checkpoint.json` | Resumable trials; duplicates trial data intentionally, no final artifact claim |
| `manifest.json` | SHA-256 and byte length of report files except itself/checkpoint |

The separate `reports/map-balance/campaign-route-pairs` output contains `pairs.csv`, `pairs-index.json` and four JSON chunks, per-seed `seeds.json`, context and manifest for all 77,384 legal Stage 1 × Stage 2 path combinations. It applies the same estimate across the combined sequence with nominal stage-clear heal 12, preserving the earlier peak and shared roster class. These are derived structural estimates, not exhaustive engine replays. Its tool/source/report hashes are recorded separately so adding this analysis does not relabel the fixed pilot. `pilotPlannedTrials` includes campaign plans that died before Stage 2; it is not Stage 2 traversal coverage.

JSON retains `null`; CSV uses blank for missing values and `0` for measured zero. Arrays/intervals/paths occupy quoted JSON strings in CSV. The compound route key is `(seed,stage,id)`. `combatPower` is deliberately null on route rows: pressure is an estimate; sparse conditional replays do not establish a comparable route CP. Distinct route exposure includes partial traversal; full ten-node traversal has separate columns. All CP values remain provisional, outside player assets/UI.

Stage aggregation retains a resolved clear even if a later stage errors/censors. `errors/censored` concern an unresolved scored scope; `campaignErrors/campaignCensored` retain all downstream campaign issues. Stage 2 W/N is conditional on arrival. Diagnostic campaigns are never included in pilot CP. Error/censor nulls the applicable score rather than being treated as a loss. `evaluationComplete` on the global summary means the scheduled trials returned; inspect error/censor fields before interpreting validity.

## Inspect or replay one case

```js
const {runCampaign}=require('./tools/balance/map/replay.cjs');
const trial=runCampaign({runSeed:2822299500,mode:'challenge',trace:true});
console.log(trial.status,trial.traceHash,trial.rooms);
```

Copy a runSeed from `trials.json` for an exact baseline replay. A forced diagnostic also needs its recorded `plannedRoutes[1/2].nodeIds` supplied as `forcedRoutes:{1:ids1,2:ids2}`. The same hash is deterministic with the same code/config and Node version. Room snapshots contain actual HP/Gold/deck fingerprint/upgrades/artifacts/RNG; reconstruct full deck instances by replaying canonical actions, not by editing a save.

For root tests, the repository's pretest builds the portable HTML. DOM and image checks additionally need jsdom/sharp available in the environment. This audit adds no gameplay dependency or package-manifest change. Full verification commands and actual results are recorded in the handoff.
