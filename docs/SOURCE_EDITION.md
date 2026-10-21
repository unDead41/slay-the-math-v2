# Slay the Math — Source Edition 2.0

User request: rebuild/update the existing game using the nine supplied menu images, arena pack, enemy model sheets, MC model sheets and MUSIC BG pack.

| Reference | Implemented surface |
| --- | --- |
| Stone dungeon main menu with armored heroine | Live title, New Run/Continue, Tutorial, Collection, sound/settings, source armoured MC |
| Armored Heroine’s Dungeon Math Tutorial | Four-step tutorial; safe interactive 2/4 = 1/2 practice |
| Arcane Archive Card Collection | Search, role filters, six-card pages, selected-card and upgrade preview |
| Choose your path in Sigil Keep | Branching parchment map, highlighted next rooms, selected preview, Enter button |
| Choose your reward in Sigil Keep | Three framed cards, selection preview, Add/Skip |
| Quiet Rune Keep rest alcove | Rest/Upgrade preview, actual heal amount, Confirm, deck access |
| Rune Keep Merchant Alcove | Playable Gold shop, three distinct offers, price/remaining Gold, Buy/Leave |
| Predict Chance: Draw Pile Probability | Native full panel, frozen source counts, input, Hint, evaluated result |
| Arcane Dungeon Victory Results | Actual stages/time/cards/predictions/concept results and replay/menu |

## Source assets

`dist/assets/source-assets.json` records crop rectangles, original filenames and source SHA-256 values for the 29 derived model/arena assets. Original supplied sheets remain unmodified. Derivatives are mechanically cropped and have edge-connected pale parchment removed, then encoded to WebP. `tools/prepare-source-assets.py <extracted-source-root>` reproduces these files with Pillow, NumPy and SciPy. Three individual card illustrations are cropped from the user's reward reference; the other nine mathematical artifacts retain the prior commissioned atlas.

The standing, attack, defend, skill and damage MC poses are used by the runtime. They are 2D pose swaps, not a skeletal character rig. All twenty roster characters have extracted front-view art. New routes use three normal enemy identities and two elite identities per stage; stable legacy combat IDs remain accepted. Mystery uses one of three source NPCs per stage. Shop uses Bram / Veil. Bosses use Twin Sigil Guardian / Deck Lord. All four supplied arena backgrounds are wired to matching stage and boss encounters.

The artwork is supplied by the user. Derivation/provenance records are included; no third-party licensing claim is made.

## Music

Three user tracks replace four cue files: normal and elite Stage 1 share the supplied normal/elite track, while each boss uses its distinct supplied track. `user-track-import.json` records processing and durations. A circular two-second equal-power tail/head overlap is baked before encoding to avoid a hard seam. Stage 2 normal/elite, Menu, Rest, Shop and Mystery retain the existing original compositions. Runtime performs 850ms transitions, Predict ducking, mute, volume, tab pause and a two-track decoded cache. Playback/audition and mathematical seam checks are distinct verification boundaries.

## Economy and compatibility

Prototype tuning: start 80 Gold; ordinary win +25, elite +40, boss +60. A shop has three unique offers at 45 Gold for 1-Energy cards, 60 for 0-Energy cards, 65 for 2-Energy cards. Any unsold affordable offer may be bought once; no restock. These are working tuning decisions, not user-confirmed balancing research. Rest retains 12 HP from the previous engine; Mystery retains heal 8/remove. Existing 12 card definitions and the two boss seal rules are unchanged.

Route version 2 introduces Shop on floor three, preserving every version 1/legacy route. Five floors per stage remain; a run passes ten rooms total. Save schema remains version 1 with validated additive Gold/shop/stat fields. Old saves lacking these fields migrate safely. New Stage 2 checkpoints use the new route version.

## Scope boundary

This update preserves the playable Probability engine and its exact evaluator. Expansion & Factorisation, Indices and Passive are still development directions in the SOR, not implemented math modes. No multiplayer, cloud account or RFID connection is added.
