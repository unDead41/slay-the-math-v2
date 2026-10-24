# Card effects revision

Ijamm approved all proposals in the preceding 40-card audit on 24 October 2026 and explicitly requested implementation and publication to a new feature branch only. Base: main 264a60e (2.32.0). No further approval gate is needed.

## Behavior

- Vulnerable increases all Attack hits by 50% for the remaining affected attack phase; stacks are duration, capped at three phases. Weak reduces all Attack hits by 25% for its affected attack phase. Combine modifiers before one floor operation, then Defense, boss seals and Block. Neither modifies direct HP damage. Reapplication extends duration, not magnitude.
- Enemy Vulnerable and player Weak tick after the player phase; enemy Weak and player Vulnerable tick after the enemy phase. No per-hit consumption under the new rules.
- Last Ember carries only its unspent emergency Block through the next player reset, once. Existing retention caps combine by maximum, never addition. Spent Block is never recreated; resolved carry survives Passive replacement.
- Growing Flame and Battle Rhythm cost 1 Energy, trigger every three relevant cards, cap +4; upgraded cadence two, cap +5. Upgraded cost remains 1.
- Ordinary Mana Reading: 1 Energy, Draw 2 now and 1 next turn, Exhaust; upgrade adds one delayed draw. Deep Study: 1 Energy, Draw 3, Exhaust. Burning Page: 0 Energy, Exhaust, with Master replacement/Focus values. Rune Armor and Clear Mind use the Master cost/activation-upgrade model.
- Card Search still pays for its bounded category search; failure draws one ordinary fallback card, respecting Hand capacity, deck exhaustion and genuine reshuffle RNG.
- Master Twin Shot is 4+3, with Strength/Focus/upgrade on the first hit only. Ordinary Twin Shot retains its original Strength allocation.
- Cinder Guard is 4 Block plus one Weak phase, initially; Focus +3, upgrade +2. This offsets the stronger whole-phase Weak.

## Compatibility and presentation

One versioned build adapter owns the approved new card values for ordinary/Master; archived supplier data and old measurements remain unchanged. Ordinary runs carry an explicit rule version. Unmarked existing runs resolve and validate using the archived prior definitions, including pending choices, old receipts, statuses and upgrades; no HP, RNG or choices are replayed. Master advances its version/save identity. IDs, original art, motion, audio, enemies, economy, map and questions remain intact. BM/English card bodies, glossary, previews, badges and tutorial descriptions match actual timing and numbers.

## Alternatives considered

The audit compared flat per-hit effects with percentage effects. The approved approach uses fixed percentage plus duration, giving setup cards a meaningful combo role. Percentage-per-stack potency was rejected because repeated cheap cards would multiply burst too strongly. Silently reinterpreting old receipts was rejected in favor of per-run definition binding.

## Verification

Real-engine tests cover percentage math/multi-hit/duration/mitigation, capped extension, emergency Block partially spent and swapped, search failure and exhaustion, growth caps/upgrades, all changed cards, save/reload and archived ordinary saves. Run the complete suite, syntax/build, bounded balance probes and browser ordinary/Master/reload checks. Numerical tuning remains a playtest candidate, not measured pupil win rates.
