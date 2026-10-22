# MASTER INTEGRATION — Slay the Math

Panduan kemas kini Question Bank 1.6.0, kandungan `form4-review-1.6.0`, dalam struktur `MECHANIC_INTEGRATED`. Tarikh: 22 Oktober 2026.

## Mula di sini

Untuk mencuba semua soalan, buka `QUESTION_BANK/QUESTION_BANK_RICH_TEXT_PREVIEW.html`. Ia berfungsi offline. Baca `QUESTION_BANK/START_HERE.md` untuk aliran jawapan salah, Hint, More Hint, penyelesaian dan Show Steps.

ZIP ini mengandungi `QUESTION_BANK`, `STM_SHARED` dan panduan utama. Folder `ARTIFACT` daripada dua ZIP Artifact 3.5 terdahulu boleh berada bersebelahan. Aset, katalog dan kesan artifact tidak disertakan semula atau diubah oleh kemas kini soalan ini.

| Folder | Pemilik / sumber utama |
|---|---|
| `QUESTION_BANK/` | Bank 120 soalan, sesi pembelajaran, visual, pengenalan asas, progress dan entry `integration/index.mjs`. |
| `STM_SHARED/` | Satu servis tooltip dan registry bersama untuk kedua-dua kategori. |
| `ARTIFACT/` jika sudah dipasang | Katalog, PNG, tracker, runtime dan adapter artifact sedia ada. |

Extract kemas kini ini ke parent yang sama dengan pakej terdahulu. Gabungkan root `MECHANIC_INTEGRATED`, simpan backup fail tempatan, kemudian gantikan keseluruhan folder QUESTION_BANK dan fail STM_SHARED daripada kemas kini ini. Elakkan root berganda. Muat semula game selepas mengemas kini supaya servis tooltip lama tidak kekal dalam memori.

## Sumber data dan identiti

Load tiga JSON: `QUESTION_BANK/question-bank-form4-120.json`, `QUESTION_BANK/rich_text/glossary.json`, dan `QUESTION_BANK/learning/foundations.json`. Bank utama ialah sumber runtime; CSV, Markdown, hint mirrors dan content.json ialah export yang diselaraskan. ID 120 soalan, 480 pilihan, seed dan binding jawapan betul kekal. Beberapa ayat pilihan telah diringkaskan; jangan menjana semula ID berdasarkan teks baharu.

Versi state sesi kekal 1. Simpanan lama yang sah boleh dipulihkan menggunakan event history dan choice IDs yang sama. Pemulihan tidak mereset sejarah soalan. Pembukaan run baharu mengekalkan exposure IDs. Apabila pool habis, jangan ulang soalan secara senyap.

Semua soalan mempunyai `harmonization` dengan contextNote, given, asked, sumber halaman dan classification. Rujukan penuh ialah `QUESTION_BANK/harmonization/source-alignment.json`; filename/hash sebenar berada dalam source-registry.json. Gunakan `pdfPages` sebagai nombor halaman fail bermula 1; `printedPages` ialah nombor yang dicetak dalam buku. Label core/supporting/enrichment bukan tahap penguasaan rasmi.

## Rich text dan artifact

Canonical registry ID kekal:

`881ed46c93d9444d01853bf2056a09e5216a8b5278ecb3aacdb069ca21818201`

Kategori Artifact kekal 55 key; Question Bank kekal 124 key; gabungan mempunyai 176 canonical entries. Attack, Skill dan Energy berkongsi canonical ID. Definisi canonical dan signature artifact dikekalkan. Warna matematik pink, game hijau dan calculation ungu dikekalkan, termasuk garis bawah serta sokongan hover/focus/tap.

Versi servis asas ialah 1.0.0 dengan capability tambahan `teachingExplanations: true`. Fail `STM_SHARED/rich-text.js` dalam keluaran ini menyokong `glossary.entries[id].teaching` hanya untuk domain question-bank. Ini memberikan maksud mudah English/Bahasa Melayu tanpa menggantikan makna artifact. Jangan menyalin fail shared lama di atas shared baharu selepas memasang kemas kini. Entry Question Bank 1.6 menyemak capability ini dan memberi ralat jelas jika servis lama masih aktif.

Untuk classic loader, muatkan `STM_SHARED/registry.js` kemudian `STM_SHARED/rich-text.js`, dan CSS `STM_SHARED/rich-text.css`. Entry ESM Question Bank mengimport servis sama melalui `STM_SHARED/index.mjs`. Gunakan satu shared directory dan satu document-level tooltip hub. Teardown UI memanggil `tips.destroy()`.

## Entry dan save owner game

Import daripada `QUESTION_BANK/integration/index.mjs`. Berikan `bank`, `glossary`, `foundations`, `savedSession`, numeric `seed`, dan callback `persist(nextSession)` milik save owner game. Callback mesti menolak jika simpanan gagal. Await setiap mutation sebelum memaparkan hasil. Satu runtime bagi satu player save dikongsi antara scenes.

| API | Tujuan |
|---|---|
| `next({topicCode})` | Reserve ID belum digunakan, atau sambung pending; PROB, SET atau LOGIC. Legacy topicId T1/T2/T3 juga disokong. |
| `submit({questionId, choiceId, attemptId})` | Terima satu jawapan melalui event ID stabil; duplicate input tidak dikira semula. |
| `openSupport({questionId, kind})` | kind: hint, moreHint, foundation atau steps. |
| `reveal({questionId})` | Tamat sebagai revealed, tanpa kredit jawapan betul. |
| `getView()` | Gated rich text, feedback dan metadata yang selamat untuk UI. |
| `getLegacyView()` | Teks biasa daripada sesi sama, dengan jawapan tersembunyi sehingga selesai. |
| `snapshot()` / `progress()` | Salinan state dan progress tanpa mengubah pemilik game. |

`view.question.teaching` menyediakan contextNote, given, asked, rich text untuk ketiganya, sumber dan alignment. Nota editorial alignmentNote dan source.basis hanya dibuka selepas soalan selesai kerana boleh menyebut cara penyelesaian. Ia sengaja tidak mendedahkan mathematicalCheck atau nota editorial yang boleh mengandungi jawapan. Jangan terus render seluruh `q.harmonization` ke skrin pemain.

Render menggunakan `renderRichText`, `renderVisual` dan `attachRichTextTooltips` daripada entry sama. Berikan satu calculationIndex untuk UI yang sedang kelihatan. Pada rerender, tutup tooltip lama dan kosongkan index. Parent UI mempunyai `data-stm-richtext` dan `data-theme`. Phaser text biasa tidak memaparkan DOM MathML; sambungkan renderer ini kepada DOM modal game yang sedia ada. Panduan API lanjut: `QUESTION_BANK/integration/README.md`.

## Aturan aliran yang wajib dikekalkan

1. Papar soalan dan pilihan; tooltip istilah sentiasa boleh dibuka. Hover/tap istilah bukan pemilihan jawapan.
2. Jawapan salah memaparkan feedback khusus dan membenarkan retry pada soalan sama. Penjelasan penuh, jawapan betul dan solution visual kekal tersembunyi.
3. Pemain perlu benar-benar membuka Hint. Hanya jawapan salah yang dihantar selepas itu membuka More Hint. Salah sebelum Hint tidak membuka More Hint apabila Hint kemudian dibaca.
4. Tab More Hint dibuka atas permintaan selepas unlock. Pembukaan bantuan tidak menambah kos atau penalti yang tidak ditetapkan game.
5. Jawapan betul atau explicit final reveal membuka penjelasan dan solution visual. Show Steps dibuka berasingan. Final reveal direkod berasingan daripada jawapan betul.
6. Bezakan betul tanpa bantuan, betul dengan bantuan, betul selepas retry dan revealed dalam progress. Latihan asas tidak menambah bilangan soalan penilaian.

Calculation ungu hanya menggunakan pengiraan tepat yang ditulis dalam penjelasan selepas jawapan dibuka. Jangan menilai formula soalan secara automatik semasa hover. Peristiwa game sebenar masih menggunakan origin resolved/preview/example dan snapshot nilainya sendiri.

## Reward, Claim Artifact dan projek game

Pemilik HP, Energy, Gold, timer, score, artifact tracker dan resolver combat kekal pada game. Runtime soalan tidak memberi artifact atau mencipta penalti. Sambungkan `completedNow`, kategori completion dan hasil submit kepada transaksi encounter/reward game yang sedia ada. Koordinasikan save soalan dan pemberian reward supaya refresh/duplicate input tidak memberi reward dua kali.

Preview membuktikan aliran pembelajaran dalam pelayar; ia bukan pemasangan pada game sebenar. `MODEL.zip` tidak tersedia dan belum dibaca. Untuk memasang screen, Claim Artifact gate atau menguji build game, perlukan kod game terkini dan policy reward yang memang digunakan projek.

## Semakan dan rebuild

Dari root ini, `node VERIFY_QUESTION_BANK.cjs` menyemak hash fail pakej soalan/shared. Ujian kandungan dan runtime berada dalam QUESTION_BANK/verification. Ujian pelayar berada dalam QUESTION_BANK/verification/browser-tests. Fail screenshot QA adalah bahan pemeriksaan dalaman, bukan aset game.

Untuk rebuild kandungan: `python3 QUESTION_BANK/harmonization/build_harmonized.py`, kemudian `python3 QUESTION_BANK/render_rich_text_preview.py`. Baca HARMONIZATION_REPORT.md dan SOURCE_DISCREPANCIES.md. Authored v1.6 JSON ialah sumber semasa; fail generator lama dikekalkan untuk semakan model asal. PDF lama tidak disertakan kerana menggunakan ayat lama; review lengkap semasa ialah Markdown dan preview HTML.

Semua ZIP kategori dihadkan kepada 150,000,000 bait. Kemas kini Question Bank ini muat dalam satu ZIP. Jangan mendakwa ujian artifact source atau game sebenar telah dijalankan hanya berdasarkan semakan preview; status berasingan direkod dalam INTEGRATION_REPORT.json.
