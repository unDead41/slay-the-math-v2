# Draf SOR — Rich Text Calculation dan Audit Artifact

Versi draf 1.1 · 21 Oktober 2026 (Malaysia). Sumber: ARTIFACT(2).zip, katalog dan SOR artifact V3.1.
Status: untuk semakan Ijamm. Ini cadangan paparan dan pengiraan; source game belum diubah.

## 1. Standard seluruh game

1. Paparan biasa menunjukkan hasil akhir sahaja. Hover nombor membuka sumber, nilai sebelum, langkah kiraan, had/pembundaran dan nilai selepas.
2. Tiga kategori rich text: calculation = ungu lembut; term matematik = pink lembut; term game = hijau lembut. Warna hanya digunakan pada token rich text yang berkenaan. Calculation mengekalkan garis bawah bertitik, kedua-dua kategori term menggunakan garis bawah putus-putus.
3. Nombor hasil dan istilah bersebelahan ialah sasaran hover berasingan: [+5] ungu dan [Strength] hijau. Perkataan lain, label, ayat penghubung, panel dan bingkai mewarisi gaya asal game. Jangan warnakan seluruh ayat atau paragraph kerana ia mengandungi satu term. Jangan sarangkan dua sasaran hover.
4. Hover, fokus papan kekunci dan tap membuka maklumat sama. Escape/tap di luar menutupnya. Tooltip boleh didekati pointer dan tidak menghalang sasaran. Tiada maklumat wajib untuk bertindak yang hanya tersedia melalui hover.
5. Snapshot nilai dan sumber diambil daripada kejadian sebenar. Pratonton dilabel sebagai pratonton; keputusan dilabel sebagai keputusan. Membuka tooltip tidak mengubah state, mengulang trigger atau membaling dadu.
6. Kekalkan unit. +5 Max HP dan +5 HP, atau +1 kad dan +4 Block, ditunjukkan sebagai hasil berasingan.
7. Bezakan perubahan (−6 HP), nilai selepas (4 HP) dan sumbangan bonus (+2 Strength). Label mesti menjelaskan jenis nombor. Jangan menjumlahkan HP semasa dalam persamaan delta.
8. Simbol UI menggunakan −, +, ×, ÷, =, ≥, ≤ serta % secara konsisten. Gunakan kurungan untuk nombor negatif: (−2) + (−4) = −6. Julat dadu 1–2 menggunakan tanda julat, bukan tanda tolak.
9. Description statik mengekalkan syarat asal artifact. Hasil aktif hanya dipaparkan selepas syarat dipenuhi, atau sebagai preview yang berlabel. Tiada angka hasil rekaan sebelum nilai runtime tersedia.
10. Block sementara, aturan reset, scaling Strength/Agility, had Hand dan had resource datang daripada core game. Jangan mencipta rumus atau angka had yang tiada dalam sumber.

## 2. Rumus dan batasan

- HP selepas healing = min(Max HP, HP sebelum + healing diminta). Healing sebenar = HP selepas − HP sebelum.
- HP selepas damage = max(0, HP sebelum − damage selepas semua pengurangan). Perubahan HP = HP selepas − HP sebelum. Damage mentah dan damage terpakai mempunyai label berasingan.
- Traveler’s Ration: tambah Max HP dahulu, kemudian hadkan healing menggunakan Max HP baharu.
- Discount artifact = kadar tertinggi yang layak. Harga akhir = max(1, ceil(harga asal × (1 − kadar))). Bundarkan harga akhir ke atas, bukan membundarkan diskaun dahulu.
- Lantern Keeper’s Flask: 0 < HP dan 2 × HP ≤ Max HP. Max HP 61 bermakna HP 30 layak dan HP 31 tidak; tiada pembundaran ambang ke atas.
- Sumbangan Sovereign Clasp per stat pada giliran t ≥ 1 = min(6, 3 + t − 1). Tambahkan sumber lain selepas mengehadkan sumbangan Clasp sendiri.
- Whetstone/Tongs ialah bonus sekali per kad Attack pertama, diberikan pada damage event positif pertama yang layak sebelum pengurangan musuh.
- Buckler/Crest ialah tambahan Block rata selepas kiraan Block kad oleh core game. Tiada gandaan Agility tambahan direka untuk bonus artifact.
- Draw menunjukkan jumlah kad yang benar-benar dipindahkan ke Hand selepas aturan Hand dan reshuffle digunakan. Jangan andaikan had Hand tertentu.
- Satu Energy atau lebih mengaktifkan Ember Balance untuk tepat 6 Block. Copper Abacus mengaktifkan sekali selepas kad ketiga layak pada giliran itu.
- Chance Die hanya memaparkan cabang hasil yang berlaku selepas satu balingan. Maklumat kebarangkalian 1/3 hanya sah jika dadu adil disahkan.

## 3. Contoh perubahan HP yang diminta

Paparan biasa: **−6 HP**. Hover: **(−2 HP) + (−4 HP) = −6 HP**; Current HP: 10 HP; Remaining HP: **10 HP − 6 HP = 4 HP**.
Jika HP sebelum hanya 4, paparan perubahan HP terpakai ialah **−4 HP** dan baki **0 HP**. Hover boleh menyatakan damage diminta 6 HP serta had bawah 0 HP.

## 4. Audit semua 31 artifact

Semua angka di bawah ialah contoh snapshot bebas, kecuali konteks yang jelas menyatakan gabungan artifact. Tooltip dalam English mudah; penerangan audit dalam BM.

### 1. Emberheart Pendant (s01_emberheart_pendant)

**Description:** After winning a combat, heal 2 HP.
**Term hover:** Heal, HP, Max HP, Combat, Once per combat.
**Konteks contoh:** Victory; HP 19/20.
**Semakan utama:** Heal capped at Max HP.

**Paparan — HP restored: +1 HP**

> Emberheart Pendant: +2 HP
> Available room: 20 − 19 = 1 HP
> Actual healing: min(2, 1) = 1 HP
> HP after effect: 19 + 1 = 20 HP

**Aturan tambahan:** Only after victory, while alive, once per won combat.

### 2. Cinder Whetstone (s02_cinder_whetstone)

**Description:** Your first Attack each turn deals 1 extra damage.
**Term hover:** First Attack each turn, Attack, Damage, Turn.
**Konteks contoh:** Eligible card damage before artifact: 6; no other modifiers.
**Semakan utama:** One bonus per card.

**Paparan — Card damage: 7 damage**

> Damage before artifact: 6
> Cinder Whetstone: +1
> Damage before enemy defenses: 6 + 1 = 7
> This is not HP loss after enemy defenses.

**Aturan tambahan:** For multiple hits or targets, apply to the first eligible positive damage event only.

### 3. Prism Buckler (s03_prism_buckler)

**Description:** Your first Defend each turn gives 2 extra Block.
**Term hover:** First Defend each turn, Defend, Block, Turn.
**Konteks contoh:** Resolved card Block before artifact: 5.
**Semakan utama:** Add after core card Block calculation.

**Paparan — Block gained: +7 Block**

> Card Block after core calculation: 5
> Prism Buckler: +2
> Block gained: 5 + 2 = 7

### 4. Clairvoyance Lens (s04_clairvoyance_lens)

**Description:** Gain 1 Focus on your first turn of each combat.
**Term hover:** Focus, First turn, Combat, Once per combat.
**Konteks contoh:** No fixed numeric Focus example until its cap is confirmed.
**Semakan utama:** Definition and cap pending.

**Paparan — Focus gained: Pending Focus**

> Requested artifact bonus: +1 Focus
> Actual gain = Focus after effect − Focus before effect
> Use the confirmed Focus cap from the core game.

**Belum disahkan:** Focus ability, cap value and interaction rules are not supplied.

### 5. Scholar's Bookmark (s05_scholars_bookmark)

**Description:** Draw 1 extra card on your first turn of each combat.
**Term hover:** Draw, Hand, Draw Pile, Discard, First turn, Combat, Once per combat.
**Konteks contoh:** Hand has 4 cards; at least one draw is possible.
**Semakan utama:** Actual draw count, not an assumed hand limit.

**Paparan — Cards drawn: +1 cards**

> Scholar’s Bookmark: draw 1 extra card(s)
> Hand before effect: 4 cards
> Hand after effect: 4 + 1 = 5 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

### 6. Merchant's Seal (s06_merchants_seal)

**Description:** Get a 5% discount in the Shop.
**Term hover:** Discount, Percent (%), Shop, Gold, Highest discount only, Round up.
**Konteks contoh:** Original price 100 Gold; only this discount.
**Semakan utama:** Highest discount; ceil; minimum price 1.

**Paparan — Final price: 95 Gold**

> Original price: 100 Gold
> Discount: 100 × 5 ÷ 100 = 5 Gold
> Price before rounding: 100 − 5 = 95 Gold
> Final price: max(1, round up(95)) = 95 Gold

### 7. Bronze Guard Pin (s07_bronze_guard_pin)

**Description:** Gain 3 Block on your first turn of each combat.
**Term hover:** Block, First turn, Combat, Once per combat.
**Konteks contoh:** Block before effect: 0.
**Semakan utama:** First turn, after opening reset.

**Paparan — Block gained: +3 Block**

> Bronze Guard Pin: +3 Block
> Before: 0 Block
> After: 0 + 3 = 3 Block

### 8. Traveler's Ration (s08_travelers_ration)

**Description:** When obtained, gain 5 Max HP and heal 5 HP. Once per run.
**Term hover:** When obtained, Max HP, Heal, HP, Run.
**Konteks contoh:** Before acquisition: HP 18/20.
**Semakan utama:** Increase Max HP before healing.

**Paparan — Max HP gained: +5 Max HP**

> Max HP before: 20
> Traveler’s Ration: +5
> Max HP after: 20 + 5 = 25

**Paparan — HP restored: +5 HP**

> Traveler’s Ration: +5 HP
> Available room: 25 − 18 = 7 HP
> Actual healing: min(5, 7) = 5 HP
> HP after effect: 18 + 5 = 23 HP

**Aturan tambahan:** Apply once on acquisition for this run.

### 9. Copper Purse (s09_copper_purse)

**Description:** When obtained, gain 25 Gold. Once per run.
**Term hover:** When obtained, Gold, Run.
**Konteks contoh:** Gold before acquisition: 40.
**Semakan utama:** Once on acquisition; not on UI open or reload.

**Paparan — Gold gained: +25 Gold**

> Copper Purse: +25 Gold
> Before: 40 Gold
> After: 40 + 25 = 65 Gold

### 10. Ember Quill (s10_ember_quill)

**Description:** After your first Skill each combat, draw 1 card.
**Term hover:** First Skill each combat, Skill, Draw, Hand, Draw Pile, Discard, Combat, Once per combat.
**Konteks contoh:** First Skill has resolved; Hand now has 3 cards; draw is possible.
**Semakan utama:** After first resolved Skill of combat.

**Paparan — Cards drawn: +1 cards**

> Ember Quill: draw 1 extra card(s)
> Hand before effect: 3 cards
> Hand after effect: 3 + 1 = 4 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

### 11. Scribe's Pebble (s11_scribes_pebble)

**Description:** After your first Exhaust each combat, gain 4 Block.
**Term hover:** First Exhaust each combat, Exhaust, Block, Combat, Once per combat.
**Konteks contoh:** First owned card entered Exhaust; Block before effect: 2.
**Semakan utama:** Actual Exhaust; not Discard.

**Paparan — Block gained: +4 Block**

> Scribe’s Pebble: +4 Block
> Before: 2 Block
> After: 2 + 4 = 6 Block

### 12. Initiate's Ring (s12_initiates_ring)

**Description:** After your first Passive each combat, gain 3 Block.
**Term hover:** First Passive each combat, Passive, Block, Combat, Once per combat.
**Konteks contoh:** First Passive has resolved; Block before effect: 2.
**Semakan utama:** Ultimate does not automatically count as Passive.

**Paparan — Block gained: +3 Block**

> Initiate’s Ring: +3 Block
> Before: 2 Block
> After: 2 + 3 = 5 Block

### 13. Copper Abacus (e01_copper_abacus)

**Description:** After 3 played cards in the same turn, gain 1 Energy. Once per turn.
**Term hover:** Played card, Energy, Turn, Once per turn.
**Konteks contoh:** Three eligible cards resolved; Energy before bonus: 0.
**Semakan utama:** Card 3 triggers; card 6 does not trigger again.

**Paparan — Energy gained: +1 Energy**

> Copper Abacus: +1 Energy
> Before: 0 Energy
> After: 0 + 1 = 1 Energy

**Aturan tambahan:** Canceled cards, draw, preview and artifact retaliation do not count.

### 14. Twin Sigil Medallion (e02_twin_sigil_medallion)

**Description:** Play at least 1 Attack and 1 Defend in the same turn to gain 6 Block. Once per turn.
**Term hover:** At least, Attack, Defend, Played card, Turn, Block, Once per turn.
**Konteks contoh:** One Attack and one Defend resolved this turn; Block before bonus: 4.
**Semakan utama:** Both card types required; either order.

**Paparan — Block gained: +6 Block**

> Twin Sigil Medallion: +6 Block
> Before: 4 Block
> After: 4 + 6 = 10 Block

### 15. Chance Die (e03_chance_die)

**Description:** On the first turn of each combat, roll a d6 once. 1–2: gain 10 Block. 3–4: draw 2 cards. 5–6: gain 2 Energy.
**Term hover:** First turn, d6, Range, Block, Draw, Hand, Energy, Combat, Once per combat.
**Konteks contoh:** Example roll: 4; Hand has 3 cards; draw is possible.
**Semakan utama:** Exactly one branch, one roll per combat; store result.

**Paparan — Cards drawn: +2 cards**

> Chance Die (roll 4): draw 2 extra card(s)
> Hand before effect: 3 cards
> Hand after effect: 3 + 2 = 5 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

**Aturan tambahan:** 1–2 gives +10 Block; 3–4 draws 2; 5–6 gives +2 Energy.

**Belum disahkan:** Do not promise 1/3 probability until the fair-die random distribution is confirmed.

### 16. Ember Balance (e04_ember_balance)

**Description:** At End Turn, gain 6 Block if you have at least 1 unspent Energy.
**Term hover:** End Turn, At least, Unspent Energy, Energy, Block, Once per turn.
**Konteks contoh:** End Turn; 2 Energy left; Block before effect: 3.
**Semakan utama:** Energy ≥ 1 gives fixed +6, not 6 per Energy.

**Paparan — Block gained: +6 Block**

> Ember Balance: +6 Block
> Before: 3 Block
> After: 3 + 6 = 9 Block

**Aturan tambahan:** Check before unused Energy is cleared.

### 17. Chainbreaker Clasp (e05_chainbreaker_clasp)

**Description:** After your first Exhaust each turn, draw 1 card and gain 4 Block.
**Term hover:** First Exhaust each turn, Exhaust, Turn, Draw, Hand, Block, Once per turn.
**Konteks contoh:** First Exhaust this turn; Hand 3 cards; Block 2; draw is possible.
**Semakan utama:** Keep card count and Block as separate results.

**Paparan — Cards drawn: +1 cards**

> Chainbreaker Clasp: draw 1 extra card(s)
> Hand before effect: 3 cards
> Hand after effect: 3 + 1 = 4 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

**Paparan — Block gained: +4 Block**

> Chainbreaker Clasp: +4 Block
> Before: 2 Block
> After: 2 + 4 = 6 Block

### 18. Ashen Phoenix Feather (e06_ashen_phoenix_feather)

**Description:** After winning a combat, heal 5 HP.
**Term hover:** Heal, HP, Max HP, Combat, Once per combat.
**Konteks contoh:** Victory; HP 18/20.
**Semakan utama:** Actual heal +2, requested heal +5.

**Paparan — HP restored: +2 HP**

> Ashen Phoenix Feather: +5 HP
> Available room: 20 − 18 = 2 HP
> Actual healing: min(5, 2) = 2 HP
> HP after effect: 18 + 2 = 20 HP

**Aturan tambahan:** Only after victory, while alive, once per won combat.

### 19. Rune-smith Tongs (e07_runesmith_tongs)

**Description:** Your first Attack each turn deals 3 extra damage.
**Term hover:** First Attack each turn, Attack, Damage, Turn.
**Konteks contoh:** Eligible card damage before artifact: 6; no other modifiers.
**Semakan utama:** One total +3 bonus for this card.

**Paparan — Card damage: 9 damage**

> Damage before artifact: 6
> Rune-smith Tongs: +3
> Damage before enemy defenses: 6 + 3 = 9
> Apply artifact bonus once per eligible card, not once per hit.

### 20. Sentinel Crest (e08_sentinel_crest)

**Description:** Your first Defend each turn gives 6 extra Block.
**Term hover:** First Defend each turn, Defend, Block, Turn.
**Konteks contoh:** Resolved card Block before artifact: 5.
**Semakan utama:** Flat artifact bonus after core Block calculation.

**Paparan — Block gained: +11 Block**

> Card Block after core calculation: 5
> Sentinel Crest: +6
> Block gained: 5 + 6 = 11

### 21. Mirror Knight's Brooch (e09_mirror_knights_brooch)

**Description:** After an enemy hit is fully blocked, deal 6 retaliation damage to the attacker. Once per turn cycle.
**Term hover:** Fully blocked, Block, Damage, Retaliation, Once per turn cycle.
**Konteks contoh:** Incoming hit 5; Block 7. Enemy reduces retaliation by 2 in this example.
**Semakan utama:** Full positive hit blocked; actual retaliation follows enemy defenses.

**Paparan — Enemy HP change: −4 HP**

> Incoming damage 5 is fully absorbed by Block 7
> Retaliation before enemy reduction: 6 damage
> Enemy reduction in this example: 2 damage
> Applied enemy HP change: −(6 − 2) = −4 HP

**Aturan tambahan:** Does not count as Attack, cannot generate endless retaliation, once per player/enemy turn cycle.

### 22. Rune Bat's Bell (e10_rune_bats_bell)

**Description:** After your first Skill each turn, draw 1 card.
**Term hover:** First Skill each turn, Skill, Draw, Hand, Draw Pile, Discard, Turn, Once per turn.
**Konteks contoh:** First Skill resolved this turn; Hand 3; draw is possible.
**Semakan utama:** Per turn, unlike Ember Quill which is per combat.

**Paparan — Cards drawn: +1 cards**

> Rune Bat’s Bell: draw 1 extra card(s)
> Hand before effect: 3 cards
> Hand after effect: 3 + 1 = 4 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

### 23. Scholar's Satchel (e11_scholars_satchel)

**Description:** Draw 2 extra cards on your first turn of each combat.
**Term hover:** Draw, Hand, Draw Pile, Discard, First turn, Combat, Once per combat.
**Konteks contoh:** Hand 4; two extra draws possible.
**Semakan utama:** Follow actual available cards and hand limit.

**Paparan — Cards drawn: +2 cards**

> Scholar’s Satchel: draw 2 extra card(s)
> Hand before effect: 4 cards
> Hand after effect: 4 + 2 = 6 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

### 24. Lantern Keeper's Flask (e12_lantern_keepers_flask)

**Description:** The first time you have 50% Max HP or less while alive in a combat, gain 12 Block.
**Term hover:** 50% Max HP or less, Percent (%), Max HP, HP, Or less, Block, Once per combat, Combat.
**Konteks contoh:** Max HP 60; current HP 30; Block before effect 2.
**Semakan utama:** 0 < HP ≤ 0.5 × Max HP; exact comparison.

**Paparan — HP threshold: 30 HP**

> Max HP: 60
> Half of Max HP: 50 ÷ 100 × 60 = 30 HP
> Current HP: 30
> Alive and 30 ≤ 30: condition met

**Paparan — Block gained: +12 Block**

> Lantern Keeper’s Flask: +12 Block
> Before: 2 Block
> After: 2 + 12 = 14 Block

**Aturan tambahan:** If Max HP is 61, threshold is 30.5. With whole-number HP, 30 qualifies and 31 does not. Do not round threshold up. Also checks at combat start; does not revive at 0 HP.

### 25. Chain Weaver's Spool (e13_chain_weavers_spool)

**Description:** After the first Discard by a card effect each turn, draw 1 card and gain 3 Block.
**Term hover:** Discard by a card effect, Hand, Discard, Draw, Draw Pile, Block, Turn, Once per turn.
**Konteks contoh:** Eligible hand discard occurred; Hand now 3; Block 2; draw possible.
**Semakan utama:** Only effect-caused Hand → Discard.

**Paparan — Cards drawn: +1 cards**

> Chain Weaver’s Spool: draw 1 extra card(s)
> Hand before effect: 3 cards
> Hand after effect: 3 + 1 = 4 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

**Paparan — Block gained: +3 Block**

> Chain Weaver’s Spool: +3 Block
> Before: 2 Block
> After: 2 + 3 = 5 Block

**Aturan tambahan:** Exclude End Turn cleanup, played-card discard and Draw Pile → Discard.

### 26. Bram's Contract (e14_brams_contract)

**Description:** Get a 15% discount in the Shop.
**Term hover:** Discount, Percent (%), Shop, Gold, Highest discount only, Round up.
**Konteks contoh:** Original price 102 Gold; Merchant’s Seal also owned.
**Semakan utama:** Highest discount only; round final price up.

**Paparan — Final price: 87 Gold**

> Owned artifact discounts: 5% and 15%
> Effective discount: max(5%, 15%) = 15%
> Discount amount: 102 × 15 ÷ 100 = 15.3 Gold
> Price before rounding: 102 − 15.3 = 86.7 Gold
> Final price: max(1, round up(86.7)) = 87 Gold

### 27. Crimson Sword Charm (e15_crimson_sword_charm)

**Description:** Gain 2 Strength at the start of combat.
**Term hover:** Strength, Start of combat, Combat.
**Konteks contoh:** Strength before effect: 0.
**Semakan utama:** Stat gain only; do not invent Attack scaling formula.

**Paparan — Strength gained: +2 Strength**

> Crimson Sword Charm: +2 Strength
> Before: 0 Strength
> After: 0 + 2 = 2 Strength

### 28. Guardian's Armlet (e16_guardians_armlet)

**Description:** Gain 2 Agility at the start of combat.
**Term hover:** Agility, Start of combat, Combat.
**Konteks contoh:** Agility before effect: 0.
**Semakan utama:** Stat gain only; do not invent Defend scaling formula.

**Paparan — Agility gained: +2 Agility**

> Guardian’s Armlet: +2 Agility
> Before: 0 Agility
> After: 0 + 2 = 2 Agility

### 29. Gatekeeper Core (b01_gatekeeper_core)

**Description:** Gain 1 extra Energy at the start of each turn.
**Term hover:** Energy, Start of each turn, Turn.
**Konteks contoh:** Energy after the core turn reset is 3 in this example.
**Semakan utama:** Apply after core Energy reset; no Max HP penalty.

**Paparan — Energy gained: +1 Energy**

> Gatekeeper Core: +1 Energy
> Before: 3 Energy
> After: 3 + 1 = 4 Energy

### 30. Sovereign Grimoire Clasp (b02_sovereign_grimoire_clasp)

**Description:** Start each combat with 3 Strength and 3 Agility. From turn 2, gain 1 of each per turn, up to an artifact contribution cap of 6 for each stat.
**Term hover:** Strength, Agility, Start of combat, Combat, Turn, Artifact contribution cap, Each stat.
**Konteks contoh:** Turn 4; Clasp contribution reached 6. Charm +2 Strength and Armlet +2 Agility also owned.
**Semakan utama:** Cap each artifact contribution, not total stat.

**Paparan — Total Strength: 8 Strength**

> Clasp contribution by turn: 3 → 4 → 5 → 6
> Clasp contribution cap: 6 Strength
> Crimson Sword Charm: +2 Strength
> Total: 6 + 2 = 8 Strength

**Paparan — Total Agility: 8 Agility**

> Clasp contribution by turn: 3 → 4 → 5 → 6
> Clasp contribution cap: 6 Agility
> Guardian’s Armlet: +2 Agility
> Total: 6 + 2 = 8 Agility

**Aturan tambahan:** No new Clasp bonus after reaching +6; other sources still add.

### 31. Decklord's Hourglass (b03_decklords_hourglass)

**Description:** Draw 2 extra cards at the start of each turn.
**Term hover:** Draw, Hand, Draw Pile, Discard, Start of each turn, Turn.
**Konteks contoh:** After normal draw, Hand has 4 cards; two extra draws are possible.
**Semakan utama:** Apply extra draw after normal draw, every player turn.

**Paparan — Cards drawn: +2 cards**

> Decklord’s Hourglass: draw 2 extra card(s)
> Hand before effect: 4 cards
> Hand after effect: 4 + 2 = 6 cards
> Example assumes enough cards and room in Hand. Live results use the actual resolved draw count.

## 5. Glosari term — English untuk game

- **Artifact** (`artifact`; Game — hijau): An item that works automatically when its condition is met. It does not cost Energy to activate.
- **HP** (`hp`; Game — hijau): Your current health. At 0 HP, Alyssa is defeated.
- **Max HP** (`max_hp`; Game — hijau): The most HP Alyssa can have. Healing stops at this value.
- **Heal** (`heal`; Game — hijau): Restore missing HP, up to Max HP. The result shows the HP actually restored.
- **Damage** (`damage`; Game — hijau): Attack damage is reduced by the relevant defenses and Block before any remaining damage reduces HP.
- **Block** (`block`; Game — hijau): Temporary protection that absorbs incoming damage. Its reset follows the core combat rules.
- **Strength** (`strength`; Game — hijau): Increases damage from Attack cards. The exact card calculation follows the core combat rules.
- **Agility** (`agility`; Game — hijau): Increases the Block gained from Defend cards. The exact card calculation follows the core combat rules.
- **Energy** (`energy`; Game — hijau): Points used to pay the Energy cost of playing cards.
- **Focus** (`focus`; Game — hijau): Definition pending: this pack gives +1 Focus and refers to an existing cap, but does not define the ability or cap value.
- **Attack** (`attack`; Game — hijau): A card type used to attack enemies.
- **Defend** (`defend`; Game — hijau): A card type used to gain Block.
- **Skill** (`skill`; Game — hijau): A card type with a special effect, such as drawing or replacing cards. Read its description for the exact effect.
- **Passive** (`passive`; Game — hijau): A card type that gives buffs or ongoing effects as described on the card. It must still be played at its stated cost.
- **Draw** (`draw`; Game — hijau): Move cards from the Draw Pile into your Hand. The actual number follows the hand limit and available cards.
- **Hand** (`hand`; Game — hijau): The cards currently held for you to play.
- **Draw Pile** (`draw_pile`; Game — hijau): The pile from which you draw cards. Reshuffling follows the core game rules.
- **Discard** (`discard`; Game — hijau): The pile for played or discarded cards. These cards can re-enter the draw cycle under the core game rules.
- **Exhaust** (`exhaust`; Game — hijau): A separate pile for cards removed from the normal Draw and Discard cycle during this combat.
- **Gold** (`gold`; Game — hijau): Money used for purchases in the Shop.
- **Shop** (`shop`; Game — hijau): A dungeon location where you can buy the available goods with Gold.
- **Discount** (`discount`; Math — pink): A reduction in a purchase price. The final price uses the highest applicable artifact discount and rounds up to a whole Gold.
- **Turn** (`turn`; Game — hijau): One period in which the player or enemies act.
- **Combat** (`combat`; Game — hijau): One battle, from its start until victory or defeat.
- **Run** (`run`; Game — hijau): One dungeon attempt, from its start until victory or defeat.
- **First turn** (`first_turn`; Game — hijau): Only Alyssa’s opening turn in each combat.
- **Start of combat** (`combat_start`; Game — hijau): When a new battle begins, before the opening turn actions.
- **Start of each turn** (`start_turn`; Game — hijau): The beginning of each player turn. Apply core resets before the relevant artifact additions.
- **Once per turn** (`once_turn`; Game — hijau): This effect can activate only once in the stated turn, then becomes available for the next turn.
- **Once per combat** (`once_combat`; Game — hijau): This effect can activate only once in this battle. A new battle resets it.
- **When obtained** (`acquisition`; Game — hijau): Apply the effect once when this artifact is acquired in the run. Viewing the item again does not repeat it.
- **End Turn** (`end_turn`; Game — hijau): Finish the player’s turn. Unspent Energy checks happen before unused Energy is cleared.
- **Played card** (`played_card`; Game — hijau): A card successfully resolved from your Hand. Drawing, previewing, canceled cards and artifact retaliation do not count.
- **First Attack each turn** (`first_attack`; Game — hijau): Only the first eligible Attack card in this player turn receives this artifact bonus.
- **First Defend each turn** (`first_defend`; Game — hijau): Only the first eligible Defend card in this player turn receives this artifact bonus.
- **First Skill each combat** (`first_skill_combat`; Game — hijau): Only the first successfully resolved Skill card in this combat triggers this effect.
- **First Skill each turn** (`first_skill_turn`; Game — hijau): Only the first successfully resolved Skill card in this player turn triggers this effect.
- **First Passive each combat** (`first_passive`; Game — hijau): Only the first successfully resolved Passive card in this combat triggers this effect. Ultimate is not automatically Passive.
- **First Exhaust each combat** (`first_exhaust_combat`; Game — hijau): Only the first owned card that actually enters Exhaust in this combat triggers this effect.
- **First Exhaust each turn** (`first_exhaust_turn`; Game — hijau): Only the first owned card that actually enters Exhaust in this player turn triggers this effect.
- **At least** (`at_least`; Math — pink): The value must be equal to or greater than the stated number: ≥.
- **Or less** (`or_less`; Math — pink): The value must be equal to or smaller than the stated number: ≤.
- **d6** (`d6`; Math — pink): A six-sided die with possible results 1, 2, 3, 4, 5 and 6. Roll once for this combat. Fair-die probabilities require the random system to be confirmed.
- **Unspent Energy** (`unspent`; Game — hijau): Energy still left when you choose End Turn. One or more Energy triggers the same fixed Block bonus.
- **Fully blocked** (`fully_blocked`; Game — hijau): Block absorbs all the positive damage of one enemy hit. A zero-damage hit or canceled attack does not qualify.
- **Retaliation** (`retaliation`; Game — hijau): Damage sent back to the attacker by an artifact. It follows enemy damage reduction and does not count as an Attack card.
- **Once per turn cycle** (`cycle`; Game — hijau): At most once across one player turn and its associated enemy turn.
- **50% Max HP or less** (`hp_threshold`; Math — pink): At or below half your Max HP while still alive. This also checks if you start combat below half HP.
- **Discard by a card effect** (`effect_discard`; Game — hijau): A card effect moves a card from Hand to Discard. End Turn cleanup, played cards going to Discard and direct Draw Pile discards do not qualify.
- **Highest discount only** (`highest_discount`; Math — pink): Use the largest applicable artifact discount. Owning 5% and 15% gives 15%, not 20%.
- **Artifact contribution cap** (`cap`; Math — pink): A limit on this artifact’s own bonus. Bonuses from other sources can still increase the total.
- **Each stat** (`per_stat`; Math — pink): Apply the stated amount separately to every named stat. For example, +3 Strength and +3 Agility each get their own +3.
- **Percent (%)** (`percent`; Math — pink): A number out of 100. To find p% of a value, multiply that value by p and divide by 100.
- **Round up** (`round_up`; Math — pink): Use the smallest whole number that is not below the calculated price. Example: 86.7 Gold becomes 87 Gold.
- **Range** (`range`; Math — pink): In a die result such as 1–2, either 1 or 2 qualifies. The dash marks a range, not subtraction.

## 6. Tiga pusingan semakan

1. **Liputan:** 31/31 ID katalog, dengan 12 Starting, 16 Elite/Mystery dan 3 Boss. Setiap artifact dipetakan kepada term, contoh hasil dan aturan trigger.
2. **Matematik:** semakan healing/HP minimum, diskaun/pembundaran, ambang HP ganjil, sumbangan stat, bonus gabungan, bilangan trigger dan cabang dadu.
3. **Paparan:** hasil akhir berunit, label delta/total, term dan angka tidak bersarang, sumber contoh jelas dan aturan belum diketahui ditandakan. Ujian preview berasingan daripada ujian integrasi combat.
Bilangan semakan berprogram: 23. Semua lulus pada penghasilan draf ini.

## 7. Perkara yang perlu disahkan ketika integrasi

- Focus: fungsi, had dan peraturannya. Jangan gunakan teks sementara sebagai definisi pemain yang final.
- Rumus tepat Strength/Agility, reset Block/Energy, had Hand dan polisi overflow; tidak ditentukan oleh pakej artifact.
- Agihan dadu adil sebelum memaparkan kebarangkalian sebenar.
- Pengiraan sebenar mesti datang daripada hasil resolved core game, termasuk pengurangan damage musuh dan cap yang sah.
- Pemilikan artifact/trigger mengikuti V3.1 dalam ZIP untuk audit ini. Tiada polisi lain daripada perbualan lama digunakan untuk mengubah fail sumber.

## 8. Had pengesahan pratonton

Sintaks JavaScript disemak dan lulus. Browser headless tidak tersedia dalam persekitaran ini, jadi ujian hover/keyboard dan semakan visual browser belum dapat dijalankan. Tiada tuntutan ujian runtime combat dibuat.

## 9. Standard warna dan garis bawah — kemas kini 1.1

| Kategori | Warna pada latar gelap | Warna pada latar cerah | Garis bawah | Hover |
|---|---|---|---|---|
| Calculation | #B9A3E3 | #70528F | Bertitik | Sumber nilai dan cara kira |
| Term matematik | #E7A1C4 | #984669 | Putus-putus | Maksud matematik yang mudah |
| Term game | #9ED5B0 | #316A48 | Putus-putus | Maksud mekanik game |
| Teks biasa | Gaya game asal | Gaya game asal | Tiada tambahan | Tingkah laku asal |

- Warna hanya pada text token. Jangan warnakan seluruh description, label atau paragraph, dan jangan menukar warna frame kad Passive/Defend disebabkan kategori rich text.
- “Get a 15% discount in the Shop.”: Get a / in the / noktah menggunakan warna asal; 15% dan discount pink; Shop hijau.
- “50% Max HP or less”: 50% pink, Max HP hijau, or less pink. Gunakan token bersebelahan, bukan satu span pink yang meliputi keseluruhan frasa.
- “Artifact contribution cap”: Artifact ialah istilah game hijau; contribution cap ialah istilah matematik pink.
- Nilai akhir 87 dalam harga 87 Gold ialah calculation ungu; Gold ialah istilah game hijau. Faktor asal 15% dalam description ialah istilah matematik pink.
- Bahagian persamaan dalam tooltip calculation menggunakan ungu. Label penerangan dan sumber di luar persamaan ikut warna biasa. Heading tooltip term mengikuti warna kategori term.
- Tiada warna rich text pada nilai Pending atau label lain yang belum mempunyai hasil pengiraan sah.
- Senarai matematik: Discount, At least, Or less, d6, 50% Max HP or less (komposit), Highest discount only, Artifact contribution cap (komposit), Each stat, Percent (%), Round up, Range. Semua entri lain dalam glosari ini ialah istilah game.
- Untuk tema cerah, gunakan warna lebih gelap dalam keluarga warna sama bagi mengekalkan kontras. Nilai gelap/cerah ini ialah token rujukan; sahkan kontras pada permukaan sebenar game ketika integrasi.
- Semua 31 artifact mengekalkan angka, trigger dan aturan pengiraan versi audit sebelumnya. Kemas kini ini mengubah pengelasan dan presentation sahaja.
