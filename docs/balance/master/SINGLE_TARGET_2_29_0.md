# Single-enemy card correction — game 2.29.0

Ijamm requests converting AoE/random-enemy effects because every current encounter has one enemy, then rebalancing only the affected scope. The 40-card audit identifies two affected cards. All IDs, names and original illustrations remain the same.

| Card | Energy | Current ordinary and Master effect | Focus | Upgrade |
| --- | ---: | --- | --- | --- |
| Rune Sweep | 2 | One hit for 12 damage on the enemy | +4 damage | +3 damage |
| Fate Storm | 2 | Three hits: 5 + 5 + 5 on the same enemy | +4 on first hit only | +3 on first hit only |

Strength applies once to either card. Defense, Block, Weak, Vulnerable and boss seals still resolve normally per hit. The sequence stops if the enemy dies. New attacks do not choose phantom/random targets or consume target-selection RNG. English/BM card bodies, notes, calculation previews and Focus guidance describe the actual effects.

The previous Master numbers were already suitable for this single-enemy baseline; they are retained. Ordinary-mode Rune Sweep changes from 6 to 12 damage and Fate Storm from 9 total to 15, with the same first-hit-only allocation as Master. Unused Rune Sweep AoE damage is removed rather than added to its one hit. A single build adapter reads these existing numeric patches from the v1.2 spec for both builds, preserving the supplier files as historical input.

These cards have different uses: without other modifiers, zero Defense gives Rune Sweep 12 versus Fate Storm 15 damage. At 2 Defense, Rune Sweep gives 10 versus Fate Storm 9 because Defense applies to each hit. Both use one card and two Energy. This preserves a meaningful one-hit/multi-hit choice without increasing the entire card pool's power.

## Preserved scope and saves

The other 38 definitions compare exactly with their preceding ordinary/Master definitions. All Master enemy definitions, difficulty profiles and 31 artifacts also compare exactly. Economy prices/support weights, map topology, original art/audio/motion and the 120-question bank are unchanged.

New receipts identify `single-enemy-1`. Old ordinary-mode receipts use the original two definitions for validation, keeping their recorded HP, RNG and resolved results; later plays use the corrected cards. A captured actual 2.27.0 fixture with eight normal/Focus/upgraded receipts remains loadable, including after appending a new receipt. Restore does not replay old damage.

Master advances to `master-1.3.0-candidate.3`, definition hash `960d9b1a52ebf89d00dfa29b47ea9b359b5779859c5ae905148104afce2f2f02`. Start a new Easy/Medium/Hard playtest run for this binding. Candidate.2 browser data remains untouched under its earlier save key; it is not silently treated as candidate.3.

## Bounded balance evidence

Matched before/after screen: 171 cases and 504 encounters per phase, **1,008 encounters total**. Ordinary mode covers both changed cards and Rune Strike control; Medium Master adds three selected pairs and one triad. Three seeds per cell, normal/upgraded variants, Wisp/armored Golem/sealed Dealer and synthetic developing Predict. Zero invalid/censored cases; all Rune Strike self-replacement controls have zero effect. [Tables and interpretation](SINGLE_TARGET_MEASUREMENTS.md), [raw comparison CSV](../../../reports/master-balance/single-target/comparison.csv), [integrity record](../../../reports/master-balance/single-target/integrity.json).

The screen preserves individual replacement utility and factorial interaction rather than inventing universal CP. Removing Fate Storm's target rolls changes subsequent shuffle/action trajectories. Large changes in three-seed utility often reflect one changed win/loss; they do not establish an exploit or justify blanket nerfs.

Actual campaign regression adds 36 attempts across all three difficulties, feedback/low Predict and recovery/reward routes, using seeds 20–22. Every attempt terminates in a real victory or defeat; zero invalid/censored. Values remain candidates for playtesting. Pupil 90%/70%/50% targets, exhaustive combinations and real-device testing remain unmeasured. Earlier candidate.2 and specialist reports retain their original sources.

## Actual verification

- New regression tests first demonstrated the old target, RNG and damage behavior; all 12 pass after implementation.
- Targeted card/Master/UI regressions: 134 passed. Three old whole-source-equality assertions were updated to preserve identities/assets and all 38 unaffected definitions; their 27-test group passed.
- Complete `npm test`: **719 passed**, zero failures/skipped/cancelled. After the final Focus tooltip wording change, all 23 Master/card/UI regressions and syntax checks passed again.
- `npm run build:prod`: passed; player output generated, pre-integration offline build 295,623,573 bytes. Numeric-source consolidation subsequently reproduced both tested card-data files byte-for-byte.
- Chromium: Easy/Medium/Hard each passed real menu, gift question, route/battle, Predict, reload, valid save and decoded-image checks. Production ordinary/Medium fixtures actually played focused Rune Sweep for 16 damage and Fate Storm for 5+5+5, preserved target RNG and retained results after reload. Zero page/resource errors.
- Exact phase task/raw identities, source/raw SHA-256, per-trial provenance, full factorial masks, terminal/valid states and campaign engine hashes verified by `tools/balance/master/single-target-report.cjs`.

The initial screen exposed an imported worker registering a second handler; that attempt was excluded and the complete measured before/after cohorts were rerun with exact task gates. The production UI fixture initially reset its own save during reload; its setup now seeds storage only once and the rerun passed. Neither failed attempt is presented as balance evidence.

[Full suite log](validation/single-target-suite.log) and [release command summaries](validation/single-target.log) preserve actual output. Existing `npm run test:balance-master` includes the new regressions. To verify archived measurements, run `node tools/balance/master/single-target-report.cjs`; intentional new cohorts require separate output identities, and existing measured files refuse overwrite.

The final release incorporates main `544ef43` (Alyssa status VFX, game 2.28.0) and its `b848f55` Pages setup, on top of the earlier gameplay base `e2c323a`. Version 2.29.0 avoids colliding with that concurrently published 2.28.0 release. The VFX modules and all hooks were preserved exactly; the two intended Focus wording corrections remain. Resolver/definition hashes still match the measured cohort exactly, so the same power/campaign evidence applies.

Final combined verification: **727/727 npm tests passed**, zero failed/skipped/cancelled; syntax, production actual-card browser, three-profile browser, and the upstream status-VFX browser suite all passed. The latter includes desktop/phone/landscape, exact gameplay comparisons, all three Master profiles and the actual standalone offline file with no external requests. Final offline output: 295,637,186 bytes. [Combined check record](validation/single-target-integrated.json). This preserves both other chats' work. Repository publication and live Pages deployment remain separate; the preceding account restriction is documented in [Pages setup](../../GITHUB_PAGES.md).
