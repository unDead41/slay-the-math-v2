# Slay the Math — Kesan 31 Artifak

Versi 3.2 · 21 Oktober 2026 · Cadangan reka bentuk untuk semakan Ijamm.

**Starting < Elite/Mystery < Boss** ialah sasaran kuasa keseluruhan. Nilai ini belum diuji dalam kod combat sebenar; sinergi dan keadaan tertentu boleh mengubah nilai sesuatu artifak.

## Starting — 12 artifak

Pilih **1 daripada 12** semasa memulakan run. Urutan jadual sama dengan sheet: kiri ke kanan, kemudian baris seterusnya.

| # | Artifak | Kesan cadangan |
|---|---|---|
| 1 | **Emberheart Pendant** | Pulihkan 2 HP selepas menang combat. |
| 2 | **Cinder Whetstone** | Kad Attack pertama setiap giliran mendapat +1 jumlah damage. |
| 3 | **Prism Buckler** | Kad Defend pertama setiap giliran memberikan +2 Block. |
| 4 | **Clairvoyance Lens** | Dapat +1 Focus pada giliran pertama setiap combat, tertakluk kepada had Focus. |
| 5 | **Scholar's Bookmark** | Draw 1 kad tambahan pada giliran pertama setiap combat. |
| 6 | **Merchant's Seal** | Diskaun 5% untuk pembelian di Shop. |
| 7 | **Bronze Guard Pin** | Dapat 3 Block pada giliran pertama setiap combat. |
| 8 | **Traveler's Ration** | Apabila diperoleh, +5 Max HP dan pulihkan 5 HP. Digunakan sekali untuk run tersebut. |
| 9 | **Copper Purse** | Apabila diperoleh, dapat 25 Gold. Digunakan sekali untuk run tersebut. |
| 10 | **Ember Quill** | Selepas memainkan kad Skill pertama setiap combat, draw 1 kad. |
| 11 | **Scribe's Pebble** | Kali pertama kad milik Alyssa memasuki Exhaust setiap combat, dapat 4 Block. |
| 12 | **Initiate's Ring** | Selepas memainkan kad Passive pertama setiap combat, dapat 3 Block. |

## Elite / Mystery Event — 16 artifak

Satu pool bersama untuk ganjaran Elite dan Mystery Event. Ini bukan 16 Elite ditambah 16 Mystery.

| # | Artifak | Kesan cadangan |
|---|---|---|
| 1 | **Copper Abacus** | Selepas memainkan 3 kad dalam satu giliran, dapat +1 Energy. Sekali setiap giliran. |
| 2 | **Twin Sigil Medallion** | Main sekurang-kurangnya 1 Attack dan 1 Defend dalam giliran sama untuk mendapat 6 Block. Sekali setiap giliran. |
| 3 | **Chance Die** | Giliran pertama: baling d6 sekali. 1–2: +10 Block; 3–4: draw 2 kad; 5–6: +2 Energy. |
| 4 | **Ember Balance** | Jika sekurang-kurangnya 1 Energy masih berbaki ketika End Turn, dapat 6 Block. |
| 5 | **Chainbreaker Clasp** | Kali pertama kad milik Alyssa memasuki Exhaust setiap giliran, draw 1 kad dan dapat 4 Block. |
| 6 | **Ashen Phoenix Feather** | Pulihkan 5 HP selepas menang combat. |
| 7 | **Rune-smith Tongs** | Kad Attack pertama setiap giliran mendapat +3 jumlah damage. |
| 8 | **Sentinel Crest** | Kad Defend pertama setiap giliran memberikan +6 Block. |
| 9 | **Mirror Knight's Brooch** | Kali pertama Block menghalang sepenuhnya damage serangan musuh dalam satu giliran, balas 6 damage kepada penyerang. Sekali setiap giliran. |
| 10 | **Rune Bat's Bell** | Selepas memainkan kad Skill pertama setiap giliran, draw 1 kad. |
| 11 | **Scholar's Satchel** | Draw 2 kad tambahan pada giliran pertama setiap combat. |
| 12 | **Lantern Keeper's Flask** | Kali pertama HP berada pada 50% Max HP atau kurang semasa Alyssa masih hidup dalam combat, dapat 12 Block. |
| 13 | **Chain Weaver's Spool** | Kali pertama kesan kad membuang kad daripada hand ke Discard setiap giliran, draw 1 kad dan dapat 3 Block. |
| 14 | **Bram's Contract** | Diskaun 15% untuk pembelian di Shop. |
| 15 | **Crimson Sword Charm** | Dapat +2 Strength pada awal setiap combat. |
| 16 | **Guardian's Armlet** | Dapat +2 Agility pada awal setiap combat. |

## Boss — 3 artifak

Selepas Boss Stage 1, tawarkan ketiga-tiganya dan pemain pilih **1** untuk Stage 2.

| # | Artifak | Kesan cadangan |
|---|---|---|
| 1 | **Gatekeeper Core** | Dapat +1 Energy pada awal setiap giliran pemain. |
| 2 | **Sovereign Grimoire Clasp** | Mula combat dengan +3 Strength dan +3 Agility. Pada giliran kedua dan seterusnya, tambah +1 kedua-duanya sehingga sumbangan artifak mencapai +6 bagi setiap stat. |
| 3 | **Decklord's Hourglass** | Draw 2 kad tambahan pada awal setiap giliran pemain. |

## Istilah

- **Strength** menambah damage daripada kad Attack mengikut sistem stat game.
- **Agility** menambah Block yang diperoleh daripada kad Defend mengikut sistem stat game.
- **Block** ialah perlindungan sementara; bukan Max HP.
- **Focus** menggunakan fungsi dan had Focus sedia ada. Artifak ini tidak menukar Prediction.
- Bonus damage Cinder Whetstone / Rune-smith Tongs dikenakan **sekali bagi kad Attack yang layak**, bukan sekali bagi setiap hit.
- Setiap artifak ialah item pasif sepanjang run. Ia tidak memerlukan butang aktivasi atau bayaran Energy tambahan.

Kesan terperinci, turutan trigger, stacking dan eksport ikon dinyatakan dalam **SOR_ARTIFACTS.md**.


## Rich text V1.1

Nilai calculation ungu lembut; istilah matematik pink lembut; istilah game hijau lembut. Teks biasa ikut design game. Calculation dipaparkan sebagai hasil akhir dan langkah kiraan dibuka melalui hover. Lihat SOR_RICH_TEXT_CALCULATION.md dan rich_text/.
