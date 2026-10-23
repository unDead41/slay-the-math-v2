# SOR Audio v2 — Volume talking seragam dan kegunaan

SLAY THE MATH: DUNGEON OF CHANCE  
Versi 2.0.0 · 23 Oktober 2026 · Asia/Kuala_Lumpur · Pemilik: Ijamm

## 1. Apa yang sudah disiapkan

Permintaan Ijamm: semua talking mempunyai volume yang standard, setiap talking mempunyai tempat penggunaan yang jelas, dan ZIP dikemas kini untuk handoff.

Pakej ini mempunyai **49 talking yang telah dinormalkan dan diukur semula**, **8 BGM asal**, serta **49 salinan talking asal**. Jumlah aset aktif ialah 57; backup asal tidak dikira sebagai talking tambahan. Baca [standard volume](VOICE_VOLUME_STANDARD_v2.md), [jadual setiap fail](AUDIO_USAGE_v2.md) dan [manifest](audio-manifest.v2.json).

| Status | Makna |
| --- | --- |
| DISAHKAN | Semua talking diseragamkan dan kegunaan dipetakan seperti diminta Ijamm. |
| DITERUSKAN | Turutan Dungeon Master/Shop dan kontrak intro Mystery daripada SOR sumber yang disertakan. |
| CADANGAN | Nama hook, variasi shuffle-bag, priority, receipt, default mixer dan polisi integrasi yang belum dipasang ke game. |
| PERLU_VERIFIKASI | Audition manusia, sari kata tepat, sambungan loop BGM dan playback web/portable selepas integrasi. |

**AUD2-01:** Dokumen v2 dan manifest v2 ialah pemilik peraturan dalam pakej ini. Dokumen lama di `docs/audio/history/input_v1/` ialah rekod sumber; nilai volume, jumlah 15 audio atau hash lama di sana tidak menerangkan hasil v2 yang sudah dinormalkan.

**AUD2-02:** Pakej aset dan dokumentasi sudah disediakan. Kod game, branch GitHub, main, build portable dan save sebenar tidak diubah oleh tugasan ZIP ini. Kerja integrasi audio kemudian menggunakan branch `music` mengikut arahan terdahulu.

## 2. Standard volume untuk SEMUA talking

**AUD2-03 — DISAHKAN skop:** Gunakan standard yang sama bagi Alyssa, Merchant dan Dungeon Master, termasuk kesemua 15 dialog Mystery. Menetapkan slider yang sama sahaja tidak menyeragamkan loudness fail sumber.

| Ukuran | Standard pakej ini |
| --- | --- |
| Sasaran integrated loudness | **−18 LUFS** sebelum slider mixer |
| Toleransi penerimaan selepas MP3 | **±0.5 LU** daripada sasaran |
| Sasaran true peak semasa pemprosesan | −2 dBTP |
| Had true peak yang diterima selepas encoding | ≤ −1 dBTP |
| Output talking | MP3 stereo, 44,100 Hz |
| Playback rate | 1.0 |
| Clip gain lalai dalam game | 1.0 / unity |
| VO aktif serentak | Maksimum satu |
| Loop talking | Dimatikan |

Nilai −18 LUFS ialah pilihan engineering untuk standard projek ini, bukan angka yang pernah ditetapkan secara khusus oleh Ijamm atau dakwaan standard sejagat.

**AUD2-04 — Bukti:** Input talking berada antara **-26.54 hingga -10.11 LUFS**. Selepas pemprosesan dan ukuran semula, 49 output berada antara **−18.35 hingga −17.88 LUFS**, dan true peak tertinggi ialah **−1.77 dBTP**. Semua output lulus decode. Butiran setiap klip: [volume audit](volume-audit.v2.json).

FFmpeg loudnorm digunakan dalam dua pass. 27 klip menggunakan normalisasi linear dan 22 menggunakan mod dynamic untuk mencapai sasaran/peak. Output dienkod semula sebagai MP3; ia tidak didakwa sama bait atau tanpa perubahan dynamics. Pitch dan playback speed tidak diubah, tiada trim kandungan/senyap dibuat, dan beza durasi container setiap output tidak melebihi 0.1 saat. Semua sumber asal dikekalkan dalam `ORIGINALS/talking/`.

**AUD2-05:** Import talking daripada `MUSIC/`. Folder `ORIGINALS/talking/` ialah backup; jangan daftar kedua-duanya dalam pool runtime. Jangan tambah auto-gain atau normalisasi kedua yang tidak diperlukan pada klip yang telah diseragamkan ini. Volume/mute pengguna masih mesti dihormati.

Loudness yang hampir sama membantu konsistensi; ia tidak membuktikan semua timbre/emphasis kedengaran sama pada setiap speaker. Audition manusia masih perlu ketika integrasi.

## 3. Talking digunakan dekat mana

Nama hook ialah kontrak adapter yang dicadangkan, bukan dakwaan fungsi tersebut sudah wujud dalam game.

| Kumpulan / speaker | Klip tersedia | Trigger yang dicadangkan | Masa penggunaan |
| --- | ---: | --- | --- |
| Alyssa — soalan | 3 | `QUESTION_PANEL_VISIBLE` | Apabila panel soalan baharu sudah interaktif, sebelum pemain memilih jawapan. |
| Alyssa — Hint | 4 | `HINT_CONTENT_REVEALED` | Selepas Hint berjaya didedahkan kepada pemain, sekali bagi tahap Hint soalan itu. |
| Alyssa — More Hint | 4 | `MORE_HINT_CONTENT_REVEALED` | Selepas More Hint berjaya didedahkan; menggantikan talking Hint/soalan yang masih bermain. |
| Alyssa — Rest | 4 | `REST_ACTION_COMMITTED` | Apabila tindakan Rest yang dipilih pemain sudah sah/berjaya; bukan sekadar masuk node atau memilih Explore. |
| Alyssa — memilih kad reward | 8 | `CARD_REWARD_CHOICES_VISIBLE` | Semasa panel pilihan kad reward muncul, sebelum kad dipilih atau dituntut. |
| Alyssa — kalah run | 4 | `RUN_DEFEAT_ENTERED` | Sekali apabila run benar-benar masuk keadaan Defeat; bukan apabila jawapan salah atau terkena damage biasa. |
| Alyssa — masuk Mystery Event | 15 | `MYSTERY_INTRO_VISIBLE` | Selepas intro event yang sepadan kelihatan dan sebelum Start Challenge. |
| Dungeon Master — memilih artifact | 4 | `ARTIFACT_GIFT_CHOICES_VISIBLE` | Semasa panel hadiah artifact sebenar dibuka; ikut pertemuan 1–4. |
| Merchant — buka Shop | 3 | `SHOP_VISIT_VISIBLE` | Apabila memasuki lawatan Shop; ikut pertemuan 1–3 dan bukan setiap pertukaran tab. |

### 3.1 Soalan — 3 talking

**AUD2-06:** `question_talking_1–3.mp3` ialah suara Alyssa berfikir apabila soalan baharu muncul. Ia boleh dipakai pada Predict, trial artifact, trial Shop/Rest, soalan Mystery dan Practice jika panel itu benar-benar menggunakan aliran soalan.

Mainkan sekali selepas panel soalan dan jawapan sudah interaktif. Jangan tunggu talking tamat untuk membenarkan menjawab. Tukar pilihan jawapan, tooltip, bahasa atau render semula tidak mengulang talking. Fail ini tidak digunakan sebagai suara “jawapan betul/salah”; klip khusus untuk kedua-dua hasil itu belum dibekalkan.

### 3.2 Hint — 4 talking

**AUD2-07:** `hint_talking_1–4.mp3` dimainkan **selepas kandungan Hint berjaya dipaparkan**. Menekan butang disabled atau tindakan yang tidak mendedahkan Hint tidak memainkan suara. Hanya first reveal bagi Hint soalan itu mencipta automatic request; membuka semula teks Hint yang sama atau double-click tidak mencipta request baharu.

Hint menghentikan voice berfikir soalan yang masih bermain. Membaca Hint tidak ditahan untuk menunggu audio.

### 3.3 More Hint — 4 talking

**AUD2-08:** `more_hint_talking_1–4.mp3` dimainkan selepas More Hint berjaya didedahkan, apabila mekanik semasa membenarkan tahap itu. Jangan memainkan More Hint kerana jawapan salah semata-mata. More Hint menggantikan voice Hint/soalan yang belum tamat; tiada queue dua voice.

### 3.4 Rest — 4 talking

**AUD2-09:** `resting_talking_1–4.mp3` ialah reaksi selepas tindakan **Rest** yang dipilih pemain disahkan/berjaya. Tidak digunakan semata-mata ketika masuk node Rest, memilih Explore atau menutup tooltip.

Jika Rest memerlukan soalan prasyarat, voice Rest menunggu kejayaan tindakan Rest itu, tanpa memberi heal lebih awal. Jika host terus kembali ke Map selepas tindakan, reaksi Rest boleh hidup sepanjang transisi Rest→Map bagi receipt yang sama sahaja. Masuk battle, soalan baharu atau Main Menu membatalkannya. Ini bukan talking peta generik.

### 3.5 Pilihan kad reward — 8 talking

**AUD2-10:** `select_card_reward_talking_1–8.mp3` dimainkan semasa **panel pilihan kad reward mula kelihatan, sebelum memilih kad**. Gaya rakaman dimaksudkan gembira/teruja sambil memilih. Jangan ulang pada hover, pilih kad sementara, menatal atau render semula. Jangan gunakan sebagai greeting Shop atau pengesahan kad sudah dibeli.

Permintaan terdahulu mempunyai 10 skrip, tetapi ZIP sumber ini hanya mengandungi rakaman **1–8**. Jangan cipta rujukan fail 9/10 yang tiada. Pakej ini tidak menjana suara baharu.

### 3.6 Kalah run — 4 talking

**AUD2-11:** `if_lose_a_run_talking_1–4.mp3` dimainkan sekali apabila run benar-benar masuk **Defeat**. Batalkan talking lama dan pilih satu klip kalah. Jangan gunakan pada setiap damage, HP rendah, jawapan matematik salah atau kekalahan simulasi dev yang bukan run sebenar. Replay manual tidak mengubah keputusan run.

### 3.7 Mystery Event — 15 talking khusus

**AUD2-12:** Semua rakaman event ialah **Alyssa memberi reaksi kepada event**, termasuk “The Dungeon Master’s Bargain”. Fail ME15 bukan suara Dungeon Master ketika hadiah artifact. Pemetaan ME01–ME15 diteruskan daripada dokumen Mystery yang terdapat dalam ZIP sumber.

| ID | Event | Fail talking dalam pakej | Penggunaan |
| --- | --- | --- | --- |
| ME01 | The Suspicious Chest | `MUSIC/event_talking/The Suspicious Chest.mp3` | Alyssa semasa intro event ini |
| ME02 | The Ember Shrine | `MUSIC/event_talking/The Ember Shrine.mp3` | Alyssa semasa intro event ini |
| ME03 | The Whispering Grimoire | `MUSIC/event_talking/The Whispering Grimoire.mp3` | Alyssa semasa intro event ini |
| ME04 | The Cracked Mirror | `MUSIC/event_talking/The Cracked Mirror.mp3` | Alyssa semasa intro event ini |
| ME05 | The Forgotten Fountain | `MUSIC/event_talking/The Forgotten Fountain.mp3` | Alyssa semasa intro event ini |
| ME06 | The Bound Collector | `MUSIC/event_talking/The Bound Collector.mp3` | Alyssa semasa intro event ini |
| ME07 | The Lost Scholar | `MUSIC/event_talking/The Lost Scholar.mp3` | Alyssa semasa intro event ini |
| ME08 | The Blind Oracle | `MUSIC/event_talking/The Blind Oracle.mp3` | Alyssa semasa intro event ini |
| ME09 | The Broken Forge | `MUSIC/event_talking/The Broken Forge.mp3` | Alyssa semasa intro event ini |
| ME10 | The Burning Archive | `MUSIC/event_talking/The Burning Archive.mp3` | Alyssa semasa intro event ini |
| ME11 | The Cinder Garden | `MUSIC/event_talking/The Cinder Garden.mp3` | Alyssa semasa intro event ini |
| ME12 | The Fallen Adventurer | `MUSIC/event_talking/The Fallen Adventurer.mp3` | Alyssa semasa intro event ini |
| ME13 | The Echo Chamber | `MUSIC/event_talking/The Echo Chamber.mp3` | Alyssa semasa intro event ini |
| ME14 | The Shattered Hourglass | `MUSIC/event_talking/The Shattered Hourglass.mp3` | Alyssa semasa intro event ini |
| ME15 | The Dungeon Master's Bargain | `MUSIC/event_talking/The Dungeon Master’s Bargain.mp3` | Alyssa semasa intro event ini |

Mainkan pada intro event yang sepadan selepas intro visible, sebelum Start Challenge. Claim satu key `run:node:eventId:intro` sebelum menjadualkan voice. Rerender, reload, pertukaran bahasa dan kembali tab tidak mengulang automatic entry voice yang sudah dikendalikan. Replay manual hanya semasa intro.

Start Challenge atau Leave membatalkan entry voice dahulu. Voice tidak memulakan soalan/timer secara automatik; pemilik soalan mengekalkan timing semasa. Cadangan inherited: delay 200 ms selepas intro visible, deadline mula 2,000 ms, watchdog durasi klip + 2,000 ms. Deadline mula tidak memotong voice yang telah mula.

### 3.8 Dungeon Master — 4 talking ikut pertemuan

**AUD2-13:** `dungeon_master_when_selecting_artifact_talking_1–4.mp3` mengikut pertemuan 1→2→3→4. Gunakan pada panel **hadiah artifact sebenar** bagi Starting, Elite, Mystery atau Boss, bukan hanya `scene === master`. Jangan panggil semasa inventory artifact, tooltip, trial pendidikan selepas Claim atau pembelian artifact dalam Shop.

Cadangan diteruskan daripada SOR v1: kiraan per run merentas stage, satu nombor bagi satu offer source, selepas had ulang klip 4. Membuka semula offer pending yang sama boleh memainkan ID voice yang sama sekali bagi pembukaan itu; jangan menaikkan nombor. Kesesuaian mengulang rakaman terakhir memerlukan audition.

### 3.9 Merchant / Shop — 3 talking ikut pertemuan

**AUD2-14:** `merchant_when_open_shop_talking_1–3.mp3` digunakan pada lawatan Shop 1→2→3, dengan cadangan ulang klip 3 selepas had. Kiraan Shop berasingan daripada Dungeon Master dan merentas stage dalam run sama.

Satu node Shop ialah satu encounter. Cards, Artifacts dan Remove ialah tab lawatan yang sama; tukar tab, beli barang atau keluarkan kad tidak mencipta greeting baharu. Continue ke Shop pending boleh mengulang ID sama tanpa increment. BGM Shop tidak restart kerana tab bertukar.

## 4. Variasi, receipt dan non-repeat

**AUD2-15 — CADANGAN:** Pool soalan, Hint, More Hint, Rest, reward kad dan Defeat menggunakan shuffle bag yang berasingan. Gunakan setiap klip pool sebelum mengocok semula; cegah klip terakhir kitaran terus menjadi klip pertama kitaran baharu. Dengan pool finite, ini bermaksud non-repeat sehingga satu kitaran habis, bukan janji tiada pengulangan selama-lamanya.

Mystery menggunakan klip fixed berdasarkan event ID. Dungeon Master dan Merchant menggunakan urutan pertemuan, bukan random.

**AUD2-16 — CADANGAN:** Gunakan RNG audio sendiri. Jangan gunakan RNG soalan, reward, kad, artifact atau peta untuk memilih variasi suara. Pilihan voice tidak mengubah soalan yang muncul atau hasil gameplay.

**AUD2-17 — CADANGAN receipt:** Bekukan voice ID pada event/receipt yang sah sebelum playback. Key mesti membezakan run/session, question encounter/attempt, question ID dan tier Hint; bank question ID sahaja tidak cukup untuk Practice atau dev.

Simpan metadata kecil seperti key, voice ID, counter/bag audio dan handled status. Jangan serialise AudioContext, media node, buffer atau timer. Run baharu reset sejarah voice run; tetapan volume/mute profil kekal. Practice/dev mempunyai session sendiri dan tidak menulis sejarah run sebenar.

Hint dan More Hint ialah key tier yang berlainan. Jika request sudah dikendalikan ketika muted atau dibatalkan, unmute tidak membangkitkan greeting/hint lama. Replay manual, jika tersedia, memainkan ID sama tanpa increment.

## 5. Satu voice bus, mixing dan priority

**AUD2-18 — CADANGAN:** Seluruh game menggunakan satu coordinator VOICE bagi ketiga-tiga speaker. Maksimum satu talking aktif. Pertukaran surface membatalkan request lama sebelum menilai priority surface baharu.

| Jenis voice | Priority cadangan |
| --- | ---: |
| Defeat | 100 |
| Hint / More Hint | 80 |
| Dungeon Master / Merchant | 70 |
| Intro Mystery | 60 |
| Reward kad / hasil Rest | 50 |
| Berfikir pada soalan | 40 |

Priority tidak membenarkan talking scene lama mengekalkan kawalan setelah pemain keluar. More Hint menggantikan Hint. Defeat menghentikan talking sebelumnya. Request lama yang decode lewat tidak boleh masuk pada soalan/scene baharu.

**AUD2-19 — CADANGAN mixer seragam:**

- `effectiveVoice = masterVolume × voiceVolume × clipGain`.
- Default Master 1.0, Voice 0.85, clipGain 1.0 untuk semua 49 klip.
- Default Music 0.45 dan SFX 0.65 boleh diteruskan; sliders tetap pilihan pengguna.
- Ketika voice benar-benar mula, BGM diturunkan kepada **0.30 × volume Music pilihan pengguna**, attack 150 ms.
- Tamat/cancel/skip/error melepaskan duck milik request; release 350 ms.
- Gunakan faktor minimum jika Voice dan Predict sama-sama meminta duck. Jangan darab dua faktor duck.
- Cancel voice dengan fade 80 ms. Talking tidak loop. Playback rate semua klip 1.0.
- Nilai duck 0.30 v2 mengatasi contoh 0.35 dalam dokumen Mystery lama untuk integrasi pakej ini.

**AUD2-20:** Master mute, jika disediakan, meliputi Voice/Music/SFX. Voice mute hanya mematikan talking. Unmute tidak auto-replay request yang sudah dikendalikan. Callback ended lama tidak boleh memulihkan volume, menghentikan voice baharu atau melepaskan duck token orang lain.

Hidden page membatalkan voice dan request pending. Show semula tidak autoplay talking lama. Jika autoplay disekat, hanya request surface semasa boleh menunggu gesture dalam deadline; Start/Leave mesti membatalkan request dahulu.

## 6. Lapan BGM dan audio yang belum ada

| Fail asal dalam MUSIC/ | Digunakan pada |
| --- | --- |
| `combat_boss_stage_1_bg.mpeg` | Battle Boss Stage 1 |
| `combat_boss_stage_2_bg.mpeg` | Battle Boss Stage 2 |
| `combat_normal_elite_stage_1_bg.mpeg` | Battle Normal dan Elite Stage 1 |
| `combat_normal_elite_stage_2_bg.mpeg` | Battle Normal dan Elite Stage 2 |
| `merchant_or_shop_bg.mpeg` | Shop, semua tab dan kedua-dua stage |
| `rest_site_bg.mpeg` | Rest Site, kedua-dua stage |
| `when_lose_current_run.mpeg` | Skrin Defeat / kalah run |
| `when_open_map_bg.mpeg` | Peta / pemilihan laluan, kedua-dua stage |

Normal dan Elite berkongsi satu track bagi stage sama, berdasarkan nama fail yang dibekalkan. Semua 8 BGM kekal sama bait; tugasan ini menyeragamkan **talking**, bukan mastering semula muzik.

BGM `.mpeg` sebenarnya mempunyai stream audio MP3; semasa import runtime boleh remux stream audio kepada MP3 tanpa cover jika diperlukan. Loop BGM masih calon dan memerlukan audition. Jangan menjadikan BGM peta yang panjang sebagai SFX buka peta.

BGM khusus Dungeon Master, BGM Main Menu baharu, SFX berasingan dan talking hasil jawapan betul/salah belum dibekalkan dalam ZIP ini. Kekalkan audio game sedia ada bagi liputan yang belum ada; jangan mengambil fail dari chat lain tanpa membaca sumbernya.

## 7. Struktur, import dan cache

- `MUSIC/`: 57 aset aktif; semua MP3 talking di sini ialah versi normalized.
- `ORIGINALS/talking/`: 49 MP3 asal untuk perbandingan/recovery sahaja.
- `docs/audio/`: SOR, standard volume, jadual, manifest dan audit v2.
- `docs/audio/history/input_v1/`: semua dokumen asal/nested documentation ZIP dikekalkan sebagai sejarah sumber.
- Dua lapisan pembungkus `MUSIC/MUSIC/` dalam input diringkaskan kepada satu `MUSIC/`; lihat sourceZipMember dan packagePath dalam manifest.

**AUD2-21:** Hash source dan normalized berbeza dengan sengaja. Import `packagePath` dan validate `packageSha256`. Laluan `proposedRuntimePath` ialah destinasi cadangan, belum dicipta dalam game.

**AUD2-22:** Daftarkan aset secara eksplisit supaya OGG lama, cache lama atau audio base64 embedded lama tidak mengatasi MP3 yang baharu. Jika portable digunakan, rebuild daftar/embed voice dan BGM daripada manifest semasa. Jangan menyalin folder ORIGINALS ke runtime.

**AUD2-23:** Kekalkan pengenalan event daripada registry game semasa. Gunakan adapter ME01–ME15; jangan dispatch mengikut tajuk UI BM/BI yang boleh berubah. Rujukan subtitle dalam manifest event diwarisi daripada skrip sumber, bukan transkrip audio yang telah disahkan. Auto-caption kekal off sehingga audition/transkrip dipadankan.

## 8. Penerimaan integrasi kemudian

1. Semua talking dimainkan melalui VOICE bus sama dengan clipGain 1.0; tiada boost ad hoc berbeza antara NPC dan Alyssa.
2. Ukuran fail normalized memenuhi −18 ±0.5 LUFS dan ≤ −1 dBTP selepas encoding.
3. Tempat penggunaan sepadan jadual 9 kumpulan dan semua 57 ID resolve kepada fail sebenar.
4. Hint/More Hint hanya selepas reveal yang berjaya; tidak repeat pada rerender atau disabled click.
5. Rest hanya tindakan Rest sah; reward card semasa memilih, Defeat hanya run kalah.
6. Intro Mystery dihentikan sebelum soalan/Leave; semua 15 event memanggil klip yang betul.
7. Dungeon Master/Shop mengikut pertemuan tanpa count bertambah ketika menukar pilihan/tab.
8. Audio tidak mengubah RNG gameplay, HP, Gold, deck, artifact, soalan atau timer.
9. Semak cancellation, slow decode, master/voice mute, tab hidden, refresh/Continue, replay dan duck owner.
10. Audition atas earphone/speaker dan uji web serta portable sebelum dakwaan integrasi siap.

**Semakan pakej yang sudah dibuat:** source ZIP CRC, decode 57 sumber, normalisasi dan ukuran semula 49 talking, decode semua output, toleransi loudness/peak, duration, hash original/BGM serta padanan manifest. Bukti ringkas akhir ada dalam [verification](VERIFICATION_v2.json). Ujian runtime game dan audition belum dijalankan oleh tugasan ini.

