# Master Balance refresh audit

24 October2026 (Malaysia). Master SOR1.2.0; main45d2378302196d9b0b79af7b371e6f16d4f5768c /2.41.0; work branch balance/master, candidate2.42.0-balance.1. Source SHAs, Git relationships and snapshot hashes are in [sources.json](../../balance/master/refresh-20261024/sources.json). Publication is branch-only.

## Initial audit

Current Mastercandidate.5 is ahead of the Combat/Economy measured candidate.4. Map's latest candidate.5 dependencies match current engine sources. Blindly merging old numeric data/current-value tests or resuming those old cohorts would mislabel the source. Each upstream source is inspected at its pinned SHA; actual runtime owners remain on current main.

Initial focused baseline50/50 passed. The audit found shared quote/gross Gold/report errors and actual AI acquisition limitations, reproduced before correction.

## Confirmed findings

| ID | Priority / status | Evidence and action |
| --- | --- | --- |
| MBREF-01 |P2 / corrected|Map/AI telemetry used A.price instead of canonical Master checkout quote. Tight-boundary tests first fail0 vs3 affordable artifacts; current quote path passes.|
| MBREF-02 |P2 / corrected|Purse purchase was netted against its grant: earned0 vs40. Gross credit/charge/room/Shop conservation regression now passes.|
| MBREF-03 |P2 / corrected|Current-profile map reporting deducted legacy60 Gold and the worker lacked an explicit Master identity path. Adopted real three-tier adapter, captured-entry rejection and canonical post-run0 handling; raw pilot verification passes.|
| MBREF-04 |P2 / corrected|AI assigned positive baseline value to cash-losing Purse and redundant Seal, and free gifts bypassed the shared policy. Eight acquisition regressions plus lifecycle follow-up reproduce/fix actual decisions. Scores remain heuristic.|
| MBREF-05 |P2 / corrected|Mystery transform used removal ranking, ignored its frozen replacement/upgrade reset and could silently select a fallback. New clone evaluation and real decline regression preserve live offers/RNG.|
| MBREF-06 |P2 / corrected|Detached CSV omitted selected route. RED→GREEN regression now checks appended route identity with all earlier positions retained.|
| MBREF-07 |P2 / corrected test integration|Old Master browser assumed synchronous startup and no Enter Dungeon gate. Actual failures were ReferenceError/loader intercept; readiness/Enter/battle/reload waits now follow the real2.41 flow. Three profiles pass without production changes.|

| MBREF-08 |P2 / corrected in review|ME08 canonical uppercase queued stats missed lowercase weights, causing free buffs to decline. Real-engine RED→GREEN regression now proves positive selection and committed modifier with immutable planning.|
| MBREF-09 |P2 / corrected in review|Fresh gross spending inherited a historical net label. Paid Purse JSON/CSV export regression and an explicit observer marker correct new output; old raw data and their known label defect remain recorded.|
| MBREF-10 |P2 / corrected reproducibility|Copied runner instructions referenced absent historical archives/old outputs. Actual ENOENT reproduced; current local runner/verifier commands pass raw integrity. Historical source links remain pinned.|

## Risks and follow-up

| ID | Priority / status | Basis and next action |
| --- | --- | --- |
| MBREF-R1 |P1 / BELUM DISAHKAN as pupil balance|Latest Map v1.5 flags Hard Stage2 pre-Rest deaths. Need repeated matched current-entry cohorts and human playtests before changing recovery or generator.|
| MBREF-R2 |P2 / carried confirmed ordinary finding|Combat CCS-01 Spool source scope remains on ordinary archived implementation. Master hand_only and offer quarantine stay intact. Ordinary save-rule revision requires its own owner task.|
| MBREF-R3 |P2 / BELUM DISAHKAN|Artifact/Mystery future utility and route heuristics approximate later opportunities. Fresh pilots prove valid execution/accounting, not optimality or pupil90/70/50.|
| MBREF-R4 |P2 / carried documentation|DOC001/DOC002 from main documentation audit remain outside this scoped runtime work.|

No new optional improvement is treated as mandatory numerical tuning. Future improvements: repeated paired acquisition/route experiments, a versioned current Combat harness, and strengthened full-policy resume identity if historical Economy runners are reused. Current refresh uses new outputs and full fingerprints instead.

## Final audit boundary

Current numerical runtime/assets/question/map/save owners are preserved. Only expected shared release/manifest/launcher outputs change under dist; developer AI/tooling changes are outside player gameplay. Fresh checks:1042/1042 Node, focused groups, actual AI and three-profile Master browsers,403 AI outcomes,42 Map records and independent score verification. Production735 files/673 manifest hashes, offline AI exclusion, AI GET/POST404 and actual protected Dev/static-subpath checks passed. The [fresh review](../../balance/master/refresh-20261024/final-review.md) is addressed in one fix pass;35 focused and1042 full tests pass. An additional42-record Easy repeated-protocol smoke retains one censor and a failed score gate despite passing raw integrity. It is not pooled with the42-record three-profile regression. The final403-outcome cohort, source hashes and independent receipt/Block/Gold/factorial/CSV checks pass; [publication readback](../../balance/master/PUBLICATION_2_42_0_BALANCE_1.md) confirms code057194e/exact tested tree and unchanged main45d2378. No universal balance, physical-device or hosted-service claim is made.
