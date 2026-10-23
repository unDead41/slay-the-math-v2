# Slay the Math — Set of Rules

Current audio integration: [Normalized talking, game 2.22.0](docs/AUDIO_2_22_0.md). This supersedes earlier package-only audio handoffs; the historical baseline below remains context.

Versi dokumen: **2.0.1** · Tarikh: **18 Oktober 2026 (Malaysia)** · Pemilik: **Ijamm**

Pakej ini ialah rujukan bersama Ijamm dan pembantu AI sepanjang pembangunan Slay the Math. SOR bermaksud **Set of Rules**: peraturan yang boleh diterjemahkan kepada reka bentuk, data, kod dan semakan penerimaan.

**Keadaan semasa:** dokumentasi asas telah disediakan; game tidak diubah oleh pakej ini. Nilai balancing dan reka bentuk baharu ialah baseline untuk dicuba, bukan keputusan playtest yang telah terbukti.

## Perubahan utama 2.0

Rujukan MC kini pengembara dungeon merah/arang/kulit. Kad memakai frame emas, keluarga merah/biru/teal/ungu dan panel parchment. Tiga topik sebenar dipisahkan daripada subfokus Probability. Map bercabang, Shop/Rest/Mystery/Elite, English mudah dan cue audio diselaraskan. Konsep Passive belum dimasukkan ke deck.

Baca [ringkasan design](docs/sor/18_DESIGN_REFERENCES.md) dahulu jika menyambung dari versi 1.0. Dokumen kini versi major kerana kontrak route/save dan domain topik berubah; ia bukan dakwaan migration kod telah dibuat.

## Mula di sini

1. Baca [visi dan skop](docs/sor/01_GAME_VISION_SCOPE.md).
2. Baca [governance](docs/sor/00_GOVERNANCE.md) dan [daftar keputusan](docs/sor/DECISIONS.md).
3. Semasa mengerjakan sesuatu modul, baca hanya SOR yang berkaitan dalam jadual di bawah.
4. Gunakan [AGENTS.md](AGENTS.md) untuk memberi arahan projek kepada pembantu AI.
5. Selepas perubahan yang mengubah peraturan, kemas kini dokumen pemilik dan [changelog](docs/sor/CHANGELOG.md).

## Peta rujukan

| Fail | Bila digunakan |
| --- | --- |
| [00 · Governance](docs/sor/00_GOVERNANCE.md) | Status keputusan, keutamaan peraturan, perubahan dan konflik |
| [01 · Visi & skop](docs/sor/01_GAME_VISION_SCOPE.md) | Identiti game, sasaran MVP, batas dua minggu |
| [02 · Matematik & pembelajaran](docs/sor/02_MATH_LEARNING.md) | Probability, Expansion & Factorisation, Indices, hint dan jawapan |
| [03 · Mekanik tempur](docs/sor/03_COMBAT_MECHANICS.md) | Giliran, tenaga, cabutan, Ramalan, Fokus dan kemenangan |
| [04 · Sistem kad](docs/sor/04_CARD_SYSTEM.md) | Jenis kad, starter deck, kesan, Tapis dan naik taraf |
| [05 · Reka bentuk kad](docs/sor/05_CARD_VISUAL_DESIGN.md) | Layout, tipografi, frame, rarity dan kebolehbacaan |
| [06 · Sistem ikon](docs/sor/06_ICON_SYSTEM.md) | Makna ikon, grid, keadaan dan eksport |
| [07 · Musuh & boss](docs/sor/07_ENEMY_BOSS_DESIGN.md) | Roster, intent, pola, fasa, siluet dan fairness |
| [08 · MC & seni watak](docs/sor/08_MC_CHARACTER_ART.md) | Identiti model, empat sudut dan elemen tiga topik |
| [09 · Dunia & stage](docs/sor/09_WORLD_STAGE_LEVEL.md) | Dungeon, branching map dan room types |
| [10 · UI, UX & akses](docs/sor/10_UI_UX_ACCESSIBILITY.md) | Skrin, interaksi, responsif, bahasa dan aksesibiliti |
| [11 · Animasi, VFX & audio](docs/sor/11_ANIMATION_VFX_AUDIO.md) | Maklum balas, timing, layer, bunyi dan reduced motion |
| [12 · Progres, ekonomi & balance](docs/sor/12_PROGRESSION_ECONOMY_BALANCE.md) | Ganjaran, kesukaran, sasaran masa dan playtest |
| [13 · Seni bina & data](docs/sor/13_TECH_ARCHITECTURE_DATA.md) | Pemisahan modul, kontrak data, RNG dan simpanan |
| [14 · Pipeline aset](docs/sor/14_ASSET_PIPELINE.md) | Nama fail, manifest, eksport dan penerimaan aset |
| [15 · QA & release](docs/sor/15_QA_RELEASE.md) | Ujian berisiko tinggi, semakan visual dan syarat siap |
| [16 · Aliran pembangunan](docs/sor/16_DEV_WORKFLOW.md) | Pelan 14 hari, tugas kecil, handoff dan kawalan skop |
| [17 · Prompt & templat](docs/sor/17_AI_PROMPTS_TEMPLATES.md) | Prompt kad, MC, musuh, tugasan dan rekod keputusan |
| [18 · Rujukan design](docs/sor/18_DESIGN_REFERENCES.md) | Dua gambar awal, pemerhatian dan impak pada SOR |
| [Daftar keputusan](docs/sor/DECISIONS.md) | Apa sudah diketahui, diteruskan, dicadangkan dan belum disahkan |
| [Changelog](docs/sor/CHANGELOG.md) | Sejarah perubahan SOR |

## Cara memasukkan ke projek

- Ekstrak ZIP ke satu folder rujukan dahulu.
- Salin folder `docs/sor/` dan `references/` ke projek game, dengan struktur relatif dikekalkan.
- Jika projek belum ada `AGENTS.md`, salin fail ini ke root projek.
- Jika sudah ada `AGENTS.md`, **gabungkan** bahagian yang relevan; simpan arahan sedia ada. Jangan overwrite secara buta.
- `README.md` ini ialah indeks pakej SOR. Dalam projek sedia ada, boleh simpan sebagai `SOR_README.md` di root dan tambah pautan dari README projek.
- Jika AI tidak dapat melihat fail projek secara automatik, berikan indeks, AGENTS dan SOR modul yang sedang dikerjakan dalam sesi itu.

## Ayat untuk memulakan sesi pembangunan

> Projek ini ialah Slay the Math. Baca AGENTS.md, indeks SOR, governance dan daftar keputusan dahulu. Kemudian baca SOR modul yang berkaitan dengan tugasan ini. Teruskan keputusan yang disahkan, nyatakan cadangan baharu, dan kemas kini dokumen pemilik apabila peraturan berubah. Laporkan perubahan dan bukti semakan sebenar.

## Cara membaca status

| Status | Maksud |
| --- | --- |
| DISAHKAN | Permintaan atau kekangan jelas daripada Ijamm |
| DITERUSKAN | Asas daripada perbualan/prototaip terdahulu; tidak semuanya disahkan melalui kod |
| CADANGAN | Standard atau nilai baharu yang disediakan untuk membolehkan pembangunan bermula |
| PERLU_VERIFIKASI | Bukti tertentu belum diperoleh; jangan tukar kepada fakta |

Semua peraturan normatif baharu dalam pakej ini berstatus **CADANGAN** melainkan ditunjukkan sebagai DISAHKAN atau DITERUSKAN dalam daftar keputusan. Perkataan WAJIB menerangkan cara mengikuti baseline ini; ia tidak bermaksud Ijamm telah meluluskan setiap butiran baharu.

Pakej mengandungi **23 fail Markdown dan dua imej rujukan**. Ia tidak memasang skill, tidak mengaktifkan ingatan kekal AI, dan tidak mengubah konfigurasi aplikasi secara automatik.


Nota implementation 2.0.1: dokumen 10/11 dan daftar keputusan merekod audio/English game 1.3.0. Kekalkan perbezaan kontrak reka bentuk daripada fitur runtime sebenar.

- [19 — Artifact system](docs/sor/19_ARTIFACT_SYSTEM.md): current Dungeon Master, offers, real effects and save rules.

Mystery v2 current owner: [MYSTERY_EVENTS.md](docs/sor/MYSTERY_EVENTS.md).

Current Mystery/Shop presentation and verification: [room UI 2.13.1](docs/ROOM_UI_2_13_1.md).

## Boss size — game 2.13.2

[Boss size correction and verification](docs/BOSS_SIZE_2_13_2.md): per-boss host calibration and responsive framing; owners SOR 07/11.


- [20 — Developer Tools](docs/sor/20_DEVELOPER_TOOLS.md): development/production commands, sandbox scenes, card states, motion, presets and diagnostics.
