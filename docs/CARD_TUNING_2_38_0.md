# Card tuning — 2.38.0-card-tuning.1

Ijamm approved the follow-up from the 40-card audit with “okay update dekat branch kamu dulu ni please!!”. This release is for `balance/card-effects-20261024` only. Main base: `6376a222169815af582cf55aa4794f3c809a3515` (2.37.0); Master SOR 1.2.0. It retains the integrated question, icon, audio and developer-tool changes from main.

## Approved values

| Card | New ordinary runs | New Master runs | Boundaries retained |
| --- | --- | --- | --- |
| Last Page | 1 Energy; Draw 2, plus 1 if Hand is empty after play | Same | Focus and upgrade each add 1 main draw; empty-Hand ceilings 3/4/4/5; Hand limit 10 |
| Recall | 0 Energy | Same | Select a real Discard UID; Exhaust; no self-return; Focus/upgrade extra draws unchanged |
| Mana Barrier | 7 Block per remaining Energy | Existing 7X unchanged | Requires X≥1; Agility once; ordinary Focus +3 and upgrade +3; Master Focus +min(6,X+2), upgrade +2 |

Growing Flame, Battle Rhythm, the other 37 cards' numbers, enemy/difficulty profiles, artifact numbers, question sampling and map rules retain their existing owners. Mana Barrier's bilingual notes clarify its existing once-per-card bonuses in both modes. Original IDs, names and artwork remain intact. These are playtest values; a small seeded AI comparison cannot establish universal balance or pupil win rates.

## Rules and saves

`tools/cards/effects-v1.cjs` and `effects-v1.json` freeze the previous adapter/settings. The current adapter adds only the approved values after building that revision. New ordinary runs carry `card-effects-2`; `archivedEffectsData['card-effects-1']` selects the complete frozen v1 definitions. The original unmarked ordinary definitions remain at `legacyEffectsData`. Engine actions and UI/Shop metadata bind to their run's generation and restore the previous binding even after errors or nested calls.

Existing ordinary HP, RNG, UIDs, receipts and opened offers are preserved. A pending v1 Recall still costs 1 when its target is confirmed; it was never prepaid. A committed v1 Read Ahead choice has already paid and must not pay again after reload. Retry retains its original rule generation. Unknown rule markers are rejected.

New Master identity: `master-1.5.0-candidate.5`, with separate difficulty save keys. The previous `master-1.4.0-candidate.4` keys are retained in browser storage; this candidate does not reinterpret those runs. Start a New Run to try the new values.

Recall enters the existing ordinary zero-Energy Shop price band: the fixed non-sale fixture changes base price 45→60 for a newly generated Shop. Previously opened v1 offers retain 45 and their original metadata. No pricing formula or loot weighting was changed.

## AI observation correction

Card-comparison choice ranking previously ran inside the actual-action observer. Incoming-damage estimates on hypothetical states could therefore consume recorded Block despite no enemy action. Choice values are now computed first; only `chooseCardOption` is observed. The agent's policy, search budget, report schema and gameplay actions are unchanged. Campaign choice ranking already used this separation.

Five real-combat regressions compare reported Block absorption with actual enemy-turn log events for Read Ahead, Clear Choice, Card Search, Recall and Burning Page. Earlier affected reports keep their source provenance and must not be treated as corrected measurements.

## Verification and handoff

The new Last Page wording retains its Draw/Hand glossary terms, keyboard focus and explanations in EN/BM. A fresh independent review identified this interaction regression and four rendered regressions verified the correction.

See [scoped audit](audits/card-effects/LATEST.md), [comparison evidence](../reports/card-tuning-2-38/summary.json), [execution record](superpowers/plans/2026-10-24-card-tuning-progress.md) and [design](superpowers/specs/2026-10-24-card-tuning-design.md). Test and publication receipts are recorded in the audit after completion. Branch publication does not authorize updating main.
