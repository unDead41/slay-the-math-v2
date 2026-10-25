# Alyssa V5 motion — game 2.45.0

Ijamm approved the complete V5 HTML review and explicitly requested applying it
to the game and pushing directly to main on 25 October 2026 (Malaysia).

## Approved source and runtime

Source: `ALYSSA_15_Frame_Sprites_v5.zip`, 95,875,418 bytes,
SHA-256 `4d6d7b3d8b6711679e9dc060e62be351a889459ffbda38e7c06a9c945a8b2302`.
The separate failed MODEL.zip attachment was not read or substituted.

| Clip | Exposures | Playback |
| --- | --- | --- |
| Idle | 15 slots, eight unique drawings | Reversed breathing poses, short blink, identical first/last rasters; loops. |
| Attack | 15 | Exactly the approved V5 atlas, retaining the approved extended Attack. |
| Damaged / Kena Attack | 15 | Impact, recoil and recovery; six original keys plus nine drawn in-betweens. |
| Defend | 15 | Approved pose order and baked model-size adjustment. |
| Skill | 15 | Approved pose order and baked model-size adjustment. |

All five atlases are copied byte-for-byte into their existing runtime paths.
No rig, separate limbs, local deformation, tweened images or new drawing is
introduced during integration. Alyssa remains `mc_01`, right-facing without a
flip, in both stages. Enemy and boss registries and their source images remain
unchanged.

Runtime sheets are 3296×1984 lossless WebP, containing 640px cells with 16px
gutters. The source pack exports 1024px PNG canvases; these are not native 4K
drawings. All 75 native frame hashes, runtime alpha padding and canvas bounds
are verified during import. The complete PNG/artwork package remains outside
the game payload; source metadata and contact sheets are kept in
`animations/alyssa-v5/`.

## One registration for every pose

The V5 pivot is the rear boot. The HTML's shadow uses rear boot +60 native px;
the same fixed two-foot centre is registered to the game's existing floor.
`drawScale = 1.08 / (640/1024)` preserves physical source units when using the
smaller atlas cells. All 75 poses use this one scale and pivot. The earlier
six-frame Skill `scales` array is retired because V5 already contains its
approved normalization. Applying it again would distort the accepted motion.

The existing compact UI raises the ground line to leave room for status labels.
The largest overhead Attack initially clipped above the arena. A common CSS
height cap now derives from the actual `--ground-y`, not a duplicated floor
inset. It reserves the top rail and uses the highest pose across the whole set.
The cap applies proportionally to all actors and changes only with layout,
never with the current action/frame. Floor pivots and canvas aspect ratios stay
fixed. The 0.92 coefficient is below `1200/(1.7*maximum hero rise)` for this
approved set; viewport checks protect the complete pose bounds.

Five same-registration posters are generated from frame 0 of these exact
atlases for loading, unavailable Canvas, texture failure and Motion Off. No
retired front-facing model is reintroduced. The measured Idle poster height is
owned by the hero registry; existing VFX read it so shield/status geometry does
not retain an obsolete model measurement. Other actors retain their existing
measurements and all VFX painters/lifecycles remain under their current owner.

## Gameplay and resources

Only Idle loops; other clips return to Idle after their recorded final hold.
Native card/HP/Block outcomes still select the motion. Animation never resolves
damage, pays Energy, consumes RNG, changes card zones or writes game outcomes.
Dialog, visibility and reduced-motion behavior remain with the existing player.
The persistent actor controllers and 96 MiB texture budget are retained.

The five compressed atlases total 10,902,106 bytes. Each decoded sheet accounts
for 26,157,056 RGBA bytes, compared with 27,443,200 for the previous sheet size.
These are texture-accounting estimates, not browser/GPU memory or device FPS.
Regenerated resource hashes, release URLs, portable output and production output
use the same assets. Tutorial images are captured from the updated actual UI.

## Reproduce and verify

```sh
python3 tools/import-alyssa-v5.py /path/to/ALYSSA_15_Frame_Sprites_v5.zip
npm run build:prod
npm run test:alyssa-browser
```

The importer requires Pillow, as do the existing Python art importers. The
browser suite requires Playwright and a configured Chromium installation;
`BROWSER_QA_MODULE` and `QA_CHROMIUM_EXECUTABLE` can point to the installed tools.
See the [scoped audit](audits/alyssa-motion/LATEST.md) for exact checks, results,
initial findings, publication evidence and limits. Physical-device performance
and residual source drawing/proportion changes are not certified by automation.

To return to the previous release, revert the integration commit and rebuild;
no save-schema migration is involved.
