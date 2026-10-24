# SOR Combat/Card Synergy — experimental handoff

Current recheck: [24 October2026 handoff](recheck-2026-10-24/HANDOFF_MASTER.md) and [all40 current before/after states](recheck-2026-10-24/40_CARDS.md). The original tables below retain their v1.2 experimental source and must not be treated as current candidate.4 measurements.

23 October 2026 (Malaysia). Branch balance/combat. Base 2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7. Status: candidate for Master; no main merge/push, no claim of student balance.

## Implementation and ownership

The supplied SOR v1.2 is a test hypothesis. Exact source is tools/balance/specs/SOR_BALANCE_v1_2.md with numeric specification and selected pairs beside it. Baseline loads pinned git objects; candidate loads actual engine/resolver with optional explicit definition fields. Candidate numeric overlays, artifact values and difficulty/enemy profiles are Node development tools only. Player card/config/artifact data remain unchanged. Ordinary legacy upgrades retain their fallback behavior. Generated HTML cache hashes reflect engine changes.

The experimental overlay covers all 40 definitions, explicit upgrades, Focus, once/card Strength, fixed delayed Block, new delayed draw/Exhaust and one-time upgraded Passive gifts. Existing active cap/swap/history remains the owner. The hand-discard distinction prevents selection-rejected pile candidates activating Spool. Candidate boss profiles preserve locked intent, apply phase/rage on subsequent intent, and require real Block absorption for Brooch. No pricing, loot odds, art, IDs or question content changes.

## Measurements and reproducibility

Reproduce retained long batches using STM_BALANCE_REPLAY_MEASURED=1 and node tools/balance/run.cjs baseline and candidate with STM_BALANCE_OUTPUT set to a separate directory; exact historical sources are retained under tools/balance/snapshots and reproduce the recorded engine hash. New runs omit that flag and use the reviewed choice-limit/Passive-preview fixes. Historical invalid budget records must be withheld and rerun rather than scored. node tools/balance/enemies.cjs; node tools/balance/report.cjs. Use the recorded Node version and provenance hashes in each summary. Raw gzip JSONL records retain options, HP, turn, Energy/Focus, order, trigger and resource vectors. CSVs are indexes into these reproducible records.

| Build | Unique engine encounters | Outcomes | Logical factorial encounters |
|---|---:|---|---:|
| baseline | 4730 | {"WIN":3662,"LOSS":1068} | 2800 |
| candidate | 5210 | {"WIN":3573,"LOSS":1637} | 3760 |

Static coverage is 780 distinct unordered pairs plus 40 duplicate specifications (820); this is tag screening, not 820 measured CPs. Lite candidate is 1,200 Medium pair variants, 960 Easy/Hard variants and 640 Medium triple variants before cache. Duplicate UID screen, individual four-state comparisons, Focus opportunity, ordered pairs/triples, all 31 artifact IDs and selected clusters are extra batches. Acquisition is not proof every trigger fired; unsupported/inactive effects and exhaustive artifact interactions remain outside measured coverage. Coverage.json gives exact counts. Enemy sweep adds 216 encounters across 12 enemies, three candidate profiles and two policies, three seeds each.

ICP uses a pinned reference slot in a fixed 12-card deck; CCP uses 4 or 8 seed-matched factorial variants. Utility is the SOR exploratory U=100 win+20 finalHP/maxHP−min(10,turns/2), after engine win healing and before room rewards. Context includes enemy, difficulty, deck, initial resources, Predict and policy. No draw/Block proxy is added to U. U weights are a proposal. Small-sample t intervals are descriptive, without multiplicity correction; correlated seeds/heuristic policies limit inference.

Focus CSV compares target expenditure with reserving equal initial stock until the target resolves and selecting a later current opportunity. It does not implement an omniscient future optimum. exposed_pairs identifies whether the target was actually played in both arms. Passive Focus modes correctly resolve unfocused. Four-state ICP uses equal Focus stock within each paired comparison, so it is contextual replacement value, not the Focus marginal itself.

Policy uses public intent, hand and execution-plan previews, with fixed priorities (not measured CP). Beginner policy chooses by UID, not validated student behavior. Predict always answers correctly using the real question evaluator; mixed assistance suppresses some seal progress. It does not model student mistakes or time. Choices use a bounded deterministic heuristic; Burning Page takes the first option and may undervalue replacing. Ordered tests request permutations and record actual plays; unavailable/too-expensive cards can spill into later turns, so never assume requested order is achieved on turn one.

Harness limits: 100 cycles, 500 plays, 10,000 estimated evaluator/API work units; internal atomic operations are not instrumented, so CP-17 atomic-step coverage is partial. Censored U=-10 is exploratory; any censored factorial withholds final ICP/CCP. Invalid cases have null utility, retained in reports. These are encounter screens, not full campaigns.

## Risk follow-up

The two highest absolute initial pair interactions were expanded to 50 seeds in two new contexts. This selection is exploratory and susceptible to winner selection.

| Pair | Context | n | Interaction U | CCP U | Status |
|---|---|---:|---:|---:|---|
| stm.defend.ember_wall + stm.passive.ember_core | {"difficulty":"medium","enemy":"dealer","archetype":"attack"} | 50 | 6.11 | 6.03 | MEASURED_EXPLORATORY |
| stm.defend.ember_wall + stm.passive.ember_core | {"difficulty":"medium","enemy":"knight","archetype":"block"} | 50 | 1.05 | 3.07 | MEASURED_EXPLORATORY |
| stm.defend.layered_shield + stm.passive.battle_rhythm | {"difficulty":"medium","enemy":"dealer","archetype":"attack"} | 50 | -0.57 | -2.25 | MEASURED_EXPLORATORY |
| stm.defend.layered_shield + stm.passive.battle_rhythm | {"difficulty":"medium","enemy":"knight","archetype":"block"} | 50 | 0.41 | 1.07 | MEASURED_EXPLORATORY |

Do not nerf from a positive interaction alone. Review the full encounter vectors, acquisition/setup costs and repeatability. This sample cannot establish absence of all unbounded loops. Contract tests bound concrete trigger/exhaust/swap cases; untested deck sizes, piles, artifact combinations and action permutations remain.

## Master handoff and cross-domain needs

Use 40-cards-before-after.csv (160 rows), ICP.csv, CCP.csv and Focus-value.csv with raw results. Audit JSON retains plans/actions, costs, queue and restore checks. enemy-screen.csv covers all canonical enemies; low-win boss cases under a fixed starter-size benchmark do not imply a developed Stage 2 deck loses that often. Compare cards-only diagnostics separately: it also applies artifact overlays, and is not a pure card-only ablation.

Recommended disposition: retain v1.2 as an experimental candidate, not a production activation. Master should combine actual path HP attrition with Economy reward/deck growth, rarity and upgrade exposure; re-evaluate risky combinations in evolved Stage 2 decks, varied Predict accuracy and human-readable policies. Keep the 90/70/50 human full-run targets unverified until student trials.

Before production: add balanceVersion/difficulty save/checkpoint snapshots, migration and pending-choice compatibility, connect preview/tooltip text for explicit upgrades, and test all new-run profiles through real campaign flow. The Node overlays are not drop-in player data. Runtime fallback extensions are reviewable, but activating candidate values in config without those integration gates is unsupported.

MODEL.zip was unavailable and unused. Mathematics PDFs were not needed to change combat and their content was not altered.
