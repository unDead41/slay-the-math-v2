# 23 — Master balancing, game 2.29.0

Pemilik: Ijamm. Tarikh: 23 Oktober 2026. Branch pembangunan: `balance/master`; destinasi penerbitan yang disahkan: `main`.

**DISAHKAN:** Ijamm meminta Master membaca ketiga-tiga branch yang siap, menyiapkan integrasi dan push ke branch Master. Sasaran murid ialah Easy 90%, Medium 70%, Hard 50% untuk menang keseluruhan dua stage. Sasaran ini belum diukur melalui murid.

**DISAHKAN — penerbitan main:** Arahan susulan Ijamm meminta update ini dipush ke `main`. Terbitkan game 2.27.0 daripada Master `bd0c11d` di atas main `b67298b`, dengan pilihan balance playtest dan nilai calon yang sama. Arahan ini menggantikan had penerbitan branch sahaja; sasaran murid kekal belum diukur. [Rekod penerbitan dan semakan](../balance/master/MAIN_RELEASE_2_27_0.md).

**IMPLEMENTED / CADANGAN UNTUK PLAYTEST:** Binding semasa `master-1.3.0-candidate.3` menyatukan 40 kad, 31 artifak, 12 musuh, profil HP/Focus/serangan/Rage, ekonomi, Shop, loot dan 15 Mystery events, dengan pembetulan satu musuh MB-06. Nilai bukan pengesahan kadar kemenangan murid. [Bukti integrasi terdahulu candidate.2](../balance/master/HANDOFF.md) dan [semakan semasa](../balance/master/SINGLE_TARGET_2_29_0.md).

## MB-01 — Sumber dan pemilikan nilai

- Asas integrasi: main `b67298b` (Learning Report/analytics 2.26.0, artwork/motion daripada `7afb0aa` 2.25.1), Map `5480273`, Combat `1bf6632` (tree sama dengan sumber tempatan `68dce74`), Economy `df53579`.
- Nilai kad/artifak/musuh asas: [spec v1.2](../../tools/balance/specs/balance-spec.v1.2.json), dilaksanakan oleh `tools/balance/candidate.cjs`.
- Pilihan Master dan pelarasan profil: [config Master](../../tools/balance/master/config.json). Economic artifacts kini Seal 10%, Purse +40 Gold, Contract 20%; highest discount sahaja, round up sekali.
- `tools/build-master-balance.cjs` menjana `dist/balance-data.js`. Jangan sunting output itu untuk menala nilai. `dist/balance.js` ialah binding yang sama bagi browser dan loader Node.
- Rarity, support requirements, duplicate suppression, harga, removal dan transaksi event masih dimiliki [22](22_ECONOMY_REWARDS.md). Profil penuh dibekalkan oleh Master; jangan kenakan bonus Elite atau pengurangan Learn dua kali.

## MB-02 — Cara bermain dan save

New Run → pilih Easy / Medium / Hard dalam bahagian balance playtest. Direct entry: `?balance=easy`, `?balance=medium`, `?balance=hard`. Ketiga-tiganya menyediakan Predict, Hint dan Starting artifact melalui flow Challenge. Label playtest kekal jelas; tiada CP atau kadar kemenangan murid dipaparkan sebagai fakta.

Setiap profil menggunakan save key versi/profil tersendiri. `balanceState` menyimpan versi, difficulty dan hash definisi. `economyState.combatVersion` mesti sepadan. Restore menolak profil/versi lain; retry dan checkpoint Stage 2 mengekalkan binding. Nilai run yang sudah disimpan tidak ditukar secara senyap. Learn/Challenge sedia ada masih boleh digunakan melalui entry biasa; save sedia ada kekal pada key asal. Question history dan tetapan masih menggunakan pemilik asal.

## MB-03 — Combat dan penerangan

3 Energy, draw 4, Hand 10, Focus 3, satu Focus card setiap turn dan maksimum tiga Passive aktif. Kad sama bagi semua difficulty. Strength sekali bagi setiap Attack pada hit pertama; Agility sekali bagi setiap Defend pada immediate Block pertama. Upgrade menggunakan nilai eksplisit, termasuk activation gift/cadence Passive, tanpa blanket Energy discount. Once-per-combat/turn limits dan sejarah swap kekal. Layered Shield tidak menggandakan Agility pada Block tertunda. Mana Reading ialah 1 Energy, draw sekarang + draw giliran berikutnya, Exhaust. Deep Study juga Exhaust.

Enemy HP, multi-hit, Block, Defense, phase dan Rage menggunakan profil penuh. Kad dan artifak dipaparkan daripada nilai sebenar calon, termasuk timing dan upgraded activation gift. Tooltip Focus umum menerangkan bonus mengikut kad, bukan bonus rata +3 untuk semua kad. Artifak retaliation memerlukan positive Block yang benar-benar menyerap positive attack.

## MB-04 — Map, sumber tawaran dan ekonomi

Topology asal dikekalkan: dua stage, sepuluh level, Mystery 5, Rest 9, Boss 10. Tiada jaminan laluan bebas Elite baharu. Gunakan [Map SOR](../../modules/map/SOR/04_MAP_COMBAT_POWER.md) untuk definisi contextual map CP. `createReplay(runtime)` membolehkan replay menggunakan engine Master; default replay lama kekal menggunakan baseline lama bagi keserasian bukti sejarah.

Normal menawarkan tiga kad distinct; Elite menawarkan tiga upgraded distinct kemudian artifak. Shop menawarkan enam kad distinct/satu sale serta artifak mengikut tier. Stage 1 tidak menjual Boss artifact. Event/transform mengikuti source/category yang sah. Semua pending offers mempunyai receipt dan tidak reroll apabila deck berubah atau save dimuatkan. Combat draw order tidak ditimbang mengikut CP. Support weighting berasaskan keupayaan deck, bukan skor CP rekaan; CP belum diukur kekal `null` dalam receipt.

Rest menggunakan Heal atau Upgrade yang sudah wujud. `Explore` tidak ditambah kerana tiada definisi runtime yang disahkan. Boss 2 tidak memberi Gold yang tidak boleh digunakan selepas run. Wang, deck, upgrade, artifak dan HP dibawa melalui API sebenar; simulasi Master tidak memberi kemenangan combat secara paksa.

## MB-05 — Bukti dan had penerimaan

Ujian campaign memadankan seed merentas difficulty, dua route policies dan tiga Predict scenarios. Mystery/Starting gift/Shop/Rest/Boss dan carried HP benar-benar berlaku. Snapshot sumber, manifest dan raw gzip disimpan di `reports/master-balance`. Rujuk summary setiap cohort; jangan campurkan keputusan sebelum dan selepas pelarasan profil.

Semakan kuasa baharu meliputi kesemua 40 kad biasa/upgraded dalam konteks fight pendek dan Boss, sepuluh pasangan dan empat triad terpilih: 624 paired/factorial cases, 1,632 encounter. Tiada invalid/censored dalam cohort ini. ICP ialah delta utility terhadap penggantian Rune Strike dalam deck sama saiz. Pair CCP ialah empat-cell interaction; triad memisahkan third-order interaction dan total synergy. Nilai bukan rating universal atau peluang memperoleh kombo. Tiga seed setiap cell ialah saringan kecil; jump utility kerana loss bertukar win bukan bukti exploit. Jangan auto-nerf atau ubah loot berdasarkan ranking ini sahaja.

90/70/50, keseimbangan manusia bagi semua archetype, device sebenar dan semua kemungkinan combo kekal **PERLU_VERIFIKASI**. Bot tidak mewakili murid, sampel bersyarat bukan data manusia dan kemenangan ulang seed bukan pemerhatian bebas. Censor/invalid mesti dilaporkan berasingan daripada loss.

## MB-06 — Satu musuh, game 2.29.0

**DISAHKAN:** Ijamm meminta kesan AoE/random-enemy ditukar kepada satu sasaran dan hanya bahagian berkaitan diseimbangkan semula. Audit katalog mendapati Rune Sweep dan Fate Storm sahaja mempunyai sasaran tersebut. Fate Storm kekal tiga hit pada musuh sama; multi-hit tidak bermaksud multi-enemy.

**IMPLEMENTED / CADANGAN UNTUK PLAYTEST:** Rune Sweep 2 Energy, 12 damage, Focus +4, upgrade +3. Fate Storm 2 Energy, 5+5+5 damage; Strength, Focus +4 dan upgrade +3 pada hit pertama sahaja. Nilai Master ini kekal; dua kad dalam mode biasa diselaraskan kepada nilai sama. Bahagian AoE Rune Sweep dibuang, bukannya ditambah sebagai damage percuma. RNG sasaran Fate Storm dibuang. Semua 40 kad kini mempunyai kesan serangan/debuff kepada satu musuh; self effects dan random draw kekal mengikut fungsi asal.

Adapter semasa: `tools/cards/single-target.cjs`, sebelum `tools/import-cards.cjs` menjana runtime. Input pembekal kekal rekod sejarah. Receipt baharu merekod versi definisi; receipt lama mode biasa disemak dengan definisi asal dan tidak diselesaikan semula. Master menggunakan `master-1.3.0-candidate.3` dan save key baharu; save candidate.2 kekal tersimpan di key asal. Nilai 38 kad lain, enemy, artifak, harga, weighting loot, topology dan bank soalan kekal. [Bukti perbandingan dan semakan](../balance/master/SINGLE_TARGET_2_29_0.md). Bukti MB-05 di atas berasal daripada candidate.2, bukan hasil baharu candidate.3.
