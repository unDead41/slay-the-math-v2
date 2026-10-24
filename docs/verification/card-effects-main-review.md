# Card-effects main integration review

Scope: the working-tree merge of main `c54ce92` and card-effects `a9c49f0`, plus the rules-aware AI integration. A fresh independent reviewer inspected the diff read-only and independently passed 73 targeted tests covering current/archived effects, reloads, explanations, AI strategy and campaign observation. No Critical issue was found.

| Finding | Severity | Resolution |
| --- | --- | --- |
| Current-Master map `publicCombatView` retained flat per-hit incoming math | Important | Fixed: active percentage rules call the real `CC.enemyDamage` on copied combat state. A new regression was observed RED (58 instead of 45), then GREEN; all 22 integration/map replay checks passed. Historical ordinary views retain their original calculation and campaign fingerprints. |
| Master SOR heading retained game 2.33.0 | Minor | Updated the current heading to 2.34.0. Historical versioned entries/reports remain intact. |

Reviewer-deferred judgments are handled explicitly: the root performs the complete suite, production build and browser checks and records results in `card-effects-main-2-34-0.json`. Hosted deployment, physical devices and pupil balance calibration remain outside this publication check. Existing `combat.cjs` and map-policy scoring weights remain disclosed heuristic approximations; redesigning them is not required to expose accurate current-state incoming values. No Critical/Important finding is deferred.

The historical feature syntax log has a blank EOF line; it remains unchanged as historical evidence. This is not a runtime defect. No second review was requested after the single fix pass.
