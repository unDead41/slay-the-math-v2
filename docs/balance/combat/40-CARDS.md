# 40-card before/after execution-plan values

Current recheck: [24 October2026 handoff](recheck-2026-10-24/HANDOFF_MASTER.md) and [all40 current before/after states](recheck-2026-10-24/40_CARDS.md). The original tables below retain their v1.2 experimental source and must not be treated as current candidate.4 measurements.

Context: Medium, sentinel, full HP, no player stat/artifact; damage values precede mitigation. See audit JSON for exact actions, conditional fields and delayed effects. Passive Focus is not applicable.

| Card | Before Energy | Candidate Energy | Before N/F/U/UF | Candidate N/F/U/UF |
|---|---:|---:|---|---|
| Rune Strike | 1 | 1 | {"damage":6} / {"damage":9} / {"damage":9} / {"damage":12} | {"damage":6} / {"damage":9} / {"damage":9} / {"damage":12} |
| Weak Point | 1 | 1 | {"damage":4,"stacks":1} / {"damage":7,"stacks":1} / {"damage":7,"stacks":1} / {"damage":10,"stacks":1} | {"damage":4,"stacks":1} / {"damage":6,"stacks":1} / {"damage":6,"stacks":1} / {"damage":8,"stacks":1} |
| Scout Strike | 1 | 1 | {"damage":4,"draw":1} / {"damage":7,"draw":1} / {"damage":7,"draw":1} / {"damage":10,"draw":1} | {"damage":4,"draw":1} / {"damage":6,"draw":1} / {"damage":6,"draw":1} / {"damage":8,"draw":1} |
| Return Strike | 1 | 1 | {"damage":5,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":11,"constant_3":3} | {"damage":5,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":11,"constant_3":3} |
| Sure Hit | 1 | 1 | {"damage":5} / {"damage":8} / {"damage":8} / {"damage":11} | {"damage":5} / {"damage":8} / {"damage":7} / {"damage":10} |
| Twin Shot | 1 | 1 | {"first":3,"second":3} / {"first":6,"second":3} / {"first":6,"second":3} / {"first":9,"second":3} | {"first":3,"second":3} / {"first":6,"second":3} / {"first":5,"second":3} / {"first":8,"second":3} |
| Shield Shot | 1 | 1 | {"damage":5,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":11,"constant_3":3} | {"damage":5,"constant_3":3} / {"damage":8,"constant_3":3} / {"damage":7,"constant_3":3} / {"damage":10,"constant_3":3} |
| Crack Shot | 1 | 1 | {"damage":5,"remove":4} / {"damage":8,"remove":4} / {"damage":8,"remove":4} / {"damage":11,"remove":4} | {"damage":5,"remove":4} / {"damage":8,"remove":4} / {"damage":7,"remove":4} / {"damage":10,"remove":4} |
| Rune Sweep | 2 | 2 | {"damage":6,"other":6} / {"damage":9,"other":6} / {"damage":9,"other":6} / {"damage":12,"other":6} | {"damage":12,"other":12} / {"damage":16,"other":12} / {"damage":15,"other":12} / {"damage":19,"other":12} |
| Fate Storm | 2 | 2 | {"first":3,"other":3,"hits":2} / {"first":6,"other":3,"hits":2} / {"first":6,"other":3,"hits":2} / {"first":9,"other":3,"hits":2} | {"first":5,"other":5,"hits":2} / {"first":9,"other":5,"hits":2} / {"first":8,"other":5,"hits":2} / {"first":12,"other":5,"hits":2} |
| Rune Guard | 1 | 1 | {"block":6} / {"block":9} / {"block":9} / {"block":12} | {"block":6} / {"block":9} / {"block":9} / {"block":12} |
| Flash Ward | 0 | 0 | {"block":3} / {"block":6} / {"block":6} / {"block":9} | {"block":3} / {"block":5} / {"block":4} / {"block":6} |
| Tower Shield | 2 | 2 | {"block":14} / {"block":17} / {"block":17} / {"block":20} | {"block":14} / {"block":19} / {"block":17} / {"block":22} |
| Ember Wall | 1 | 1 | {"block":6,"thorns":2} / {"block":9,"thorns":2} / {"block":9,"thorns":2} / {"block":12,"thorns":2} | {"block":5,"thorns":2} / {"block":8,"thorns":2} / {"block":7,"thorns":2} / {"block":10,"thorns":2} |
| Foreseen Guard | 1 | 1 | {"block":9,"constant_4":4} / {"block":12,"constant_4":4} / {"block":12,"constant_4":4} / {"block":15,"constant_4":4} | {"block":8,"constant_4":4} / {"block":11,"constant_4":4} / {"block":10,"constant_4":4} / {"block":13,"constant_4":4} |
| Layered Shield | 1 | 1 | {"block":4,"later":4} / {"block":7,"later":4} / {"block":7,"later":4} / {"block":10,"later":4} | {"block":4,"later":3} / {"block":7,"later":3} / {"block":6,"later":3} / {"block":9,"later":3} |
| Burning Pages | 1 | 1 | {"block":4,"draw":1} / {"block":7,"draw":1} / {"block":7,"draw":1} / {"block":10,"draw":1} | {"block":4,"draw":1} / {"block":6,"draw":1} / {"block":6,"draw":1} / {"block":8,"draw":1} |
| Cinder Guard | 1 | 1 | {"block":5,"stacks":1} / {"block":8,"stacks":1} / {"block":8,"stacks":1} / {"block":11,"stacks":1} | {"block":5,"stacks":1} / {"block":8,"stacks":1} / {"block":7,"stacks":1} / {"block":10,"stacks":1} |
| Hold the Line | 2 | 2 | {"block":10,"retain":5} / {"block":13,"retain":5} / {"block":13,"retain":5} / {"block":16,"retain":5} | {"block":12,"retain":5} / {"block":16,"retain":5} / {"block":15,"retain":5} / {"block":19,"retain":5} |
| Mana Barrier | 3 | 3 | {"block":15} / {"block":18} / {"block":18} / {"block":21} | {"block":21} / {"block":26} / {"block":23} / {"block":28} |
| Quick Study | 1 | 1 | {"draw":2} / {"draw":3} / {"draw":3} / {"draw":4} | {"draw":2} / {"draw":3} / {"draw":3} / {"draw":4} |
| Deep Study | 2 | 1 | {"draw":4} / {"draw":5} / {"draw":5} / {"draw":6} | {"draw":3} / {"draw":4} / {"draw":4} / {"draw":5} |
| Mana Reading | 3 | 1 | {"draw":6} / {"draw":7} / {"draw":7} / {"draw":7} | {"draw":2,"laterDraw":1} / {"draw":3,"laterDraw":1} / {"draw":2,"laterDraw":2} / {"draw":3,"laterDraw":2} |
| Read Ahead | 1 | 1 | {"look":3,"take":1} / {"look":4,"take":1} / {"look":4,"take":1} / {"look":5,"take":1} | {"look":3,"take":1} / {"look":5,"take":1} / {"look":4,"take":1} / {"look":6,"take":1} |
| Burning Page | 1 | 0 | {"replace":1,"take":1} / {"replace":2,"take":1} / {"replace":2,"take":1} / {"replace":3,"take":1} | {"replace":1,"take":1} / {"replace":3,"take":1} / {"replace":2,"take":1} / {"replace":4,"take":1} |
| Clear Choice | 1 | 1 | {"look":3,"take":1} / {"look":4,"take":1} / {"look":4,"take":1} / {"look":5,"take":1} | {"look":4,"take":1} / {"look":6,"take":1} / {"look":5,"take":1} / {"look":7,"take":1} |
| Card Search | 1 | 1 | {"search":4} / {"search":5} / {"search":5} / {"search":6} | {"search":5} / {"search":7} / {"search":6} / {"search":8} |
| Recall | 1 | 1 | {"return":1,"extra":0} / {"return":1,"extra":1} / {"return":1,"extra":1} / {"return":1,"extra":2} | {"return":1,"extra":0} / {"return":1,"extra":1} / {"return":1,"extra":1} / {"return":1,"extra":2} |
| Next Chapter | 1 | 1 | {"laterDraw":2} / {"laterDraw":3} / {"laterDraw":3} / {"laterDraw":4} | {"laterDraw":2} / {"laterDraw":4} / {"laterDraw":3} / {"laterDraw":5} |
| Last Page | 1 | 1 | {"draw":1,"emptyBonus":2} / {"draw":2,"emptyBonus":2} / {"draw":2,"emptyBonus":2} / {"draw":3,"emptyBonus":2} | {"draw":1,"emptyBonus":2} / {"draw":2,"emptyBonus":2} / {"draw":2,"emptyBonus":2} / {"draw":3,"emptyBonus":2} |
| Blazing Spirit | 1 | 1 | {"strength":2} / {"strength":2} / {"strength":2} / {"strength":2} | {"strength":2} / {"strength":2} / {"strength":3} / {"strength":3} |
| Growing Flame | 2 | 1 | {"every":3,"strength":1,"cap":3} / {"every":3,"strength":1,"cap":3} / {"every":3,"strength":1,"cap":3} / {"every":3,"strength":1,"cap":3} | {"every":3,"strength":1,"cap":3} / {"every":3,"strength":1,"cap":3} / {"every":2,"strength":1,"cap":3} / {"every":2,"strength":1,"cap":3} |
| Swift Step | 1 | 1 | {"agility":2} / {"agility":2} / {"agility":2} / {"agility":2} | {"agility":2} / {"agility":2} / {"agility":3} / {"agility":3} |
| Battle Rhythm | 2 | 1 | {"every":3,"agility":1,"cap":3} / {"every":3,"agility":1,"cap":3} / {"every":3,"agility":1,"cap":3} / {"every":3,"agility":1,"cap":3} | {"every":3,"agility":1,"cap":3} / {"every":3,"agility":1,"cap":3} / {"every":2,"agility":1,"cap":3} / {"every":2,"agility":1,"cap":3} |
| Rune Armor | 2 | 1 | {"defense":1} / {"defense":1} / {"defense":1} / {"defense":1} | {"defense":1} / {"defense":1} / {"defense":1} / {"defense":1} |
| Lasting Shield | 1 | 1 | {"retain":4} / {"retain":4} / {"retain":4} / {"retain":4} | {"retain":4} / {"retain":4} / {"retain":5} / {"retain":5} |
| Grimoire Ward | 1 | 1 | {"block":3} / {"block":3} / {"block":3} / {"block":3} | {"block":3} / {"block":3} / {"block":4} / {"block":4} |
| Ember Core | 1 | 1 | {"damage":2} / {"damage":2} / {"damage":2} / {"damage":2} | {"damage":3} / {"damage":3} / {"damage":4} / {"damage":4} |
| Clear Mind | 2 | 1 | {"draw":1} / {"draw":1} / {"draw":1} / {"draw":1} | {"draw":1} / {"draw":1} / {"draw":1} / {"draw":1} |
| Last Ember | 1 | 1 | {"threshold":30,"block":6,"focus":1} / {"threshold":30,"block":6,"focus":1} / {"threshold":30,"block":6,"focus":1} / {"threshold":30,"block":6,"focus":1} | {"threshold":30,"block":6,"focus":1} / {"threshold":30,"block":6,"focus":1} / {"threshold":30,"block":8,"focus":1} / {"threshold":30,"block":8,"focus":1} |
