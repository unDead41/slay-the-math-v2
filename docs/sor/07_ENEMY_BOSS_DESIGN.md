# 07 — Reka bentuk musuh, boss dan intent

Versi: 2.0.0. HP/pola boss terdahulu diteruskan sebagai baseline; semua statistik baharu ialah cadangan playtest.

## Prinsip musuh

- **ENM-01:** Setiap musuh mempunyai siluet, peranan tempur dan satu idea pembelajaran yang jelas.
- **ENM-02:** Tindakan seterusnya dipaparkan sebelum pemain membuat keputusan. Tiada damage atau perubahan pola tersembunyi.
- **ENM-03:** Boss menggunakan hukum matematik yang sama dengan pemain. Kesukaran datang daripada kombinasi dan keputusan, bukan jawapan mengelirukan.
- **ENM-04:** MVP satu musuh setiap encounter. Multi-target ialah peluasan yang memerlukan kontrak kad/target baharu.

## Roster baseline

| ID | Stage | Nama | HP | Pola berulang |
| --- | --- | --- | --- | --- |
| cermin_bara | 1 | Cinder Mirror | 24 | Serang 5 → Perisai 4 |
| pengawal_prisma | 1 | Prism Guard | 30 | Serang 7 → Perisai 6 |
| penenun_rantai | 2 | Chain Weaver | 34 | Serang 8 → Perisai 5 |
| penjaga_deck | 2 | Deck Sentinel | 40 | Perisai 7 → Serang 10 |
| penjaga_dua_lambang | 1 | Twin Sigil Guardian | 70 | Rujuk pola boss |
| penguasa_deck | 2 | Deck Sovereign | 95 | Rujuk pola boss |

Pola bermula pada entri pertama dan kembali ke awal selepas entri terakhir. Semua nilai ini mesti diuji bersama heal, reward dan damage kad; ia belum terbukti seimbang.

## Pola boss

| Boss | Fasa 1 | Fasa 2 pada HP ≤50% |
| --- | --- | --- |
| Twin Sigil Guardian | Serang 8 → Perisai 8 → Serang 12 | Serang 10 → Perisai 10 → Serang 14 |
| Deck Sovereign | Serang 10 → Perisai 10 → Serang 14 | Serang 12 → Perisai 12 → Serang 16 |

Perubahan fasa mengikuti timing di [03](03_COMBAT_MECHANICS.md). Crossing threshold tidak membatalkan intent yang telah dipaparkan. Tiada serangan tambahan pada saat fasa berubah.

## Identiti dan kaitan pembelajaran

| Musuh | Siluet / visual | Fokus soalan |
| --- | --- | --- |
| Cinder Mirror | Roh nyalaan dalam bingkai cermin kecil | Afiniti Api sebagai subset Serangan |
| Prism Guard | Perisai geometri lebar, satu teras | Jenis Serangan/Perisai yang eksklusif |
| Chain Weaver | Bentuk tinggi dengan dua teras bersambung | Kebergantungan selepas hasil pertama |
| Deck Sentinel | Konstruk kad berlapis, bentuk bersegi | Bilangan hasil dan susutan ruang sampel |
| Twin Sigil Guardian | Dua lambang berputar; mahkota simetri | Gabungan dan persilangan |
| Deck Sovereign | Jubah/konstruk besar dengan orbit kad | Dua cabutan, penggantian dan perbandingan model |

Musuh tidak perlu memaparkan formula di badannya. Motif memberi identiti; teks soalan menerangkan maksud sebenar.

## Intent dan UI

Setiap intent memaparkan ikon, kata kerja dan nombor sebenar: “Serang 12” atau “Dapat 10 Perisai”. Jika kesan baharu ditambah, ia wajib disenaraikan sebelum commit; tooltip lore tidak mencukupi.

Panel boss menunjukkan HP, nama, fasa dan intent. Preview nombor mesti mengambil nilai daripada data yang sama dengan resolver.

## Seni dan animasi

Gunakan fantasi gelap dengan bentuk geometri dan lambang kebarangkalian. Boss lebih besar/kompleks, tetapi art tidak menutup HUD atau kad.

Set minimum: idle, attack, hit, defeated; boss menambah transition ringkas. Bagi aset statik, gerakan transform/VFX boleh menggantikan animasi rangka. Jangan mendakwa ilustrasi satu pose ialah sprite sheet.

**ENM-05:** VFX musuh berada di bawah layer teks/intent. Elakkan gore dan kejutan visual yang menutup keputusan pemain.

## Fairness dan penerimaan

- Kedua-dua boss boleh ditamatkan dengan starter + ganjaran munasabah.
- Salah Ramalan tidak menyebabkan HP dipotong secara langsung.
- Bos tidak menukar komposisi deck secara tersembunyi.
- Perbezaan fasa terbaca melalui pose/warna **dan** label.
- Kemusnahan, reward dan unlock berlaku tepat sekali.

Pola ini sengaja ringkas untuk MVP. Kebolehan unik tambahan perlu menjadi keputusan berasingan dengan telegraph, counterplay dan ujian risiko yang jelas.

## Penyelarasan dungeon dan Elite

**ENM-06:** Dungeon ialah arah environment; gunakan brass lusuh, batu, kulit, kristal dan lampu amber yang serasi dengan MC. Tiga topik ialah Probability, Expansion & Factorisation dan Indices; fokus Probability dalam jadual terdahulu ialah subfokus T1, bukan keseluruhan kurikulum.

| ID Elite | Stage | Label English | HP cadangan | Pola | Cue |
| --- | --- | --- | --- | --- | --- |
| elite_prism_warden | 1 | Prism Warden | 48 | Attack 9 → Gain 8 Block | elite_stage_1 |
| elite_chain_weaver | 2 | Chain Warden | 62 | Attack 12 → Gain 10 Block | elite_stage_2 |

**ENM-07:** Elite optional pada route bercabang; crest/siluet lebih kuat daripada musuh biasa, masih berbeza boss. Satu musuh aktif per encounter dikekalkan. Cue kedua-dua Elite mesti berlainan.

Motif T2/T3 boleh muncul pada art tetapi tidak memberi modifier tempur baharu tanpa definisi. Reward/Gold di [12](12_PROGRESSION_ECONOMY_BALANCE.md); routing di [09](09_WORLD_STAGE_LEVEL.md).


## Dungeon Edition 2.1 — current integration

The supplied Ember Mirror model and four action poses are connected to actual engine outcomes. Other roster models retain source identities and use CSS reactions; no unavailable dedicated action sheets are claimed. Details: ../DUNGEON_EDITION_2_1.md.

## Dungeon Edition 2.3 — supplied action sheets

The latest Finalize Design(2).zip now contains standing/model and Attack/Defend/Skill/Damaged sheets for Ember Mirror (wisp), Prism Guard (beetle), Rune Bat (bat), Mirror Knight (knight) and Polished Shard Beast (shard; existing gameplay label Shard Beast). These supersede the earlier statement that only Ember Mirror has dedicated source actions. Each action is a supplied key pose, not a claim of a full frame-by-frame animation. Rune Bat's additional animation pack is retained in the user's original ZIP; this release uses its action key poses. Stage 2 enemies and both bosses retain existing source models and outcome-driven CSS reactions. HP, intent patterns, encounter selection and loot are unchanged. All ground actors share a foot pivot and floor shadow. Bat and Ember Mirror retain their flying/flame anatomy and project a shadow onto that same floor.

## Latest override — Stage 1 animation pack v3, game 2.7.0

The supplied NORMAL ELITE ENEMY.zip replaces key-pose-only presentation for the five Stage 1 non-boss enemies with real frame sequences: `wisp` → Ember Mirror, `beetle` → Prism Guard, `bat` → Rune Bat, `knight` → Mirror Knight, `shard` → Shard Beast. All face left. One shared renderer/registration uses the accepted full cells and source FPS, without per-frame crop/recentering or duplicated padding frames. Details: SOR 11/14 and docs/STAGE1_ANIMATION_2_7_0.md. Existing IDs, HP, patterns, encounters, loot and both bosses remain owned by existing config/engine. Stage 2 legacy uses of an ID do not opt into a Stage 1 clip.

## Latest override — both-stage Normal/Elite motion, game 2.10.0

Ijamm requests motion for Normal and Elite enemies in both stages. The new Stage 1 ZIP contains the same 25 accepted sheets; preserve them. Stage 2 v2.1 adds `weaver` → Chain Weaver, `shade` → Deck Guard, `mimic` → Card Mimic, `golem` → Chain Golem and `reaper` → Rune Reaper. Each has five actions / 27 frames. Chain Golem's supplied correction faces left with `flipX=false`; do not mirror it again. Chain Weaver retains its floating anatomy. All 10 canonical non-boss encounters now animate; legacy cross-stage IDs and both bosses retain their existing renderer. Actual config still owns names, HP, patterns, encounters and loot. Presentation maps each resolved Stage 2 intent to Attack, Defend or Skill without changing its effects. Source/verification: [both-stage motion](../ENEMY_MOTION_2_10_0.md).


## Map, modes, Boss and Shop — 2.12.0

2.12 supersedes static Boss presentation: sentinel → Twin Sigil Guardian (Stage 1), dealer → Deck Lord (Stage 2), five clips/six frames each. Resolved intent cycles map Attack/Defend/Skill; actual hit/blocked reaction maps Damaged/Defend. HP, seals, patterns, damage, reward and phase timing remain unchanged.

## Boss size correction — game 2.13.2

Ijamm’s references image(20261022-063153).png and image(20261022-063228).png require both bosses to appear comparable in size to Alyssa, as in the normal encounter. Calibrate the visible padded artwork rather than source-cell dimensions; keep the original models, direction, source registration and arena floor. Implementation/evidence: [Boss size](../BOSS_SIZE_2_13_2.md).


## Combat balance experiment — 23 October 2026

CADANGAN: branch `balance/combat`, base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`, evaluates SOR Balance v1.2 through the real engine in an isolated Node loader. Candidate values are development-only; no player numeric data, loot/prices, IDs, artwork or questions are activated/changed. See [Combat/Card Synergy handoff](../balance/combat/SOR_COMBAT_CARD_SYNERGY.md), raw results and CSVs for measured context and limitations. Optional explicit-upgrade execution fields preserve existing definition fallbacks. Human full-run win targets remain unverified.


## Deep Combat/Synergy follow-up — 23 October 2026

DISAHKAN: Ijamm requests deep evolved-deck/Predict/setup/exploit/artifact-trigger testing. The development-only harness and measured handoff are in [Deep Combat report](../balance/combat/deep-results/DEEP_COMBAT_REPORT.md). Candidate Hard/growth risk requires Master review with Economy/Map; bot results are not student win rates. Production numbers, ID/assets/questions and Economy policy are unchanged by this follow-up.


## Master integration — game 2.27.0

The explicit Easy/Medium/Hard playtest now uses the integrated [Master SOR](23_MASTER_BALANCE.md). It supersedes the earlier integration gaps only for that versioned candidate. See [Master handoff](../balance/master/HANDOFF.md) for actual source/validation and unmeasured pupil targets; legacy entry and historical specialist evidence retain their own definitions.
