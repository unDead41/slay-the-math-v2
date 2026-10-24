# Current Combat & Card Synergy recheck

Developer evidence only. Read `docs/balance/combat/recheck-2026-10-24/HANDOFF_MASTER.md` and the applicable Master SOR before using results. No runtime numbers, assets, IDs, questions, acquisition prices or UI Combat Power are changed by these tools.

`runtime.cjs` loads private actual-engine cartridges: ordinary challenge, Master Easy/Medium/Hard, or pre-effects Git objects at c54ce92. Primary runtime source is main50d3af4/game2.36.0. Publication-base dependency parity is checked separately; never relabel historical results as a new definition.

Prepared-deck policy `recheck-visible-phase-greedy-1` ranks real legal plans using actual engine incoming damage, visible Hand/intent and declared support priorities. These priorities are not CP. Requested orders are physical slot UIDs in an arranged opening, forced only when legal. No Energy is granted. Requested cards may be unavailable/illegal/unplayed; consult order-exposure data. Both pair orders and forward/reverse triples are tested, not all six triple permutations.

Master campaigns use the existing `sampled-turn-search-2/{skill}`, actual connected maps, source offers, Gold, acquisition, recovery, Mystery and the current two-wrong-answer cap. `high/low` refer to synthetic Predict knowledge only; artifact/Mystery questions retain feedback. Secondary ordinary campaigns decline Mystery. `artifact_gate` adds an explicitly synthetic correct-first artifact-trial oracle only, through real trial/award APIs; this is not a pupil model. Expert lookahead is bounded and does not model future Predict income.

ICP uses target-vs-Rune Strike matched12-card replacement decks, 5 seeds, wisp/dealer, ordinary/Master Medium, both upgrades and both target Focus states. Both arms begin with one Focus and assisted Predict (no Predict Focus). Normal reserves Focus for other cards; Focus spends on the first target when eligible. Passive targets never spend Focus. The no-Focus arms distinguish raw benefit from opportunity cost. CP is conditional encounter outcome, never a universal card rating or acquisition probability.

CCP includes all4 pair or all8 triple membership cells, matching deck size/slots/upgrade/seed. Total combination U, pair interaction and third-order interaction are different outputs. U=100*win+20*terminalHP/maxHP-min(10,turns/2). Censored/invalid U stays null and its group unranked. Named support units (Block actually used/expired/retained, draw, status phases, mitigation, attributes, Passive/Thorns damage) are separate; do not add them again to U. Usage pools include repeated reference variants, not natural card frequencies.

Typical commands (full Git history needed for pre-effects replay):

```sh
node tools/balance/recheck/audit.cjs
STM_WORKERS=3 node tools/balance/recheck/run.cjs icp
STM_WORKERS=2 STM_RECHECK_OUT=reports/combat-recheck-2026-10-24/focus-reviewed node tools/balance/recheck/run.cjs focus
node tools/balance/recheck/run.cjs pairs
node tools/balance/recheck/run.cjs triads
node tools/balance/recheck/run.cjs triads_reverse
node tools/balance/recheck/run.cjs evolved
node tools/balance/recheck/run.cjs roster
node tools/balance/recheck/run.cjs clusters
node tools/balance/recheck/run.cjs reload
node tools/balance/recheck/run.cjs revision
node tools/balance/recheck/run.cjs ordinary_campaign
node tools/balance/recheck/run.cjs campaign
node tools/balance/recheck/analyse.cjs
node tools/balance/recheck/select.cjs
node tools/balance/recheck/run.cjs followup
node tools/balance/recheck/run.cjs focus_followup
node tools/balance/recheck/run.cjs artifact_gate
node tools/balance/recheck/verify.cjs
```

Choose a fresh `STM_RECHECK_OUT` when repeating immutable raw cohorts; generators refuse overwrites. Manifests retain exact tasks even when later coverage expands. Adaptive selections are retained at the primary output path. Raw outputs are concatenated gzip JSONL members; read finalized files listed in `*-parts.json`, never glob `.pending` files. Current writer keeps an open descriptor, fsyncs, renames and verifies decompressed counts/unique indices. The excluded first Focus write and complete rerun are documented in `focus-recovery.json`;1180 available old records match the rerun exactly and20 missing records were regenerated.

Limits:100 encounter cycles,500 paid plays,10,000 estimated harness/API/preview work. These do not edit player timers and are not counts of every engine atom. Exact mechanical reload compares full state/RNG except presentation log/intent labels. Source bundles, raw hashes, task indices, provenance and selected full replays are verified. Artifact quote/acquisition/negative scopes and arranged exploit fixtures are explicitly distinct from measured encounter power. Bot results do not validate pupil90/70/50 goals or prove every possible loop absent.
