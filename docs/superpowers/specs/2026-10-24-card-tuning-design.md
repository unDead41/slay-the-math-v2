# Approved card-tuning follow-up

Ijamm approves updating the assistant branch after the 40-card audit. Publish only `balance/card-effects-20261024`; main starts at `6376a222169815af582cf55aa4794f3c809a3515` / 2.37.0 and must not be written. The old feature head `a9c49f03f5e60dc0309f90931469361e6febedee` is already an ancestor of main, so the refreshed branch may fast-forward from that head through current main.

## Result

- Last Page: 1 Energy, Draw 2 plus 1 if Hand is empty after play, in ordinary and Master. Focus and upgrade still add one main draw each; the 3/4/4/5 empty-Hand ceilings stay unchanged.
- Recall: 0 Energy in both modes, real selected Discard return and Exhaust unchanged. Focus/upgrade extra draw, capacity, UID conservation, single payment and no-Discard rejection remain intact.
- Ordinary Mana Barrier: 7 Block per remaining Energy, minimum X=1. Its existing flat Focus +3 and upgrade +3 stay intact. Master is already 7X with its existing Focus formula/upgrade; preserve it.
- Compute AI card-choice decisions outside actual-action capture. Capture only `chooseCardOption`, matching the working campaign pattern; actual metrics must agree with real enemy-turn log absorption.
- Growing Flame/Battle Rhythm and all other balance owners retain their existing values.

## Compatibility and owners

New ordinary runs use `card-effects-2`. Preserve original unmarked ordinary saves and `card-effects-1` runs, including receipt values, pending Recall charging its original 1 Energy on confirmation, already-paid Read Ahead choices, previews/notes, newly generated Shop prices, Retry and RNG. Freeze the v1 adapter/settings and generate a v1 archive from the same pre-effects input. Select data and config metadata by the run's version with synchronous reentrant binding. Unknown versions remain rejected. Never replay a resolved action or mutate stored HP/RNG to adopt new rules.

Master uses a distinct candidate.5 identity/save key; prior candidate.4 storage remains untouched. Feature release: `2.38.0-card-tuning.1`. English/BM rich text and notes use the active definitions. Ordinary new Recall Shop prices follow the existing Energy-cost bands; do not change pricing policy or old opened stock. Existing artwork, icons, motion, audio, education/question attempts, map and profile numbers are preserved.

## Approach

The accepted audit specifies the exact changes. A versioned adapter plus archived binding fits the existing architecture. In-place conversion would invalidate receipts and change paid costs; a second independent resolver would duplicate rules. Use the existing resolver and select the correct archived definitions instead. Implement inline in the existing isolated worktree, with TDD and one independent final review. This is the concrete design behind the already approved audit, not a new permission gate.

## Verification

Observe missing behavior RED, then GREEN. Exercise real plays at zero/remaining Energy, empty/nonempty/full Hand, Focus/upgrades, Exhaust and real choices. Freeze synthetic v1 saves before editing production code; test restore and explanation/Shop behavior across all three ordinary generations. Compare telemetry with actual logs across choice cards. Run the complete suite, syntax, production build and native player/AI browser checks. Compare seeded before/after outcomes using identical policies, and preserve measured context: these values remain playtest candidates, not pupil win rates. Record initial/final audit and verified remote SHA in the handoff.
