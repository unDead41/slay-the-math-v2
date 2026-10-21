# 14 — Pipeline aset, penamaan dan penerimaan

Status: CADANGAN. Digunakan bagi kad, ikon, MC, musuh, background, VFX dan audio.

## Aliran aset

Brief → rujukan → draf → semakan → pembetulan → approved → eksport → manifest → integrasi → semakan dalam game.

**AST-01:** Draf tidak menggantikan aset approved secara senyap. Simpan versi terdahulu dan ID stabil apabila identiti aset sama.

## Struktur yang dicadangkan

| Folder | Kandungan |
| --- | --- |
| art/source/ | Fail master, layer dan sumber boleh edit |
| art/reference/ | Rujukan asal dan nota provenance |
| art/review/ | Draf, contact sheet dan perbandingan |
| public/assets/cards/ | Artwork kad produksi |
| public/assets/icons/ | Ikon UI |
| public/assets/characters/ | MC dan ekspresi/pose |
| public/assets/enemies/ | Musuh dan boss |
| public/assets/backgrounds/ | Background stage |
| public/assets/vfx/ | Sprite/kesan yang diperlukan |
| public/assets/audio/ | Music dan SFX |
| data/assets/ | Manifest/registry mengikut struktur projek |

Ikut struktur repo sedia ada jika sudah ada; jangan melakukan migrasi folder besar hanya untuk meniru contoh ini.

## Penamaan

Gunakan lowercase ASCII snake_case, kategori, ID, varian dan versi:

- `card_bara_art_v001.png`
- `icon_energy_32_v001.svg`
- `mc_01_turnaround_v001.png`
- `mc_01_idle_front_v001.png`
- `enemy_cermin_bara_idle_v001.png`
- `boss_penguasa_deck_phase2_v001.png`
- `bg_kubu_lambang_battle_v001.webp`
- `sfx_card_draw_v001.ogg`

**AST-02:** Nama tidak menggunakan “final_final2”. Asset ID dalam data tidak bergantung pada nama fail versi; manifest memetakan ID ke path semasa.

## Kontrak eksport

| Kategori | Master cadangan | Eksport / syarat |
| --- | --- | --- |
| Artwork kad | Minimum 1024 px pada sisi panjang | Crop mengikut zon art; tiada teks UI dibakar |
| Ikon | Vektor grid 32 unit | SVG bersih dan PNG jika perlu |
| MC/musuh statik | Sisi panjang sekitar 2048 px | PNG/WebP alpha; baseline/anchor seragam |
| Turnaround | 4096 × 2304 px | Sheet penuh + setiap sudut berasingan selepas diterima |
| Background | Sekitar 1920 × 1080 px | Crop responsif dengan safe zones |
| Sprite sheet | Berdasarkan animasi sebenar | Frame size, count, fps dan pivot direkod |
| Audio | Master berkualiti asal | Format web yang disokong renderer; durasi/loop metadata |

Ukuran ialah target produksi awal. Jangan upscale dan mendakwa detail baharu; renderer boleh memerlukan resolusi lain.

## Manifest minimum

Setiap aset mempunyai assetId, category, filePath, version, width/height atau duration, pivot/anchor jika berkenaan, source, author/provider, usageRights, status, relatedContentIds dan reviewNote.

`usageRights` mesti merekod “rujukan diberikan pengguna; hak penggunaan perlu disemak sebelum edaran” jika hak belum diketahui. Jangan mereka lesen. Rekod prompt dan tarikh bagi aset yang dijana jika diperlukan untuk menghasilkan semula.

## Semakan teknikal

- **AST-03:** Alpha sebenar; tiada checkerboard palsu, halo hitam atau sisa latar.
- **AST-04:** Frame/pivot konsisten; watak tidak melompat apabila pose berubah.
- **AST-05:** Tiada teks salah eja, nombor palsu, limb berganda atau ikon yang tersalah makna.
- **AST-06:** Uji pada background terang dan gelap serta saiz sebenar.
- **AST-07:** Pastikan case path sepadan pada sistem yang case-sensitive.
- **AST-08:** Simpan sumber master; bundle runtime hanya aset yang benar-benar digunakan.

## Aset asal dan inspirasi

Gunakan Slay the Spire sebagai rujukan genre sahaja. Jangan mengekstrak seni, frame, logo, suara atau muziknya. Rujukan MC pengguna perlu dikekalkan provenance; perubahan reka bentuk tidak mengesahkan hak edaran secara automatik.

## Penerimaan

Aset approved mempunyai manifest, sumber, ukuran, anchor, eksport dan bukti semakan dalam UI. “Gambar cantik” sahaja tidak bermaksud sedia digunakan dalam game.

Rujuk [05](05_CARD_VISUAL_DESIGN.md), [06](06_ICON_SYSTEM.md), [07](07_ENEMY_BOSS_DESIGN.md) dan [08](08_MC_CHARACTER_ART.md) untuk keperluan domain.

## Rujukan design 2.0

**AST-09:** Rujukan master konsep ialah [MC dungeon](../../references/mc_dungeon_concept_v001.jpeg) 1600×900 JPEG dan [konsep kad](../../references/card_concepts_v001.jpeg) 1600×687 JPEG. Byte asal dikekalkan; SHA-256 di [18](18_DESIGN_REFERENCES.md).

Jangan mendakwa kedua-duanya 4K, transparent atau frame animasi. Resolusi master dalam jadual ialah sasaran eksport masa depan.

**AST-10:** Pisahkan frame/card art/teks/ikon untuk produksi English. Sheet penuh ialah concept reference, bukan empat kad runtime atau sprite battle. Font/label dalam JPEG tidak menjadi UI interaktif.

**AST-11:** Manifest menambah topicIds T1/T2/T3, cardFamily, referenceSource, reviewState=concept/reference, serta stageId/roomType/musicCueId bagi audio. Status visual tidak mengaktifkan content definition.

Tiada perubahan pada dua gambar sumber dibuat oleh kemas kini SOR ini.

## Source Edition 2.0 update

The user requested a rebuild against nine current menu references plus the supplied arena/MC/enemy/music packages. Runtime evidence, exact scope, source mappings, new Shop tuning, route-version compatibility and limits are maintained in [Source Edition](../SOURCE_EDITION.md), decisions 35–39, `DESIGN.md` and `UX-CONTRACT.md`. Earlier prototype examples in this document remain history where superseded. The implemented evaluator remains Probability; other planned math modes are not claimed active.


## Dungeon Edition 2.1 — current integration

New unchanged transparent sheets are in source-art/. tools/import-scene-assets.py preserves alpha and exports padded runtime crops plus six map seal derivatives. dist/assets/scene-assets.json records original hashes/crops. Original square/FHD icon PNGs remain in modules/map/assets/map-icons/; none is silently recolored.

## Dungeon Edition 2.3 — latest source import

`tools/import-dungeon-2-3.py` reads the extracted Finalize Design(2).zip. It exports five enemy pose sets, Alyssa standing plus retained action exports, seven retained source enemy models, all six arena variants and 13 atlas crops. Sprite canvases are 1600×1200 with fixed (800,1100) foot pivot; alpha noise at 8/255 or below is discarded. `dist/assets/grounding-assets.json` records source hashes, crop regions and pivots. Runtime referenced sprite/arena paths must be nonempty and decodable. This is mechanical asset preparation, not a redraw or a new frame-by-frame animation.

Five menu clean plates were made with built-in imagegen precise-object-edit: remove the baked logo and button/text regions while retaining each Alyssa/dungeon scene. `dist/assets/menu-art.json` records the source references, hashes, native output dimensions (1672×941), date, prompt and WebP derivatives. These are not advertised as native 4K. Original uploaded references and ZIP are untouched.

## Predict companion icon 2.3.2

Focus is the existing unmodified atlas crop `ui-focus.webp`. A companion Predict image was made with built-in imagegen by editing that crop as a frame/style reference: replace its eye crystal with a divination sphere above three cards. The output is copied byte-for-byte to `dist/assets/ui-predict.png`; its original 1254×1254 RGBA canvas and transparent outer padding are retained. It is not described as native 4K. `hud-icons-2-3-2.json` records the prompt, reference and output hashes, dimensions and alpha inspection. No atlas/source-sheet pixels are overwritten.

## Dungeon Master entity 2.4.1

The latest user instruction replaces the human elder with an unidentified non-human presence. Two built-in imagegen edits preserve Alyssa, altar and blue-stone composition, replacing the Master with a black rift and broken gold rune arcs. The second request explicitly asked for 3840×2160, but native output remains 1672×941. Mechanical Lanczos resampling exports the runtime `dungeon-master.webp` at 3840×2160, WebP quality 95. This is an upscaled 4K export, not a native-4K generation. Full prompts and exact source/runtime hashes are retained in `dungeon-master-entity-2-4-1.json`; `dungeon-master-art.json` retains the prior edition provenance. Original uploads remain unchanged.

## Approved artwork PNG export 2.4.2

The latest upload image(20261019-025055).png is pixel-identical to the approved 2.4.1 generated source. A separate Lanczos PNG export at 3840×2160 is included in the update ZIP's ARTWORK folder. This preserves the exact approved art; no new generation or redraw is performed. The game continues to use its existing 3840×2160 WebP. The PNG is explicitly upscaled from 1672×941, not native 4K detail. Source/PNG/runtime hashes and dimensions: dist/assets/dungeon-master-png-2-4-2.json.

## Supplied stone Master artwork 2.4.3

The newest user image image(20261019-032240).png replaces the prior rift image. It has a stone/obsidian Master with a carved face and hands; that explicit new reference supersedes the old no-face/no-hands prompt. The exact original 1672×941 PNG is preserved in the user's upload. Mechanical ImageMagick Lanczos export supplies a 3840×2160 PNG and WebP quality 95 runtime. No creative edit or new generation is performed. These are upscaled 4K canvases, not native 4K. The source/runtime/PNG hashes are in dist/assets/dungeon-master-stone-2-4-3.json; dungeon-master-art.json keeps prior records as history. The update's ARTWORK folder contains the new PNG, not the superseded 2.4.2 art.
