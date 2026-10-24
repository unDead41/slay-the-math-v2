# Combat animation polish — main 2.32.0

Main baseline: `6dc3ce366d266c33154f9b2e76afeb3bba224eca` (2.31.0). Integrated feature: `b422a184b000f1042d378251e24a5d0d34415225` from combat-animation. Ijamm explicitly authorizes pushing this completed update to main on 24 October 2026, superseding the previous branch-only boundary.

## Result

- Important status changes take precedence; crowded changes retain a bounded combined summary. An exactly explained Passive/stat gain uses one named callout.
- Distinct aura zones, clearer absorption/depletion/expiry, and ten Passive signatures retain the original card/artifact/status/menu artwork and actor registration.
- Card/Passive/status feedback and one primary synthesized SFX share cancelable presentation timing. Settings offers Combat Effects: Low / Full; Motion Off and OS reduction keep their existing visual override and separate SFX control.
- Package version, Settings and resource cache hashes advance together to 2.32.0. The illustrated tutorial, original animation registry, Master profiles, maths, question sampling, gameplay RNG and saved run schema retain their existing owners.

The five feature presentation sources are byte-identical to the published branch. This integration adds version/cache metadata, main authorization, documentation and version assertions in native browser QA. [Detailed behaviour](COMBAT_MOTION_POLISH_LOCAL.md). No new uploaded model or MP3 is imported.

## Actual verification

**PASS:** 172 focused Node/jsdom tests, zero failures/skips: card mechanics/physical transfers, all Passive receipts/swaps, status planning/lifecycle/SFX, compact combat UI, tutorial isolation and versioned entrypoints.

**PASS:** native Chromium QA on the final 2.32.0 source. All ten actual Passive trigger paths, exact gameplay/save comparisons, six viewport/quality combinations (1920×1080, 390×844, 844×390; Low/Full), seven concurrent auras, wrapped summary containment above HP, native setting persistence, shield hit/depletion/expiry, confirmed swaps, cancellation and Motion Off/OS-reduction SFX. Runtime metadata and Settings both identify 2.32.0. The report explicitly names missing original assets; it does not claim full atlas playback.

**PASS:** syntax for eight feature/release JS files, whitespace validation, feature-byte comparison against b422a18 and zero game-asset changes. Actual evidence: [main verification](verification/combat-main-2-32-0.json) and [browser report](verification/combat-main-2-32-0-browser.json).

## Limits

The recovered local checkout is incomplete. Native browser checks use the unchanged right-facing poster fallback because original large atlases/focus frames and a few baseline icons are unavailable locally. Those assets remain in the repository tree; this update does not remove or replace them. Full `npm run build:prod`/standalone offline packaging is **BLOCKED / NOT EXECUTED** in this checkout, not a verified successful build. No physical-phone performance measurement, human SFX audition, Windows installation check or hosted Pages result is claimed.

MODEL.zip failed attachment materialization and was not read/applied. Existing source animation sheets and frame timing stay unchanged. Prior complete-build evidence belongs to its original source/version and is not represented as fresh 2.32.0 validation.

The previous stable source is main 6dc3ce3. A rollback of the complete polish must revert both the 2.32.0 release metadata commit and feature b422a18; reverting only release metadata leaves feature behaviour active.
