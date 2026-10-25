# Fresh whole-branch review and one fix pass

Reviewer: fresh gpt-6-astra/high, read-only, no subagents. Base6c49f3980c3a832635d4d01a6c50a8df98ac4aad through c329fe7769ce94f88efa4c6e9491cec25c89e634. No Critical findings. The reviewer ran24 new tests and the independent Python verifier, checked recorded source hashes and found the current calibration intact. Public choice/cached-projection legality and observation boundaries were preserved.

## Important findings accepted

1. `experience-data.cjs` replaced executed provenance difficulty with a row label, allowing Easy Weak Point outcomes to fit a Hard profile. Fix: preserve executed difficulty; reject disagreement with row and declared report scope before normalization.
2. Empty reports and absent complete seed/skill groups could disappear because masks were only checked inside existing groups. Fix: verify the full declared difficulty/skill/seed/mask total, require a predeclared cohort schedule for CLI export, and preserve/check expected IDs and planned counts in new Combat manifests. Keep older immutable bundles explicitly legacy-compatible.

Three real-engine regressions failed first with “Missing expected exception”: cross-difficulty labels, empty/missing groups, and a missing whole report before export/after storage. All13 data tests then passed. Every retained raw cohort (672 reports/1464 outcomes) passes the strict importer against its schedule; the revalidated528-report training bundle refits to the **identical** model ID and entries. No seed, fitting parameter, label or model byte changes. CLI export→validate→train also returns the same model. The full post-fix suite passes1107/1107; refreshed syntax, actual AI browser/source identity, protected-source/artifact and player/production endpoint checks also pass. Exact results are in verification.json. There is no re-review.

## Deferred minors

- Generic Map/Economy envelope validation can accept missing kind/policy or an empty outcome object. Current fitter does not consume these domains; future specialist adapters should enforce useful domain fields and nullable measurements.
- Reader verifies summary.json bytes/hash and recomputes counts against manifest.summary, but does not compare summary.json semantic counts. A custom producer can retain a contradictory human summary; model fitting still uses validated observations and manifest counts.

## Rulings on every behavior the reviewer set aside

1. General optimality, pupil outcomes and untested combinations stay unverified; the measured Hard holdout regression remains disclosed. The user receives bounded developer improvements rather than a universal improvement claim. Cost if wrong: synthetic evidence may generalize poorly.
2. Author-executed full Node/browser/build evidence is the broad verification; the read-only reviewer inspected it instead of rerunning artifact-producing checks. Cost if wrong: environment-specific gaps may remain.
3. Projection/timing results apply to the fixed local benchmark. Cost if wrong: another workload/device may see a smaller or absent speed gain.
4. Remote ref/publication checks are the author's final expected-head/readback responsibility. Cost if wrong: later remote changes could make the checked branch stale.
5. Unchanged production mechanics, Ordinary Spool, human recovery tuning and historical specialist issues retain their owners. Changed-file/source boundaries are verified without claiming a new whole-game audit. Cost if wrong: existing out-of-scope defects remain.
