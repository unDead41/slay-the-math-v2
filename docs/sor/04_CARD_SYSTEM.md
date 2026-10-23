# 04 — Sistem kad, deck, alias dan konsep Passive

Versi: 2.0.0. Kesan tempur aktif dan starter v1 diteruskan; label produksi diselaraskan kepada English. Nilai balancing kekal cadangan.

## Taksonomi

**CRD-01:** Jenis kad aktif ialah Attack, Defense atau Skill. Afiniti berasingan: Neutral atau Fire. ID sedia ada tidak ditukar kerana terjemahan.

**CRD-02:** Passive ialah keluarga visual cadangan dalam sheet, belum jenis aktif dalam starter/reward. Rarity, afiniti, topik dan jenis ialah dimensi berlainan.

## Starter — 12 salinan

| ID stabil | English | Jenis | Afiniti | Kos | Teks asas | Salinan |
| --- | --- | --- | --- | --- | --- | --- |
| tebas | Slash | Attack | Neutral | 1 | Deal 6 damage. | 5 |
| bara | Ember | Attack | Fire | 1 | Deal 6 damage. | 3 |
| benteng | Guard | Defense | Neutral | 1 | Gain 5 Block. | 2 |
| tarik | Draw | Skill | Neutral | 1 | Draw 2 cards. | 1 |
| tapis | Filter | Skill | Neutral | 1 | Set aside 2 cards from your draw pile until combat ends. | 1 |

Jumlah masih 8 Attack, 2 Defense, 2 Skill, 3 Fire. Lindung dan Benteng kedua-duanya alias kepada Guard/ID benteng; jangan menambah kad kerana nama gambar berlainan.

## Pool ganjaran tambahan

| ID | English | Jenis / afiniti | Kos | Kesan |
| --- | --- | --- | --- | --- |
| serangan_kembar | Twin Strike | Attack / Neutral | 2 | Deal 4 damage twice. |
| perisai_prisma | Prism Shield | Defense / Neutral | 2 | Gain 9 Block. |
| suluh | Glimmer | Skill / Neutral | 1 | Draw 1 card. Gain 1 Focus. |

Lapan definisi aktif, semuanya Common. Konsep Ward tidak termasuk pool ini.

## Filter dan cabutan

- **CRD-03:** Pilih tepat 2 instance draw pile, tanpa mendedahkan susunan.
- **CRD-04:** Selepas commit, draw pile tinggal ≥2 dan jumlah aktif ≥6. Aktif=hand+draw+discard+resolving; filtered tidak termasuk.
- **CRD-05:** Jika tidak sah, disabled dengan sebab; tiada kos dipotong.
- **CRD-06:** Kad ditapis kembali tersedia pada battle seterusnya; run deck tidak dipadam.
- **CRD-07:** Snapshot baharu mengikuti komposisi baharu; soalan selesai tidak dinilai semula.

Draw/Glimmer mengikuti shuffle [03](03_COMBAT_MECHANICS.md). Kad resolving tidak mencabut dirinya. Jika tiada kad, cabut yang tersedia; kesan Focus Glimmer masih berlaku. Tiada kad aktif menghasilkan tenaga atau kitaran percuma tanpa had.

## Upgrade

**CRD-08:** Maksimum satu upgrade setiap instance, tanpa mengubah jenis/afiniti/kos.

| Kad | Versi + |
| --- | --- |
| Slash+, Ember+ | 8 damage |
| Guard+ | 7 Block |
| Draw+ | Draw 3 cards |
| Filter+ | Kesan asas; gain 1 Focus selepas berjaya |
| Twin Strike+ | 5 damage twice |
| Prism Shield+ | 12 Block |
| Glimmer+ | Draw 2 cards; gain 1 Focus |

Bonus 1 Focus pada Twin Strike+ menambah 2 damage jumlah pada hit pertama: 7+5=12 sebelum Block.

## Konsep ungu dalam gambar

**CRD-09:** Gambar memaparkan Fokus, kos 1, Passive dan kesan gain 1 Block pada awal giliran. Catat sebagai konsep; jangan menyimpulkan ia sentiasa aktif, boleh stack tanpa had atau kekal selepas battle.

Nama English kerja: Ward. Resource Focus di HUD kekal Focus. Sebelum Ward aktif, tentukan kos pengaktifan, trigger selepas reset Block, tempoh, stacking, zon kad, luput dan save; kemudian uji dan rekod keputusan. Sehingga itu tiada Ward dalam starter, reward atau shop.

## Kontrak dan penerimaan

**CRD-10:** Nama/kesan di UI datang daripada data yang sama dengan resolver; tiada teks angka dalam bitmap art. Setiap instance ID unik dan alias tidak menduplikasi definisi.

Starter tetap 12, lapan definisi aktif, upgrade/resume kekal sah dan imej rujukan tidak mengubah statistik dengan sendirinya. Lihat [05](05_CARD_VISUAL_DESIGN.md).

## Hand capacity — 2.9.0

**CRD-11:** Every normal, card and artifact draw shares `DCConfig.HAND_LIMIT` (implementation baseline: 10). Check capacity before taking a card or shuffling. Unavailable capacity stops the requested draw; no excess card is discarded/exhausted and no extra RNG call occurs. A played Draw card frees its own slot before its effect. Report actual cards drawn and show Hand full when the request exceeds capacity.

Old overfull saves remain loadable: restore keeps the first 10 cards in Hand and places excess instances on top of Draw in their prior hand order. Preserve every UID, upgrade, RNG and locked Predict snapshot.


## Supplied 40-card mechanics and display — 2.18.0

The explicit request to apply the supplied 40-card package supersedes the earlier Passive exclusion and eight/twelve-card pool baseline. Current scope, stable-ID compatibility, base values/upgrade extension, transaction and rendering owners: [Cards and display 2.18.0](../CARDS_AND_DISPLAY_2_18_0.md). Source-authoritative mechanics remain playtest tuning.


## Passive and supplied audio — 2.20.0

The deck may own more than three Passives; only three may be active in combat. Fourth play requires choosing an outgoing active UID before payment. The outgoing physical card goes to Discard; inactive history preserves original timing/progress/trigger caps on reactivation. Source card definitions and upgrades remain authoritative. See [Passive and Music 2.20.0](../PASSIVE_AND_MUSIC_2_20_0.md).


## Combat balance experiment — 23 October 2026

CADANGAN: branch `balance/combat`, base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`, evaluates SOR Balance v1.2 through the real engine in an isolated Node loader. Candidate values are development-only; no player numeric data, loot/prices, IDs, artwork or questions are activated/changed. See [Combat/Card Synergy handoff](../balance/combat/SOR_COMBAT_CARD_SYNERGY.md), raw results and CSVs for measured context and limitations. Optional explicit-upgrade execution fields preserve existing definition fallbacks. Human full-run win targets remain unverified.
