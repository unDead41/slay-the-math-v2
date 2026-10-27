# Emberlyn — main 2.53.0

**VALID dalam skop audit dan QA calon stabil; penerbitan main PENDING.**
Ijamm mengarahkan audit dan push semua pakej yang benar-benar pending.
Hanya Pet ialah ciri semasa yang belum masuk main. Pengaktifan provider/backend
awam tidak termasuk. Tarikh: 27 Oktober 2026, Asia/Kuala_Lumpur; Master SOR
**1.3.0** main dibaca dahulu.

| Identiti | Pin |
| --- | --- |
| Main asas / versi | `7a49fff83388347f0157616fc6b051ddbda4c694` / 2.52.0 |
| Feature Pet | `codex/ai-pet-online-20261025` / `07677f62ede996e2dd66d9b53f9fd5e152069863` |
| Keadaan awal | Enam commit terus selepas main, 6 ahead / 0 behind; tiada konflik Git |
| Calon QA tempatan | `728d25e7a9969b3570e7e8943664b9a6c43ce67c` |
| Tree QA tempatan | `2bb0b762478cc76243097cc9aba7300bebab6524` |
| Versi stabil | 2.53.0; source/production daripada owner semasa |

SHA QA di atas ialah checkpoint **tempatan**. Commit API terbitan mungkin berbeza;
exact tree/runnable binding mesti direkodkan selepas penerbitan. Bukti fresh QA
merujuk calon ini; delta akhir hanya dokumentasi/evidence dan disemak berasingan.

## Inventori branch

40 refs sebenar terdiri daripada main dan 39 non-main. Kesemua 37 head asal
kekal, ditambah task rename yang ancestral dan Pet. 39 non-main dikelaskan sebagai
20 ancestor, 14 penerimaan seluruh tree sejarah, tiga specialist diterima terpilih,
satu preview bahasa diganti dan satu Pet pending. Behind sahaja bukan kecacatan.

| Kerja bukan pending feature semasa | Disposisi |
| --- | --- |
| `balance/combat`, `balance/economy`, `balance/map` | Sejarah diterima terpilih; baki alat/data tidak disahkan semula pada 2.53.0, tiada raw merge |
| Preview `dual-language-bm-bi` | Telah diganti; PERLU UPDATE jika dihidupkan semula |
| `balance/master` dan task rename | Sudah ancestor; branch dan rekod asal dikekalkan |

Inventori penuh, setiap ahead/behind/merge-base dan 14 bukti tree adoption berada
dalam [indeks bukti](verification/pet-main-20261027/evidence-index.json). Semakan
Root 13:50:20Z mendapati 40 refs masih sama; lease dibaca lagi sebelum main write.
Tiada claim semua branch sejarah telah raw-merged atau diuji sebagai alat aktif.

## Integrasi dan pemeliharaan

Calon mengekalkan enam commit Pet dan source behavior asal, promote
2.53.0-pet.1 kepada stabil 2.53.0. Hanya lapan path package/generated berubah
daripada feature: package, Practice, integration audit, release, tiga entrypoints
dan asset manifest. Script main dikekalkan; tambahan Pet kekal. Lima build owner
exact main. Tiada edit runtime behavior, test, bank, math/numerical, AI/model,
current/archived rules, save/RNG, VFX/Idle, sharing, 610 aset non-Tutorial asal atau namespace.

Pet Emberlyn asal ialah PNG 4,427,889 bytes, SHA-256
`51ac96816818d22a27d469286926863f32b362e90c33dca5d62a1bbaa075a2fc`.
Satu Settings preference dan `requestOnline` mengawal API, termasuk explicit
Online, cancellation dan stale-response guards. Local FAQ kekal apabila blocked,
Offline atau servis gagal. Soalan aktif memakai original Continue/Hint dengan
attempt/assistance accounting; Practice tidak membuka free-chat bypass.

Provider key/model serta expected-code/origin policy dikonfigurasi server-side.
**Kod classroom yang dimasukkan pemain berada di password input/tab memory dan
dihantar sebagai Bearer**, bukan disimpan dalam save. Context API minimum tidak
menghantar bank jawapan, raw save/RNG, rekod pendidikan atau future offers.
Replies ialah plain text. Tiada real credential/provider/backend diaktifkan.
GitHub Pages hanya game statik; Online memerlukan hosted HTTP(S) origin dan backend
operator yang sepadan. Portable `file:` menyediakan local help, bukan null-origin
API exception. [Panduan operator](PET_ASSISTANT.md).

## Build dan artifact yang diuji

Normal build PASS **4.840 s**, production PASS **5.301 s**, tanpa pretest rebuild.

| Output | Identiti |
| --- | --- |
| Source | ID `2cd3983e582904c5dc632414`; 770 manifest entries, 772 offline-declared files + canonical manifest |
| Production | ID `b0d1369647d48acbf3bd64fd`; 771 entries, 773 offline-declared files + canonical manifest |
| Dua alias portable | 318,208,878 bytes setiap satu; SHA-256 `4811f778f856642811e4ecc234921ecb686abbca805286491941ccd89765a2aa` |

Semua declared hash/length/path dan shell identity diperiksa bebas. Source dan
production berbeza mengikut transform owner; readiness tidak dipin kepada versi
preview lama. `MATHEMATICS-SLAYER-OFFLINE.html` dan alias
`SLAY-THE-MATH-OFFLINE.html` byte-identical; ini bukan migration storage file-origin.

## Hasil fresh pada calon 728d25e7

| Semakan | Hasil sebenar |
| --- | --- |
| Focused Node, 14 fail | **126/126 PASS**, 0 fail/skip/cancel, EOF lengkap, 19.427 s |
| Syntax Pet/app/server | Tiga command, tujuh JS files PASS |
| Native Pet desktop/phone BM/English | **54/54 PASS**, 0 errors, 57.422 s |
| Production cold-offline | **15/15 PASS**, 0 errors, 141.784 s |
| Portable EN canonical / BM alias | **2/2 PASS**, 0 HTTP/page errors, 11.157 s |
| Root exact mathematical oracle | **4,163 parameter checks, 0 fail**, Fraction/set/truth reference, berasingan daripada Node cases |
| Independent semantic/static audit | **VALID**; preserved owners, Pet art, manifests/aliases dan capture bindings |

126 ialah command focused sebenar dengan EOF, **bukan full game suite**. Typed Pet
calculators baharu diperiksa oleh oracle; ini bukan audit baharu seluruh bank,
textbook atau pupil outcomes. Historical 1,266 recorded feature PASS cases merentas
commands mengekalkan dependency failures/tiada EOF asal dan bukan full-green
stable run. Historical recovery/follow-up receipts tidak diubah.

Native Pet menggunakan endpoint/provider terkawal, memeriksa exact save/RNG,
permission/cancellation, accounted original Hint, wrong-code/version recovery dan
local help. Cold test memasang/verifies **774/774** production files, kemudian
memulakan browser process baharu pada profile yang sama dengan server dihentikan,
HTTP cache disabled/network blocked dan navigation service worker; retained bytes
237,492,918. Practice 120, Tutorial 23/98, empat stage/boss fixtures, VFX dan 85 audio
decode diperiksa. Playback automatik bukan human audition/OS reboot.

Portable memeriksa pet asal/local set help, explicit Offline, legacy key/deck,
exact synthetic save/RNG dan jenama semasa. EN 1366×900 dan BM 390×844 ialah dua
file/origin fixtures berasingan. Bounds dan kawalan boleh dicapai dengan scroll;
**bukan semua isi modal muat serentak satu viewport**. Browser-cache Ready ialah
false pada portable dan tidak dilabel sebagai pemasangan cache lengkap.

QA CLOSED **2026-10-27T13:53:17.315721Z**: 3,750 tracked hashes bersih, zero tracked/
source/artifact delta, source/production dan dua portable exact; owned browser/
server PIDs kosong. Public privacy review PASS, raw private body count 0.

## Provenance Tutorial dan evidence

98 gambar ialah actual capture Pet asal pada durable checkpoint
`1c4d86f4f876ccec4821c70acd12846e08ba09e0` (local source 5f5c547),
tree `6e9f20861b5c19fe272161daf4258d4113b77133`, version 2.53.0-pet.1.
Kesemua 111 input asal bind kepada source itu. Stabil semasa **107/111** sama;
perbezaannya `education-practice.js` (generated version), `index.html`,
`pet-assistant.js` (follow-up recovery copy) dan `release.js`. Raw app/engine,
strict provenance guard serta semua 98 image hash/dimensions/actions/per-image
batches exact. Tiada recapture atau relabel metadata, dan tiada source normalization
untuk memaksa pass. Strict media checks termasuk dalam 126 focused PASS.

[Pakej public lossless](verification/pet-main-20261027/README.md) menyimpan hanya
allowlist yang privacy-approved: stdout EOF/commands, drivers/diffs, reports,
screenshots QA dan proof statik/Root yang diperlukan. Tiada profile/cache/dependency,
provider key, raw save/RNG/session/export body atau rekod pemain sebenar. Dua
kegagalan URL mirror setup disimpan sebagai setup, bukan product/test failures.

## Penemuan dan had

- **MASALAH DISAHKAN / P3 docs:** ayat draft classroom-code dibetulkan seperti
  di atas; entry CHANGELOG stabil dipisahkan daripada historical candidate.
  Tiada runtime fix diperlukan. Tiada isu tambahan P0/P1 ditemui dalam skop ini.
- **MASALAH inherited:** CI-247-01, QA-248-PRELOAD-01 dan AM-U01 kekal pada
  pemilik asal. Fresh PASS tidak membuktikan fixes yang tidak dibuat.
- **RISIKO BERPOTENSI:** real model quality/latency/cost/retention, auth/shared
  quota per-replica dan long-term CacheStorage eviction belum diverifikasi.
  Hint guard normal-flow bukan anti-cheat edited-client atau external assistant.
- **PENAMBAHBAIKAN:** tiada perubahan opsyenal dibawa senyap; tindakan baharu
  memerlukan skop tersendiri. Physical/screen-reader/pupil/human-audio belum diukur.

Tiga PDF textbook/DSKP tersedia; tidak dibaca baharu kerana bank/math unchanged.
Review Pet asal selektif, bukan seluruh buku/120 soalan. MODEL.zip unavailable/
unread. Tiada new campaign/training, win-rate, live Google/provider/backend,
public browser, physical-device atau full-suite claim. Pages belum disahkan
sehingga workflow untuk actual published SHA diperhatikan.

## Penerbitan

**PENDING.** Root perlu meluluskan exact final tree; sole writer kemudian membaca
main segera, memakai expected-head `7a49fff83388347f0157616fc6b051ddbda4c694`
dan `force:false`, berhenti jika bergerak, serta readback ref/tree/version/parents.
Sumber Pet dan semua branch asal dikekalkan. Pages exact head disemak berasingan;
receipt dokumentasi hanya merekod fakta actual selepas write yang dibenarkan.
