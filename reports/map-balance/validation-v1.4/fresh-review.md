# Fresh whole-change review

Read-only review by one fresh-context reviewer,990541d57c6df96cefb21eddc7a365d1d989a74d..702230324a83d909f06802ae1754d402f22e5f5d. Full fixed records were actively collecting, so raw-data acceptance remains a separate owner gate.

No Critical or Important implementation defect was reported. Strengths: canonical profile injection, captured state validation, actual quotes/zero postboss grant, immutable matched entries, no production diff and explicit censoring. Reviewer independently ran7 current-runtime tests and verified all126 completed smoke records across three profiles.

Finding: independent Python recalculation covered matched CP but campaign/Predict/conditional policy CP and all-case bounds were only export-consistency checked. Owner regraded this Important for the claimed independent-score acceptance: consistently corrupted JSON+CSV could pass. Allsix negative fixtures were accepted RED. Expanded verification recomputes counts, probabilities, CP/Wilson and CP intervals, nullability and all-case bounds from raw cohorts for allfive score tables; allsix corruptions reject GREEN. No raw/protocol change was necessary. Positive smoke verification passes and the relevant38 Node tests pass. Full root suite/result acceptance follow separately.

Reproduce the negative verification after a completed current Easy smoke using:

```bash
node /tmp/stm-map-v14-source/tools/balance/map-recheck/run.cjs --difficulty easy --seed-limit 1 --out /tmp/map-score-smoke
python3 reports/map-balance/validation-v1.4/verifier-score-negative.py /tmp/map-score-smoke/easy /tmp/stm-map-v14-source
```

Reviewer set aside final full outcomes/completeness, pending root/build/publication checks, historical800-trace equivalence, and physical device/browser/pupil validation. Owner rulings and costs are recorded in the plan progress ledger. No deferred minor finding remains. Verdict: suitable for balance/map publication after completing the planned collection, verification and handoff.

Closing-version note: restore the source archive first. The negative harness now requires an unmodified dataset to pass before testing mutations, and accepts an explicit source root; a mismatched package version can no longer masquerade as six successful corruption checks.
