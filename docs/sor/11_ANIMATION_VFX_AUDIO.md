# 11 — Animasi, VFX, audio dan maklum balas

Versi: 2.1.0. Dungeon dan keperluan cue room mengikut arahan terkini; timing/audio treatment ialah cadangan.

## Audio source pack v1 — sejarah 22 Oktober 2026

Nota sejarah; status audio semasa ialah implementasi game 2.22.0 di bawah dan [Audio 2.22.0](../AUDIO_2_22_0.md). Pemilik pemetaan asal: [Audio SOR v1](../audio/STM_AUDIO_SOR_v1.md). Data/metadata: [manifest](../audio/audio-manifest.v1.json). Bukti source audit dan batas: [verification](../audio/VERIFICATION_v1.json).

- **DISAHKAN:** Ijamm membekalkan MUSIC(2).zip dan meminta SOR dahulu; kemas kini audio chat ini melalui branch `music`.
- **DISAHKAN melalui nama fail:** 8 BGM meliputi Normal/Elite Stage 1, Normal/Elite Stage 2, kedua-dua Boss, Shop, Rest, Map dan Defeat. Normal dan Elite berkongsi satu sumber setiap stage untuk pakej baharu ini; requirement pemisahan Elite terdahulu digantikan bagi import ini.
- **DISAHKAN:** 4 dialog Dungeon Master dan 3 Merchant mengikut nombor pertemuan. Panel hadiah sebenar menentukan eligibility Dungeon Master; tab paid-artifact Shop tetap Merchant.
- **CADANGAN:** Kiraan per run merentas stage, receipt encounter yang kekal, reopen memainkan ID sama, selepas had ulang DM 4 / Merchant 3. Volume Voice, duck dan playback lifecycle diterangkan dalam dokumen pemilik.
- **DITERUSKAN:** CRC ZIP dan decode semua 15 fail lulus; bait sumber dikekalkan. Audition/loop, transkrip dan playback browser masih memerlukan semakan.
- **Status ketika SOR v1 disediakan:** Dokumentasi sahaja. Status tersebut telah digantikan oleh import 2.20.0 dan integrasi normalized 2.22.0; ia bukan status runtime semasa.

## Prinsip

- **MOT-01:** Resolver menentukan keputusan; animasi hanya memaparkannya.
- **MOT-02:** Satu tindakan mempunyai satu isyarat utama yang jelas. Jangan lapiskan semua partikel, shake dan bunyi pada setiap klik.
- **MOT-03:** Input yang boleh menimbulkan transaksi kedua dikunci sehingga state stabil. Butang Batal hanya berfungsi sebelum commit.
- **MOT-04:** Reduced motion/skip animation tidak mengubah damage, RNG, soalan atau ganjaran.

### Card transfers and ten Passive cues — 2.25.0

**DISAHKAN:** Ijamm requests Draw, Discard and Exhaust animations and appropriate trigger animation for all ten existing Passive cards. **DITERUSKAN implementation:** observe ordered physical transfers in an ephemeral per-action WeakMap journal; merge cloned-run observations only after validation/commit. The normal synchronous engine/render/save remains authoritative. Draw flips a back into the full source portrait, Discard arcs into its pile, Exhaust contracts into fire embers, and hidden shuffle/search transfers keep their backs. New canonical Passive log entries pulse their own badge and show actual resolved amounts, including zero/capped Focus or draw and actual retained Block. Ongoing/waiting effects never fabricate triggers; Continue does not replay history. All transient presentation is cancelable by the next action, render/navigation, native dialog, hidden/pagehide, resize and both motion preferences. Source assets and gameplay values are unchanged. The chosen 220/280/400ms Draw/Discard/Exhaust durations are reversible presentation defaults. Scope, all-ten mapping and actual verification: [Combat card motion](../CARD_MOTION_2_25_0.md).

### Alyssa RPG status presentation — 2.28.0

**MOT-09 — main 2.32.0 polish (24 October 2026):** supersede first-four selection with priority ordering plus a remainder summary, and let actual Passive receipts own exactly explained positive stat labels. Share a cancelable presentation lead between card/Passive/status feedback and one primary synthesized SFX; never delay resolution/save. Refine ten existing motif signatures without changing their icons. Partial Block absorption followed by reset/expiry must not shatter; use receipt-backed depletion evidence and neutral feedback when artifact/mid-hit Block makes inference ambiguous. Low/Full intensity is a UI preference; Motion Off/OS reduction still overrides visuals and does not silence SFX. Ijamm subsequently authorizes publishing the completed polish to main as 2.32.0. Actual verification and remaining build/device/audio limits are recorded in COMBAT_MOTION_MAIN_2_32_0.md. [Scope, verification and limits](../COMBAT_MOTION_POLISH_LOCAL.md).

**MOT-08 (DISAHKAN request):** Ijamm asks for RPG-style buff/shield/stat-up/down effects around Alyssa and suitable online SFX search terms. **DITERUSKAN implementation default:** use moderate, bounded auras and short bursts. `status-vfx.js` reads the existing player status projection and new enemy-turn receipts after the normal command/render/save. Block has a translucent shield; Strength has warm embers; Agility has gold arcs; Defense has a separate rune ring; Thorns, Weak and Vulnerable retain distinct shapes. Labels use actual signed deltas. Enemy-only conditions and future queued grants do not decorate Alyssa as active buffs. Block absorption uses the actual receipt even when the next-turn refill leaves the final Block value unchanged. Expiry is a soft dissolve, not a fabricated hit. Continued saves/rerenders restore only current auras.

Keep the source hero/canvas pivot, illustrations and UI/status icons intact. Decorations are inert, pointer-transparent, aria-hidden and below controls. Limit each action to four transient groups and deterministic particles; do not shake the screen or add mathematical answer particles. Motion Off/OS reduction, hidden/pagehide, dialogs, next commands, rerenders, resize and scene exit cancel transient presentation. Confirmed native choices may display effects only on the next presentation frame after closing. Existing badges/logs remain the accessible owners. New audio is not installed; proposed search terms and one-shot policy are in [SFX guide](../ALYSSA_STATUS_SFX_GUIDE.md). [Scope and actual verification](../ALYSSA_STATUS_VFX_2_28_0.md).

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

### Hand and Skill consistency — 2.9.0

Skill uses the importer's per-frame body-scale correction at the same floor pivot, without changing durations, frame order, idle return or atlas bytes. Hand hover has a 140ms dwell and 180ms presentation transition; keyboard focus is immediate. Destroy/cancel hand timers on replacement, dialogs and hidden pages. Motion never changes draw limits, gameplay or the run clock.

### Both-stage Normal/Elite motion — 2.10.0

The same player now owns all ten canonical non-boss actors: 50 clips / 263 frames. Stage 2 preserves source FPS, order and full cells using the same floor matrix. Its label-to-action table belongs to presentation: Chain Weaver uses Spark → Attack, Flame Burst → Skill, Fire Shield → Defend; the other four use Dark Pulse → Attack, Mist Shield → Defend, Dark Wave → Skill. Resolver patterns, displayed intent and damage remain unchanged. Stage 1's accepted mapping and Alyssa's entire registry remain unchanged.

Stage 2 fallback posters come from these new source sheets on the same registered canvas. Disable legacy CSS pose/hover transforms for an atlas-backed enemy, including while its canvas is loading. Motion Off/reduced motion selects Idle even if Canvas is unavailable. Existing dialog/hidden-tab pause, cancellation, four-texture cache and independent hero player remain canonical. Source guides already bake normalization into pixels; do not apply their calibration transforms again. Details: [both-stage motion](../ENEMY_MOTION_2_10_0.md).


## Map, modes, Boss and Shop — 2.12.0

2.12: both bosses now use the existing atlas player for all five actions / sixty frames, left facing and original variable holds. Original runtime pivot [512,768] maps to boss canvas floor [800,1000], with host foot percentage matched to preserve grounding and all faint VFX. Static posters use the same matrix. Damage/Block/turn/save never await source event hooks. Pause, static reduced motion, disposal and loading/failure fallback retain their owners.

## Boss framing — game 2.13.2

The boss host uses explicit figureScale 1.1, independent of the ordinary-enemy default 0.9. All five clips and their posters share this host; drawScale, source frame cells, holds, pivots, floor and motion policies remain canonical. A phone width cap and tablet-only horizontal containment preserve equal visible size without trimming source VFX. See [Boss size](../BOSS_SIZE_2_13_2.md).


## Passive and supplied audio — 2.20.0

DISAHKAN: apply the supplied MUSIC(3).zip now; this supersedes the archive's earlier planning-only music-branch handoff. The committed audio registry owns eight supplied BGM and seven one-shot voices; Menu/Mystery remain. Actual visible encounters own per-run greeting order, separate Voice controls, stale-load cancellation, gesture unlock and minimum-factor Voice/Predict ducking. Audio never owns gameplay RNG or resolution. Source hashes, routes and audition limits: [audio integration notes](../audio/source-pack-3/INTEGRATION_NOTES.md). Full app/build evidence: [Passive and Music 2.20.0](../PASSIVE_AND_MUSIC_2_20_0.md).

## Normalized talking — 2.22.0

DISAHKAN: Ijamm authorizes applying the prepared MUSIC(4) package to main v2.21.3, developing audio changes on `music`. The current registry owns 49 voices at -18 LUFS ±0.5 and true peak ≤ -1 dBTP, rate/gain 1, plus eight unchanged supplied BGM. Existing Menu/Mystery music and generated SFX remain. Actual visible questions, successful Hint/More Hint reveal, committed Rest, card reward choices, final defeat, fixed Mystery intros and ordered NPC encounters own playback. This supersedes the former package-only status. There are eight supplied card-reward clips, not ten. Persistence, isolated variation RNG, single Voice bus, deadlines/cancellation, mixer behavior and actual verification: [Audio 2.22.0](../AUDIO_2_22_0.md). No verified transcript, human audition or new dedicated correct/wrong-answer voice is claimed.


## Expanded talking and checked answers — 2.24.0

DISAHKAN: check latest main (2.23.1), apply MUSIC(5) on music first, then integrate into main. Registry pack 5 adds 26 mastered recordings: answering +4, Hint +4, More Hint +4, correct +5 and wrong +9, for 75 voices total. All 57 preceding supplied assets retain their exact bytes and records. New encoded MP3s measure -18.03 to -17.93 LUFS, peak at most -1.85 dBTP. Checked answer/support event order owns reactions; selection, timeout, abandonment, Reveal and exhaustion do not fabricate answer outcomes. This supersedes 2.22.0's absence of answer voices. Triggers, importer, volume audit and limits: [Audio 2.24.0](../AUDIO_2_24_0.md).


## Supplied Main Menu recording — music branch 2.32.1

DISAHKAN: Ijamm supplies Menu.mp3.mpeg for the opening/Main Menu and explicitly requests updating music only, not main. Replace the canonical menu cue with Ancient Stone Keep at assets/music/menu_ancient_stone_keep.mp3. The active registry chooses only this MP3; historical menu OGG files cannot shadow it. Retain full-track loop, first-gesture browser unlock, saved mute/volume and ordinary scene routing/crossfades. The input is preserved byte-for-byte; other music and all 75 voices retain their existing owners. [Source, branch boundary and actual checks](../audio/menu-2026-10-24/README.md).
