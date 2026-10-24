# Master balancing handoff — game 2.27.0

Current correction: [game 2.29.0, single-enemy cards](SINGLE_TARGET_2_29_0.md). The integration and measurements below retain their original candidate.2 source; they are not relabeled as candidate.3 results.

Implemented on balance/master; Ijamm's subsequent instruction authorizes publishing this completed 2.27.0 update to main. See [main release](MAIN_RELEASE_2_27_0.md) for publication scope and checks. Start New Run and select an Easy/Medium/Hard playtest link, or open the game with ?balance=easy / medium / hard. Current common definition binding: master-1.3.0-candidate.2; definition hash 85f441c951fe36e94129c4a4201fdd94fcdcecb15ef3002099ab9197faa1782d.

## What is integrated

Latest main b67298b (Learning Report/optional analytics 2.26.0), including original artwork/card motion from 7afb0aa, plus Map 5480273, Combat remote 1bf6632 (local source 68dce74, identical tree) and Economy df53579. The final game version is 2.27.0 to avoid the concurrent analytics version. Analytics sharing remains under its existing consent/settings owner.

The shared browser/Node binding connects 40 candidate cards, 31 artifacts, 12 enemies, full difficulty profiles, source-aware frozen rewards, Shop prices/removal, Rest, 15 Mystery events, Boss rewards and real campaign carry. Economic Seal/Purse/Contract now use 10%/+40/20%. Difficulty saves are isolated and versioned; restore rejects a different definition/profile, and retry/checkpoint retain the binding. Learn assistance is not multiplied onto candidate combat. Legacy entry/saves and the question bank remain available. See [Master SOR](../../sor/23_MASTER_BALANCE.md), [profiles](PROFILES.md), [all 40 measured cards](CARD_POWER.md), [31 artifacts](ARTIFACTS.md) and the specialist numeric card audit under ../combat.

No map topology or extra Explore feature is invented. Mandatory Mystery 5, Rest 9 and Boss 10 remain. Source support weighting uses capability tags; unmeasured loot CP remains null. Card CP and map pressure are different quantities.

## Campaign evidence

720 primary two-stage campaign attempts, plus 18 matched validator verification replays: initial 180, calibration 180, untouched holdout seeds 20–39 another 360. No invalid or censored campaign result in these cohorts. The initial profile won every Easy pilot and no Hard pilot. Candidate.2 adjusts starting HP, enemy HP/attack, Rage/phase and Easy recovery as a package; the package comparison does not identify one isolated causal variable. No card stat was changed to force a bot win rate.

All battles use the real resolver, actual connected route choices, frozen legal offers, available Gold, acquired cards/artifacts, real Rest/upgrade and carried HP. Mystery is attempted. Feedback Predict guesses untried visible answers and retries; high/low know the canonical Predict answer with synthetic 85%/25% probability and abandon a wrong first answer. Artifact trials use feedback; Mystery gets one feedback-based attempt. These policies differ in seal access as well as Focus. They are not measured pupil skill. The two route policies are recovery-seeking and reward-seeking; later choices, encounters and RNG exposure may diverge.

Holdout results (20 paired seeds per cell; intervals describe that bot cohort):

| Difficulty | Predict | Route | Wins | Rate | Wilson 95% | Censored / invalid |
| --- | --- | --- | ---: | ---: | --- | --- |
| easy | feedback | health-recovery | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| easy | feedback | seek-reward | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| easy | high | health-recovery | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| easy | high | seek-reward | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| easy | low | health-recovery | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| easy | low | seek-reward | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| hard | feedback | health-recovery | 4/20 | 20.0% | 8.1%–41.6% | 0 / 0 |
| hard | feedback | seek-reward | 7/20 | 35.0% | 18.1%–56.7% | 0 / 0 |
| hard | high | health-recovery | 7/20 | 35.0% | 18.1%–56.7% | 0 / 0 |
| hard | high | seek-reward | 16/20 | 80.0% | 58.4%–91.9% | 0 / 0 |
| hard | low | health-recovery | 1/20 | 5.0% | 0.9%–23.6% | 0 / 0 |
| hard | low | seek-reward | 6/20 | 30.0% | 14.5%–51.9% | 0 / 0 |
| medium | feedback | health-recovery | 16/20 | 80.0% | 58.4%–91.9% | 0 / 0 |
| medium | feedback | seek-reward | 17/20 | 85.0% | 64.0%–94.8% | 0 / 0 |
| medium | high | health-recovery | 20/20 | 100.0% | 83.9%–100.0% | 0 / 0 |
| medium | high | seek-reward | 19/20 | 95.0% | 76.4%–99.1% | 0 / 0 |
| medium | low | health-recovery | 13/20 | 65.0% | 43.3%–81.9% | 0 / 0 |
| medium | low | seek-reward | 17/20 | 85.0% | 64.0%–94.8% | 0 / 0 |

**Pupil 90% / 70% / 50% remains unmeasured.** Easy remains extremely forgiving for these bots; Hard is strongly sensitive to knowledge and route. Preserve that limitation instead of claiming calibration. Holdout cells reuse seeds across policies, so pooling them as independent pupil observations is invalid. Real pupils and broader decision/deck policies are the next calibration inputs.

## Card and synergy evidence

Fresh 624 replacement/factorial cases, 1,632 encounters, zero invalid/censored: every card normal/upgraded, two horizons, 3 seeds per cell; ten chosen pairs and four triads. Utility is actual win/HP/turn outcome, not summed draw/Block proxies. Pair interaction uses all four cells. Triads retain eight cells and separate third-order interaction from total synergy. Selected pair results worth follow-up:

| Pair | Enemy | Upgraded | Mean interaction U |
| --- | --- | --- | ---: |
| Battle Rhythm + Flash Ward | dealer | true | 104.88 |
| Lasting Shield + Tower Shield | dealer | true | 73.04 |
| Lasting Shield + Tower Shield | dealer | false | 68.86 |
| Ember Core + Flash Ward | dealer | true | 35.74 |
| Mana Reading + Last Page | dealer | true | 35.32 |
| Grimoire Ward + Burning Page | dealer | true | 35.28 |
| Recall + Deep Study | dealer | true | 34.47 |
| Growing Flame + Twin Shot | wisp | true | 0.17 |

Large positive U often crosses the loss/win threshold. It does not prove an infinite combo or universal OP state, and acquisition cost is not free in the campaign. Defensive setup is valuable in long fights; it can lose tempo in short ones. No automatic nerf or CP-based loot multiplier is justified by 3 seeds. Historical Combat Lite/deep evidence remains intact and retains its original profile context.

## Reproduction and provenance

- npm run balance:master -- --label=NEW-LABEL --seeds=20 --offset=40 --workers=3
- npm run balance:power (refuses to overwrite existing evidence; use a separate checkout/output when deliberately repeating).
- node tools/balance/master/report.cjs verifies manifests/source snapshots and regenerates these tables.
- npm test; npm run check; npm run test:maps; npm run build:prod; npm run test:balance-master-browser.
- In this environment jsdom is supplied through NODE_PATH=/tmp/stm-audio-qa/node_modules:$CODEX_PRIMARY_RUNTIME_NODE_MODULES; browser QA additionally uses QA_CHROMIUM_MODULE=@sparticuz/chromium. No project dependency installation is required here.

Every measured cohort keeps manifest tasks, compressed raw records and exact source snapshots under reports/master-balance. Analytics integration initially preserved every engine dependency byte. The final review then strengthened save validation in dist/economy.js, dist/card-combat.js: mandatory matching Economy state and the candidate Thorns bound. These are validator changes, not new card/profile numbers. All 18 difficulty/Predict/route cells for held-out seed20 were replayed after those fixes and exactly matched the prior outcomes, carried state, room snapshots, action trace/RNG and metrics. See [comparison](../../../reports/master-balance/validation-replay/comparison.json) and its separate source snapshot. Do not relabel historical source hashes as the final tree.

The final validation record is [VALIDATION.md](VALIDATION.md). [Execution plan](../MASTER_PLAN.md) records scope and the concurrent main update. Real pupil win rates, physical device/audio audition, all possible combinations and universal CP rankings remain unverified.


## Economy compatibility recheck — 24 October 2026

[Current scope, financial telemetry corrections and fresh evidence](../../economy/recheck-20261024/REPORT.md) target game2.36.0 / Master candidate.4. Historical cohorts retain their original source. No new player price/stat/profile change is introduced by the audit. Pupil targets and the 12 bounded Predict-skip Boss cases require Master/Combat follow-up.
