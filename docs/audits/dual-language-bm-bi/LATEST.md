# Whole-game language — main publication audit

24 October 2026, Asia/Kuala_Lumpur. Master SOR1.2.0 was read from current main before implementation/publication work. Ijamm now authorizes publication; the earlier local-only restriction is superseded. Repository: `unDead41/slay-the-math-v2`.

**Status: VALID within the publication scope.** Fresh targeted377/377, syntax/build, both240-state text matrices and all four native browser suites pass. Production manifest hashes and numeric/policy/art parity pass. Actual GitHub publication/read-back follows these checks.

## Sources and initial audit

- Publication base: main `ee65fa24a7f70157a946608277fa641652fe0057`, game2.42.0.
- Reviewed local language base: `45d2378302196d9b0b79af7b371e6f16d4f5768c`, game2.41.0, branch `dual-language-bm-bi`.
- Main is four commits ahead of that base and explicitly excludes the pending language work. The old remote language branch is not replayed.
- Master1.2.0, current AGENTS/governance/decisions, main documentation audit and current Balance/AI release/audit were read. The original language findings and evidence are preserved in [LOCAL_2_41_0.md](LOCAL_2_41_0.md).

The local update was checkpointed, advanced to current main and reapplied. Conflicts were generated HTML/manifest/release files and the appended decision history; generation and preservation of both histories resolve them. There are no competing gameplay-rule changes in these conflicts. Version2.43.0 identifies the integrated release. Current Balance/AI policy and numeric owners are preserved.

## Findings and risks

| Category / priority / confidence | Evidence, result and next action |
| --- | --- |
| Confirmed / P2 / high | Main2.42.0 does not contain the approved language work. Integrate it once; do not replay the obsolete catalogue-only branch. |
| Confirmed / P2 / high | Generated launchers/release/manifest require a shared2.43.0 rebuild; decision conflict must retain both histories. Resolved by source generation and scoped merge. |
| Confirmed / P2 / high | DOC001/DOC002 are stale topic/MC instructions in main AGENTS. Language changes already correct these to the active three Form4 topics and approved Alyssa, without changing runtime identity. |
| Potential / P1 / medium | Publishing against a moved main can overwrite newer work. Read main again before push; require a normal fast-forward and verify remote ref/tree/version afterward. No forced update. |
| Potential / P2 / high | Voices and words baked into original Tutorial screenshots stay English; Form1 readability is not a pupil study. Preserve those limitations and original media. |
| Potential / P2 / medium | Finite text/viewport tests cannot prove every future dynamic sentence/device. Preserve the bounded unmapped-copy audit and test new text with its owner. |
| Improvement implemented | One shared language preference, current-value descriptions, consistent retained keywords, source parity and reproducible language/native checks. No unrelated numerical retune. |

## Verification

Current results: [main-2-43-0/verification.json](main-2-43-0/verification.json). Source parity: [preservation.json](main-2-43-0/preservation.json). Seven functional runtime files match the earlier1037-test language snapshot exactly; the manifest regenerates for the release. Twenty-three numeric/source owners and all69 AI/balance policy files match current main; artwork/audio match current main. Existing recorded balance outcomes are not relabeled or claimed as new runs.

The publication checks focus on changed boundaries and direct consumers. The original full1037/1037 result remains historical, separate from fresh targeted results. Fresh text matrices/native language/Master/AI/production checks and hashes are recorded with the current inputs. Full-suite history is not presented as a new full2.43.0 run.

Source publish and Pages read-back follow successful verification. [Release](../../DUAL_LANGUAGE_MAIN_2_43_0.md). Keep live deployment separate from a successful local production build.
