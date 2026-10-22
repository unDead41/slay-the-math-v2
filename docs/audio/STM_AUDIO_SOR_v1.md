# Slay the Math — SOR Audio v1.0.0

Tarikh: 22 Oktober 2026 (Asia/Kuala_Lumpur)  
Pemilik: Ijamm · Branch kerja: `music`  
Sumber: `MUSIC(2).zip` · 15 fail · 25,952,324 bait  
Status hasil: **SOR dan data rujukan untuk integrasi kemudian. Audio belum dipasang ke runtime oleh pakej ini.**

## 1. Tujuan, skop dan status keputusan

Dokumen ini memetakan audio Ijamm kepada scene, aksi dan pertemuan supaya pembangun boleh mengintegrasikannya kepada game semasa tanpa meneka nama fail atau turutan dialog. Ikuti [manifest](audio-manifest.v1.json) bagi ID, nama sumber, hash, metadata dan laluan runtime yang dicadangkan. [Checklist integrasi](IMPLEMENTATION_CHECKLIST.md) menerangkan titik sambungan dan semakan sebelum merge.

| Status | Tafsiran |
| --- | --- |
| DISAHKAN | Arahan Ijamm: nama fail menentukan kegunaan; talking mengikut first/second/next meet; kerja audio di branch music; sediakan SOR dahulu. |
| DITERUSKAN | Tingkah laku atau struktur yang benar-benar dibaca dalam source game baseline. |
| CADANGAN | Pilihan implementasi yang boleh diubah: skop kiraan per run, ulang dialog terakhir, reopen, mix dan metadata tambahan. |
| PERLU_VERIFIKASI | Audit pendengaran, titik loop, transkrip tepat dan playback browser selepas integrasi. |

**AUD-SOR-01 — DISAHKAN:** Branch `music` ialah tempat perubahan audio chat ini. SOR ini tidak memberi arahan merge ke `main`. Pada integrasi nanti, semak main terkini dan gabungkan perubahan yang diperlukan tanpa menimpa kerja chat lain.

**AUD-SOR-02 — DISAHKAN:** Gunakan rakaman asal yang diberikan. Nama fail dalam seksyen 2 ialah ejaan sebenar, termasuk `.mpeg`. Jangan cipta dialog tambahan, menukar susunan nombor, menganggap label nama fail sebagai transkrip, atau mengubah mekanik game kerana audio.

**AUD-SOR-03 — DITERUSKAN:** Baseline diaudit ialah `unDead41/slay-the-math-v2`, branch `music`, commit `085ae6e4aed070c2b58e600f2ee8993a6b6e30e0` (game 2.13.2). Main sudah berada pada `d9a731bad152b5b2508f8afa6c1a306ef372a53b` sewaktu semakan. Nama fungsi dan laluan di bawah ialah bukti baseline, bukan jaminan main tidak berubah kemudian.

## 2. Inventori sumber yang diperiksa

ZIP mengandungi **8 BGM dan 7 voice clip**. Jumlah durasi metadata ialah **1129.357 saat** (kira-kira 18 minit 49 saat). Tempoh ini ialah ukuran fail, bukan titik akhir loop yang sudah diluluskan melalui pendengaran.

| Nama fail di dalam MUSIC/ | Jenis | Kegunaan | Durasi metadata | ID stabil dicadangkan |
| --- | --- | --- | ---: | --- |
| `combat_normal_elite_stage_1_bg.mpeg` | BGM | Normal dan Elite Stage 1 | 154.800 s | `bgm_combat_stage_1` |
| `combat_normal_elite_stage_2_bg.mpeg` | BGM | Normal dan Elite Stage 2 | 150.000 s | `bgm_combat_stage_2` |
| `combat_boss_stage_1_bg.mpeg` | BGM | Boss Stage 1 | 139.200 s | `bgm_boss_stage_1` |
| `combat_boss_stage_2_bg.mpeg` | BGM | Boss Stage 2 | 174.936 s | `bgm_boss_stage_2` |
| `merchant_or_shop_bg.mpeg` | BGM | Shop, semua tab | 64.440 s | `bgm_shop` |
| `rest_site_bg.mpeg` | BGM | Rest Site kedua-dua stage | 180.048 s | `bgm_rest` |
| `when_open_map_bg.mpeg` | BGM | Peta kedua-dua stage | 167.160 s | `bgm_map` |
| `when_lose_current_run.mpeg` | BGM | Kalah run | 8.520 s | `bgm_defeat` |
| `dungeon_master_when_selecting_artifact_talking_1.mp3` | Voice | Dungeon Master: pertemuan 1 | 11.964 s | `vo_dm_01` |
| `dungeon_master_when_selecting_artifact_talking_2.mp3` | Voice | Dungeon Master: pertemuan 2 | 12.748 s | `vo_dm_02` |
| `dungeon_master_when_selecting_artifact_talking_3.mp3` | Voice | Dungeon Master: pertemuan 3 | 11.886 s | `vo_dm_03` |
| `dungeon_master_when_selecting_artifact_talking_4.mp3` | Voice | Dungeon Master: pertemuan 4 | 12.931 s | `vo_dm_04` |
| `merchant_when_open_shop_talking_1.mp3` | Voice | Shop: pertemuan 1 | 12.434 s | `vo_shop_01` |
| `merchant_when_open_shop_talking_2.mp3` | Voice | Shop: pertemuan 2 | 10.998 s | `vo_shop_02` |
| `merchant_when_open_shop_talking_3.mp3` | Voice | Shop: pertemuan 3 | 17.293 s | `vo_shop_03` |

**AUD-SOR-04 — DISAHKAN melalui nama fail:** Normal dan Elite **berkongsi track** bagi stage yang sama. Stage 1 dan Stage 2 menggunakan fail yang berlainan. Ini menggantikan keperluan lama track Elite berasingan untuk pemetaan pakej baharu ini; flag Elite dan mekanik Elite kekal.

**AUD-SOR-05 — DISAHKAN melalui nama fail:** Track map, Shop dan Rest tidak berlabel stage. Gunakannya pada kedua-dua stage. Fail `when_open_map_bg.mpeg` ialah BGM peta; jangan mainkan keseluruhan fail sebagai bunyi klik.

### Liputan yang belum dibekalkan dalam ZIP ini

| Audio | Tindakan integrasi |
| --- | --- |
| BGM khusus Dungeon Master / memilih artifact | Kekalkan cue `mystery` sedia ada sebagai fallback sementara. Label fallback ini CADANGAN; jangan mendakwa fail baharu telah dibekalkan. |
| BGM baharu Main Menu / Mystery | Kekalkan lagu sedia ada bagi scene tersebut. |
| BGM khusus reward, stage clear atau victory | Kekalkan pemetaan sedia ada; jangan menggunakan defeat untuk kemenangan. |
| SFX berasingan seperti buka peta kertas, serangan, klik dan claim | Tiada fail SFX berasingan di dalam ZIP ini. Kekalkan SFX sedia ada. Fail daripada chat lain hanya boleh diimport selepas sumber sebenar diperiksa. |
| Transkrip / sari kata dialog | Belum ditranskrip. Jangan memaparkan ayat rekaan sebagai kata-kata rakaman. |

## 3. Pemetaan BGM dan keutamaan scene

**AUD-SOR-06 — CADANGAN implementasi:** Tentukan audio daripada **surface yang benar-benar dipaparkan**, kemudian scene. Render baseline mendahulukan `education`, kemudian pilihan artifact, kemudian scene biasa. Panggilan `trackFor(run)` yang bergantung pada `run.scene` sahaja belum mencukupi untuk artifact pada Reward, Mystery atau Stage Clear.

| Keutamaan | Keadaan sebenar | Muzik |
| ---: | --- | --- |
| 1 | Main Menu sedang dipaparkan, atau tiada run | Menu sedia ada |
| 2 | Panel memilih hadiah artifact sedang dipaparkan | Fallback `mystery` + voice Dungeon Master bagi encounter itu |
| 3 | Trial soalan `education` selepas Claim | Fallback `mystery`; tiada greeting baharu |
| 4 | `run.scene === defeat` | `bgm_defeat` |
| 5 | Battle dan musuh ditandakan Boss, Stage 1 | `bgm_boss_stage_1` |
| 6 | Battle dan musuh ditandakan Boss, Stage 2 | `bgm_boss_stage_2` |
| 7 | Battle Normal atau Elite, Stage 1 | `bgm_combat_stage_1` |
| 8 | Battle Normal atau Elite, Stage 2 | `bgm_combat_stage_2` |
| 9 | Shop, termasuk Cards / Artifacts / Remove | `bgm_shop` |
| 10 | Rest Site / scene `camp` | `bgm_rest` |
| 11 | Peta / scene `map` | `bgm_map` |
| 12 | Scene lain | Kekalkan route sedia ada |

**AUD-SOR-07 — DITERUSKAN:** Stage dalam save ialah zero-based: `run.stage === 0` bermaksud Stage 1, `1` bermaksud Stage 2. Gunakan flag Boss daripada definisi musuh semasa. Jangan bergantung semata-mata pada nama fail model, nama paparan atau dua ID lama `sentinel/dealer`.

**AUD-SOR-08 — CADANGAN:** BGM ulang sepanjang scene berkaitan. BGM tidak restart apabila memilih kad, membeli barang, menukar tab, menutup tooltip atau render semula pada route audio yang sama. Pulang ke peta memilih cue map walaupun sebelum itu bertempur dengan Normal/Elite.

**AUD-SOR-09 — PERLU_VERIFIKASI:** Semua lapan BGM ialah calon loop, termasuk defeat yang berdurasi 8.520 s. SOR ini belum mengesahkan loop itu lancar. `loopStart=0` dan `loopEnd=decodedBuffer.duration` hanya fallback awal. Semasa integrasi, dengar sambungan hujung-ke-awal beberapa kitaran; tentukan titik sebenar atau derivatif crossfade jika perlu, tanpa menimpa sumber asal. Jangan memotong VO sebagai sebahagian loop.

## 4. Dungeon Master — urutan talking

**AUD-SOR-10 — DISAHKAN:** Mainkan satu dialog Dungeon Master apabila pemain membuka panel untuk memilih hadiah artifact sebenar. Urutan awal mengikut nombor fail:

| Pertemuan Dungeon Master | Fail | ID |
| ---: | --- | --- |
| 1 | `dungeon_master_when_selecting_artifact_talking_1.mp3` | `vo_dm_01` |
| 2 | `dungeon_master_when_selecting_artifact_talking_2.mp3` | `vo_dm_02` |
| 3 | `dungeon_master_when_selecting_artifact_talking_3.mp3` | `vo_dm_03` |
| 4 | `dungeon_master_when_selecting_artifact_talking_4.mp3` | `vo_dm_04` |

Panel ini boleh muncul untuk Starting, hadiah Elite, Mystery atau Boss. Pemilik eligibility ialah UI artifact semasa, bukan andaian bahawa hanya `scene === master` layak.

**AUD-SOR-11 — CADANGAN kiraan:** Gunakan satu kiraan Dungeon Master untuk satu run merentas kedua-dua stage dan semua tier hadiah. Contoh: Starting = 1; hadiah Elite seterusnya = 2; hadiah Mystery seterusnya = 3; hadiah Boss seterusnya = 4. Tidak perlu setiap jenis hadiah mempunyai “first meet” sendiri.

**AUD-SOR-12 — CADANGAN selepas had:** Selepas dialog 4, ulang dialog 4: `1 → 2 → 3 → 4 → 4 → 4…`. Formula indeks: `Math.min(visitNumber, 4) - 1`. Ini mengelakkan greeting first meet bermula semula. Kesesuaian mengulang dialog terakhir mesti disemak dengan mendengar rakaman; urutan selepas had belum diminta secara khusus oleh Ijamm.

**AUD-SOR-13 — CADANGAN reopen:** Satu hadiah pending mempunyai satu ID encounter dan satu nombor pertemuan. Membuka semula panel yang sama selepas Main Menu/Continue atau reload boleh memainkan **dialog sama dari awal sekali** apabila surface itu aktif semula. Ia tidak menukar dialog ke nombor berikutnya. Menukar artifact yang disorot, membaca tooltip atau render semula dalam panel itu tidak memulakan voice semula.

**AUD-SOR-14 — CADANGAN pengecualian:** Jangan mainkan greeting ketika membuka inventori “Your Artifacts”, hover ikon, membeli artifact dalam Shop, menukar tab Shop atau menjawab soalan selepas Claim. Voice Dungeon Master dimiliki panel hadiah sebenar. Jika `offer.ready === false` atau pilihan kosong, belum ada panel hadiah layak untuk dikira.

## 5. Shop / Merchant — urutan talking

**AUD-SOR-15 — DISAHKAN:** Dialog Shop mengikut pertemuan 1, 2 dan 3 daripada nombor fail.

| Pertemuan Merchant | Fail | ID |
| ---: | --- | --- |
| 1 | `merchant_when_open_shop_talking_1.mp3` | `vo_shop_01` |
| 2 | `merchant_when_open_shop_talking_2.mp3` | `vo_shop_02` |
| 3 | `merchant_when_open_shop_talking_3.mp3` | `vo_shop_03` |

**AUD-SOR-16 — CADANGAN kiraan:** Kiraan Merchant berasingan daripada Dungeon Master, per run dan merentas stage. Pertemuan dengan Dungeon Master tidak menaikkan kiraan Shop.

**AUD-SOR-17 — CADANGAN selepas had:** Lawatan Shop ke-4 dan seterusnya menggunakan dialog 3: `1 → 2 → 3 → 3 → 3…`. Formula indeks: `Math.min(visitNumber, 3) - 1`. Jangan memilih rawak kerana fail membawa urutan pertemuan.

**AUD-SOR-18 — CADANGAN reopen:** Satu node Shop ialah satu encounter. Tukar Cards → Artifacts → Remove, pilih barang, beli barang, keluarkan kad atau buka/tutup tooltip tidak menaikkan kiraan dan tidak memainkan greeting semula. Pulang daripada Main Menu ke Shop pending yang sama boleh mengulang voice yang sama sekali bagi pembukaan itu. Shop di node baharu menerima nombor berikutnya.

## 6. Definisi “pertemuan”, persistence dan replay

**AUD-SOR-19 — CADANGAN:** Pertemuan dikira apabila encounter layak pertama kali hendak dipaparkan kepada pemain, tanpa bergantung pada bunyi berjaya didengar. Mute, volume 0 atau decode gagal tidak mengubah urutan encounter. Fail voice yang dipilih mesti dibekukan sebelum playback bermula.

| Peristiwa | Kiraan pertemuan | Playback greeting |
| --- | --- | --- |
| Panel hadiah baharu pertama kali dipaparkan | Dungeon Master +1 | Dialog yang ditentukan bagi pertemuan itu |
| Masuk node Shop baharu | Merchant +1 | Dialog yang ditentukan bagi lawatan itu |
| Pilih item, beli, tukar tab atau rerender surface sama | Tidak berubah | Jangan restart |
| Main Menu → Continue ke encounter sama | Tidak berubah | Ulang ID dialog yang sama sekali |
| Reload / import save pada encounter sama | Tidak berubah jika metadata tersedia | Ulang ID dialog sama selepas gesture yang membolehkan audio |
| Tekan Replay Voice, jika kawalan itu disediakan | Tidak berubah | Hentikan voice lama, ulang ID sama sekali |
| Stage 1 → Stage 2 | Kekalkan kiraan | Tunggu encounter baharu yang layak |
| New Run | Reset kedua-dua kiraan kepada 0 | Encounter pertama menggunakan dialog 1 |
| Buka inventori artifact / trial soalan | Tidak berubah | Tiada greeting baharu |

### Kunci encounter yang dicadangkan

- Dungeon Master: `artifact:` + `run.artifactState.offer.source`. Baseline mempunyai `source` yang stabil, contohnya `starting` dan `boss:0:<node>`.
- Shop: `shop:` + `run.stage` + `:` + `run.route.active`; gunakan depth sebagai fallback hanya untuk route legacy yang tiada active node.
- Kunci ini berada **di dalam run**, jadi tidak perlu mencipta global ID daripada seed sahaja.
- Jika host pada masa hadapan membenarkan beberapa offer daripada source yang sama, tambah offer-instance ID sekali pada penciptaan offer. Jangan menjana ID setiap render.
- Simpan nombor pertemuan dan ID voice bagi kunci itu. Semakan kewujudan kunci mesti idempotent sebelum increment.

**AUD-SOR-20 — CADANGAN bentuk save:** Gunakan metadata pilihan berasingan daripada HP, RNG, reward dan pemilikan. Contoh ini ialah kontrak cadangan, belum berada dalam runtime:

```json
{
  "audioPresentation": {
    "version": 1,
    "visits": { "dungeonMaster": 1, "merchant": 1 },
    "encounters": {
      "artifact:starting": {
        "speaker": "dungeonMaster",
        "visitNumber": 1,
        "voiceId": "vo_dm_01"
      },
      "shop:0:example-node": {
        "speaker": "merchant",
        "visitNumber": 1,
        "voiceId": "vo_shop_01"
      }
    }
  }
}
```

**AUD-SOR-21 — CADANGAN migrasi:** Save lama tanpa metadata audio diterima. Jangan meneka berapa kali pemain sudah bertemu NPC daripada jumlah artifact yang dimiliki kerana artifact boleh dibeli atau digunakan. Mula mengira daripada encounter pertama yang boleh diperhatikan selepas migrasi. Save metadata audio bersama pemilik autosave semasa. Jika storage gagal, kekalkan state dalam memori dan ikut amaran save sedia ada; jangan menjanjikan persistence selepas reload.

**AUD-SOR-22 — CADANGAN pemulihan:** Validate versi, speaker, nombor integer positif, ID voice daripada sequence speaker dan had 128 rekod encounter. Metadata audio rosak tidak patut membuang run gameplay yang sah. Pulihkan metadata audio sahaja. Checkpoint menyimpan dan memulihkan snapshot metadata sepadan dengannya; Retry bukan lawatan NPC baharu hanya kerana audio dibina semula.

ID terpilih ialah data kekal. AudioContext, sumber Web Audio, buffer, timer, token aktivasi dan posisi playback tidak diserialkan. Skop kiraan per run ialah cadangan yang digunakan dokumen ini, bukan keputusan pengguna tentang sejarah profil sepanjang hayat.

## 7. Mixer, kelajuan, gangguan dan kawalan

**AUD-SOR-23 — CADANGAN:** Sediakan bus Music, Voice dan SFX. Voice ialah one-shot, `loop=false`, satu voice aktif pada satu masa. BGM terus bermain pada volume lebih rendah ketika NPC bercakap.

| Parameter | Baseline cadangan | Asal / tafsiran |
| --- | ---: | --- |
| Music volume | 0.45 | Nilai awal runtime diaudit |
| SFX volume | 0.65 | Nilai awal runtime diaudit |
| Voice volume | 0.85 | Cadangan baharu; slider berasingan |
| BGM crossfade | 850 ms | Nilai runtime diaudit, boleh dituning |
| Pengurangan BGM ketika Voice | ×0.30 | Cadangan menggunakan faktor duck runtime yang sedia ada |
| Duck attack / release | 150 / 350 ms | Cadangan baharu |
| Fade-out voice apabila meninggalkan surface | 80 ms | Cadangan baharu |
| Playback rate semua sumber | 1.0 | Kekalkan kelajuan rakaman dibekalkan |

Arahan prompt voice 0.9 yang pernah digunakan tidak bermaksud rakaman sedia ada perlu diperlahankan lagi. Mainkan fail dibekalkan pada `playbackRate=1`; perubahan kelajuan memerlukan arahan khusus kemudian.

**AUD-SOR-24 — CADANGAN duck:** Duck berasaskan sebab aktif, contohnya Voice dan dialog Predict. Jika dua sebab aktif, ambil faktor minimum; jangan mendarab 0.30 × 0.30. Pulihkan volume daripada tetapan Music semasa apabila tiada sebab duck. Perubahan slider atau mute semasa voice tidak boleh dipintas callback tamat voice.

**AUD-SOR-25 — CADANGAN mute:** Kekalkan kawalan Music dan SFX sedia ada, tambah Voice volume/mute apabila diimplementasi. Global mute, jika disediakan, meliputi ketiga-tiga bus. Music mute hanya mematikan Music; voice masih tertakluk pada kawalan Voice sendiri. Jangan gunakan flag lama `musicMuted` seolah-olah ia global mute. Mematikan Voice di tengah dialog menghentikannya; unmute tidak memainkan baki/restart secara tiba-tiba.

**AUD-SOR-26 — CADANGAN pembatalan:** Setiap pembukaan surface mempunyai token aktivasi dalam memori. Respons decode lewat hanya boleh dimainkan jika token, encounter dan speaker masih sepadan dengan surface aktif. Meninggalkan Shop/panel hadiah atau masuk Education menghentikan voice dan membuang greeting pending. Voice daripada scene lama tidak boleh muncul di map atau battle baharu.

**AUD-SOR-27 — DITERUSKAN/CADANGAN:** Kekalkan audio unlock selepas interaksi pengguna. Jika greeting dihalang, simpan hanya greeting bagi surface semasa untuk gesture berikutnya. Jangan mengumpulkan greeting tertunggak bagi scene yang sudah ditinggalkan. Hidden page menghentikan voice tanpa menaikkan kiraan; show semula tidak auto-replay voice. BGM ikut pause/resume controller semasa. Kawalan Replay Voice ialah cadangan pilihan, bukan syarat menunggu sebelum gameplay boleh diteruskan.

**AUD-SOR-28 — DITERUSKAN daripada peraturan projek:** Bunyi tidak menjadi syarat transaksi. Pemain boleh memilih artifact, membeli barang, menukar scene dan menjawab soalan sebelum talking habis. Audio gagal atau mute tidak menghalang progression. Semua arahan penting kekal melalui teks/visual game. Sari kata tepat memerlukan transkrip rakaman; belum disediakan oleh audit ini.

## 8. Struktur aset dan manifest integrasi

Fail asal berada pada `MUSIC/<nama asal>` dalam pakej muat turun. Simpan bait asal dan hash. Laluan berikut ialah **cadangan hasil import**, belum dicipta atau dipasang oleh SOR ini:

| ID manifest | Laluan relatif runtime dari dist/ | Alias cue lama / baharu |
| --- | --- | --- |
| `bgm_combat_stage_1` | `assets/music/stage1_combat.mp3` | `stage1_dungeon`, `stage1_elite` |
| `bgm_combat_stage_2` | `assets/music/stage2_combat.mp3` | `stage2_dungeon`, `stage2_elite` |
| `bgm_boss_stage_1` | `assets/music/stage1_boss.mp3` | `stage1_boss` |
| `bgm_boss_stage_2` | `assets/music/stage2_boss.mp3` | `stage2_boss` |
| `bgm_shop` | `assets/music/shop.mp3` | `shop` |
| `bgm_rest` | `assets/music/rest.mp3` | `rest` |
| `bgm_map` | `assets/music/map.mp3` | `map` |
| `bgm_defeat` | `assets/music/defeat.mp3` | `defeat` |
| `vo_dm_01` | `assets/voice/dungeon_master/meet_01.mp3` | Tiada alias lama |
| `vo_dm_02` | `assets/voice/dungeon_master/meet_02.mp3` | Tiada alias lama |
| `vo_dm_03` | `assets/voice/dungeon_master/meet_03.mp3` | Tiada alias lama |
| `vo_dm_04` | `assets/voice/dungeon_master/meet_04.mp3` | Tiada alias lama |
| `vo_shop_01` | `assets/voice/merchant/meet_01.mp3` | Tiada alias lama |
| `vo_shop_02` | `assets/voice/merchant/meet_02.mp3` | Tiada alias lama |
| `vo_shop_03` | `assets/voice/merchant/meet_03.mp3` | Tiada alias lama |

**AUD-SOR-29 — DITERUSKAN melalui ffprobe:** Semua fail berkod audio MP3 stereo. Lapan BGM bernama `.mpeg` menggunakan 48,000 Hz dan mempunyai gambar cover terbenam; tujuh VO ialah MP3 44,100 Hz. `.mpeg` di sini bukan bukti rakaman video bergerak. Semak stream audio sebenar semasa import.

**AUD-SOR-30 — CADANGAN import:** Kekalkan sumber. Untuk runtime, keluarkan stream audio ke `.mp3` dengan stream-copy dan buang cover; jangan menukar pitch/tempo atau re-encode tanpa tujuan. Jika derivatif OGG diperlukan, hasilkan daripada sumber yang sama dan rekod hash derivatif berasingan. Sample rate berbeza antara BGM dan VO bukan alasan untuk merosakkan sumber asal.

Contoh command bagi satu BGM, dijalankan dari root sumber pada fasa integrasi selepas direktori destinasi disediakan:

```bash
ffmpeg -i "MUSIC/combat_normal_elite_stage_1_bg.mpeg" -map 0:a:0 -c:a copy -map_metadata -1 -vn "dist/assets/music/stage1_combat.mp3"
```

**AUD-SOR-31 — DITERUSKAN, perangkap integrasi yang disahkan melalui kod:** `dist/audio.js` sekarang memeriksa embedded `DC_MUSIC[id]`, kemudian cuba `.ogg` sebelum `.mp3`. Mengganti MP3 sahaja boleh masih memainkan OGG lama atau audio embedded lama. Integrasi mesti membaca sumber eksplisit daripada manifest, atau mengganti semua bentuk bagi cue berkenaan dan membina semula portable. Jangan menggunakan OGG lama sebagai fallback bagi MP3 baharu.

**AUD-SOR-32 — CADANGAN katalog/build:** Normal dan Elite stage sama patut merujuk satu aset canonical, supaya tidak menggandakan decode atau base64. `music-data.js` dan preview perlu menggunakan tajuk/durasi sebenar import; jangan mengekalkan BPM/key/mood komposisi lama bagi audio baharu. `build-portable.cjs` sekarang menjangka sepuluh MP3 BGM dalam satu direktori. Semasa menambah Voice dan cue map/defeat, bina senarai aset daripada manifest, urus voice berasingan dan semak ID yang wajib. Jangan sekadar menambah fail MP3 dalam direktori lama dan menganggap portable sudah lengkap.

Manifest v1 ialah data dokumentasi. Game belum membaca fail ini. SHA-256 manifest ialah hash sumber, bukan hash derivatif yang belum dibuat. Sumber dilabel user-supplied; pengarang, platform penjanaan dan hak edaran tidak direka.

## 9. Titik sambungan game yang diaudit

| Fail baseline | Apa yang ada | Perubahan kemudian yang relevan |
| --- | --- | --- |
| `dist/audio.js` | `trackFor`, Music bus, unlock, cache, fade, duck, preview, hidden handling | Routing surface-aware, aset eksplisit, Voice bus, pembatalan dan duck berbilang sebab |
| `dist/app.js` | `syncMusic`, `render`, aksi UI, save/settings, SFX oscillator | Adapter peralihan surface, receipt encounter sebelum greeting, Voice settings; kekalkan SFX dan pemilik save |
| `dist/artifacts.js` | `offer` menghasilkan `kind/source/ids/ready` | Gunakan source sebagai identiti hadiah, tanpa menukar offer RNG atau effect |
| `dist/artifact-ui.js` | Panel pemilihan hadiah dan panel education berasingan | Paparan eligibility, kawalan replay pilihan; jangan main audio daripada fungsi template |
| `dist/engine.js` | Stage 0/1, Shop node, transaksi, validate/restore/checkpoint | Hanya sambungan metadata audio yang perlu; jangan menukar damage, stock, RNG, claim atau soalan |
| `dist/music-data.js` | Katalog komposisi terdahulu | Kemas kini katalog import; jangan meneka BPM/key |
| `build-portable.cjs` | Embed BGM MP3 dan menguji jumlah 10 | Embed aset yang dirujuk manifest, termasuk voice; validate alias tanpa salinan berlebihan |

**AUD-SOR-33 — CADANGAN pemilikan:** Pengiraan encounter berlaku pada adapter peralihan surface sebelum render/dispatch audio, dengan save owner yang sama. Fungsi view kekal untuk menghasilkan paparan; jangan increment counter pada `artifactView()`, template Shop, event hover atau callback audio ended. Playback beroperasi selepas state encounter dipilih dan surface dipasang.

## 10. Penerimaan dan bukti

**AUD-SOR-34 — CADANGAN penerimaan integrasi:**

1. Starting artifact menggunakan DM 1; tiga hadiah encounter berikut menggunakan DM 2, 3 dan 4. Pilih item berulang kali tidak memainkan greeting berulang.
2. Shop di tiga node berbeza menggunakan Merchant 1, 2 dan 3; tab Cards/Artifacts/Remove mengekalkan satu BGM dan satu greeting pembukaan.
3. Encounter sama selepas Continue/reload mengekalkan nombor dan voice ID; New Run reset, Stage 2 tidak reset.
4. Encounter selepas had mengikut polisi hold-last yang dilabel cadangan. Transcript/audition review mesti memastikan dialog terakhir sesuai diulang.
5. Normal dan Elite setiap stage berkongsi sumber; Boss memilih track stage yang betul; map mempunyai cue tersendiri.
6. Uji semua voice sehingga tamat, keluar awal, slow load, mute/unmute, volume sifar dan audio unlock. Tiada voice lama muncul di scene baharu.
7. Uji Voice + Predict duck serentak, tab hidden/show dan Music preview. Tetapan volume pengguna pulih dengan betul.
8. Dekod semua derivatif, dengar loop 3 kitaran serta uji web dan portable secara offline. Audio yang didengar mesti sumber baharu, termasuk ketika OGG/embedded lama pernah tersedia.
9. Save lama, Export/Import, checkpoint/retry dan metadata audio rosak tidak merosakkan run sah atau menggandakan hadiah.
10. HP, RNG, stock, kad, artifact, bank soalan dan progression kekal dikawal resolver sedia ada. Audio sahaja tidak mengubah hasil permainan.

### Semakan yang telah dibuat bagi pakej SOR ini

- ZIP asal lulus pemeriksaan CRC.
- 15/15 fail audio dikesan oleh ffprobe dan didekod oleh ffmpeg tanpa ralat.
- Nama, durasi, codec, sample rate, channel, saiz dan SHA-256 sumber direkod.
- Manifest, pemetaan satu-ke-satu, sequence 4/3 dan senario kiraan/reopen diperiksa ketika pembinaan pakej; lihat `VERIFICATION_v1.json`.
- Source routing, overlay hadiah, identiti offer/Shop dan build portable baseline diperiksa.

**Belum dibuat:** import runtime, perubahan UI/engine audio, integrasi main, audition manusia, kelulusan loop, transkrip tepat atau ujian playback browser. Tiada ujian gameplay dikatakan lulus oleh hasil dokumentasi ini.

## 11. Handoff

Fail utama: `docs/audio/STM_AUDIO_SOR_v1.md`. Data: `audio-manifest.v1.json`. Audit: `source-audit.v1.json`. Checklist: `IMPLEMENTATION_CHECKLIST.md`. Semua fail sumber audio ada dalam folder `MUSIC/` pakej muat turun.

Arahan ringkas untuk chat integrasi:

> Baca AGENTS.md, SOR_README.md, SOR 11/13/19 dan docs/audio/STM_AUDIO_SOR_v1.md. Gunakan audio-manifest.v1.json dan MUSIC/ daripada pakej ini. Semak main terkini, buat kerja audio di branch music, kekalkan sumber asal dan gameplay. Implement routing berdasarkan surface, urutan Dungeon Master 1–4 dan Merchant 1–3, encounter yang kekal semasa save/restore, Voice/Music/SFX serta pembatalan. Bezakan peraturan DISAHKAN daripada CADANGAN. Jalankan penerimaan web dan portable sebelum menyediakan perubahan untuk merge; jangan anggap dokumentasi ini sudah mengaktifkan audio.

