# Dungeon Edition 2.3 — menu scenes and grounded combat

Ijamm's current request is to use the attached Finalize Design(2).zip assets,
match the five attached Alyssa main-menu illustrations, and make combat actors
visibly stand on the arena floor.

The five main-menu scenes are Dungeon Corridor, By the Campfire, Rune Archive,
A Path Ahead and The Dungeon Door. They use clean-plate derivatives of the
supplied artwork, with a separate live title and five native menu controls.
The original uploaded files are unchanged. Scene buttons along the bottom work
with touch and keyboard. With Motion On, scenery changes every 14 seconds after
the next image has decoded. Motion Off, OS reduced motion, a hidden tab, an open
dialog or hovering/focusing the main controls pauses automatic changes. Failed
image loading leaves the current art and menu usable.

The original flooring bug came from independently sized spaces: the arena
background covered the document while the character used the battle panel.
Changing page height moved the background's wall/floor boundary without moving
the character. Independent transparent padding also changed visible foot height
between poses. In 2.3, the background belongs to the same battle theatre as the
actors and contact shadows. Bottom-aligned cover preserves image proportions and
the floor; Normal, Elite and Boss rooms each choose their own supplied image in
both stages. Every runtime sprite uses a 1600×1200 transparent canvas, with its
foot pivot at (800,1100). The anchor transform places that pivot at the theatre
ground line. HP labels occupy a separate region below it. On phones, wide enemy
canvas widths are capped proportionally so shields and wings remain visible.

| Stable ID | Source identity | Supplied poses used |
|---|---|---|
| wisp | Ember Mirror | Standing, Attack, Defend, Skill, Damaged |
| beetle | Prism Guard | Standing, Attack, Defend, Skill, Damaged |
| bat | Rune Bat | Standing, Attack, Defend, Skill, Damaged |
| knight | Mirror Knight | Standing, Attack, Defend, Skill, Damaged |
| shard | Polished Shard Beast; gameplay name remains Shard Beast | Standing, Attack, Defend, Skill, Damaged |
| Remaining enemies and bosses | Existing source models | Existing outcome-driven CSS reactions |

These are action key poses. They are not advertised as a full skeletal rig or a
frame-by-frame animation. Rune Bat's additional animation strips remain in the
original user source ZIP; this release integrates its supplied key-pose sheet.
Flying Rune Bat and flame-bodied Ember Mirror retain their source anatomy, with
shadows/glow projected onto the same actual floor. Grounded actors do not bob.
Existing MC action cutouts are retained; this release does not redraw them.

The supplied UI atlas supplies the relevant utility icons. Focus keeps the
separate gold/ruby design approved in 2.2, while Predict keeps its cyan geometry.
The exact identity **Alyssa the Clairvoyance** remains in DCConfig.MC and SOR 08.

Runtime owners: `DCVisuals` in visuals.js, homeView/selectMenuScene/scheduleMenu
and battleView in app.js, and dungeon-2-3.css. Provenance, source hashes, source
crop coordinates, export sizes and pivots live in `dist/assets/menu-art.json`
and `dist/assets/grounding-assets.json`. `tools/import-dungeon-2-3.py` performs
mechanical crop/normalisation and atomically validates/writes WebP outputs.

This is a presentation update. Numeric card/combat/math rules, RNG, route/map
progress, soundtrack, save key/schema and learning credit are retained. Saved
runs continue on their own existing route snapshots. The Windows installer
updates the confirmed original folder, validates source and affected-file hashes,
makes a backup, then replaces only manifest-listed files. A changed local file
that cannot be safely matched stops the update before replacement; its contents
are not silently merged or discarded. A rollback script accompanies the backup.

Actual verification and platform limits: VERIFICATION_2_3.md.
