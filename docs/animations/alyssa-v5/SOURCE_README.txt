ALYSSA / MOTION V5 — 5 ACTIONS, 15 FRAME SLOTS EACH

Idle, Attack, Kena Attack (damaged), Defend, Skill. 75 transparent PNGs.
Download the complete HTML and open it with Chrome/Edge; works offline.
All five animations are embedded. Before/After: Idle, Defend and Skill vs V4.
Keyboard 1–5 chooses action; Space pauses; arrows step; R restarts.

IDLE: One coherent eight-pose drawing set, exposed across 15 slots in a
palindrome. A single source scale is used for every pose. First and last
rasters are identical. Full blink: open/half/closed/half/open. Short blink
exposures and closer breathing timing replace V4's 220ms body exposures.
ATTACK: All 15 approved V4 PNGs are byte-identical. Six original key poses
and nine drawn in-betweens; original weapons remain in the same hands.
DAMAGED: Six original damaged poses plus nine drawn in-betweens. Original
key poses occupy slots 1,5,9,11,13,15. Original key-2 face landmark was
manually checked because automatic detection selected the sword glow.
DEFEND/SKILL: Same 15 approved poses and timing. Whole-raster scale is
normalized using a regularized anatomical head-unit estimate, anchored at
the common ground pivot. Strong pose changes and crouching remain.
This reduces broad model-size variation; small drawing/proportion changes
remain visible at high zoom. VFX bounds never determine per-frame zoom.

No rig, local warp, separated limb, optical flow, morph or frame synthesis.
Source drawings: built-in imagegen. Python only splits, registers, resamples
and packs complete sprites. All transforms and source rectangles recorded.
15 slots does not mean 15 unique raster drawings in Idle: it uses 8 unique
poses, repeated for a symmetrical exhale and reopening of the eyelids.

frames/: native export 1024x1024 RGBA, 75 files, one common pivot.
atlases/: lossless WebP, 640px cells, 5 columns x 3 rows, 16px gutters,
3296x1984px, below 4096px. Five main + three comparison atlases.
One fixed shared camera/view bounds across all five actions; no auto zoom.
sources/, prompts/, reference/: used art, generation prompts and key poses.
source_preserved/: approved V4 Defend/Skill before scaling.
manifest.json: source mappings, timing, atlas rectangles and transforms.
asset-validation.json, browser-validation.json: decoded asset / player checks.
contact-sheets/: all 15 slots for every action at identical view scale.
The MP4 repeats the exported poses at their recorded timing. Video 60Hz
does not mean 60 new sprite drawings per second. Preview visual only;
game logic, hitboxes and integration are not changed.
