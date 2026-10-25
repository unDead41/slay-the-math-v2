# Independent whole-branch review

Reviewer: one fresh-context `gpt-6-astra`, high reasoning, read-only; no nested or second reviewer. Reviewed `d77b3e0ce87d573de89e84a9b2374df97ad625b9..a71410b2498d5d80486908382b9007d6eddb70b1` against the eight user requirements, plan, Master/AGENTS and actual code/native evidence. Verdict before root fixes: **With fixes**. No Critical findings and no deferred Minors.

## Strengths

Preference/network/API outcome separation, explicit Online and cancel/timeout/stale-response guards; release identity includes shell/worker and cold reconstruction; native process close/restart and player coverage are real; gameplay/assets are preserved; exact Tutorial provenance compatibility and documented external-pet/storage/main limits.

## Important findings, root reproduction and single fix pass

1. **P2: Failed Offline startup trapped the player outside Settings.** `dist/bootstrap.js` failure/entry gate hid Enter/continuation while the sole selector was behind the overlay. Root added a native assertion and observed `review-gate-red.log` fail because Settings access was absent. The gate now opens the existing Settings modal; there is still exactly one radio group. Selecting Online restarts the normal entry flow without granting offline Ready. Fresh `review-gate-green.log` passes all4fault cases, including worker-denied/missing-package explicit return to Online.
2. **P2: Same-key cache replacement could produce Ready.** `dist/offline-install.js` reopened receipt/keys without hashing the replacement namespace. Reviewer reproduced final-receipt and both warm paths with same-length corrupted bytes, read-only/in-memory. Root observed3failing regressions in `review-storage-red.log`. Every Ready transition now hashes the actual reopened retained namespace, including after receipt write; warm install repairs replacement bytes before Ready and audit rejects corruption. `review-storage-green.log` passes36focused/provenance tests.

Reviewer independently ran mode/worker13/13 and Settings/provenance4/4. Artifact-writing native tests and the temporarily mutating installer file were inspected rather than rerun by the read-only reviewer. Root, not another reviewer, verifies the fixes and final full suite. Product-build/complete-restart results after fixes are recorded separately; pre-fix green evidence is not relabelled.

## Declined to judge and root rulings

| Reviewed boundary | Root ruling | Cost/limit |
| --- | --- | --- |
| Live provider/backend/animated external pet | Keep the explicit adapter/local-FAQ scope. | Service-owner integration remains necessary for live chat. |
| Main2.49.1 Idle integration | Keep the pinned candidate and Master integration boundary. | Combined release needs regeneration and acceptance. |
| OS reboot, devices, other browsers, hardware graphics | Do not extend process-restart/software-rendering evidence. | Behavior may differ in those environments. |
| Human audio recognition | Keep muted native playback/decode evidence distinct. | Human audition still required. |
| GPU/temp-space crashes | Preserve failures; no GPU product fix claimed. | A hardware-rendering issue may remain. |
| Portable success as cache proof | Keep separate reports/delivery claims. | Neither validates the other's storage. |
| CI-247-01/QA-248-PRELOAD-01 | Keep inherited findings open. | Their historical intermittent conditions may remain. |
| All mathematics answers | Keep unchanged canonical data/evaluators and numerical regression suite. | No new textbook-by-textbook audit. |
| Original Tutorial provenance failure | Permit only the exact two Settings hooks; keep snapshots/images unchanged. | Broader changes need capture review. |
| Whole-origin compromise/corruption after verification | Readiness is point-in-time; reaudits/cold worker fail closed. | Later eviction/corruption can require repair. |

Final source fixes remain branch-only. No review verdict authorizes or establishes a main merge/deployment.
