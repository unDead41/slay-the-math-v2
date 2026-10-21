# Alyssa animation — v2.8.0

Ijamm requested reading the existing project source `MODEL.zip` to finish Alyssa's motion. The readable source is the 253,699,295-byte v2 archive in the Slay the Math sources. This resolves the prior failed attachment deliveries; those unavailable uploads were not read or assumed equivalent.

## Assets and registration

Five clips, six key poses each: Idle, Attack, Defend, Skill and Damaged. Alyssa faces right without mirroring, in both stages and all battle encounter types. The supplied 3200×2144 runtime sheets retain complete 1024×1024 cells, 32px margins and 32px gaps. Lossless WebP derivatives total 9,023,160 bytes.

Source durations are preserved, including unequal windup, impact and recovery holds. Only Idle loops; other clips return to Idle after their final hold. Per-frame boot pivots are divided by four for the runtime sheets, then registered to the existing (800,1100) floor with one scale of 1.08. Hero presentation scale is 1.7, with a phone width cap for wide poses. All 30 alpha bounds fit the 1600×1200 drawing canvas. Alpha and visible pixels match the runtime PNGs over black and white backgrounds.

The original 4096×4096 exports are already upscaled from generated 1536×1024 source sheets. This update uses the supplied runtime sheets and adds no generated poses, interpolation or native 4K detail. The original archive and earlier static fallback artwork remain untouched.

Exact source/runtime hashes, dimensions and bounds: `animations/alyssa-v2/import-audit.json`. The source manifest, SOR, README and generation notes are retained beside it. `tools/import-alyssa-animations.py` reproduces the import; the Stage 1 importer preserves the separate hero registry if rerun.

## Runtime behavior

The atlas player supports variable frame holds and per-frame pivots while retaining its original FPS path for enemies. Hero and enemy have independent players. Four cached sheets cover both Idle textures plus current action textures; stale loads cannot override newer reactions.

Card resolution triggers Attack, Defend or Skill. Actual HP loss after automatic artifact Block selects Damaged; a fully blocked hit selects Defend. Canvas animation never resolves combat, awards artifacts, consumes RNG or changes questions/save state.

Dialogs and hidden pages pause both players. Motion Off and OS Reduced Motion show supplied Idle frame 0. Scene replacement destroys old players. Failed textures retain the static fallback. The portable build embeds all five derivatives through the existing resolver.

## Verification

Actual release results and limitations: `verification/alyssa-animation-2-8-0.json`. The focused browser suite covers all five motions, return to Idle, exact engine/save equality, both stages, bosses, refresh, dialog/reduced-motion policies, FHD/UWHD/4K/phone floor registration and offline play. The existing Stage 1 browser suite checks enemy regressions.

Windows installation commands are not executed on a Windows host here. Local browser checks do not establish hardware performance on the user's PC.
