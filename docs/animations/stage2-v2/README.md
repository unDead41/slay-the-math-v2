# Stage 2 Normal + Elite Enemy Animations — standardized v2.1

**v2.1 correction:** Chain Golem alone has been redrawn in a clear left-facing side profile for all five actions (27 frames). Use its authored PNGs with `flipX=false`; its chest, feet, weapon strike and chest pulse face screen left. All other enemy runtime files are unchanged. See CHAIN_GOLEM_LEFT_FIX.md.

One combined Slay the Math / Deck Tower pack: **3 Normal + 2 Elite**, **25 animations and 135 runtime frames**. All enemies face left. Normal enemy runtime PNG files are copied byte for byte from the accepted v1 ZIP. The two elites add 54 newly generated, normalized frames.

Extract the ZIP completely and open **OPEN_PREVIEW.html**. If delivery is split into Part ZIP files, extract **every part into the same destination**, keeping the shared top-level folder, then open the preview. Each part is a valid ZIP; these are not binary .z01 fragments. Both/all parts are required for the full pack.

## Roster and frames

| Enemy | Type | Roster ID | Idle | Attack | Defend | Skill | Damaged | Total |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Chain Weaver | normal | s2_chain_weaver | 6 | 6 | 6 | 6 | 3 | 27 |
| Deck Guard | normal | s2_deck_guard | 6 | 6 | 6 | 6 | 3 | 27 |
| Card Mimic | normal | s2_card_mimic | 6 | 6 | 6 | 6 | 3 | 27 |
| Chain Golem | elite | s2_chain_golem | 6 | 6 | 6 | 6 | 3 | 27 |
| Rune Reaper | elite | s2_rune_reaper | 6 | 6 | 6 | 6 | 3 | 27 |

## Shared Stage 1 / Stage 2 standard

- Frame **768×768**, PNG **RGBA8 / sRGB / straight alpha**.
- Sheet **2560×1728**, grid **3 columns × 2 rows**.
- Internal alpha-zero padding **at least 96 px on every side**, including VFX.
- Gap and outer sheet margin **64 px**, fully transparent. Unused cells are alpha zero.
- Fixed pivot **(0.5,0.5)**; no runtime trimming or bounding-box autoscale.
- Idle median longest silhouette edge **384±1 px**, measured at alpha ≥16. Species proportions are retained.
- FPS: **Idle 6 / Attack 12 / Defend 10 / Skill 10 / Damaged 12**.
- Six unique Idle poses. Attack/Defend/Skill share the same neutral at indices 0 and 5 for entry and exit.
- Damaged has **three distinct poses**: impact, recoil and settling. No repeated recovery frames.
- Idle loops; other actions play once, then return to Idle/current state.

## Import

Use **animation_manifest.json** as the single combined index. Each enemies/<id>/ folder also has the same-schema manifest with its own relative paths. Root paths are relative to the pack root.

Grid slicing: frameWidth 768, frameHeight 768, margin 64, spacing 64. For index i, x=64+(i%3)×832 and y=64+floor(i/3)×832. Only use active indices listed in the manifest; Damaged uses the first row only. JSON hash atlases are supplied for all 25 sheets.

Keep the roster IDs from the table when mapping assets into the game. Suggested Attack/Skill contact/release index **3**. Defend hold index **2**, resume **3**. Damaged contact index **0**. Trigger gameplay effects once per action, not once per visual frame.

Use the same display scale across Stage 1 and Stage 2, retaining the full frame and pivot. import_manifest.json provides five texture entries per enemy so only the encounter enemy needs to be loaded. The preview retains Idle plus the selected action textures.

## Elite identity

**Chain Golem** uses one short-chain wrecking ball in its right hand. The cyan and violet cores remain embedded in its chest. Defend braces its original cuffs and chest chains; Skill pulses left from the existing cores.

**Rune Reaper** develops the V2 Stage 2 elite proposal. Its four-view design is in designs/. It has two arms, one cyan sternum core, one violet helmet slit and one straight-shaft scythe in its right hand. Attack uses a short one-handed chop, Defend parries with the same weapon, and Skill channels a rune seal over its original free left palm.

## Contents and checks

enemies/: 25 sheets, 135 individual PNG frames, 25 atlases, five manifests.
previews/: five WebP action loops, five all-frame boards, scale comparisons and a combined MP4. STAGE2_NORMALS_ONLY.mp4 preserves the previous three-normal review video.
designs/: Rune Reaper 4 POV and supplied Chain Golem reference.
sources/: native action sheets, exact imagegen prompts, source roster and provenance.
SOR_STAGE2_ANIMATION.md, normalization.json, validation_report.json and SHA256SUMS.txt document the export.

Artwork uses the built-in imagegen tool. Accepted normal art is preserved; elite sprites use deterministic extraction, anatomical core/foot registration and premultiplied-alpha resampling. No optical-flow morphing is used.

Dimensions, alpha bounds, padding, atlas crops, path resolution, frame uniqueness, normal-source byte preservation, preview logic and ZIP integrity are checked. The combined MP4 is decoded for verification. Browser render, engine import, in-game combat timing and gameplay acceptance remain untested. This ZIP does not change game stats, AI, encounter lists or saved data.
