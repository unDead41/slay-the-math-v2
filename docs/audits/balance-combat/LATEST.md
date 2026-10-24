# Master Audit — balance/combat

24 Oktober2026, Asia/Kuala_Lumpur. Master SOR1.2.0. Scope: current Combat/Card Synergy development evidence; no runtime tuning or main publication authorized. Ijamm explicitly requests recheck after main changes and publication to this branch for Master.

## Sumber dan keadaan Git

| Field | Verified record |
|---|---|
| Previous remote Combat | 1bf66320ed275755d25734ad907395443f71176f |
| Main when testing began | 50d3af423cdc2240e949f4ddf29e023865304b65 / game2.36.0 |
| Main merged forward into working branch | 6376a222169815af582cf55aa4794f3c809a3515 / game2.37.0 |
| Before-effects cartridge | c54ce92fdd8e43544b03a16ed995431da6fdb8f0 / game2.33.0 |
| Current ordinary / Master | card-effects-1 / master-1.4.0-candidate.4 |
| Publication | Actual data commit/ref verified after upload; publication receipt supplements this audit. |

Previous Combat is an ancestor of main: its work was already integrated. New work starts from current implementation rather than replaying the old v1.2 overlay as if current. Main moved three more commits during testing; all24 loaded production dependencies are byte-identical between the tested50d snapshot and6376 publication base. Main's icon/SOR changes were fast-forwarded into the work branch. Historical reports retain their original labels.

**Status:** PERLU UPDATE for the ordinary Spool contract inconsistency below; VALID for the tested source/data/engine invariants within stated coverage. Pupil targets, exhaustive combinations and physical UI remain BELUM DISAHKAN. No Git conflict was observed in the branch synchronization. Potential balance risks are not relabeled as confirmed player bugs.

## Audit awal

Read current Master SOR, AGENTS, governance, domain SOR, decisions, previous Combat/Master handoffs and current card-effects owner. Main already supersedes historical Combat numbers: phase percentage statuses, lower setup/draw costs and Exhaust, first-activation history, single-enemy cards, candidate.4, real Economy/Map integration, AI and two-wrong-answer limits. Old tables therefore cannot approve current power. Preserve all existing IDs, assets, questions, saves, UI and source RNG.

## Masalah disahkan

| ID | Status / priority / confidence | Evidence, impact and action |
|---|---|---|
| CCS-01 | PERLU UPDATE / P2 / high | Forced-owned ordinary e13 Spool triggers from Clear Choice's Draw-Pile discard despite ineligible Hand-discard scope. Master rejects it. Actual receipt/log/Block/draw and restore evidence: audit.json.gz → ordinary/e13. Scope is latent existing/dev/forced-owned state; current normal offers exclude it. Master/card owner should version any new-ordinary scope correction while retaining old save receipts. No production fix in this audit. |
| CCS-04 | RESOLVED in evidence pipeline / P2 / high | First Focus part held380 records while worker metadata claimed400. Original1180 records were excluded; full1200 rerun accepted, all1180 available cases exactly matched and20 missing regenerated. Writer now holds an fd, fsyncs and validates decompressed count/unique indices. All accepted part hashes/counts/tasks verify. focus-recovery.json and excluded-focus-write preserve the trace. |

Existing main documentation findings DOC-001/DOC-002 (topic/MC summaries in AGENTS) remain under their owner and are not claimed fixed. They do not establish a runtime combat bug.

## Risiko berpotensi

| ID | Status / priority / confidence | Basis and next check |
|---|---|---|
| CCS-02 | BELUM DISAHKAN for pupils / P1 / high within the bot cohort | Current Master Hard is sensitive to decision skill, Predict/seal access, artifact-trial success and real deck growth. Primary intermediate20 cases per difficulty/Predict (two routes,10 reused seeds) and separate80-case artifact sensitivity show cohort differences; another seed set differs substantially. Do not force card nerfs or pupil90/70/50 conclusions. Master must evaluate the joint Combat/Map/Economy/learning contract with actual pupils. |
| CCS-05 | Checked within scope / P2 / high | Main changed from50d to6376 while tests ran. Dependency parity and exact replays preserve applicability to current combat inputs. Snapshot/definition labels are retained, and no UI/browser approval is inferred from parity. Check main again for later runtime changes before integration. |

## Penambahbaikan

| ID | Priority / status | Concrete follow-up |
|---|---|---|
| CCS-03 | P2 / CADANGAN | Master can reuse the frozen task/seed/source manifests for matched campaigns after cross-domain tuning; measure actual opportunities to acquire strong pairs and real pupil Hint/More Hint/time behavior. Keep approved two-attempt policy intact unless Ijamm changes it. Broader policy/combination coverage is a follow-up, not an invisible implementation change. |

## Audit akhir dan semakan

Final work is additive developer tooling, tests, source/raw evidence and documentation. There is no changed production file relative to the synchronized main base. Forty cards ×4 current states ×4 cartridges, plus before-state probes;780 distinct +40 duplicate screens/cartridge;30 original Lite pairs +9 risks;8 triads forward/reverse;50-seed follow-ups;actual12-enemy roster with real Elite flags;200 reload pairs;31 artifact scopes/cartridge;116 targeted contracts.

Primary evidence:28,056 engine encounters,10,106 tasks,368 campaign attempts,0 invalid,0 mismatch,92 explicitly censored always-skip cases.31 complete serialized task replays match, including one bounded-search Expert campaign. No score is assigned to a censored/invalid group.26 new harness/probe/boss/artifact-gate checks pass; targeted pre-existing engine run269 pass/1 UI badge test blocked by missing jsdom. Syntax passes. These sets overlap; do not sum them into a fabricated unique test count.

Final diff review checks production preservation, no CP UI, source identities, numeric/interaction formulas, actual Energy/Focus payments, incomplete-order exposure, source/hash/task/part counts, censor denominators, ordinary-vs-Master distinctions and relative links. Independent read-only review identified roster Elite fixture context and incomplete combo exposure; those are addressed by actual first-start Elite flags and explicit order/turn fields, including reverse triples. Ordinary campaign turns/Energy/Focus aggregation was corrected from real encounters; unavailable campaign enemy HP is null. Worker counters and extra Mystery combat are separated.

No additional confirmed issue found in the reviewed scope. UI/browser/physical device/audio/math-content correctness, full CI, every triple permutation, universal CP/loop absence and pupil success remain unverified. MODEL.zip was unavailable and unused. PDFs/questions/assets were not modified.

[Detailed Master handoff](../../balance/combat/recheck-2026-10-24/HANDOFF_MASTER.md) · [40 cards](../../balance/combat/recheck-2026-10-24/40_CARDS.md) · [raw/source/CSV/integrity](../../../reports/combat-recheck-2026-10-24) · [commands/policy](../../../tools/balance/recheck/README.md)
