# Current map audit v1.4

This is a developer-only recheck of all100 catalogue seeds against main990541d57c6df96cefb21eddc7a365d1d989a74d/game2.37.0 and the canonical `master-1.4.0-candidate.4` binding. It does not tune production numbers or show CP to players. The retained v1.3 measurements describe their old runtime, not this build.

The existing cohort was measured on2.37.0. Its original publication branch2.37.1 changed only package-version metadata among its30 pinned input files;29 runtime files were byte-identical. The branch now includes2.40.0; use the separate ../map-regression runner/cohort for that runtime. Existing data retain their original contexts. Restore the exact source before verification or exact replay:

```bash
python3 reports/map-balance/validation-v1.4/restore-source.py /tmp/stm-map-v14-source
python3 /tmp/stm-map-v14-source/tools/verify-map-advanced.py reports/map-balance/v1.4/easy
python3 /tmp/stm-map-v14-source/tools/verify-map-advanced.py reports/map-balance/v1.4/medium
python3 /tmp/stm-map-v14-source/tools/verify-map-advanced.py reports/map-balance/v1.4/hard
node /tmp/stm-map-v14-source/tools/balance/map-recheck/run.cjs --difficulty all --workers 3 --max-seconds 7200 --out /tmp/stm-map-v14-replay
```

The archive includes historical reference inputs, the exact validator and import dependencies; it omits player assets and primaryv1.4 trials. Three full recorded trials replay exactly after cold restoration. Use a new empty restore directory. The current-checkout validator deliberately rejects an old cohort when package metadata differs; no hash check is bypassed. For a future current-runtime study, version the config/source context and use a fresh output rather than overwriting this cohort.

Use `--seed-limit 1 --out /absolute/scratch/smoke` for a smoke experiment. Resume the same fixed schedule using `--resume`. For one profile, use `--difficulty easy`, `medium` or `hard`. The output directory cannot be a player build. Use a new output/context after any runtime or protocol change.

The fixed schedule per difficulty is400 uniform feedback campaigns,200 each avoid-Elite/reward/Shop/health-recovery, and200 each high/low/skip Predict on health-recovery:1,800 per tier/5,400 full campaigns total. The same sampler/runSeeds pair repetitions within and across conditions. Feedback Predict controls reuse the two health-recovery repetitions. Up to four unique uniform entry states per seed/stage are replayed on three nominal rank paths. Stage2 is an actual survivor bank; missing entries are not fabricated. Starting HP/deck/Gold/owned artifacts/RNG/clock are identical within each matched triplet, not between difficulty profiles.

All200 current generated snapshots must exactly match the retained map hashes before the experiment starts. All5,500 stage routes remain structurally enumerated. Nominal easiest/median/hardest ranks use the existing pressure-reference model; it does not model current percentage phases, deck growth or actual recovery and is not a candidate damage prediction. Observed ranking inversions remain provisional, without outcome-based relabeling.

The worker injects the existing Master loader, which supplies actual HP/enemies/Focus/economy/loot/Rest/Mystery/carry and candidate cards/artifacts. Context and every trial carry runtime identity; hash/profile mismatch fails integrity. Canonical Shop quotes determine artifact affordability. Master awards no unusable final-boss Gold, so reports explicitly use a zero post-run grant rather than deducting the historical60 Gold. These changes affect observations, not gameplay transactions.

The reference combat/acquisition policies remain `visible-greedy-feedback-v1` and the declared route policies. Feedback obeys the current engine's two-wrong-attempt settlement for Predict/artifact/Mystery. A failed artifact trial may leave no acquired artifact. High/low use the canonical key as explicitly synthetic85%/25% knowledge models, make one Predict attempt and close after an error; other question consumers retain feedback. Skip never opens Predict; configured starting/Passive/artifact Focus may still exist. Predict also opens boss seals, so these are not pure Focus causal comparisons or measured pupil ability. The benchmark clock adds one second per answer, not a pupil timing model.

Each profile has the v1.3 report schemas plus explicit `difficulty`, `balanceVersion` and `contextId` in every table. The parent folder combines policy/stage/Predict/matched/driver tables without pooling their scores. Full-campaign `allCaseWinBounds` retain unknown cases between observed-wins/planned and (wins+unknown)/planned. CP remains the same contextual log-risk scale with Wilson95 uncertainty; untested/unresolved scope has null CP. Cross-profile/old-runtime comparisons are descriptive changes of conditions, not isolated causes.

The100-turn/500-play/10,000-API limits are fixed before outcomes. A limit is censored, never a player loss; no outcome-dependent resampling or forced combat win occurs. **A complete fixed schedule can contain unscorable scopes.** `quality-gate.json` and `check.cjs` fail the score gate for censoring. The independent Python verifier may still PASS raw integrity when the only score-gate failure is `CENSORED_SCOPE_SCORES`, while reporting the count and FAIL score status. Such CP must remain null and be handed to Master as unresolved; a PASS verifier does not certify balance.

Historical800-trace compatibility is not claimed for current profiles, question rules or changed sampling budgets. Their original data remain untouched. Reproduction validates the actual pinned sources, task sets, checkpoints, identities, scopes, resource deltas, graph prefixes, CP/Wilson and CSV/JSON. A later longitudinal comparison needs the same profile/method/budget and a new versioned source context. Human full-run targets90/70/50 remain unmeasured.

Gold-flow limitation in this frozen cohort: `shopGoldSpent` is the sum of negative net action deltas. A purchased Purse credits Gold inside the same action, so this measures net outflow, not the gross checkout quote. Net room/final Gold, affordability, routes and CP are unaffected. Economy2e54f2b supplies a separate gross-flow telemetry correction; Master must reconcile that shared file for future cohorts and must not relabel these immutable raw records as gross flows. Current rows explicitly carry `shopGoldSpentBasis`.
