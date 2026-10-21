# Stage 2 Enemy Animation SOR — v2.1

Scope: 3 Normal + 2 Elite, no bosses. Shared standard and import rules are in README.md and animation_manifest.json. 25 actions, 135 frames. All face left. Schema version 3.0.

| Enemy | Type | Roster ID | Idle | Attack | Defend | Skill | Damaged | Total |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Chain Weaver | normal | s2_chain_weaver | 6 | 6 | 6 | 6 | 3 | 27 |
| Deck Guard | normal | s2_deck_guard | 6 | 6 | 6 | 6 | 3 | 27 |
| Card Mimic | normal | s2_card_mimic | 6 | 6 | 6 | 6 | 3 | 27 |
| Chain Golem | elite | s2_chain_golem | 6 | 6 | 6 | 6 | 3 | 27 |
| Rune Reaper | elite | s2_rune_reaper | 6 | 6 | 6 | 6 | 3 | 27 |

## Chain Weaver — s2_chain_weaver

- Identity: Hooded violet wraith with two cyan eye slits, two skeletal hands and exactly two chained lanterns: cyan in front, violet behind.
- Attack: Whips its existing cyan lantern toward the left, keeping the second lantern attached.
- Defend: Braces the existing chains in front of its torso; no carried shield is added.
- Skill: Channels a compact intertwined cyan-violet pulse through the two original lanterns.
- Damaged: Chest impact, backward floating recoil, then distinct settling pose.

## Deck Guard — s2_deck_guard

- Identity: Navy card-armored golem with silver edging, shoulder card fans, one violet eye and one shield on its anatomical left forearm.
- Attack: Right-hand punch toward the left; the shield remains attached to the left arm.
- Defend: Lifts and braces its single existing left-arm card shield, then lowers the same shield.
- Skill: Emits translucent violet card glyphs from the free hand; physical armor remains attached.
- Damaged: Breastplate impact, compressed backward recoil, then distinct balanced recovery.

## Card Mimic — s2_card_mimic

- Identity: Third normal enemy: squat navy card-deck chest, silver trim, one cyan eye on its hinged lid, teeth, two claw arms and two short legs.
- Attack: A short anticipatory lean and snap bite using the original hinged lid.
- Defend: Crouches, closes its own lid and braces both claws against its chest; no shield object.
- Skill: Spits violet card-shaped light glyphs from its mouth.
- Damaged: Corner impact, surprised backward recoil, then distinct settling pose.

## Chain Golem — s2_chain_golem

- v2.1 orientation correction: all 27 frames use a strong left-facing side profile, with front chest and boot toes directed left. Do not apply an additional horizontal flip.

- Identity: Headless slate-rock elite, two fixed chest cores (cyan/violet), two arms, two legs, one short-chain wrecking ball in the right hand.
- Attack: Short leftward strike using the same single chained ball.
- Defend: Braces its original iron cuffs and chained chest; no added shield.
- Skill: A small leftward cyan-violet pulse from the existing chest cores; both arms stay on their original sides.
- Damaged: Shoulder impact, backward recoil with ball inertia, distinct settling pose.

## Rune Reaper — s2_rune_reaper

- Identity: Navy and silver armored elite with one violet helmet slit, cyan sternum core, split coat-tails and one straight-shaft scythe in the right hand.
- Attack: Compact one-handed leftward scythe chop; single rigid shaft and blade remain continuous.
- Defend: Two-hand parry on the same scythe shaft; no extra weapon or shield.
- Skill: Self-channel rune seal above its original free left palm on image right; the right hand keeps the one scythe.
- Damaged: Shoulder impact, controlled backward recoil, distinct settling pose.

Physical equipment counts and anatomical hand assignment must be retained. No gameplay balance or AI values are inferred from artwork. Keep event execution separate from animation frames.
