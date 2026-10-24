# Economy branch audit — 24 October 2026

Master SOR1.2.0 read from main6376a222169815af582cf55aa4794f3c809a3515, plus AGENTS and main documentation audit. Initial measurement base:50d3af423cdc2240e949f4ddf29e023865304b65 (2.36.0). Closing/publication parent:6376a222169815af582cf55aa4794f3c809a3515 (2.37.0). Previous remote balance/economy:df53579593937c2d71fcb6bb96409036ad575070, already merged into initial main. User authorises recheck/fixes and push to balance/economy only.

**Status: VALID for economic measurement/transaction compatibility in the recorded scope. Calibration remains BELUM DISAHKAN.** Parent updates are retained; no main ref is changed by this branch publication. Source/published receipt follows in PUBLICATION.md after remote verification.

## MASALAH DISAHKAN

| ID | Status / priority / confidence | Evidence, effect and correction |
|---|---|---|
| ECON-01 | VALID, fixed / P2 / high | Artifact affordability used A.price (omitting profile multiplier); at Easy boundary it counted0 versus3 actually affordable. telemetry.cjs now uses E.shopPrice. Regression covers Easy/Hard immediately below/at quote boundary. |
| ECON-02 | VALID, fixed / P2 / high | Purse purchase netted +40 acquisition against spending, reporting0 earned and an understated charge. Observer records new acquisition credits and gross costs; test checks overall/Shop/room conservation against real purchase. Player currency is unchanged. |
| ECON-03 | VALID, historical context clarified / P2 / high | Older economy reports pinned2.24.0/candidate.1 and older Master power cohorts are not fresh candidate.4 measurements. Owner handoffs now point to source-pinned current report/tables; old data remain historical. |

## RISIKO BERPOTENSI

| ID | Status / priority / confidence | Trigger, evidence and follow-up |
|---|---|---|
| ECON-R01 | BELUM DISAHKAN / P2 / medium | Twelve valid Easy/Predict-skip Boss1 runs reach the100-turn benchmark cap. That observation is confirmed; an infinite live-game stalemate is not proven. Exact matched states/decks/traces supplied to Combat/Master; limits unchanged and capped cases retained. |
| ECON-R02 | BELUM DISAHKAN / P2 / high for price observation, unmeasured desirability | Seven ordinary prices follow changed Energy bands. Burning Page goes45→60 when1→0 Energy; other six go65→45. Existing band0=60 is confirmed, not presumed a bug. Master should decide whether ordinary pricing should change after measuring marginal value. |
| ECON-R03 | BELUM DISAHKAN / P2 / high | Pupil90/70/50 and universal current CP remain unmeasured.600 declared-policy runs and tag histograms do not supply these estimates; bounded/matched strata and survivor-only cash are explicit. |

## PENAMBAHBAIKAN

| ID | Priority / status | Proposal and evaluation |
|---|---|---|
| ECON-I01 | P2 / recorded, no tuning change | Review seven current ordinary price changes and current candidate.4 CP before altering rarity/support; compare measured purchase benefit with cost. |
| ECON-I02 | P3 / deferred by absent mechanic contract | Explore has no runtime owner. Evaluate actual Heal/Upgrade; add Explore only after an approved action/reward/save contract. |

General main DOC-001 (old topic summary) and DOC-002 (old MC summary) remain outside this economy correction. They do not prove runtime content errors and are not silently marked resolved.

## Before and after checks

Initial comparison proved old economy already integrated and found the two observer defects; RED assertions were observed before fixes. Final diff contains only economy observer correction, current test/report tooling and domain/audit handoff. No player engine/card/artifact values, questions, RNG algorithms, map topology, artwork/audio or save identity is retuned.

928 full-suite tests pass on the2.36.0 owner implementation; following2.37.0 main advance,70 economy/Master/icon tests,24 native desktop/mobile checks and production/portable build pass. Final11 focused regressions cover the report-only timeout-ledger distinction. All financial/Combat/policy owner bytes remain identical across main versions; historical measurements are not relabeled. Both charts self-reviewed. Author review only for this recheck.

Fresh cohorts:165888 offers/525312 slots;3360 event cases;1080 boundaries;600 Shop fixtures;96 Rest cases;600 real campaign attempts (341wins/247losses/12capped,0invalid),2102 paid transactions;12 exact censored replays. Raw data/seeds/manifest/current tables and limits: [report](../../economy/recheck-20261024/REPORT.md), [verification](../../economy/recheck-20261024/VERIFICATION.md).

No additional confirmed issue was found in the final economic diff beyond the corrections above. Live services, hardware, hosted deployment, exhaustive combinations and pupil calibration are outside the evidence.
