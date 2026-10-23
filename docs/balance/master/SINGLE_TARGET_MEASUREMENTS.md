# Single-enemy bounded measurements — 2.29.0

Before and after use the same 171 factorial cases / 504 encounters each (1,008 encounters total), three paired seeds per cell. Ordinary mode screens the two changed cards plus Rune Strike control; Medium Master additionally screens three pairs and one triad. Wisp, armored Golem and sealed Dealer cover different fight contexts. Twelve-card replacement decks, no artifacts, synthetic developing Predict; one seed per cell checks reload boundaries. No invalid/censored cases. All Rune Strike self-replacement controls have zero effect.

Source snapshots and exact task/raw identities pass the integrity checks in `tools/balance/master/single-target-report.cjs`. The earlier duplicate-message harness attempt was rejected, kept outside the measured cohort and rerun after guarding the imported power worker entry point. Final manifests/raw hashes and per-trial provenance were checked before this report was written.

ICP is the mean utility difference against Rune Strike, not raw damage or universal CP. Utility is 100 for win + 20 finalHP/maxHP - min(10, turns/2). Each column below uses only three seeds. Rune Sweep retains Master numbers; Fate Storm also removes target RNG, changing later shuffle/action trajectories. A change around 33 U often represents one changed win/loss among three trials. Do not interpret that jump as an infinite combo, guaranteed improvement or a reason to retune unrelated cards.

| Mode | Card | Enemy | Before | After | Before upgraded | After upgraded |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| legacy | Rune Sweep | wisp | -0.72 | 0.17 | 0.00 | 0.00 |
| legacy | Rune Sweep | golem | -1.72 | 0.94 | -0.56 | 1.28 |
| legacy | Rune Sweep | dealer | 0.33 | 0.83 | -34.17 | -0.11 |
| legacy | Fate Storm | wisp | 0.17 | 0.17 | 0.00 | 1.44 |
| legacy | Fate Storm | golem | 0.33 | 2.17 | -0.33 | 1.44 |
| legacy | Fate Storm | dealer | 1.00 | 34.94 | -0.56 | 34.83 |
| master | Rune Sweep | wisp | 1.22 | 1.22 | 1.49 | 1.49 |
| master | Rune Sweep | golem | 4.29 | 4.29 | 2.32 | 2.32 |
| master | Rune Sweep | dealer | -0.33 | -0.33 | 33.21 | 33.21 |
| master | Fate Storm | wisp | 1.49 | 1.49 | 1.49 | 1.49 |
| master | Fate Storm | golem | 4.51 | 2.85 | 1.50 | 1.31 |
| master | Fate Storm | dealer | 33.81 | -0.33 | 104.50 | 103.01 |

Pair entries are four-cell interaction; TRIPLE is the isolated eight-cell third-order interaction. These are not total deck damage or the power of the full combination. Full utilities/outcomes for every mask are retained in the raw files.

| Kind | Cards | Enemy | Upgraded | Before interaction U | After interaction U |
| --- | --- | --- | --- | ---: | ---: |
| PAIR | Fate Storm + Weak Point | dealer | false | -33.97 | -0.17 |
| PAIR | Fate Storm + Weak Point | dealer | true | -35.49 | 33.44 |
| PAIR | Fate Storm + Weak Point | golem | false | 32.78 | 34.81 |
| PAIR | Fate Storm + Weak Point | golem | true | 3.42 | 2.13 |
| PAIR | Fate Storm + Weak Point | wisp | false | -0.17 | -0.17 |
| PAIR | Fate Storm + Weak Point | wisp | true | 0.00 | 0.00 |
| PAIR | Fate Storm + Blazing Spirit | dealer | false | -102.58 | -69.44 |
| PAIR | Fate Storm + Blazing Spirit | dealer | true | 32.19 | 32.21 |
| PAIR | Fate Storm + Blazing Spirit | golem | false | -5.00 | -5.71 |
| PAIR | Fate Storm + Blazing Spirit | golem | true | -0.49 | -0.05 |
| PAIR | Fate Storm + Blazing Spirit | wisp | false | -0.17 | -0.17 |
| PAIR | Fate Storm + Blazing Spirit | wisp | true | -0.17 | -0.17 |
| PAIR | Rune Sweep + Weak Point | dealer | false | -33.97 | -33.97 |
| PAIR | Rune Sweep + Weak Point | dealer | true | 1.94 | 1.94 |
| PAIR | Rune Sweep + Weak Point | golem | false | 33.41 | 33.41 |
| PAIR | Rune Sweep + Weak Point | golem | true | 2.13 | 2.13 |
| PAIR | Rune Sweep + Weak Point | wisp | false | -0.17 | -0.17 |
| PAIR | Rune Sweep + Weak Point | wisp | true | 0.00 | 0.00 |
| TRIPLE | Fate Storm + Blazing Spirit + Growing Flame | dealer | false | -35.01 | -34.35 |
| TRIPLE | Fate Storm + Blazing Spirit + Growing Flame | golem | false | 2.68 | 6.97 |
| TRIPLE | Fate Storm + Blazing Spirit + Growing Flame | wisp | false | -0.99 | -0.99 |

## Actual campaign regression

36 two-stage attempts: seeds 20-22, three difficulties, feedback/low synthetic Predict and recovery/reward routes. Every attempt ended in an actual victory or defeat; none invalid/censored. Only three seeds per cell, paired across policies. These are regression observations, not independent pupil observations or calibration of the 90/70/50 goals. No enemy or reward profile was retuned from this cohort.

| Difficulty | Predict | Route | Wins | Invalid | Censored |
| --- | --- | --- | ---: | ---: | ---: |
| easy | feedback | health-recovery | 3/3 | 0 | 0 |
| easy | feedback | seek-reward | 3/3 | 0 | 0 |
| easy | low | health-recovery | 3/3 | 0 | 0 |
| easy | low | seek-reward | 3/3 | 0 | 0 |
| hard | feedback | health-recovery | 0/3 | 0 | 0 |
| hard | feedback | seek-reward | 1/3 | 0 | 0 |
| hard | low | health-recovery | 0/3 | 0 | 0 |
| hard | low | seek-reward | 2/3 | 0 | 0 |
| medium | feedback | health-recovery | 3/3 | 0 | 0 |
| medium | feedback | seek-reward | 2/3 | 0 | 0 |
| medium | low | health-recovery | 1/3 | 0 | 0 |
| medium | low | seek-reward | 2/3 | 0 | 0 |

[Before manifest](../../../reports/master-balance/single-target/before/manifest.json), [after manifest](../../../reports/master-balance/single-target/after/manifest.json), [comparison CSV](../../../reports/master-balance/single-target/comparison.csv), [campaign manifest](../../../reports/master-balance/single-target-campaign/manifest.json). Each directory retains raw gzip and the exact source snapshot.
