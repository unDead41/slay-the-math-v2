# Alyssa right-facing renderer — 2.8.1

The 2.8.0 canvas used the supplied right-facing animation, but `DCVisuals.hero` still selected `ground-alyssa-*` images for the underlying image renderer. Every render and action could therefore display the older pose while a texture loaded, after a texture failure, or without Canvas support. A new DOM regression reproduced the old standing image before the fix.

## Correction

One registry, `DCAnimationData.hero.posters`, now owns all five image paths. Idle/standing, Attack, Defend, Skill and Damaged/damage resolve to `alyssa-right-*` images mechanically projected from frame 0 of the corresponding verified MODEL.zip animation. Their canvas, scale and boot pivot match the animated renderer. No old pose is selected during image loading or when Canvas/atlas loading is unavailable.

The old fallback scale override and old CSS hero pose animations are removed. Motion Off and OS Reduced Motion select the new right-facing Idle image. Combat resolution, RNG, saved runs and enemy rendering are unchanged.

The original five animation sheets and their 30 source frames are unchanged. Poster provenance, projection, dimensions and hashes are appended to `animations/alyssa-v2/import-audit.json`. Reproduce just the posters with `python3 tools/import-alyssa-animations.py MODEL.zip --posters-only`; the complete importer also generates them.

The portable builder includes all five new posters and omits the five retired `ground-alyssa-*` combat images. Regenerate `MAIN-SEKARANG.html` with `npm run build` after pulling this update. The source checkout's generated HTML is not distributed as part of this patch.

## Verification

Actual results are recorded in `verification/alyssa-right-only-2-8-1.json`. Regression coverage checks all five visible image poses with Canvas absent, right-facing Idle with Motion Off, normal animated combat, both stages/bosses, forced atlas request failures, no legacy hero requests, phone/UWHD/4K layouts and the freshly generated offline build. The new unit regression failed on 2.8.0's old image path before the correction.
