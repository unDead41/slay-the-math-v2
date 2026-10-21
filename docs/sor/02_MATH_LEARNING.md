# 02 — Matematik, topik dan pembelajaran

Versi: 2.2.0. Arahan Ijamm 19 Oktober 2026 mengehadkan bank pendidikan kepada tiga bab KSSM Matematik Tingkatan 4 dan kini meminta implementasi selepas Claim Artifact. Game 2.5.0 menggunakan bank 120 item yang sama. Arahan ini mengatasi rancangan algebra/indices dalam baseline 2.0 di bawah.

## Skop terkini - diimplementasi dalam game 2.5.0

| ID bank | Bab | Topik | Item |
|---|---|---|---|
| T1 / PROB | 9 | Kebarangkalian Peristiwa Bergabung | 40 |
| T2 / SET | 4 | Operasi Set | 40 |
| T3 / LOGIC | 3 | Penaakulan Logik | 40 |

**MTH-09:** Ijamm kini meminta implementasi sebenar menggunakan bank 120 yang telah dihantar. Claim Artifact membuka scene `education` dengan satu soalan daripada `form4-review-1.0.0`. `dist/question-data.js` mengekalkan prompt, pilihan, jawapan, hint dan penerangan asal bagi semua 120 item. Evaluator Predict tempur kekal berasingan dan masih Probability.

**MTH-10:** Setiap item mempunyai ID unik, seed tetap, empat pilihan, jawapan, hint, penerangan, difficulty cadangan dan SP terpilih. Soalan Probability menggunakan TEACHING_POOL/eksperimen tetap, bukan mendakwa snapshot draw pile hidup. Rujukan pemetaan ialah DSKP KSSM Matematik Tingkatan 4 dan 5, KPM/BPK September 2018, bab 3, 4 dan 9. Ini item asal dan draf semakan, bukan bank rasmi KPM atau penguasaan seluruh DSKP.

**MTH-11:** Cabutan rawak tanpa penggantian mengikut ID; item direkod digunakan apabila scene soalan dibuka. RNG soalan berasingan daripada combat/map/artifact. Pilih secara rawak antara topik yang masih berbaki, kemudian item yang belum pernah keluar dalam topik itu. Susunan pilihan dikocok sekali dan disimpan. New Run tidak mengosongkan sejarah. Browser pada origin yang sama menyimpan sejarah profil; run/export turut membawa semua ID yang diketahui. Import menggabungkan sejarah, bukan mengosongkannya. Selesai 120: papar bank habis dan benarkan sambung tanpa soalan berulang; tiada auto-reset.

**MTH-12:** Pilihan artifact dikunci tetapi belum diberi ketika soalan dijawab. Pilih A-D dan Check Answer. Jawapan salah menolak pilihan yang telah dicuba, membenarkan cubaan lain dan Hint; tiada countdown, penalti HP atau Focus. Selepas jawapan betul, papar jawapan sebenar dan penerangan. Tindakan Continue/Claim terakhir memberi artifact sekali sahaja lalu menyambung flow asal. Starting ke map; Elite/Mystery melengkapkan bilik; Boss Stage 1 ke checkpoint Stage 2. Skip gift sebelum trial kekal seperti dahulu bagi Elite/Mystery.

**MTH-13:** Refresh, Menu/Continue dan import menyambung pending question ID, susunan pilihan, pilihan semasa, cubaan, hint dan solved flag. Tiada reroll pada render. Rekod completed education berasingan daripada mastery Predict; tidak memberi bonus combat atau memalsukan kredit first-correct Predict. Save rosak atau jawapan yang direka ditolak melalui bank ID dan pengesahan state.

Keputusan: DEC-20261019-27 (review dahulu), digantikan bagi timing implementasi oleh DEC-20261019-30/31. Pemilik: education.js untuk bank/soalan, engine.js untuk transaksi claim/progres, app.js untuk sejarah profil dan kawalan native, artifact-ui.js/education.css untuk paparan. Bukti: docs/EDUCATION_UPDATE_2_5_0.md.

## Baseline 2.0 terdahulu - sejarah, digantikan bagi bank baharu

## Taksonomi kandungan

| ID | Topik utama | Motif MC | Status kandungan |
| --- | --- | --- | --- |
| T1 | Probability | Gesper dua gelang | Mekanik Predict terdahulu diteruskan |
| T2 | Expansion & Factorisation | Folio grid/jubin | Domain diperlukan; bank dan integrasi khusus perlu dibina |
| T3 | Indices | Bracer x²/x³ | Domain diperlukan; bank dan integrasi khusus perlu dibina |

**MTH-01:** Tiga fokus v1 ialah subfokus T1: P1 combined events, P2 dependent/independent events, P3 mutually exclusive/non-exclusive events. Ia bukan tiga topik utama baharu.

Dua stage tidak bermaksud satu topik setiap stage. Semua topik boleh muncul pada kedua-duanya melalui kandungan berperingkat. Jangan mengaktifkan modifier damage baharu hanya kerana motif wujud pada kostum.

## T1 — Probability

| Keadaan | Formula |
| --- | --- |
| Hasil sama mungkin | P(A)=n(A)/n(S), n(S)>0 |
| Inclusive OR | P(A ∪ B)=P(A)+P(B)−P(A ∩ B) |
| Mutually exclusive | A ∩ B kosong; P(A ∪ B)=P(A)+P(B) |
| AND umum | P(A ∩ B)=P(A)P(B given A), jika P(A)>0 |
| Independent | P(A ∩ B)=P(A)P(B) |
| Conditional | P(B given A)=P(A ∩ B)/P(A), jika P(A)>0 |

**MTH-02:** Eksklusif bukan sinonim independent. Kad individu, bukan jenis kad, menjadi hasil sama mungkin. OR bermaksud inklusif kecuali dinyatakan tepat satu.

Contoh menggunakan keseluruhan starter 12 sebelum cabutan: 8 Attack, 3 Fire (semuanya Attack), 2 Defense dan 2 Skill.

1. P(Attack OR Fire)=8/12+3/12−3/12=2/3.
2. P(Attack OR Defense)=10/12=5/6.
3. Dua Attack tanpa penggantian=(8/12)(7/11)=14/33.
4. Dua Attack dengan penggantian penuh=(8/12)(8/12)=4/9.
5. Attack dan Fire pada satu kad: intersection=1/4 tetapi hasil darab peluang=1/6; bukan independent.

**MTH-03:** Live draw menggunakan snapshot draw pile semasa; hand, discard dan filtered tidak termasuk. Selepas Filter/Draw, kira snapshot baharu. Contoh starter bukan keadaan automatik selepas empat kad dicabut.

**MTH-04:** MVP tidak menjana soalan dua kad jika draw pile kurang daripada dua atau model melintasi reshuffle. Simulasi penggantian mesti dilabel “Cards are put back after each draw.”; ia tidak memulangkan kad game sebenar.

## T2 — Expansion & Factorisation

Skop awal dicadangkan: distributive law, pengumpulan sebutan sejenis dan common factor. Bentuk lebih kompleks hanya dimasukkan selepas objektif dan semakan.

| English prompt | Jawapan tepat | Risiko salah faham |
| --- | --- | --- |
| Expand 3(x + 2). | 3x + 6 | Darab kedua-dua sebutan |
| Expand 2(x + 4) + x. | 3x + 8 | Gabung sebutan sejenis |
| Factorise fully: 6x + 12. | 6(x + 2) | Faktor sepunya terbesar |
| Factorise fully: 12x + 18. | 6(2x + 3) | Bezakan faktor separa daripada penuh |

**MTH-05:** Grid/jubin hanya model belajar apabila ukuran dan label jelas. Bilangan kotak dekoratif tidak membuktikan satu pengembangan tertentu.

Jika ekspresi digunakan untuk damage, bentuk dikembangkan dan difaktorkan mesti memberikan nilai sama bagi x yang sama. Bentuk algebra tidak memberi bonus angka tanpa rule berasingan.

## T3 — Indices

Skop awal dicadangkan: asas positif, eksponen integer kecil, hukum darab/bahagi asas sama dan kuasa kepada kuasa.

| English prompt | Jawapan tepat |
| --- | --- |
| Simplify 2³ × 2². | 2⁵; nilainya 32 |
| Simplify 3⁴ ÷ 3². | 3²; nilainya 9 |
| Simplify (2²)³. | 2⁶; nilainya 64 |
| Find 5⁰. | 1 |

**MTH-06:** Nyatakan format jawapan: eksponen atau nilai berangka. Hukum a^m/a^n memerlukan a≠0; jangan jana 0⁰ atau pembahagian sifar. Asas berbeza tidak membolehkan eksponen dijumlahkan begitu sahaja.

## Kontrak soalan

Setiap soalan mempunyai ID, topicId T1/T2/T3, subtopicId, objektif, prompt English, jenis jawapan, jawapan tepat, hint, penerangan dan status semakan. T1 menambah snapshot, peristiwa, penggantian dan contextKind LIVE_DRAW atau TEACHING_POOL.

**MTH-07:** Gunakan pecahan tepat atau aritmetik integer. Algebra menerima bentuk setara melalui parser domain terhad yang disemak; tiada eval. Jika meminta “fully”, semak syarat pemfaktoran penuh. MCQ tidak mempunyai dua jawapan setara.

**MTH-08:** Hint menerangkan kaedah, bukan membocorkan terus jawapan. Rekod hintUsed. Selepas jawapan, papar langkah ringkas English dan jawapan sebenar; tiada countdown wajib atau penalti HP kerana salah.

Predict sebelum draw kekal khusus kepada peluang kad mengikut [03](03_COMBAT_MECHANICS.md). Penempatan challenge T2/T3 dalam tutorial/room mesti dinyatakan apabila bank dibina; gambar sahaja tidak menentukan timing atau reward baharu.

## Kurikulum dan penerimaan

Jangan mendakwa semua topik ialah Matematik Tingkatan 4 hanya kerana prototaip asal begitu. Semak DSKP rasmi bagi setiap objektif sebelum menulis SK/SP atau dakwaan alignment.

Lulus apabila topic ID jelas, formula sah, contoh di atas disemak secara bebas, teks English tepat, dan simbol dekoratif tidak menjadi soalan tanpa model yang lengkap.


## Parchment map and integrated mechanics — 2.11.0

MTH-14 (2.11.0) supersedes the 1.0 bank presentation/selection details with the supplied bank content form4-review-1.4.0, package 1.5.0. The original 120 IDs, source seeds, prompts, choices and correct keys are unchanged. The supplied ordered session reducers now own adaptive no-repeat reservation, per-choice feedback, Hint/More Hint ordering, 240 hint/solution visuals, 360 worked steps after correct, seven Basics lessons/14 unscored checks and 30-skill practice evidence. New reservations retain source choice order; legacy pending shuffled orders remain saved. New Run resumes the profile's unfinished reservation. Existing correct-plus-final-Claim timing and zero wrong-answer HP penalty remain. See docs/MAP_INTEGRATION_2_11_0.md for compatibility and evidence.
