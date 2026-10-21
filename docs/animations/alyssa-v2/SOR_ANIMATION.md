# Alyssa animation v2 — RIGHT

Alyssa faces RIGHT; enemies must face LEFT. Keep flipX false.

## Assets
30 individual transparent PNG frames at 4096 × 4096, 6 key poses for each of Idle, Attack, Defend, Skill and Damaged. 4K is the export canvas resolution: source detail is upscaled from generated 1536 × 1024 sheets. It is not native 4K detail. No optical-flow in-between frames are claimed.

## Safe packing
Each frame has ≥512 px transparent space on all four sides. Canvas reference anchor (2048,3072); actual boot anchors are recorded per frame because wide attacks are shifted inside the safe area. Frames are extracted by figure ownership from the source alpha, rather than fixed grid crops that capture adjacent sprites. Preserve complete cells, including padding, when importing. Do not auto-trim or use content bounds as frame dimensions.

4K atlas: 12800 × 8576; 3 columns × 2 rows; frame 4096 × 4096; margin 128; spacing 128. Runtime atlas: 3200 × 2144; frame 1024 × 1024; margin 32; spacing 32. Do not import the 4K atlas as 512 px cells. Large 4K atlases may exceed a GPU texture limit: use runtime sheets or individual frames in that case.

## Timing
Use animation_manifest.json durations. Idle loops; other animations return to idle after the final pose. PREVIEW.html repeats selected actions for inspection.

## Validation and limits
All 30 exported frames checked for transparent bounds ≥512 px, consistent dimensions and matching sheet/individual pixels. See validation_report.json. A contact sheet and 15-second video are included for visual review. Standalone asset preview only; no integration into the main game source was tested.
