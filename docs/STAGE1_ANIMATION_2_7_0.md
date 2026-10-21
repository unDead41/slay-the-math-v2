# Stage 1 enemy animations — v2.7.0

Stage 1 normal and Elite encounters now play the supplied `NORMAL ELITE ENEMY.zip` v3 frame animations. The five actors share a fixed canvas registration so their feet and effects stay aligned with the arena during every pose.

| Encounter ID | Supplied actor | Encounter |
| --- | --- | --- |
| `wisp` | Ember Mirror | Normal |
| `beetle` | Prism Guard | Normal |
| `bat` | Rune Bat | Normal |
| `knight` | Mirror Knight | Elite |
| `shard` | Shard Beast | Elite |

All five actors use Idle, Attack, Defend, Skill and Damaged: 25 clips and 128 active frames. Idle loops at 6 fps; Attack and Damaged play once at 12 fps; Defend and Skill play once at 10 fps, then return to Idle. Enemy Block intents use Defend; existing burst intents use Skill. The source actors face left toward Alyssa.

## Rendering and scope

`dist/animation-data.js` owns the atlas paths and source frame rectangles. `dist/animation.js` owns frame timing and drawing. `dist/app.js` connects the player to existing encounter feedback. Combat damage, Block, draws, Energy, rewards, questions, saves and RNG remain owned by the engine; animation frames never resolve an action.

The 25 lossless WebP atlases total 20,193,594 bytes. They preserve the supplied 768 × 768 frames, alpha padding, 64 px sheet margins and spacing. There is no per-frame trimming or recentering. The importer verifies active alpha bounds and visible pixels against the source and records hashes in [import-audit.json](animations/stage1-v3/import-audit.json). The supplied provenance and manifests are retained beside that audit.

The player pauses behind dialogs and while the page is hidden, resumes without counting paused time, and shows a static supplied Idle frame when Game Motion is off or OS Reduced Motion is on. Late texture loads cannot replace a newer pose or a destroyed scene. An unavailable texture falls back to the existing image renderer.

Both bosses and later-stage encounters keep their existing models. Alyssa retains her existing artwork because `MODEL(1).zip` was unavailable in the workspace; the new Alyssa animation import requires that ZIP to be uploaded again. Her reaction to End Turn now follows actual resolved HP loss, including automatic artifact Block.

## Verification

- `npm run check`: passed.
- Full engine, DOM and animation suite: 119 passed, zero failed or skipped.
- Additional resolved-HP reaction DOM regression: 1 passed, zero failed.
- `npm run test:animation-browser`: six check groups passed for all five actors, with no browser errors.
- Actual rendered Idle and Damaged pixels change; Attack, Defend and Skill finish once and return to Idle. Saved engine state matches native engine results and does not change as animation time advances.
- Grounding, frame proportions and page overflow checked at 1920 × 1080, 3440 × 1440, 390 × 844 and 320 × 740. The three grounded actors remain on the arena floor; Rune Bat and Ember Mirror retain their intended floating offsets.
- `npm run build`: passed. The generated 102,712,584-byte portable HTML embeds all 25 atlases and renders them with zero HTTP requests. This generated file is not committed.

The machine-readable report is [stage1-animation-2-7-0.json](verification/stage1-animation-2-7-0.json). These results are local verification results, not a claim that hosted CI has passed.

## Run the update on Windows

In the existing project terminal:

```powershell
git pull --ff-only origin main
npm.cmd run build
npm.cmd start
```

If the server is already running, refresh the game with Ctrl+F5 after pulling and building.
