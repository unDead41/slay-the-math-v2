# 00 — Governance dan penggunaan SOR

Versi: 2.0.0 · Tarikh: 18 Oktober 2026 · Pemilik: Ijamm

## Tujuan dan status

SOR ialah kontrak reka bentuk yang boleh dirujuk semula. Fail ini mengawal cara semua dokumen lain ditafsirkan dan dikemas kini. Standard baharu berstatus CADANGAN; rujuk [daftar keputusan](DECISIONS.md) untuk asal setiap asas.

## Keutamaan

1. Arahan langsung Ijamm yang paling baharu dan khusus.
2. Keputusan DISAHKAN yang masih aktif.
3. Dokumen pemilik domain bagi baseline semasa.
4. Config/data/kod sebagai bukti implementasi sebenar.
5. Contoh, prompt dan idea backlog.

Arahan sistem atau platform tetap mengatasi arahan projek. Kod menerangkan apa yang sedang berlaku; kod yang bercanggah dengan peraturan tidak secara automatik menukar peraturan. Laporkan jurang sebelum membuat perubahan besar.

## Status design awal

Imej terkini ialah rujukan visual yang diteruskan. Arah seni boleh digunakan terus untuk draf, tetapi teks Passive dan simbol dekoratif tidak mengesahkan mekanik atau bank soalan. Rujuk [18](18_DESIGN_REFERENCES.md).

Status CADANGAN bermaksud baseline boleh diuji, bukan persetujuan pengguna.

## Kekuatan peraturan

| Istilah | Tafsiran |
| --- | --- |
| WAJIB | Syarat untuk mematuhi baseline yang sedang digunakan |
| PATUT | Pilihan lalai; penyimpangan bersebab boleh direkodkan |
| BOLEH | Pilihan tambahan; bukan kerja yang wajib dibina |
| DILARANG | Tingkah laku yang melanggar baseline |

## Status keputusan

- **GOV-01:** DISAHKAN hanya digunakan untuk arahan atau kekangan yang benar-benar dinyatakan Ijamm.
- **GOV-02:** DITERUSKAN merangkumi butiran perbualan/prototaip terdahulu. Catat jika belum disemak melalui kod.
- **GOV-03:** CADANGAN boleh menjadi baseline kerja yang boleh dibalikkan. Jangan gambarkan sebagai keputusan pengguna.
- **GOV-04:** PERLU_VERIFIKASI memerlukan bukti khusus; simpan soalan dan bukti yang diperlukan, bukan placeholder kosong.
- **GOV-05:** Eksperimen kekal berasingan daripada baseline sehingga perubahan diputuskan dan direkodkan.

## Satu pemilik bagi setiap domain

| Domain | Dokumen pemilik | Bentuk nilai semasa implementation |
| --- | --- | --- |
| Formula, jawapan, kandungan | [02](02_MATH_LEARNING.md) | Question bank dan evaluator |
| Giliran, timing dan resolusi | [03](03_COMBAT_MECHANICS.md) | Combat rules/config |
| Kad, starter deck dan kesan | [04](04_CARD_SYSTEM.md) | Card definitions |
| Layout kad | [05](05_CARD_VISUAL_DESIGN.md) | Card component/tokens |
| Makna ikon | [06](06_ICON_SYSTEM.md) | Icon registry |
| Statistik dan pola musuh | [07](07_ENEMY_BOSS_DESIGN.md) | Enemy definitions |
| MC dan turnaround | [08](08_MC_CHARACTER_ART.md) | Character sheet/asset manifest |
| Route dan node | [09](09_WORLD_STAGE_LEVEL.md) | Stage definitions |
| Warna, teks, navigasi | [10](10_UI_UX_ACCESSIBILITY.md) | UI tokens dan strings |
| Masa animasi/audio | [11](11_ANIMATION_VFX_AUDIO.md) | Motion/audio config |
| Ganjaran dan sasaran balance | [12](12_PROGRESSION_ECONOMY_BALANCE.md) | Reward config dan rekod playtest |
| Kontrak simpanan/RNG | [13](13_TECH_ARCHITECTURE_DATA.md) | Schema dan migration |

Dokumen lain boleh menunjukkan contoh, tetapi mesti memaut kepada pemilik. Ubah nilai pada sumber terlebih dahulu, kemudian selaraskan contoh yang bergantung padanya.

## Mengubah peraturan

**GOV-06:** Rekod ID keputusan, status, sebab, fail terlibat, risiko dan kaedah semakan. Contoh ID: `DEC-20261018-01`.

**GOV-07:** Perubahan formula, turutan resolusi, schema save, identiti visual teras atau ruang sampel memerlukan semakan impak merentas domain. Perubahan ejaan boleh dibetulkan terus.

**GOV-08:** Versi dokumen menggunakan semver:

- Patch: ejaan, pautan atau penjelasan tanpa mengubah tingkah laku.
- Minor: peraturan/ciri baharu yang serasi dengan asas semasa.
- Major: perubahan teras yang memerlukan migration atau keputusan semula.

Versi SOR berasingan daripada versi game, versi aset dan `schemaVersion` save.

## Penyelesaian konflik

Jika dua dokumen bercanggah, rujuk dokumen pemilik dan keputusan terkini. Jika sumber yang sah belum menentukan jawapan, nyatakan konflik dan teruskan kerja bebas daripadanya. Jangan memilih secara senyap bagi perubahan yang akan membuang kerja atau menukar game teras.

## Penerimaan

- Setiap domain mempunyai pemilik dan ID peraturan.
- Setiap nombor baharu boleh dikenal pasti sebagai baseline, bukan fakta playtest.
- Tiada status DISAHKAN tanpa sumber.
- Tiada dakwaan bahawa fail MD mengaktifkan ingatan kekal atau mengubah game.

Lihat [aliran pembangunan](16_DEV_WORKFLOW.md) untuk penggunaan harian.
