# Twin Sigil Guardian — Stage 1 boss animation

## Identity and facing
Nonhuman guardian in ivory/gold armor, black faceless helmet, cyan chest crystal, exactly two magical sigil rings (amber and cyan), floating gold diamonds. Combat art faces LEFT; Alyssa faces RIGHT. Keep flipX false. Defend moves the existing cyan ring forward; do not add a third ring or a separate handheld shield.

## Deliverables
30 transparent PNG frames, six unique key poses each for Idle, Attack, Defend, Skill, Damaged. Individual canvas 4096 × 4096. Export is upscaled from 1536 × 1024 generated sheets: canvas resolution is 4K; native painted detail is not 4K. Six key poses, no optical-flow or extra interpolated frames claimed. The 4POV design reference is included.

## Padding and atlas layout
All exported frames must retain ≥512 px transparent padding on top, left, right and bottom. One scale is used across all actions. Canvas reference anchor (2048,3072); actual per-frame anchors and explicit atlas rectangles are recorded in animation_manifest.json. Wide effects may shift inside the safe area. Do not auto-trim frame canvases.

4K sheets: 12800 × 8576, 3 columns × 2 rows, 4096px cells, margin 128px, spacing 128px. Runtime sheets: 3200 × 2144, 1024px cells, margin 32px, spacing 32px. Use runtime sheets for common game GPU limits; keep 4K PNGs as master exports. Do not slice either sheet with the wrong cell size or zero margin/spacing.

## Timing and event hooks
Use manifest durations. Idle loops; one-shot actions return to idle in the consuming game. Suggested visual hooks: Attack frame 2 attack_contact; Defend frame 2 guard_active; Skill frame 3 skill_release; Damaged frame 0 impact. These are animation hooks, not new gameplay stats or balance changes. PREVIEW.html deliberately repeats the selected action for review.

## Validation
Check alpha bounds, all 30 PNG sizes, six unique frame hashes per action, exact RGBA matches between each PNG and its atlas crop, and ZIP integrity. Visual inspection covers facing, adjacent-frame contamination and complete silhouette. Native source art can vary slightly between generated poses. No main-game integration was tested because this deliverable is a standalone asset package.
