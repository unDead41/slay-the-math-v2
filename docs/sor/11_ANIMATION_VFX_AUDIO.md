# 11 — Animasi, VFX, audio dan maklum balas

Versi: 2.0.1. Dungeon dan keperluan cue room mengikut arahan terkini; timing/audio treatment ialah cadangan.

## Prinsip

- **MOT-01:** Resolver menentukan keputusan; animasi hanya memaparkannya.
- **MOT-02:** Satu tindakan mempunyai satu isyarat utama yang jelas. Jangan lapiskan semua partikel, shake dan bunyi pada setiap klik.
- **MOT-03:** Input yang boleh menimbulkan transaksi kedua dikunci sehingga state stabil. Butang Batal hanya berfungsi sebelum commit.
- **MOT-04:** Reduced motion/skip animation tidak mengubah damage, RNG, soalan atau ganjaran.

### Alyssa motion 2.8.0

MODEL.zip owns Alyssa's five clip timings. Use its per-frame durations rather than uniform FPS. Idle loops; actions return to Idle after their final hold. Hero and enemy pause together behind dialogs and on hidden pages. Motion Off and OS Reduced Motion show Idle frame 0. Outcomes remain owned by the resolver. Source mapping, pivots and actual validation: [Alyssa 2.8.0](../ALYSSA_ANIMATION_2_8_0.md).

In 2.8.1 the image fallback must also use that right-facing source for every pose. Its poster canvas and registration match the animated canvas. Do not apply the legacy CSS hero pose motion. Motion Off selects the same source's Idle poster even without Canvas. Details: [right-only correction](../ALYSSA_RIGHT_ONLY_2_8_1.md).

## Timing baseline

| Peristiwa | Tempoh sasaran | Maklum balas |
| --- | --- | --- |
| Hover/focus kad | 100–140 ms | Naik sedikit, outline jelas |
| Pilih kad / buka preview | 140–180 ms | Pembesaran terkawal |
| Cabut satu kad | 140–180 ms | Gerakan dari draw pile |
| Main Serangan | 260–380 ms | Gerakan kad, impact, nombor damage |
| Dapat Perisai | 220–300 ms | Bentuk shield dan nombor |
| Filter | 280–400 ms | Dua kad ke zon Ditapis |
| Predict betul | 300–450 ms | Focus bertambah, bintang kecil |
| Predict salah | 180–260 ms | Penanda lembut dan penerangan |
| Transisi skrin | 180–240 ms | Fade/slide ringkas |
| Fasa boss | 600–900 ms | Perubahan pose/lambang, label fasa |
| Menang/kalah | 600–1000 ms | Hasil jelas, kemudian pilihan seterusnya |

Cabutan berbilang boleh bertindih sedikit supaya menunggu tidak terlalu panjang. Jangan menghalang pemain membaca kad yang sudah stabil.

## Layer

Turutan asas belakang ke depan: background → environment → watak/musuh → kesan dunia → kad/HUD → tooltip/dialog → petunjuk fokus.

Nombor damage berdekatan sasaran dan tidak menutup intent. Partikel dan glow tidak berada di atas teks. Screen shake sangat kecil, hanya pada impact besar, dan dimatikan dalam reduced motion.

## Bahasa VFX

Api menggunakan merah/jingga untuk MC/Bara; Predict/Focus menggunakan emas/biru ais. Shield mempunyai siluet pelindung. Filter menunjukkan pemisahan kad dan Draw menunjukkan kad masuk ke tangan.

**MOT-05:** Formula atau nombor jawapan tidak muncul sebagai partikel rawak. Simbol hiasan tidak boleh disalah anggap sebagai arahan matematik.

## Audio dungeon dan cue room

| Cue ID | Kegunaan | Status |
| --- | --- | --- |
| stage_1 | Map/battle biasa stage 1 | Diperlukan, berbeza stage_2 |
| stage_2 | Map/battle biasa stage 2 | Diperlukan, berbeza stage_1 |
| rest | Rest, tenang | Diperlukan |
| shop | Shop, ringan | Diperlukan |
| mystery | Mystery, rasa ingin tahu | Diperlukan |
| elite_stage_1 | Elite stage 1 | Diperlukan, track tersendiri |
| elite_stage_2 | Elite stage 2 | Diperlukan, track tersendiri |
| boss_stage_1 | Boss stage 1 | Cadangan tambahan |
| boss_stage_2 | Boss stage 2 | Cadangan tambahan |
| menu | Menu | Pilihan |

Minimum tujuh cue diperlukan; dua boss cue ialah cadangan tambahan. Map dan battle biasa boleh berkongsi cue stage. Keperluan cue di atas kini mempunyai fail muzik dalam game 1.3.0; pemetaan ID runtime dan bukti berada di bawah.

**AUD-01:** Instrumental dungeon tanpa vokal default; stage 1 exploratory, stage 2 lebih tegang. Elite lebih intensif; English mudah terpakai pada label pemain.

**AUD-02:** Loop bersih, volume seimbang, crossfade cadangan 400–800 ms. Pilih cue daripada stageId+roomType. Muzik tidak restart pada rerender/draw.

**AUD-03:** Prioriti Boss → Elite → Rest/Shop/Mystery → stage biasa → menu. Satu music loop aktif; volume Music/SFX/mute disimpan.

**AUD-04:** Audio bermula selepas interaksi pengguna jika perlu. Gagal autoplay tidak menghalang game; pause/tab background/resume tidak menggandakan loop.

**AUD-05:** Manifest merekod sumber/hak, duration, loop points, stage dan room. Tiada audio Slay the Spire digunakan.

SFX mengekalkan attack, Block, draw, Focus, choose, confirm dan cancel. Jawapan salah menggunakan feedback neutral; visual/teks tetap memberi maklumat tanpa audio.

## Prestasi

Sasaran projek ialah interaksi lancar, ideal 60 fps pada peranti rujukan; 30 fps stabil diterima bagi peranti lemah jika input masih responsif. Ini sasaran, bukan ukuran yang telah dicapai.

Hadkan emitter serentak, guna semula objek/tekstur bila sesuai, lepaskan listener/audio yang tidak digunakan dan uji selepas pertukaran skrin berulang. Jangan membina sistem telemetry besar hanya untuk mengukur satu transisi.

## Penerimaan

Animasi dapat dimatikan tanpa mengubah hasil; tiada input berganda; tab background/resume tidak meninggalkan kad terapung atau audio berganda; semua maklum balas kritikal mempunyai teks/visual tanpa perlu mendengar.


## Fail muzik dan controller game 1.3.0

| Cue spesifikasi | ID fail runtime | Tajuk |
| --- | --- | --- |
| menu | menu | The Door Below |
| stage_1 | stage1_dungeon | Lanterns in the Stone |
| stage_2 | stage2_dungeon | Halls of the Hidden Seal |
| elite_stage_1 | stage1_elite | The Iron Warden |
| elite_stage_2 | stage2_elite | The Obsidian Sentinel |
| boss_stage_1 | stage1_boss | Keeper of the First Gate |
| boss_stage_2 | stage2_boss | The Last Equation |
| rest | rest | A Fire and a Small Hope |
| shop | shop | Coins by Candlelight |
| mystery | mystery | A Question Behind the Wall |

Sepuluh komposisi instrumental asal disusun dan disintesis secara deterministik tanpa sampel atau muzik Slay the Spire. Setiap satu mempunyai OGG dan MP3 stereo 44.1 kHz, tempoh sekitar 54–72 saat dan panjang loop muzik yang tepat. `dist/assets/music/scores.json` merekod semua skor, seed, sumber, hash dan ukuran. `tools/compose_music.py` ialah sumber pembinaan.

**AUD-06:** Runtime 1.3 menggunakan fade 850 ms. Rerender dalam scene sama tidak restart lagu. Generasi permintaan memastikan respons lewat tidak menghidupkan track scene lama atau memintas Mute. Cache menyimpan maksimum dua buffer decode.

**AUD-07:** Music dan Sound FX mempunyai volume berasingan. Music dikecilkan kepada 30% volume pilihan semasa dialog Predict dibuka, kemudian dipulihkan. Nilai volume/mute disimpan; Unmute terus membuka audio dalam gesture itu. Hide/show pantas disemak semula selepas suspend asynchronous selesai.

**AUD-08:** Web cuba OGG kemudian MP3. Fail portable membenamkan semua MP3. Semua loop menggunakan AudioBuffer; pemuatan gagal tidak menyekat game. Tab tersembunyi/pagehide menggantung audio. Satu scene memilih satu lagu; Menu Music membolehkan semua track didengar dan kembali ke muzik scene apabila ditutup.

**AUD-09:** Peta, battle biasa dan reward berkongsi cue dungeon setiap stage. Rest juga digunakan untuk stage clear/victory; Mystery digunakan untuk defeat. Shop track tersedia dalam Music player dan route audio, tetapi modul Shop belum ada dalam source 1.3.0. Aset siap tidak membuktikan kedai boleh dimainkan.

Semakan numerik meliputi decode semua 20 fail, panjang tepat, loudness, headroom dan seam. Ini bukan bukti audition manusia atau playback browser sebenar. Had sebenar direkod dalam `docs/VERIFICATION.md` projek.

## Source Edition 2.0 update

The user requested a rebuild against nine current menu references plus the supplied arena/MC/enemy/music packages. Runtime evidence, exact scope, source mappings, new Shop tuning, route-version compatibility and limits are maintained in [Source Edition](../SOURCE_EDITION.md), decisions 35–39, `DESIGN.md` and `UX-CONTRACT.md`. Earlier prototype examples in this document remain history where superseded. The implemented evaluator remains Probability; other planned math modes are not claimed active.


## Dungeon Edition 2.1 — current integration

Dedicated Ember Mirror Attack/Defend/Skill/Damaged pose swaps and model-based enemy CSS reactions follow resolved outcomes. A pose timeout restores presentation only; combat/RNG/save never waits for animation. Motion Off and OS reduced motion remain authoritative. Existing soundtrack is retained.

## Dungeon Edition 2.3 — art fade and grounding

The menu cycles five decoded local backgrounds with a 1.4s fade, 14s scene interval. Motion Off/OS reduced motion, hidden tab, open dialog and interaction with the main controls pause autoplay. Manual selection remains available. One cancelable menu timer and generation counter reject stale loads after navigation. No animation mutates game state. Five supplied Stage 1 enemy pose sets now follow resolved outcomes. Shared foot pivots stop pose swaps moving actors off the floor; grounded idle has no vertical bob. Existing soundtrack and sound settings remain.

## Main menu transition 2.5.1 — 21 October 2026

**MOT-06 (DISAHKAN):** The latest user request sets Home's artwork transition to 5s, superseding the previous 14s interval and 1.4s fade. DCVisuals.timing owns a 5000ms automatic interval and 5000ms crossfade. Five stable foreground/ambience pairs retain their source throughout a transition. Decoding and the generation guard precede active selection; an older pending decode cannot replace a newer choice. No game mutation waits for animation. Motion Off/OS reduction, hidden tabs, dialogs and main-menu focus/hover still pause automatic changes; manual choice remains available.

## Stage 1 atlas animation — 2.7.0

**MOT-07:** Ijamm supplies NORMAL ELITE ENEMY.zip and requests animations for Stage 1 enemies except bosses. Its v3 manifest now drives 25 clips / 128 active frames for Ember Mirror, Prism Guard, Rune Bat, Mirror Knight and Shard Beast. Idle is 6 FPS and loops; Attack and Damaged are 12 FPS; Defend and Skill are 10 FPS and play once before returning to Idle. Frame count and order remain supplied. Attack/Skill event markers do not resolve gameplay.

`animation-data.js` owns clip rectangles/FPS and the shared registration. `animation.js` owns a cancelable canvas player using elapsed presentation time, a three-texture LRU and generation guards for slow decodes. The existing app owns native commands, resolved outcomes, focus, dialogs and scene changes. Render/navigation disposes the old player; new actions supersede old ones. Dialog/hidden/pagehide pause the current frame; resume excludes paused time. Motion Off and OS reduction show the supplied Idle frame without a frame loop. Failed textures keep/recover to a static image fallback.

Enemy damage reactions follow resolved HP changes. End Turn Block intents use Defend for these five actors; burst intents use the existing Skill mapping. Alyssa's existing reaction now uses actual HP loss after artifact Block, rather than a pre-resolution estimate. Boss and Stage 2 artwork/pose ownership remain existing. The new Alyssa source archive was unavailable, so no new hero frames are claimed.

All clips draw onto the existing 1600×1200 canvas with one matrix: source origin (384,578) → floor pivot (800,1100), scale 2.5; actor display scale 0.9 for all five. No frame-specific trim, recenter or width/height distortion. Bat/Ember retain their floating anatomy/offsets. Checks and limits: docs/STAGE1_ANIMATION_2_7_0.md.
