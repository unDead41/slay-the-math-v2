# Simulation data handoff for Combat, Map and Economy

## Current main integration authorization — 2.50.0

The current explicit user request authorizes combining combat, education and
Master Map protocol candidates with main 2.49.1 as 2.50.0. Scoped compatibility
is VALID with carried P2 findings and explicit limits; original failed commands
and later focused/native evidence remain separate. Publication is PENDING actual
main ref readback. This supersedes the relevant earlier branch-only boundary;
original source pins, histories and current main owners remain. The completed
owner pilot stays tied to source b3dc, not 2.50. [Scope, results and limits](../ALL_CANDIDATES_MAIN_2_50_0.md).


Owner: Master Balance / developer AI.25 October2026. Read Master SOR and current owner audit before exporting. Publish your own branch only unless Ijamm authorizes more. This contract and validator live on balance/master; read that branch's current version when your branch does not yet contain them.

## Required delivery

Each fixed experiment writes a NEW directory:

```text
reports/balance-experience/<domain>/<date-and-protocol>/
  manifest.json
  observations.jsonl
  summary.json
  raw/                 # original reports/trials or .jsonl.gz, frozen source/context
  README.md             # actual command, scope, findings and limits
```

Use tools/ai-playtester/experience-data.cjs writeBundle/readBundle, or produce the same schema and validate centrally. manifest.json schemaVersion1 binds exact SHA256 and byte length of observations.jsonl and summary.json, source branch/40-character commit SHA, seedPlan.train/validation and planned/returned/error/censor counts. Keep bundles below64MiB; start another immutable bundle for a larger schedule. Keep raw records and their original manifests beside the exchange files, recording their hashes in your README. Never overwrite old output or bypass a source/context check to resume it.

Freeze `schedule.json` (an array of the actual experiment options) before running a Combat cohort. Pass it to `normalizeReports(...,{source,split,schedule})`. Every declared difficulty/skill/seed/mask and total must be present; row difficulty must agree with executed provenance and declared scope. Empty/interrupted reports and absent complete groups are rejected instead of silently disappearing. The returned array carries `.plan`; pass it directly to `writeBundle`, or pass that saved plan explicitly after transforming the array. New Combat writers require it. The manifest retains expected group IDs/cells and planned report/group/cell counts; reader and fitter check these again. Removing a whole report from the stored JSONL is therefore detectable even if surviving file hashes/counts were regenerated.

CLI export requires the external predeclared schedule and rejects a missing whole report. Programmatic imports without an external schedule are explicitly marked DECLARED_REPORT_OPTIONS: they check each supplied report, but cannot prove that a separate report was omitted before import. Older immutable schema1 bundles remain readable as LEGACY_NO_COHORT_PLAN; their original coverage needs external protocol/raw verification. Do not describe legacy or report-only coverage as a verified predeclared whole cohort. The reviewed current corpus is also revalidated with its actual schedule in `reports/ai-playtester/data-20261025/review-guarded/`.

Every JSONL line has schemaVersion1, unique id, domain combat/map/economy, kind, source:{branch,commit}, sourceHash (the frozen source/context digest), policy/version, split train/validation/test, uint32 seed, runtime:{version,difficulty,definitionHash,engineHash}, status COMPLETE/CENSORED/INVALID and the actual measured outcome. Add declared public features and experiment options; exclude hidden draw order, future seeded enemy/event/Shop identities, canonical answer keys and private player data. Save missing values as null, never invent zero or relabel censor/error as loss. Include each planned task once and explain missing tasks; fixed counts and seed lists must be declared before outcomes.

## Combat owner

Retain actual card ID/upgraded state, enemy, difficulty, Predict mode, deck/intervention slots, policy identity and complete mask cells. For one card masks0/1 compare a same-size Rune Strike replacement; for a pair masks0/1/2/3 are mandatory. Each cell records status and finite utility for a terminal outcome, otherwise null. Save costs/actual HP damage/Block used and expired/buffs/debuffs/draw/Passive counters in raw reports. Do not turn a high contextual delta into universal CP. Do not reuse a factorial cell as an extra independent single-card observation.

The current executable converter consumes AI report JSONL or gzip (one full report per line):

```bash
node tools/ai-playtester/experience-cli.cjs export-ai reports/local/raw.jsonl.gz reports/local/new-combat-bundle YOUR_40_CHARACTER_SOURCE_SHA reports/local/schedule.json
node tools/ai-playtester/experience-cli.cjs validate reports/local/new-combat-bundle
node tools/ai-playtester/experience-cli.cjs train reports/local/new-combat-bundle reports/local/new-model.json
```

The first reference protocol fixes training seed93 and validation701/702. The converter refuses other fitting seeds; future protocols must declare and implement a new seed plan explicitly. Train output is a candidate file, never automatic activation. The model matches exact runtime identity and the actual combat-policy source signature; model bytes are excluded from that compatibility signature to prevent a circular hash. Full exported source fingerprints still include them.

## Map owner

Keep complete raw campaigns and same-entry matched replays, public route decisions, stage-entry hashes and the actual survivor bank. Preserve conditional Stage2 populations. In the exchange line use kind campaign or room, the runtime identity from the executed record and sourceHash=contextId from the frozen context. The outcome includes actual result, stage/room category, HP before/after/lost/recovered, Gold before/after/earned/spent and reached/cleared/censored scope. Record route policy, Predict profile, limits and available public choices in features. Never use nominal pressure ranks or a CP estimate as a factual HP loss, and do not infer per-room causality from bundled route comparisons.

## Economy owner

Retain exact offer/receipt IDs, actual price and discount, source category, frozen choices, actual acquired/removed/upgraded card/artifact IDs, and before/after HP/Max HP/Gold/deck. Use kind transaction or campaign. Outcome distinguishes gross goldEarned/goldSpent from net change: earned-spent must equal actual Gold delta. A paid Purse counts its40 grant and full checkout charge separately. Explicitly label spending basis; do not relabel historical net telemetry as gross. Record decline/unaffordable/required choices and opportunity counts, not just successful purchases.

Example of a NON-factorial exchange observation (the surrounding producer supplies its actual identity/hashes; no example numbers claim a measurement):

```javascript
const {writeBundle}=require('./tools/ai-playtester/experience-data.cjs');
const observation={schemaVersion:1,id:actualTaskId,domain:'economy',kind:'transaction',
 source:{branch:'balance/economy',commit:actualCommit},sourceHash:frozenContextId,
 policy:actualPolicyVersion,split:'train',seed:actualSeed,runtime:executedRuntimeIdentity,
 status:actualStatus,features:{roomType:'shop',offeredArtifactId},
 outcome:{result:actualResult,goldBefore,goldAfter,goldEarned,goldSpent,price:actualQuote,
          spendingBasis:'GROSS_CHECKOUT_SPENDING'}};
writeBundle(newDirectory,{source:observation.source,seedPlan:declaredSeedPlan,observations:[observation]});
```

Use the same envelope with domain map/kind room and real recovery/route measurements. These Map/Economy files support source-checked diagnostics; the current acquisition learner fits complete Combat factorials only. Exporting them does not claim that a route/economy learner has already been validated.

## Handoff checklist and interpretation

Include command, current source hashes, protocol/version, fixed inputs/seed plan, planned/returned/terminal/invalid/censored totals, raw hashes, numeric/runtime compatibility and a README of confirmed issues/potential risks/improvements. Source drift requires fresh replay, not a changed label. Keep baseline and candidate, training and validation, and human versus synthetic evidence separate. Same seed is a matched scenario, not another independent pupil. No script silently learns from a player's save or changes game numbers.


## Shared collection and visual evidence — 25 October 2026

Read [the shared protocol](../simulation/SIMULATION_EVIDENCE_PROTOCOL.md) for ownership, source/case registration, stable-source rechecks and browser/tutorial capture. Maximum three subagents across Master/Map, default one, one collector. Registry coordination is manual, not a global lock.

Schema/fitting support and historical seed plans above remain unchanged. A Map/Economy envelope PASS does not verify every semantic field/planned case or implement a supported learner; reconcile owner raw/context/schedule independently.
