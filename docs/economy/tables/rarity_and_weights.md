# Rarity and support contracts

All values below are candidate settings. First filter source/category, then sample rarity and ID separately. If a rarity is empty, renormalize the remaining rarity weights.

| Pool | Common | Uncommon | Rare |
| --- | --- | --- | --- |
| normal_s1 | 70 | 25 | 5 |
| normal_s2 | 55 | 35 | 10 |
| elite_s1 | 35 | 50 | 15 |
| elite_s2 | 20 | 55 | 25 |
| shop_s1 | 55 | 35 | 10 |
| shop_s2 | 40 | 40 | 20 |

| Difficulty | Support alpha |
| --- | --- |
| easy | 0.25 |
| medium | 0.15 |
| hard | 0.1 |

| Factor | Value |
| --- | --- |
| Unowned ID | 1 |
| One owned copy | 0.65 |
| Two or more owned copies | 0.35 |
| Owned Passive ID | 0.15 |
| Setup Passive, Stage 1 level 1–4 | 0.85 |
| Setup Passive, Stage 1 level 5–10 | 1 |
| Setup Passive, Stage 2 | 1.1 |

`w = stageSuitability × (1 + alpha × supportScore) × duplicateFactor`. Support 0..1 from fixed requirements, no measured CP. Artifact offers are uniform within eligible/unowned tier; these card factors never apply to artifacts.

| Card | Requirement tags | ICP / CCP |
| --- | --- | --- |
| Rune Strike | none; support=0 | null / UNMEASURED |
| Weak Point | none; support=0 | null / UNMEASURED |
| Scout Strike | none; support=0 | null / UNMEASURED |
| Return Strike | none; support=0 | null / UNMEASURED |
| Sure Hit | none; support=0 | null / UNMEASURED |
| Twin Shot | none; support=0 | null / UNMEASURED |
| Shield Shot | block | null / UNMEASURED |
| Crack Shot | none; support=0 | null / UNMEASURED |
| Rune Sweep | none; support=0 | null / UNMEASURED |
| Fate Storm | none; support=0 | null / UNMEASURED |
| Rune Guard | none; support=0 | null / UNMEASURED |
| Flash Ward | none; support=0 | null / UNMEASURED |
| Tower Shield | none; support=0 | null / UNMEASURED |
| Ember Wall | none; support=0 | null / UNMEASURED |
| Foreseen Guard | none; support=0 | null / UNMEASURED |
| Layered Shield | none; support=0 | null / UNMEASURED |
| Burning Pages | none; support=0 | null / UNMEASURED |
| Cinder Guard | none; support=0 | null / UNMEASURED |
| Hold the Line | block | null / UNMEASURED |
| Mana Barrier | none; support=0 | null / UNMEASURED |
| Quick Study | none; support=0 | null / UNMEASURED |
| Deep Study | none; support=0 | null / UNMEASURED |
| Mana Reading | none; support=0 | null / UNMEASURED |
| Read Ahead | none; support=0 | null / UNMEASURED |
| Burning Page | none; support=0 | null / UNMEASURED |
| Clear Choice | none; support=0 | null / UNMEASURED |
| Card Search | searchable_category | null / UNMEASURED |
| Recall | discardable_other | null / UNMEASURED |
| Next Chapter | none; support=0 | null / UNMEASURED |
| Last Page | zero_or_draw_selection | null / UNMEASURED |
| Blazing Spirit | attack | null / UNMEASURED |
| Growing Flame | attack | null / UNMEASURED |
| Swift Step | defend | null / UNMEASURED |
| Battle Rhythm | defend | null / UNMEASURED |
| Rune Armor | none; support=0 | null / UNMEASURED |
| Lasting Shield | block | null / UNMEASURED |
| Grimoire Ward | skill | null / UNMEASURED |
| Ember Core | focus | null / UNMEASURED |
| Clear Mind | none; support=0 | null / UNMEASURED |
| Last Ember | none; support=0 | null / UNMEASURED |
