# Single-enemy correction — 23 October 2026

Ijamm explicitly requests converting AoE/random-enemy card effects to the single enemy actually present and rebalancing only the affected scope. This continues the published Master work, based on main `e2c323a` / 2.27.0.

Implementation choices: keep all 40 IDs, names and original artwork; retain multi-hit attacks on the same enemy. Audit found two affected definitions: Rune Sweep and Fate Storm. Rune Sweep becomes one 12-damage hit for 2 Energy; Fate Storm becomes three 5-damage hits for 2 Energy, with Strength, upgrade and +4 Focus on the first hit only. These reuse existing Master values; ordinary modes receive the same correction for these two cards. Rune Sweep upgrades by +3; Fate Storm upgrades its first hit by +3. Each hit still uses ordinary Defense, Block, Weak, Vulnerable and boss seals.

One build-time adapter owns target/text changes in both languages. Canonical supplier files remain an archived input; generated runtime and current previews use the adapter. Remove phantom targets and target-selection RNG consumption. Current receipts identify the definition used; actual old ordinary-mode receipts must still load and retain their recorded HP/RNG. Master advances its candidate identity rather than silently accepting the preceding candidate save under new rules.

Checks: demonstrate the failed single-target/RNG behavior before implementation; test normal/Focus/upgraded forms, mitigation, lethal stopping, duplicate play, reload and historical receipts. Capture a bounded before/after power cohort with source snapshots, matched seeds, control cards and selected factorial combinations. Run a small actual campaign cohort on all three profiles, full regression suite, syntax, production build and browser checks. Preserve preceding evidence under its original identity. Pupil 90/70/50 targets remain unmeasured.

Do not retune the other 38 cards, enemy profiles, prices, loot weights, routes or questions unless these checks identify a related regression. Publish the completed correction through the existing main release workflow after verification.
