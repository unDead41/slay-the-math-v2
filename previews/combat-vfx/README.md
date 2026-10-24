# Combat VFX preview V10

Standalone review of Shield, ten Passive ornaments, body buffs/debuffs and player/enemy comparison. This directory does not install these effects in the production game.

Open `index.html` directly in Chrome or Edge. Open `passive-catalog.html` to compare all ten motifs at the same layer/size, including Full/Low and grayscale. Both files work offline. On GitHub, download the HTML before opening it; GitHub's source viewer does not run it.

The main preview starts with Blazing Spirit, Growing Flame and Last Ember in top view. Toggle back to Alyssa's feet, change the trigger order, or use Main 10 Passive to review each animation. The demo's values and enemy Passive view are visual examples, not new gameplay rules.

| Passive | Primary ornament |
| --- | --- |
| Blazing Spirit | Flaming swords with crossguards |
| Growing Flame | Six-petal radial fireflowers |
| Swift Step | Crescent comets and long trails |
| Battle Rhythm | Traveling equalizer bars |
| Rune Armor | Pointed V shield plates |
| Lasting Shield | Padlocks with U shackles |
| Grimoire Ward | Rolled rune talismans |
| Ember Core | Toothed turbines with inner rotors |
| Clear Mind | Open books and turning pages |
| Last Ember | Cracked hearts and a double heartbeat |

The shared circle, activation-ordered layers and Passive-only floor policy remain. V9 particle lanes, status barriers, Shield V3 and original artwork/icon bytes are retained in this preview snapshot. The current production game and its language/balance/icon owners remain unchanged.

## Editing and verification

Edit the five JavaScript modules and four CSS files beside this README. `index.html` is also the tracked offline artwork/markup shell: keep its first asset-data script, embedded art and base stylesheet when editing the layout. The rebuild replaces only the named VFX/controller scripts and the second stylesheet, then regenerates the gallery. It needs Python 3; contract checks need Node.js. No npm packages or installation are required.

From the repository root:

```sh
python3 previews/combat-vfx/rebuild.py --check
node previews/combat-vfx/verify.cjs
```

After changing a source module, run `python3 previews/combat-vfx/rebuild.py` before checking again. On Windows, use `py` if `python3` is not available. Generated QA pages/reports stay in the ignored local `dist/` folder.

The checks cover periodic geometry, all sixty identity/layer/quality variants, the shared base, trigger-order interruption/removal, finite geometry, source/asset preservation and inline-script validity. Historical native Canvas and visual evidence for this exact HTML is in the [branch audit](../../docs/audits/combat-animation/LATEST.md).

Ijamm subsequently authorizes publishing this completed preview from `combat-animation` to main on 25 October 2026. The earlier branch-only boundary is historical. Production combat integration and physical-device FPS validation remain separate; no game runtime or release-version change is included. MODEL.zip was unavailable and was not used.
