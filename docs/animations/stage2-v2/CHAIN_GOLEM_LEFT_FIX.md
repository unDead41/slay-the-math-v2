# Chain Golem left-facing correction (v2.1)

Only Chain Golem was redrawn: Idle 6, Attack 6, Defend 6, Skill 6 and Damaged 3.
All 27 poses use a clear left-facing profile. Chest, toes, ball attack and chest pulse face screen left. The original headless design, two arms, two legs, two chest cores and single chained ball are retained. The three damaged poses remain distinct.

Use the authored left-facing PNGs with flipX=false. Keep the standard 768x768 frame, 2560x1728 sheet, transparent padding >=96px, 64px sheet margin/gap and pivot (0.5,0.5). Idle silhouette target remains 384+/-1px.

Idle is stabilized using the anatomical chest-core-to-sole height with a small authored breathing excursion. Per-frame VFX bounds do not control character scale. Attack/Defend/Skill retain a uniform scale within each action and share the neutral Idle endpoint.

The other four enemies are preserved byte for byte. The combined HTML, frame boards, WebP and MP4 previews show the corrected Chain Golem. Exact prompts are in sources/GENERATION_PROMPTS.json.

MODEL.zip was unavailable and was not used. Existing accepted Stage 2 assets and the original Chain Golem portrait were used instead. Engine import and in-game combat timing have not been tested.
