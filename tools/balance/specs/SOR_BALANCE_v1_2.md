# SOR Balance & Difficulty — Slay the Math v1.2

Tarikh: **23 Oktober 2026 (Malaysia)**. Pemilik: **Ijamm**. Baseline disemak: main **v2.23.1**, commit `af12035acdb73e2345adc0e8e5c8a60fa4346dcb`.

## 1. Status dan skop

**DISAHKAN oleh arahan Ijamm:** audit kos Energy berbanding kesan setiap kad; audit nilai Focus; sertakan musuh, boss, buff/debuff, Passive, artifak, event, ekonomi, healing dan keseluruhan run. Tambah Easy dengan sasaran 90% murid menang, Medium 70%, Hard 50%.

**CADANGAN:** semua perubahan angka, formula dan profil dalam dokumen ini ialah calon untuk implementasi/playtest. Ia belum mengubah game. Tiada kadar menang murid atau simulasi engine sebenar dilaporkan oleh pakej dokumentasi ini.

**BAL-01:** Pemain menang apabila kedua-dua boss ditewaskan dalam satu run. Matlamat balance ialah beberapa binaan deck berdaya maju, kos dan manfaat boleh difahami, dan peningkatan kekuatan melalui keputusan yang jelas. Kesan yang lebih kuat memerlukan kos, setup, had, kelewatan atau Exhaust yang sesuai.

**BAL-02:** Kekalkan dua stage, sepuluh level setiap stage, satu musuh aktif setiap encounter, 40 kad dan ID/aset sedia ada. Soalan kekal 120 item/3 topik dan random tanpa pengulangan dalam run. Semua tiga difficulty menggunakan definisi kad/Focus yang sama; difficulty mengubah profil run secara terbuka.

### Pendekatan

| Pilihan yang dipertimbangkan | Kesan / tradeoff | Kedudukan |
|---|---|---|
| Tala multiplier musuh sahaja | Cepat, tetapi kad kurang berbaloi dan Focus tidak setara kekal | Tidak dipilih sebagai rancangan penuh |
| Tala kad/Focus dan profil keseluruhan run | Menangani punca kad, scaling, healing, ekonomi dan tempo; perlu integrasi lebih luas | **Cadangan penulis untuk memenuhi skop Ijamm** |
| Kesukaran berubah tersembunyi mengikut prestasi semasa | Mengaburkan kebolehbandingan seed dan sasaran kadar menang | Dikecualikan |

Pendekatan kedua ialah cadangan penulis; Ijamm belum memilih atau meluluskan setiap angka prototaip. Arahan Ijamm sudah mengesahkan keperluan tiga tahap dan sasaran kadar menang. Pakej ini mengemas kini spesifikasi, bukan kelulusan automatik nilai baharu.

## 2. Asas bersama dan perubahan yang perlu diberi perhatian

**BAL-03:** Energy asas 3/turn, draw asas 4, Hand 10, starter 12, Focus cap 3, satu Focus card/turn, tiga Passive aktif. Starter sama untuk semua difficulty: 3 Rune Strike, 3 Weak Point, 2 Rune Guard, 2 Flash Ward, 1 Quick Study, 1 Read Ahead. Tiada Passive dipasang percuma. Satu upgrade maksimum bagi setiap instance.

**Perubahan formula cadangan yang disengajakan:** Strength kini sekali setiap kad Attack, pada hit pertama yang resolved; Agility sekali setiap kad Defend, pada Block segera pertama. Dalam kod v2.23.1 Strength ditambah setiap hit dan Layered Shield boleh mendapat Agility pada kedua-dua pemberian. Penukaran ini perlu migration/versi balance dan ujian angka, bukan patch teks sahaja. Fixed Passive/retaliation tidak menerima kedua-dua stat.

**Perubahan semantik kad:** Deep Study menjadi 1 Energy/draw 3/Exhaust. Mana Reading menjadi 1 Energy/draw 2 sekarang +1 next turn/Exhaust, menggantikan X-all-Energy. Burning Page menjadi 0 Energy/Exhaust. Trigger/upgrade baharu hendaklah diimplementasi melalui execution-plan yang sama dengan preview dan tooltip. Versi asal disimpan dalam snapshot dan data current_values.

## 3. Tiga profil kesukaran

**BAL-04:** Difficulty dipilih sebelum New Run dan dikunci sepanjang run/checkpoint/retry. Default pemain baharu: Easy. Learn/Challenge kekal tujuan/aliran pembelajaran; Easy/Medium/Hard ialah difficulty berasingan. Jangan darab lagi modifier Learn lama 0.7 selepas profil difficulty. Sasaran 90/70/50 diukur pada Challenge penuh; Learn/Practice dilaporkan berasingan.

| Pemboleh ubah | Easy | Medium | Hard |
| --- | --- | --- | --- |
| Sasaran kemenangan murid | 90% | 70% | 50% |
| HP maksimum/mula | 75 | 60 | 55 |
| Gold mula | 100 | 80 | 70 |
| Focus mula setiap combat | 1 | 0 | 0 |
| Enemy HP × | 0.8 | 1 | 1.15 |
| Enemy Attack × | 0.7 | 1 | 1.15 |
| Enemy Block × | 0.75 | 1 | 1.1 |
| Defense adjustment | -1 | 0 | 0 |
| Bonus phase boss sebelum skala | 1 | 2 | 3 |
| Rage: setiap turn | 6 | 6 | 5 |
| Rage: tambah damage | 0 | 1 | 2 |
| Rest heal | 20 | 15 | 12 |
| Heal selepas Boss 1 | 20 | 12 | 8 |
| Gold Normal / Elite / Boss 1 | 30 / 50 / 75 | 25 / 40 / 60 | 22 / 36 / 54 |
| Harga Shop × | 0.9 | 1 | 1.1 |
| Event Gold reward × | 1.2 | 1 | 0.9 |
| Event Gold cost × | 0.8 | 1 | 1.1 |
| Event heal × | 1.25 | 1 | 0.8 |
| Event voluntary HP cost × | 0.6 | 1 | 1.2 |
| Event failure HP × | 0 | 1 | 1.25 |
| ME15 Max HP cost | 3 | 5 | 6 |
| Event time × | 2 | 1.5 | 1 |
| ME14 first-turn Energy loss | 0 | -1 | -1 |


Nilai Gold kemenangan dalam jadual ialah jumlah akhir dan tidak didarab sekali lagi oleh multiplier event. Stat kad, kos Focus, Hand cap dan ketepatan soalan sama pada semua tahap. HP mula ialah HP maksimum awal sebelum Ration atau pengorbanan Max HP. Focus mula diberi pada setiap combat sebelum bonus artifak, dihadkan kepada 3.

## 4. Nilai kad, Focus dan Upgrade — kesemua 40

**BAL-05:** Normal/Focus di bawah menunjukkan nilai asas tanpa Strength/Agility, status, artifak, musuh atau upgrade. `X` ialah baki Energy positif sebelum commit. Penilaian mengambil kira damage/Block efektif, kos satu kad dalam tangan, Energy tersisa, bilangan giliran sehingga manfaat dan ketersediaan syarat.

**BAL-06:** Kad bersyarat/hibrid dibandingkan ketika syarat gagal dan berjaya. Kad 0 Energy mesti mempunyai had nyata seperti Exhaust. Kad 2 Energy mesti memberi manfaat yang munasabah berbanding dua kad 1 Energy, dengan mengambil kira ia menggunakan satu slot Hand. Rarity menambah peluang mendapat kesan khusus; ia tidak membenarkan kad yang tiada kegunaan dalam model encounter semasa.

| Kad | Energy | Normal | Focus | Upgrade satu kali |
| --- | --- | --- | --- | --- |
| Rune Strike | 1 | 6 damage | 9 damage | Damage +3; Focus kekal +3. |
| Weak Point | 1 | 4 damage; kemudian Vulnerable 1 | 6 damage; kemudian Vulnerable 1 | Damage +2; bonus Focus kekal +2. |
| Scout Strike | 1 | 4 damage; draw 1 | 6 damage; draw 1 | Damage +2; draw kekal 1. |
| Return Strike | 1 | 5 damage; +3 jika hilang HP pada enemy turn terakhir | 8 damage; +3 jika syarat benar | Damage asas +3; bonus syarat kekal. |
| Sure Hit | 1 | 5 damage; abaikan Block | 8 damage; abaikan Block | Damage +2. |
| Twin Shot | 1 | 3 + 3 damage | 6 + 3 damage | Hit pertama +2. |
| Shield Shot | 1 | 5 damage; +3 jika mempunyai Block sebelum bermain | 8 damage; +3 jika syarat benar | Damage asas +2. |
| Crack Shot | 1 | Buang sehingga 4 Block musuh; kemudian 5 damage | Buang sehingga 4 Block; kemudian 8 damage | Damage +2; buang Block kekal 4. |
| Rune Sweep | 2 | 12 damage kepada setiap musuh hidup | 16 kepada sasaran utama; 12 kepada yang lain | Damage utama +3; musuh lain kekal 12. |
| Fate Storm | 2 | 3 hit rawak, setiap hit 5 damage | 9 + 5 + 5 damage | Hit pertama +3. |
| Rune Guard | 1 | 6 Block | 9 Block | Block +3. |
| Flash Ward | 0 | 3 Block; Exhaust | 5 Block; Exhaust | Block +1; kos kekal 0; Exhaust kekal. |
| Tower Shield | 2 | 14 Block | 19 Block | Block +3. |
| Ember Wall | 1 | 5 Block; Thorns 2 hingga enemy phase seterusnya tamat | 8 Block; Thorns 2 | Block +2; Thorns kekal. |
| Foreseen Guard | 1 | 4 Block; +4 jika intent mengandungi Attack | 7 Block; +4 jika syarat benar | Block asas +2. |
| Layered Shield | 1 | 4 Block sekarang; 3 Block pada awal giliran sendiri berikutnya | 7 sekarang; 3 kemudian | Block segera +2; pemberian tertunda kekal. |
| Burning Pages | 1 | 4 Block; draw 1 | 6 Block; draw 1 | Block +2; draw kekal. |
| Cinder Guard | 1 | 5 Block; Weak 1 pada musuh | 8 Block; Weak 1 | Block +2; Weak kekal 1. |
| Hold the Line | 2 | 12 Block; simpan sehingga 5 baki Block sekali | 16 Block; had simpanan 5 | Block +3; had simpanan kekal. |
| Mana Barrier | X | 7X Block; gunakan semua baki Energy positif | 7X + min(6, X+2) Block | Tambah 2 Block flat selepas 7X; tidak mengubah gandaan. |
| Quick Study | 1 | Draw 2 | Draw 3 | Draw asas +1; bonus Focus kekal +1. |
| Deep Study | 1 | Draw 3; Exhaust | Draw 4; Exhaust | Draw asas +1. |
| Mana Reading | 1 | Draw 2 sekarang; +1 draw giliran berikutnya; Exhaust | Draw 3 sekarang; +1 kemudian; Exhaust | Draw tertunda +1; Focus hanya draw segera. |
| Read Ahead | 1 | Lihat sehingga 3; ambil 1; susun baki di atas Draw | Lihat sehingga 5; ambil 1; susun baki | Had lihat asas +1; bonus Focus kekal +2. |
| Burning Page | 0 | Lihat calon; boleh ganti 1 kali; ambil 1; Exhaust | Boleh ganti sehingga 3 kali; ambil 1; Exhaust | Had ganti asas +1. |
| Clear Choice | 1 | Lihat sehingga 4; ambil 1; buang baki ke Discard | Lihat sehingga 6; ambil 1; buang baki | Had lihat asas +1. |
| Card Search | 1 | Pilih kategori; cari padanan pertama dalam sehingga 5 kad | Cari sehingga 7 kad | Had cari asas +1. |
| Recall | 1 | Ambil semula 1 kad Discard pilihan; Exhaust | Ambil semula 1; kemudian draw 1; Exhaust | Tambah draw 1 kepada versi biasa; Focus tambah 1 lagi. |
| Next Chapter | 1 | +2 draw pada giliran sendiri berikutnya | +4 draw pada giliran sendiri berikutnya | Draw asas tertunda +1. |
| Last Page | 1 | Draw 1; draw tambahan 2 jika tangan kosong selepas kad keluar | Draw 2; tambahan 2 jika syarat benar | Draw asas +1; bonus empty-hand kekal 2. |
| Blazing Spirit | 1 | +2 Strength selama aktif dalam combat | Tiada Focus | Sumbangan Strength +1; kos kekal 1. |
| Growing Flame | 1 | Selepas setiap 3 Attack selepas aktif: +1 Strength, maksimum +3 | Tiada Focus | Kira setiap 2 Attack; maksimum sumbangan +3 kekal. |
| Swift Step | 1 | +2 Agility selama aktif dalam combat | Tiada Focus | Sumbangan Agility +1; kos kekal. |
| Battle Rhythm | 1 | Selepas setiap 3 Defend selepas aktif: +1 Agility, maksimum +3 | Tiada Focus | Kira setiap 2 Defend; had sumbangan +3 kekal. |
| Rune Armor | 1 | +1 Defense selama aktif dalam combat | Tiada Focus | Tambahan 3 Block sekali pada pengaktifan pertama combat. |
| Lasting Shield | 1 | Simpan sehingga 4 baki Block setiap awal giliran | Tiada Focus | Had simpanan 5. |
| Grimoire Ward | 1 | Skill pertama selepas aktif setiap giliran: +3 Block fixed | Tiada Focus | Pencetus memberi 4 Block. |
| Ember Core | 1 | Selepas kad benar-benar guna Focus: 3 fixed HP damage | Tiada Focus | Damage pencetus +1. |
| Clear Mind | 1 | +1 draw setiap awal giliran bermula giliran berikutnya | Tiada Focus | Draw 1 sekali pada pengaktifan pertama combat. |
| Last Ember | 1 | Ketika hidup dan HP <=30%: +6 Block, +1 Focus, sekali/combat | Tiada Focus | Block pencetus +2; threshold dan Focus kekal. |


**BAL-07:** Tiada lagi blanket +3/+1 atau pengurangan satu Energy pada semua upgrade Passive. Setiap baris ialah kontrak upgrade tepat. Jika upgrade mengubah medan yang sama dengan Focus, kedua-duanya ditambah sekali; jika medan berbeza, kekalkan kedua-dua kesan berasingan. Contoh Rune Strike+ Focus = 6+3+3=12 sebelum stat/mitigation; Flash Ward+ Focus =3+1+2=6; Tower Shield+ Focus =14+3+5=22. Mana Barrier+ dengan X=2 dan Focus =14+2+4=20 sebelum Agility. Mana Reading+ Focus =draw 3 sekarang dan 2 kemudian.

### Focus

- Stok maksimum 3; kos 1; maksimum satu kad Focus setiap player turn. Toggle percuma; potong ketika kad layak commit.
- Bonus Focus datang daripada jadual setiap kad. +3 bukan lagi nilai universal; kad mahal/tertunda boleh mendapat bonus lebih besar, kad percuma/hibrid lebih kecil.
- Focus tidak mengubah Energy, Exhaust, jumlah hit, status, jumlah sasaran atau had carry kecuali jadual jelas menyatakan medan itu. Tiada bonus Focus untuk Passive.
- Passive tidak menghabiskan armed Focus. Bonus damage/Block tidak didarab dengan jumlah hit/giliran. Semak keberkesanan bonus sebelum bayar.
- Jika snapshot membuktikan bonus segera mustahil (Hand penuh, tiada calon tambahan), resolve Normal dan kekalkan stok/armed. Carian sah yang gagal selepas commit tetap membayar.
- Bagi bonus tertunda Next Chapter/Mana Reading, jangan jamin kapasiti masa depan. Bayar Focus apabila queue sah diwujudkan, simpan jumlah, patuhi hand cap ketika ia tiba, tiada refund akibat perubahan kapasiti kemudian.
- Upgrade dan Focus berasingan: gunakan Normal → satu upgrade yang disenaraikan → bonus Focus. Mana Barrier X menggunakan Energy sebelum payment, bukan selepas menjadi sifar.


## 5. Formula, buff, debuff dan timing

**BAL-08:** Bagi setiap hit Attack: jumlah asas + upgrade medan hit itu + bonus syarat + Strength sekali pada hit pertama kad + bonus artifak first-card sekali + Focus sekali + Vulnerable(2 jika ada) − Weak(2 jika ada). Clamp >=0; tolak Defense dan clamp; jika boss sealed, ceil(baki/2); serap Block; tolak HP. Jika Ignore Block, langkau Block sahaja. Boss sealed mempunyai lantai HP 1 sehingga dua seal dibuka. Hentikan baki hit/trigger apabila combat tamat.

**BAL-09:** Weak/Vulnerable masing-masing cap 3 stack. Satu stack digunakan oleh satu hit; Weak tetap digunakan apabila hasilnya 0. Reapplication menambah stack hingga cap dan mengemas kini expiry kepada akhir giliran pihak terjejas berikutnya, tanpa menambah duration berulang. Tick/expiry tidak berlaku akibat membuka tooltip. Papar nombor stack berasingan daripada baki turn. Defense mengurangkan setiap hit; Strength sekali per kad. Contoh Strength 2: Rune Strike 8; Twin Shot (3+2)+3=8. Defense 1 kemudian menghasilkan masing-masing 7 dan 6 sebelum Block.

**BAL-10:** Defend Block = asas/X + upgrade + Agility sekali + Focus pada pemberian pertama. Layered Shield kemudian memberi fixed 3 tanpa Agility/Focus/upgrade; snapshot disimpan ketika commit. Carry = min(baki Block, had tertinggi), bukan penjumlahan had. Lasting Shield biasa 4, upgraded 5; Hold the Line 5 sekali. Reset baki Block, kemudian queue Block yang due. Block tidak negatif.

**BAL-11:** Thorns daripada Ember Wall berjumlah +2 setiap kad, cap jumlah 6 sehingga enemy phase berikutnya tamat. Ia membalas setiap positive Attack hit yang bersambung walaupun diserap penuh, hanya ketika pemain masih hidup. Fixed HP damage mengabaikan Defense/Block, mengekalkan lantai HP boss sealed, tiada Strength/Weak/Vulnerable/Focus dan tiada recursion. Ember Core ialah once/turn selepas Focus benar-benar dibayar; tidak mencetus jika serangan sudah menamatkan combat. Semua status sementara reset pada combat baharu.

**BAL-12:** Draw/Exhaust/Discard/Passive bukan zon yang sama. Kad resolving tidak boleh mencabut atau memilih dirinya. Shuffle seeded hanya apabila perlu dan hanya kad Discard yang layak. Bounded choice tidak reshuffle di tengah sesi. Tangan penuh menghentikan draw tanpa memindahkan lebihan kad. Penambahan Energy daripada Abacus sekali/turn; Focus tidak memberikan Energy. Tiada loop yang mengulangi kos sifar, refund, exhausted card atau once/combat trigger tanpa batas.

### Passive dan pertumbuhan atribut

**BAL-13:** Had tiga ialah Passive aktif semasa combat; deck boleh memiliki lebih banyak. Hanya satu salinan card ID yang aktif serentak. Kad keempat memilih outgoing sebelum kos dibayar; cancel percuma. Outgoing ongoing stats dikeluarkan, resolved Block/damage/draw tidak ditarik balik. Sejarah aktivasi, progress dan trigger disimpan sepanjang combat. Reaktivasi tidak mengulangi hadiah activation/threshold atau mengira kad ketika tidak aktif. Trigger yang telah dicapai tidak reset melalui Recall, swap atau reload. Growing Flame/Battle Rhythm kira kad selepas aktivasi, cap sumbangan +3; peningkatan tidak mengubah hasil yang sudah resolved. Clear Mind/Rune Armor upgraded activation gift sekali per card ID per combat.

## 6. Musuh dan boss

**BAL-14:** Jadual ini menggantikan HP/pola baseline bagi **run baharu dengan balance v1.2**. Angka HP Elite sudah termasuk kekuatan tier; jangan tambah lagi legacy +10 HP/+2 damage. Enemy Defense baharu mesti disimpan dan dipaparkan, bukan hanya label UI. Gunakan ID yang sama dengan roster dan animasi sekarang.

| ID / musuh | Stage / tier | HP Medium | Defense Medium | Pola Medium sebelum phase/Rage | HP E/M/H |
| --- | --- | --- | --- | --- | --- |
| bat / Rune Bat | 1 / normal | 28 | 0 | 5×2 damage → 7 damage → Guard + 5 Block | 23/28/33 |
| wisp / Ember Mirror | 1 / normal | 30 | 0 | 6 damage → 8 damage → Guard + 7 Block | 24/30/35 |
| beetle / Prism Guard | 1 / normal | 34 | 1 | 6 damage + 3 Block → Guard + 9 Block → 9 damage | 28/34/40 |
| knight / Mirror Knight | 1 / elite | 54 | 1 | 9 damage → 5 damage + 6 Block → 13 damage | 44/54/63 |
| shard / Shard Beast | 1 / elite | 56 | 0 | 5×2 damage → Guard + 10 Block → 14 damage | 45/56/65 |
| weaver / Chain Weaver | 2 / normal | 44 | 0 | 8 damage → Guard + 9 Block → 11 damage | 36/44/51 |
| shade / Deck Guard | 2 / normal | 48 | 1 | 8 damage + 4 Block → Guard + 12 Block → 12 damage | 39/48/56 |
| mimic / Card Mimic | 2 / normal | 46 | 0 | 4×3 damage → Guard + 8 Block → 10 damage | 37/46/53 |
| golem / Chain Golem | 2 / elite | 70 | 2 | 11 damage → 6 damage + 10 Block → 15 damage | 56/70/81 |
| reaper / Rune Reaper | 2 / elite | 72 | 0 | 6×2 damage → Guard + 12 Block → 17 damage | 58/72/83 |
| sentinel / Twin Sigil Guardian | 1 / boss | 90 | 1 | 9 damage → Guard + 12 Block → 6×2 damage | 72/90/104 |
| dealer / Deck Lord | 2 / boss | 125 | 1 | 11 damage → 7 damage + 10 Block → 5×3 damage | 100/125/144 |


**BAL-15:** Pola ialah urutan berkitar dan intent dikunci sebelum tindakan pemain. `5×2` bermaksud dua hit bernilai 5, bukan jumlah 5. Block dalam intent diberi sebelum giliran pemain dan melindungi musuh sepanjang giliran itu; intent berikut menggantikannya. Guard-only kekal damage 0 walaupun Rage/phase aktif. Enemy Block tidak digandakan setiap render.

**BAL-16:** Skala HP/Block dengan ceil; damage setiap hit dengan round-half-up, minimum 1 bagi Attack positif. Defense = max(0, base+profile adjustment). Phase 2 sekali pada boss HP <=50% dan masih hidup; intent semasa kekal. Selepas intent terkunci itu selesai, intent seterusnya menerima bonus phase profil pada **base positive per-hit damage sebelum attack multiplier**. Rage = floor((turn−1)/rage_every_turns)×rage_damage_step, juga sebelum multiplier. Formula akhir per hit = max(1, roundHalfUp((base+phaseBonus+rage)×attackMultiplier)) untuk base>0. HP/Block tidak berubah kerana phase/Rage. Dua seal setiap boss; unassisted correct memberi Focus, guided correct masih boleh membuka satu seal. Bank exhausted mempunyai completion jelas/unscored yang membuka seal tanpa Focus supaya run tidak soft-lock.

**BAL-17:** Sasaran pemerhatian awal Medium: Normal 3–5 turn, Elite 5–8, Boss 7–10. Ini band saringan, bukan aturan yang memaksa fight berlarutan. Catat burst win/slow fight; jangan menambah HP tersembunyi untuk menghalang kombo sah. Stage 2 mesti diuji bersama hadiah Boss 1 dan semua route, termasuk route tanpa membeli artifak.

## 7. Kesemua 31 artifak

**BAL-18:** Jadual nilai calon di bawah lengkap bagi semua ID, termasuk yang dikekalkan. Nilai artifak sama pada semua difficulty. Kos peluangnya ialah pilihan hadiah, Gold dan syarat deck. Heal kemenangan mengikut angka artifak dan tidak menerima multiplier heal event. Pemilikan unik; semua once/turn/combat/acquisition mempunyai receipt.

| Artifak | Tier | Nilai semasa | Nilai cadangan |
| --- | --- | --- | --- |
| s01 / Emberheart Pendant | starting | heal=2 | heal=2 |
| s02 / Cinder Whetstone | starting | damage_bonus_per_card=1 | damage_bonus_per_card=2 |
| s03 / Prism Buckler | starting | block_bonus=2 | block_bonus=2 |
| s04 / Clairvoyance Lens | starting | focus=1 | focus=1 |
| s05 / Scholar's Bookmark | starting | draw=1 | draw=1 |
| s06 / Merchant's Seal | starting | discount_percent=5 | discount_percent=10 |
| s07 / Bronze Guard Pin | starting | block=3 | block=5 |
| s08 / Traveler's Ration | starting | max_hp=5, heal=5 | max_hp=5, heal=5 |
| s09 / Copper Purse | starting | gold=25 | gold=40 |
| s10 / Ember Quill | starting | draw=1 | draw=2 |
| s11 / Scribe's Pebble | starting | block=4 | block=4 |
| s12 / Initiate's Ring | starting | block=3 | block=5 |
| e01 / Copper Abacus | elite_mystery | cards_required=3, energy=1 | cards_required=3, energy=1 |
| e02 / Twin Sigil Medallion | elite_mystery | block=6 | block=4 |
| e03 / Chance Die | elite_mystery | sides=6, faces_1_2={'block': 10}, faces_3_4={'draw': 2}, faces_5_6={'energy': 2} | sides=6, faces_1_2={'block': 10}, faces_3_4={'draw': 2}, faces_5_6={'energy': 2} |
| e04 / Ember Balance | elite_mystery | min_unspent_energy=1, block=6 | min_unspent_energy=1, block=6 |
| e05 / Chainbreaker Clasp | elite_mystery | draw=1, block=4 | draw=1, block=4 |
| e06 / Ashen Phoenix Feather | elite_mystery | heal=5 | heal=4 |
| e07 / Rune-smith Tongs | elite_mystery | damage_bonus_per_card=3 | damage_bonus_per_card=3 |
| e08 / Sentinel Crest | elite_mystery | block_bonus=6 | block_bonus=4 |
| e09 / Mirror Knight's Brooch | elite_mystery | retaliation_damage=6 | retaliation_damage=4 |
| e10 / Rune Bat's Bell | elite_mystery | draw=1 | draw=1 |
| e11 / Scholar's Satchel | elite_mystery | draw=2 | draw=2 |
| e12 / Lantern Keeper's Flask | elite_mystery | hp_threshold_percent=50, block=12 | hp_threshold_percent=50, block=10 |
| e13 / Chain Weaver's Spool | elite_mystery | draw=1, block=3 | draw=1, block=3 |
| e14 / Bram's Contract | elite_mystery | discount_percent=15 | discount_percent=20 |
| e15 / Crimson Sword Charm | elite_mystery | strength=2 | strength=1 |
| e16 / Guardian's Armlet | elite_mystery | agility=2 | agility=1 |
| b01 / Gatekeeper Core | boss | energy=1 | energy=1 |
| b02 / Sovereign Grimoire Clasp | boss | initial_strength=3, initial_agility=3, strength_per_later_turn=1, agility_per_later_turn=1, max_artifact_contribution_each_stat=6 | initial_strength=2, initial_agility=2, strength_per_later_turn=1, agility_per_later_turn=1, max_artifact_contribution_each_stat=4 |
| b03 / Decklord's Hourglass | boss | draw=2 | draw=2 |


**BAL-19:** Strength/Agility daripada semua sumber ditambah dengan provenance, lalu digunakan sekali bagi kad layak. Clasp baharu menyumbang 2/3/4 pada turn 1/2/3+, cap 4 bagi setiap stat daripada dirinya. Kurangkan sumber tepat ketika consume/swap; jangan menghapus sumber lain. Gatekeeper +1 Energy/turn; Hourglass +2 draw/turn; pilihan boss ini perlu diuji bersama Clasp dalam cohort Stage 2. Boss artifacts hanya dijual di Shop Stage 2; slot Boss Stage 1 dikunci tanpa menggantinya dengan hadiah lain. Starting/Mid slots kekal 3/2.

**BAL-20:** Artifact yang memerlukan Passive layak apabila deck mempunyai Passive. Hand-discard artifact hanya layak apabila ada kesan kad yang benar-benar membuang **dari Hand**; Clear Choice/Burning Page membuang calon dari Draw dan tidak memenuhi syarat. End Turn discard tidak memenuhi syarat. Brooch memerlukan serangan positif selepas Defense yang diserap sepenuhnya oleh Block; Defense yang sendiri menjadikan hit 0 tidak mengaktifkannya. Brooch menggunakan mitigation biasa, berbeza daripada Thorns/Ember Core.

## 8. Ekonomi, hadiah, Rest dan route

**BAL-21:** Harga asas kad: Common 50, Uncommon 75, Rare 110 Gold; upgraded ×1.20. Harga artifak Starting/Mid/Boss 80/140/220. Removal kali ke-n dalam run: 50+15×(n−1), maksimum satu servis per Shop. minimum **10 kad dalam run deck** untuk Shop dan Mystery removal; ini menggantikan minimum 1 ME10. Ia tidak menghadkan saiz zon aktif ketika Exhaust/Passive dimainkan.

**BAL-22:** Shop masih 6 kad unik, tepat satu sale 60%, serta 3 Starting/2 Mid/1 Boss artifact slots dan tab Remove. Harga akhir = max(1, ceil(base×upgradeMultiplier×difficultyShopMultiplier×saleMultiplier×(1−bestArtifactDiscount))). SaleMultiplier=0.4 pada satu offer, 1 pada lain. Hanya ceil akhir; semua komponen dipratonton. Discount terbaik sahaja, tidak dijumlah. Perubahan harga selepas membeli discount artifact dikira bagi stok belum dibeli sahaja. Tawaran/sale ID tidak reroll melalui reload.

**BAL-23:** Tawaran kad distinct dan seeded; normal reward pilih satu daripada tiga atau Skip. Elite pilih satu daripada tiga upgraded atau Skip, kemudian hadiah artifak mengikut flow sedia ada. Boss 1: Gold, satu hadiah Boss eligible, heal profil dan checkpoint; tiada tambahan card reward baharu. Boss 2: kemenangan. Timbang rarity yang masih mempunyai calon, renormalize jika pool habis; jangan menduplikasi offer untuk mengisi ruang kosong.

| Pool | Common | Uncommon | Rare |
| --- | --- | --- | --- |
| normal_s1 | 70 | 25 | 5 |
| normal_s2 | 55 | 35 | 10 |
| elite_s1 | 35 | 50 | 15 |
| elite_s2 | 20 | 55 | 25 |
| shop_s1 | 55 | 35 | 10 |
| shop_s2 | 40 | 40 | 20 |


**BAL-24:** Rest menawarkan heal profil ATAU upgrade satu instance, satu pilihan sahaja; label Explore boleh mengekalkan arah seni/aliran sedia ada jika ia pemilik upgrade. Jangan memberi kedua-dua manfaat. HP heal dihadkan pada missing HP. Stage 1 clear heal sekali selepas boss reward sebelum checkpoint. Tiada heal selepas battle biasa kecuali sumber jelas seperti artifak.

**BAL-25:** Kekalkan generator map sepuluh level, Mystery level 5, Rest level 9, Boss level 10 dan kontrak path 3–5. Difficulty tidak menyembunyikan identiti node atau menukar seed selepas pilihan. Setiap pemain boleh memilih route tanpa Elite apabila graph yang disahkan menyediakan laluan itu; validator mesti mengesan graph yang mewajibkan Elite secara tidak disengajakan. Node, transaksi dan hadiah berlaku sekali. Skop map tidak diperluas oleh SOR balance ini.

## 9. Kesemua 15 Mystery events

**BAL-26:** Narrative, topic dan source question kekal. Angka Medium asal berikut ialah asas sebelum profil. Semua event optional, satu scored attempt; salah/timeout/abandon selepas mula menerapkan failure sekali selepas review. Boleh menolak trade selepas berjaya. Pembatalan sebelum start tiada penalti. More Hint/ulangkaji selepas keputusan tidak menghidupkan semula hadiah.

| Event | Topik | Success Medium asal | Failure Medium asal | Saat E/M/H |
| --- | --- | --- | --- | --- |
| ME01 / The Suspicious Chest | PROB | +40 Gold. | Lose up to 4 HP. No reward. | 60/45/30 |
| ME02 / The Ember Shrine | LOGIC | May pay 5 HP to upgrade one card. | Lose up to 2 HP. No upgrade. | 60/45/30 |
| ME03 / The Whispering Grimoire | SET | Choose one of up to three Skill cards for free. | The book closes. No card. | 90/68/45 |
| ME04 / The Cracked Mirror | LOGIC | May transform one card into a random card of the same category. | The mirror breaks. No change to your deck. | 90/68/45 |
| ME05 / The Forgotten Fountain | SET | Choose: heal 15 HP OR gain 25 Gold. | The fountain dries up. No reward. | 60/45/30 |
| ME06 / The Bound Collector | PROB | May trade one Starting artifact + 30 Gold for one random Elite/Mystery artifact. | The offer ends. No payment is taken. | 90/68/45 |
| ME07 / The Lost Scholar | LOGIC | Gain 30 Gold AND upgrade one chosen card. | No reward. Read the scholar's explanation. | 120/90/60 |
| ME08 / The Blind Oracle | PROB | Choose +2 Strength OR +2 Agility for the next combat. | The vision fades. No buff. | 60/45/30 |
| ME09 / The Broken Forge | SET | May pay 35 Gold to upgrade an Attack or Defend card. | The forge goes cold. No payment is taken. | 90/68/45 |
| ME10 / The Burning Archive | SET | Choose: remove one card OR gain 25 Gold. | Lose up to 3 HP. No reward. | 90/68/45 |
| ME11 / The Cinder Garden | PROB | Choose: heal 10 HP OR gain one random Starting artifact. | Lose up to 3 HP. No reward. | 90/68/45 |
| ME12 / The Fallen Adventurer | SET | Choose: 40 Gold OR one card from up to three offers. | The supplies turn to dust. No reward. | 120/90/60 |
| ME13 / The Echo Chamber | LOGIC | Banish the echoes without combat. Gain 40 Gold. | A Normal Enemy combat begins after the explanation. | 90/68/45 |
| ME14 / The Shattered Hourglass | PROB | Draw 2 extra cards on the first turn of the next combat. | Lose 1 Energy on the first turn of the next combat. | 120/90/60 |
| ME15 / The Dungeon Master's Bargain | LOGIC | May pay 5 Max HP for one random Elite/Mystery artifact. | The offer is withdrawn. No Max HP is lost. | 120/90/60 |


**BAL-27:** Pengiraan event: duration=ceil(baseSeconds×eventTimeMultiplier); Gold reward=floor(base×eventGoldRewardMultiplier); Gold cost=ceil(base×eventGoldCostMultiplier); heal=ceil(base×eventHealMultiplier), dihadkan missing HP; voluntary HP cost=ceil(base×eventHpCostMultiplier); failure HP=ceil(base×eventFailureHpMultiplier), nonlethal minimum HP 1. ME15 Max HP cost ialah 3/5/6 khusus, jangan darab multiplier HP lagi. Semua eligibility dikira menggunakan kos profil sebenar. ME10 hanya remove jika run deck selepas remove >=10; Gold alternative kekal. ME13 gagal memulakan tepat satu Normal combat mengikut profil semasa, hanya Normal rewards, tiada tambahan event Gold. ME14 penalty ialah 0/−1/−1 Energy pada turn pertama combat berikutnya sahaja dan base Energy selepas penalty tidak kurang 2; cap tidak memadam bonus positif artifak.

**BAL-28:** Kunci event ID, soalan, susunan jawapan, target, hasil transform, harga dan deadline sebelum tindakan yang berkaitan. Deadline sekali ketika scored question bermula; intro/claim review tidak memakan masa soalan. Hint tidak renew timer; reload tidak renew. Waktu Easy/Medium lebih panjang secara terbuka. Wrong-answer damage di luar combat nonlethal; Max HP trade juga memaparkan clamp dan minimum hidup. Jika tiada soalan eligible yang belum digunakan atau tiada pilihan sah, Continue tanpa caj/ganjaran; jangan recycle diam-diam.

## 10. Pembelajaran, fairness dan sasaran kadar menang

**BAL-29:** Semua difficulty menggunakan bank, jawapan dan random-unused selection yang sama. Difficulty tidak menukar ketepatan matematik, menipu draw/d6 atau memberi jawapan berbeza. Lifetime exposure berasingan daripada runUsedIds; New Run reset run exclusion; retry/checkpoint ialah run sama. Practice/tutorial tidak membayar hadiah. Satu first-try unassisted correct Predict memberi +1 Focus hingga cap; assisted/retry tidak memberi Focus. Tiada HP penalty langsung daripada salah Predict. Mystery ialah sistem scored/failure tersendiri seperti seksyen 9.

**BAL-30:** Sasaran bermaksud **peratus murid yang memenangi run penuh pada percubaan scored pertama selepas tutorial standard** dalam difficulty ditetapkan. Satu murid menyumbang satu keputusan kepada ukuran utama. Denominator merangkumi semua run layak yang dimulakan; defeat dan voluntary abandonment ialah kalah. Gangguan teknikal yang disahkan dilaporkan berasingan bersama bilangan dan sebab, bukan dibuang untuk menaikkan angka. Run pembangun, sandbox, import preset dan replay kemenangan dikecualikan. Repeat-play win rate ialah ukuran kedua yang dilabel berasingan.

**BAL-31:** Tugaskan difficulty secara seimbang antara kumpulan pengalaman/keupayaan awal, atau laporkan komposisi kohort. Jika murid sama menguji beberapa tahap, rekod urutan dan laporkan learning effect; jangan menyamakan Hard selepas latihan berulang dengan first exposure Easy. Gunakan ID peserta samaran/tempatan; tiada akaun/analitik jauh diwajibkan.

**BAL-32:** Easy 90%, Medium 70%, Hard 50% ialah sasaran kalibrasi, **bukan jaminan setiap 10 murid tepat 9/7/5 menang**. Julat pemerhatian awal ±5 mata peratus: 85–95/65–75/45–55. Laporkan n, menang, kadar, Wilson 95% CI, build, seed dan cohort. n=30/tahap untuk pilot; n>=100/tahap bagi validasi awal. n=100 tidak membuktikan ketepatan ±5 mata: contoh 90/100 → CI kira-kira 82.6–94.5%, 70/100 →60.4–78.1%, 50/100 →40.4–59.6%. Anggaran sampel untuk margin ±5 mata pada 95% sekitar 139/323/385 setiap tahap; ini anggaran perancangan, bukan jaminan precision/representativeness.

**BAL-33:** Gunakan status berasingan: Draft (dokumen), Implemented (engine/UI/save lulus), Pilot (data awal), Calibrated (kadar kohort hampir sasaran, ketidakpastian dan batas dilaporkan). Semasa calibrated, observed rate berada dalam band ±5 dan sasaran berada dalam Wilson CI; laporkan lebar CI dan jangan mendakwa toleransi ±5 pada populasi jika CI lebih luas. Ubah satu kumpulan nilai ketika kalibrasi, pin build baharu dan uji kohort/set seed seterusnya. Jika kadar terlalu rendah, semak punca kalah sebelum memilih HP/damage/recovery/cost untuk ditala. Jangan mengurangkan kesukaran setiap run secara tersembunyi untuk memaksa sasaran.

## 11. Matriks ujian dan penerimaan

**BAL-34:** Ujian kontrak engine meliputi 40×Normal/Focus/Upgrade/Upgrade+Focus, Energy 0/1/2/3/4, Strength/Agility 0/2/6/10, Weak/Vulnerable 0/1/3, Defense 0/1/2, Block 0/5/20, boss sealed/unsealed, target mati pertengahan multi-hit, Hand 8/9/10, draw kosong, Recall/queue/cancel/reload. Semak actual delta, kos dan receipt, bukan teks yang meniru formula sahaja. Uji boss half-HP transition dengan intent terkunci, Guard-only Rage=0 damage, multi-hit + Thorns/Defense dan Brooch tanpa Block.

**BAL-35:** Mulakan saringan dan bajet Lite CP-07–09: 40 kad, 780 pasangan berbeza +40 duplicate, pasangan berisiko terpilih dan beberapa triple. Kempen seeded lanjutan menggunakan engine sebenar boleh dinaikkan kepada 1,000 seed/tahap/build jika perlu. Gunakan set seed sama untuk A/B dan rekod RNG/polisi. Simulasi bot tidak menjadi dakwaan 90/70/50 murid. Tiada binaan sah mempunyai loop tindakan tanpa batas/soft-lock; saring pile kosong, Passive, duplicate, bank habis dan healing berulang.

**BAL-36:** Log tempatan minimum: balanceVersion, difficulty, seed, mode, pseudonymous participant/experience, result, turns/room, HP before/after, incoming raw/mitigated damage, Block created/used/wasted, Energy spent/unspent, Focus earned/spent/wasted, actual card draws, upgrade, rewards/offers/picks/skips, route, artifact triggers, event result/deadline, support usage, death cause dan technical exclusions. Raw time tidak digunakan untuk Rage. Soalan betul/Hint mesti dilapor supaya balance pemain yang menggunakan bantuan turut dinilai.

**BAL-37:** Ukuran card pick rate/Focus use bersyarat pada peluang ditawarkan/drawn dan keadaan syaratnya. Rarity rendah dengan sedikit exposure tidak dihukum hanya kerana kiraan kecil. Kad flagged apabila berulang kali kalah nilai kepada alternatif berkos sama dalam situasi yang sepatutnya sesuai; siasat lebih daripada satu archetype. Sasaran awal Focus: setiap kad eligible mempunyai sekurang-kurangnya satu situasi munasabah; tiada satu kad menjadi pilihan Focus wajib merentas kebanyakan deck.

## 12. Pemilik data, migration dan kerja pelaksana

**BAL-38:** Satu config balance versioned memegang profil, card definitions/upgrade/Focus, enemy definitions, artifact values, ekonomi dan event adapters. Renderer, preview, calculation hover, tooltip, resolver dan save validator membaca execution plan yang sama. Jangan mengubah fail master/aset asal tanpa provenance; gunakan overlay ber-ID dan import pipeline tunggal. JSON dalam pakej ini ialah **spesifikasi reka bentuk, bukan drop-in runtime data**. Pelaksana perlu menyediakan schema execution-plan bagi perubahan action/timing/stat budget.

**BAL-39:** Simpan balanceVersion/difficulty/profile snapshot dan enum stat-application dalam run serta checkpoint. Save v2.23.1 meneruskan nilai/timing asal sebagai legacy; jangan menukar kos kad atau stat ketika pending choice/Predict/battle. New Run menggunakan balance baharu selepas implementasi diluluskan. Migrasi data/validator bercabang menurut versi; jangan ubah ID atau mengira semula receipts lama dengan formula baharu. UI memaparkan difficulty dan versi balance sebenar. Keputusan latihan murid antara versi tidak digabung tanpa label.

**BAL-40:** Dokumen pemilik: 21 ialah spesifikasi tuning semasa; 03 combat/timing, 04 kad/upgrade, 07 musuh, 09 map, 12 ekonomi/targets, 19 artifacts, MYSTERY_EVENTS event. Keputusan/changelog merekod sumber arahan dan status CADANGAN. Arahan rich text terkini kekal warna sahaja (pink math, green game, purple calculation), tiada underline dekoratif. Perubahan balance tidak menggantikan artwork/audio/terjemahan atau isi soalan.

**Diserahkan kepada pelaksana:** bentuk dalaman adapter dan modul, strategi cache, UI control sesuai dengan reka bentuk sedia ada dan pilihan test fixtures. Peraturan angka, rounding, timing dan scope dalam SOR ini tidak diserahkan untuk diteka. Sebarang pembetulan selepas playtest mesti menaikkan versi tuning dan mengemas kini jadual serta data yang sama.

## 13. Bukti dan batas pakej

- Semakan sumber sebenar: repo main v2.23.1, 40 card IDs, 31 artifact IDs, 15 event IDs, 12 canonical enemy IDs dan owner SOR berkaitan.
- Pemeriksaan pakej: kelengkapan ID, jadual/data sepadan, jumlah rarity weights, skala difficulty monotonic dan contoh formula/rounding. Laporan sebenar dibekalkan selepas penjanaan.
- Belum dilaksanakan: perubahan gameplay, simulasi engine sebenar v1.2, pilot murid dan sasaran kemenangan. Tiada test lama dipersembahkan sebagai bukti balance baharu.
- MODEL.zip gagal tersedia dan tidak digunakan. Tiga PDF tersedia sebagai sumber projek, tetapi kandungan kurikulum tidak diaudit atau diubah oleh tugasan balance ini.

Sumber kod: https://github.com/unDead41/slay-the-math-v2/tree/af12035acdb73e2345adc0e8e5c8a60fa4346dcb

## 14. Combat Power individu, gabungan dan tawaran mengikut deck — tambahan v1.2

**DISAHKAN melalui arahan susulan Ijamm:** balancing juga merangkumi kad yang ditawarkan daripada Elite, Shop dan sumber lain; setiap kad memerlukan individual combat power dan combination combat power. Uji kombo yang mungkin terlalu kuat. Jika kos pengiraan tinggi, saringan dan sampling terhad memadai.

**CP-01 — Nama dan tujuan.** Pendekatan ini ialah *simulation-based game balancing*, analisis synergy dan aturan pemberat tawaran. Scaling ialah hubungan kuasa kad/deck dengan perkembangan musuh dan stage. Latihan LLM/RL tidak diwajibkan. Gunakan engine sebenar dan polisi tindakan yang boleh diulang untuk menilai hasil; penulis/LLM boleh membantu mencadangkan kes ujian dan membaca log. Model tidak mengubah game secara autonomi selepas setiap permainan murid.

**CP-02 — Individual Combat Power (ICP).** Simpan rekod setiap 40 kad: kos, damage efektif, Block yang benar-benar digunakan, draw yang berjaya dimanfaatkan, delay/setup, repeatability/Exhaust, syarat, Focus, upgrade dan hasil encounter. Angka dicatat mengikut difficulty, lawan, phase, deck, artifak, polisi dan seed. Satu skor tanpa konteks tidak mencukupi: kad defense bernilai berbeza pada intent Attack dan Guard; setup Passive bernilai berbeza pada fight 2 dan 8 turn.

**CP-03 — Skor utama dan kos peluang.** Jalankan encounter lengkap dan rekod win rate serta HP/turns. Calon fungsi ringkasan dalaman `U =100×I(menang)+20×(HP akhir/maxHP)−min(10,playerTurns/2)`. ICP ialah purata perubahan U apabila satu slot reference diganti dengan kad A dalam benchmark deck bersaiz sama. Ia unit relatif, boleh negatif, dan bukan rating universal 0–100. Ambil hasil selepas keputusan combat dan win-heal artifak yang sah selesai, sebelum room reward, hadiah/ heal Stage 1, Shop atau event; kekalkan HP/maxHP awal sama dalam variant. Loss menggunakan HP akhir 0. Nilai/proksi draw atau Block tidak ditambah lagi pada U selepas hasil encounter sudah mengira manfaatnya. Kekalkan laporan vektor supaya pilihan pemberat U tidak menyembunyikan kelemahan. Wajaran U ialah CADANGAN penulis untuk disemak, bukan fakta empirikal.

**CP-04 — Combination Combat Power (CCP) dan synergy.** Pin dua slot reference R1/R2 dalam deck benchmark: D00 = reference/reference; D10 = A/reference; D01 = reference/B; D11 = A/B. Semua variant mempunyai saiz deck sama, lawan/resources/artifak/seed/polisi yang sama. Kira `ICP(A)=mean(U10−U00)`, `ICP(B)=mean(U01−U00)`, `CCP(A,B)=mean(U11−U00)` dan **interaction surplus** `I(A,B)=mean(U11−U10−U01+U00)`. Positif bermaksud manfaat gabungan melebihi jumlah peningkatan individu dalam konteks itu. Uji juga urutan A→B dan B→A apabila legal; jangan membenarkan 4 Energy dalam turn 3 Energy tanpa sumber sebenar. Untuk duplicate A+A, perlu dua UID yang benar-benar dimiliki; Passive sama tidak boleh aktif serentak.

**CP-05 — Contoh tempatan tanpa dakwaan simulasi.** Pada musuh tanpa Defense/Block dan tanpa stat/Focus, Weak Point→Rune Strike memberi 4+(6+2)=12 damage serta menggunakan Vulnerable. Rune Strike→Weak Point memberi 6+4=10 damage dan meninggalkan satu Vulnerable untuk hit kemudian. Ini membuktikan urutan penting pada contoh satu turn; ia tidak membuktikan nilai satu run, kerana status baki mungkin berguna kemudian. Perbandingan mesti menggunakan horizon sama dan expiry sebenar.

**CP-06 — Nilai Focus marginal.** Banding polisi menggunakan satu Focus pada kad A dengan polisi menyimpan stok sama untuk pilihan layak terbaik berikutnya, dengan cap/satu penggunaan turn yang sama. Jangan menilai +3 damage seolah-olah sumber itu percuma atau menganggap +2 pilihan sentiasa lebih lemah daripada +3 damage. Rekod manfaat benar, ruang tangan, Energy tersisa, hilang peluang Focus dan nilai tertunda. Simpan empat keadaan Normal/Focus/Upgrade/Upgrade+Focus; tetapan ini meluaskan ruang ujian, bukan empat nombor yang dianggap sama.

**CP-07 — Skop saringan yang munasabah.** 40 kad menghasilkan C(40,2)=**780 pasangan berbeza tanpa mengambil kira urutan**; tambah 40 kes duplicate dua UID =820. Dua urutan bagi pasangan berbeza memberi 1,560 pasangan berurutan, sebelum konteks/upgrade/Focus. C(40,3)=9,880 triple berbeza. Pakej ini melakukan saringan **tag peraturan** bagi 820 spesifikasi pasangan sahaja dan menyediakan 40 rekod individu. `screen_priority` ialah keutamaan semakan, bukan combat power dan bukan bukti OP. Semua medan CP hasil engine kekal `null/UNMEASURED`. Tiada semua possible outcomes telah dicuba.

**CP-08 — Bajet Lite pilihan awal.** Mulakan 24 pasangan keutamaan tertinggi +6 pasangan kawalan seeded. Medium: 30×10 seed×4 variant factorial =1,200 encounter maksimum. Seterusnya 12 pasangan berisiko sama pada Easy dan Hard: 12×10×2×4=960. Lapan triple berisiko pada Medium dengan 8 variant factorial: 8×10×8=640. Jumlah saringan awal **2,800 encounter** sebelum cache; ini bukan 2,800 run kempen atau bukti kadar menang murid. Tambahan urutan, matchup, empat keadaan Focus/upgrade dan polisi dicatat sebagai batch berasingan. Jika perlu, bermula dengan batch pertama sahaja. Perluaskan kes meragukan kepada 50/100+ seed. Kempen 1,000 seed/tahap ialah pilihan ujian lanjutan, bukan prasyarat dokumen ini.

**CP-09 — Tiga kad dan artifak.** Pin tiga slot reference dan uji semua 8 variant D000..D111. `CCP(A,B,C)=mean(U111−U000)`. Interaksi ketiga tulen `IABC=mean(U111−U110−U101−U011+U100+U010+U001−U000)`. Jumlah synergy berbanding tiga individu `Stotal=mean(U111−U100−U010−U001+2U000)`; ini merangkumi pair interactions serta interaksi ketiga. Ambang siasatan >10 U CP-10 boleh dikenakan pada Stotal atau IABC dan direkodkan berasingan. Permutasi legal A/B/C ialah batch tambahan.  Triple ujian dipilih berdasarkan interaksi: Strength+multi-hit; Agility+Layered Shield; draw+kad percuma+Exhaust; selection+Attack mahal; Recall+Exhaust; Skill+Grimoire Ward; Focus+Ember Core; carry+queued Block. Artifak ialah modifier ujian tersendiri, terutama Clasp/Charm, Abacus, Gatekeeper, Hourglass, Brooch dan win-heal. Gabungan kad-artifak tidak diliputi sepenuhnya oleh 780 pasangan kad. Logging mesti menyatakan konteks artifak; tambah kes yang ditunjukkan oleh telemetry, bukan mendakwa seluruh ruang telah selesai.

**CP-10 — Bila kombo perlu ditala.** Synergy positif adalah manfaat membina deck. Flag untuk siasatan apabila manfaat luar biasa berulang merentas seed/deck/lawan dengan setup rendah, satu pilihan mendominasi hampir semua peluang sesuai, atau ada loop tanpa batas. Calon trigger siasatan: interaction surplus >10 U atau perbezaan kemenangan >15 mata peratus dalam sekurang-kurangnya dua konteks; ini ambang saringan penulis, bukan keputusan automatik. Sampel 10 seed masih exploratory. Semak CI, kos memperoleh/menyediakan kombo dan rare exposure sebelum mengubah angka. Pembetulan boleh pada kos, satu medan Focus, trigger cap, per-hit/per-card rule atau upgrade. Perubahan dimasukkan sebagai versi global untuk run baharu; jangan melemahkan kad yang sudah dimiliki ketika run berjalan.

**CP-11 — Tawaran mengikut sumber.** Starter ialah 12 kad tetap. Normal: tiga kad distinct, pilih satu/Skip. Elite: tiga upgraded distinct, pilih satu/Skip kemudian flow artifak. Shop: enam distinct dan satu sale seeded. Event ikut kategori/saiz tawaran sendiri, contohnya ME03 Skill-only. Rest/Explore yang hanya memberi heal/upgrade tidak mendapat random card-roll baharu. Boss 1 memberi artifak mengikut owner, bukan card-roll tambahan. Nilai CP dan eligibility artifak dianalisis berasingan.

**CP-12 — Sampel dua peringkat.** Pertama tapis eligibility kategori/ID mengikut sumber, kemudian pilih rarity mengikut jadual pool/stage BAL-23. Event card rewards (ME03/ME12) dan transform ME04 mewarisi normal_s1 atau normal_s2 mengikut stage. ME03 tapis Skill; ME04 tapis kategori yang sama dan kecualikan ID asal; result upgrade=0 dan disimpan sebelum confirmation. Semua artifact offers menggunakan uniform tanpa pengulangan dalam tier yang eligible/unowned, tanpa pemberat rarity kad atau duplicateFactor kad. Kemudian, bagi kad, renormalize jika rarity tiada calon. Kemudian pilih ID dalam rarity tersebut dengan `w=stageSuitability×(1+alphaDifficulty×supportScore)×duplicateFactor`. Selepas memilih, buang ID itu daripada offer dan ulang. Alpha Easy=0.25, Medium=0.15, Hard=0.10; supportScore 0..1 daripada capability sokongan yang benar-benar ada pada snapshot deck/artifak. Satu requirement dikira sekali: contohnya has-Block bagi Shield Shot, Skill untuk Grimoire Ward, Focus spender untuk Ember Core, atau Attack/Defend untuk sumber stat. Tag tema/warna tidak menghasilkan sokongan. Kad tanpa requirement mendapat supportScore=0. Rarity weights tidak ditukar diam-diam oleh jumlah kad dalam kategori itu.

**CP-13 — Had bantuan dan duplicate.** Setup Passive di sini ialah Growing Flame, Battle Rhythm, Lasting Shield, Grimoire Ward, Ember Core dan Clear Mind. Keenam-enam ID ini pada stage 1 level 1–4 menggunakan stageSuitability 0.85; stage 1 level 5–10 menggunakan 1.0; stage 2 menggunakan 1.10; kad lain 1.0. DuplicateFactor 1.0 jika tiada salinan, 0.65 jika satu, 0.35 jika dua atau lebih; Passive ID sama yang sudah dimiliki menggunakan 0.15. Ini faktor peratus relatif dalam rarity yang dipilih, bukan jaminan kad tertentu. Gunakan snapshot sebelum offer dijana. Simpan faktor/ID/receipt; menambah atau membuang kad tidak menukar offer yang sudah dibuka. Semua kad eligible kekal berpeluang positif; bantuan kecil memudahkan binaan tanpa melengkapkan kombo secara automatik.

**CP-14 — Definisi support dan data belum diukur.** Daftar requirement bagi calon: Shield Shot→has-Block; Blazing Spirit/Growing Flame→Attack; Swift Step/Battle Rhythm→Defend; Grimoire Ward→Skill; Ember Core→Focus spender; Lasting Shield/Hold the Line→Block; Recall→kad lain yang boleh masuk Discard; Last Page→kad 0 Energy atau draw/selection yang membolehkan urutan tangan; Card Search→kategori sasaran wujud. Untuk requirement OR, sekurang-kurangnya satu memenuhi satu requirement; jangan menghitung semua alternatif berulang. Capability dinilai daripada definisi deck dan artifak yang dimiliki, tidak melihat susunan Draw rahsia. Jika ukuran ICP/CCP belum ada, gunakan tag tetap ini; jangan menganggap `null` sebagai kuasa sifar. Penambahan weight berdasarkan skor CP terukur memerlukan versi formula seterusnya dan penilaian A/B, kerana angka itu bergantung konteks.

**CP-15 — Reproducibility dan RNG.** Card/Artifact offer menggunakan loot RNG stream berasingan daripada shuffle/combat dan question RNG, derived daripada seed+source+stage+node+ordinal dan disimpan. Pending offer tidak reroll. Input ke simulator/weight mesti sepadan balanceVersion; data legacy per-hit tidak digabung dengan data once/card. Cache key merangkumi seluruh deck/upgrade/artifak/profile/seed/lawan/polisi. Coverage report menyenaraikan apa yang disaring, disimulasikan dan belum diuji. Draw tempur tidak ditimbang mengikut CP; shuffle deck sedia ada kekal seeded. Soalan random/nonrepeat tidak diubah oleh model tawaran kad.

**CP-16 — Paparan dan semakan.** ICP/CCP ialah alat pembangunan dalaman; murid menerima kos/kesan/Focus/rarity/preview yang jelas. Engine sebenar ialah pemilik hasil; heuristik tag memilih kes ujian dan memberi sokongan tawaran terhad. Semak bahawa offer generation tidak meminta RNG/menjalankan combat di UI, dan pembelian/claim sekali sahaja. Sahkan histogram rarity, kategori, duplicate, sumber/stage, kadar pick serta kadar menang dengan/ tanpa weighted support dalam seed cohort sama. Kemudian semak semula sasaran Easy 90/Medium70/Hard50 melalui murid; bot kuat sahaja tidak mewakili murid.



**CP-17 — Penamatan simulator yang terhad.** Harness sahaja berhenti selepas 100 kitaran player/enemy lengkap, 500 committed card plays atau 10,000 langkah evaluator atomik, yang mana dahulu. Hasil menang/kalah yang sudah resolved pada langkah itu didahulukan. Encounter belum terminal diberi label BENCHMARK_LIMIT_CENSORED; U=-10 untuk bounded exploratory screen, dan HP sebenar tetap dilog berasingan. Kekalkan semua variant/kadar censored; jika mana-mana variant censored, tangguhkan ranking ICP/CCP akhir bagi perbandingan itu dan ulang dengan had lebih besar yang direkodkan atau selesaikan loop sebenar. Jangan buang variant censored daripada denominator saringan. Polisi/API tidak sah menghasilkan INVALID_POLICY_OR_ENGINE dengan skor null bagi paired case, bukan kekalahan pemain. Had ini tidak menghentikan game murid dan tidak dikira sebagai data kemenangan/kekalahan murid.

### Rujukan kaedah

- Volz, Rudolph & Naujoks (2016), *Demonstrating the Feasibility of Automatic Game Balancing*: https://arxiv.org/abs/1603.03795 — kajian tujuan simulation/deck-based untuk permainan Top Trumps; menyokong pendekatan umum, bukan ukuran Slay the Math.
- Dokumentasi algoritma OpenSpiel: https://openspiel.readthedocs.io/en/latest/algorithms.html — membezakan algoritma search/Monte Carlo daripada RL. Pakej ini tidak memasang OpenSpiel atau mendakwa MCTS/RL sudah digunakan.
