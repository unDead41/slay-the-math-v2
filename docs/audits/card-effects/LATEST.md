# Card tuning audit and handoff — 24 October 2026

## Source and authority

- Base main: `6376a222169815af582cf55aa4794f3c809a3515`, game 2.37.0. Main initially remained at that SHA; the concurrent Settings-only Dev update later advanced it to `1ece105903ee34c81c38a338ead01db65a834523`. Master SOR at that snapshot remains 1.2.0. Its nine-file change was inspected and preserved in this branch, including both decision/changelog histories. No card, engine, balance, question or save-key change is present in that main delta.
- Prior feature remote: `a9c49f03f5e60dc0309f90931469361e6febedee`, already in main's history.
- Worktree: local `balance/card-tuning-20261024`; delivery: existing remote `balance/card-effects-20261024` only. Current user approval: “okay update dekat branch kamu dulu ni please!!”. No main publication under this instruction.
- Master SOR 1.2.0, AGENTS, relevant card/combat/save/economy owners and main audit read before edits. Existing DOC001/DOC002 main-documentation findings remain outside this runtime scope.
- Owner: [2.38.0-card-tuning.1](../../CARD_TUNING_2_38_0.md); plan/design/execution record linked there.

## Initial scoped audit

| Finding | Priority / classification | Evidence | Action |
| --- | --- | --- | --- |
| AI choice ranking counted hypothetical incoming hits as actual Block use | P2 / PERLU UPDATE | Same-runtime card comparison recorded 266 Block used against 12 in actual enemy-turn events in one regression; actual run was not hit during ranking | Fix observer boundary; five public combat regressions |
| Last Page, Recall and ordinary Mana Barrier values were approved for tuning after the 40-card audit | Candidate improvement / BELUM DISAHKAN as universal balance | Prior audit plus exact-main characterizations: Last Page 1+2; Recall 1 Energy; ordinary Mana 5X vs Master 7X | Apply the three approved values, preserving all other numerical owners |
| Old ordinary saves and pending card choices could be reinterpreted if only current definitions changed | P1 compatibility risk / BELUM DISAHKAN before changes | Existing v1 marker, real receipts, unpaid Recall choice, paid Read Ahead choice and opened Shop | Freeze full v1 definitions/settings; bind resolver and metadata by run; separate Master candidate.5 key |

## Final scoped diff audit

| Finding / boundary | Status | Evidence |
| --- | --- | --- |
| AI hypothetical-choice accounting | VALID, corrected | Choice computed outside capture; only actual `chooseCardOption` is observed; five real combat/log regressions pass |
| Last Page 2+1, Recall 0+Exhaust, ordinary Mana 7X | VALID implementation; balance remains candidate | Real engine tests exercise Focus/upgrade, empty/nonempty/full Hand, zero Energy, actual Discard UID and lifecycle |
| Prior v0/v1 ordinary rules and pending payments | VALID in targeted tests | Frozen complete archive hash, old receipts/RNG, paid/unpaid reload, original Shop metadata and Retry; unknown marker rejected |
| Unrelated source preservation | VALID | [Scope evidence](../../../reports/card-tuning-2-38/scope.json): all 40 IDs/artwork; 37 definitions deep-equal in each mode; original/v1 archives exact; Master Mana numbers, profiles/enemies/artifacts/economic overrides exact |
| Universal win-rate improvement | BELUM DISAHKAN | [384-run comparison](../../../reports/card-tuning-2-38/summary.json): zero invalid/censored/error. Last Page wins 20→19 ordinary and 21→19 Master; Recall Master 20→22; ordinary Mana 20→20 with utility +0.139. Rune Strike controls and unchanged Master Mana outcomes identical. Small intermediate-policy cohort; not pupil data. |
| Current default release and old Master saves | VALID; native checks passed | New ordinary marker2 and candidate.5 separate keys; v1 retained; main's unrelated question/icon/audio/Dev source remains in base |

## Concurrent main compatibility

Main advanced from the base to `1ece105903ee34c81c38a338ead01db65a834523` during final verification. The current Master SOR and Dev audit were read. The nine-path delta removes redundant main-menu Dev controls, retains access from Settings and updates the related guide/SOR/native tests. Exact current-main versions were retained for its seven otherwise-untouched paths; both append-only decision/changelog histories are retained alongside the card changes. Fresh combined-tree Dev checks passed: 20/20 developer Node tests and the production/static-subpath browser suite, including Settings-only controls, password/reload, Hub, copied player saves, all15 events, exact questions, status edits and reports. This task does not move main. The later main metadata-only release `37558d5a53d62e457c076b2444a1b71e8b42e50b` advances main to2.37.1. Its three audit histories are preserved; feature metadata remains2.38.0-card-tuning.1 with its own generated cache URLs. No gameplay source changed in that follow-up. The published card commit will descend from this observed current main and preserve the same verified local tree.

## Independent review and correction

[One fresh whole-branch review](REVIEW_2_38_0.md) found a P2 Last Page explanation/accessibility regression: Draw/Hand terms lost their three glossary targets. Four actual rendered cases failed before correction, then passed after restoring typed game tokens and regenerating data. Affected group44/44 passed. No other Critical/Important or deferred Minor findings. Reviewer declined universal balance claims and final operational receipts; root retains candidate limitations and verifies actual logs/ref independently.

## Verification receipts

- Untouched exact-main baseline: 923/923 tests passed before production edits.
- Focused current-value/archive/AI/source/explanations group: 81/81 passed.
- Fresh final sequential production player/portable build passed (303,171,444 bytes portable), with the corrected glossary and concurrent-main Settings controls; syntax checks passed. An earlier concurrent pretest attempt was killed by the environment before tests, and the pre-review full run was superseded. No full-suite success is claimed for those attempts.
- Final production native card checks: 10/10 ordinary/Master/v1-recall/v1-paid/v1-Shop × EN/BM cases passed, including real actions, current glossary focus, unchanged reload state, zero broken artwork or page errors.
- Additional production effects checks: ordinary, Master, Last Ember and unmarked original save passed; Master Easy/Medium/Hard real menu/gift/route/Predict/reload passed.
- AI browser: four encounters, report history/downloads/cancellation/storage isolation and widths1440/750/390 passed, zero page errors. This test predates the text-only glossary correction; numerical/actions parity with the final definitions is separately verified.
- Fresh combined-main Dev Node checks20/20 and production/static-subpath browser suite passed.
- First completed post-correction full suite:957/958; the sole failure was an old current-run UI expectation of Recall costing1. Updated the expectation to approved0, with a resolved receipt and exactly one play asserted; no runtime change. The final whole suite passed958/958, zero failures/skips/cancellations, in255.382seconds using `node --test --test-concurrency=2 tests/*.test.cjs` after all corrections.

Tiada isu tambahan ditemui dalam skop yang disemak. Universal balance, pupil outcomes, physical devices and live hosting are outside this verification.

## Publication receipt

All implementation verification is complete; branch-only publication and remote readback are the remaining steps. Main at final pre-publication read: `37558d5a53d62e457c076b2444a1b71e8b42e50b`. This task never moves main. Candidate values, particularly Last Page's policy-dependent outcomes, require further human playtesting before a balance claim or main promotion.
