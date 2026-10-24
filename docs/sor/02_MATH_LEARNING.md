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


## Map, modes, Boss and Shop — 2.12.0

2.12 audit only: all original authored bank bytes/IDs/answers remain unchanged. Read-only support review found generic denominator/denominators bindings opening Common denominator in multiplication/equation contexts (confirmed PROB-008, 015, 038). Report precise locations and request a harmonized source package from the question owner; do not silently rewrite hints/examples. Projection checks cover all 120 items with zero plain/rich text mismatches. Details: docs/QUESTION_SUPPORT_AUDIT_2_12.md.


## Mystery Events — 2.13.0

Mystery v2 uses the same active 120-question bank and profile exposure service as Artifact trials, preferred compatible IDs first and unused same-topic fallback only. It never replaces question text/answers/hints with the older package snapshot or artwork counts. Each timed attempt ends after its first answer or deadline, then shows correct explanation and optional worked steps. Deadline/one-attempt rules are a Mystery variant; existing Artifact/Predict learning rules remain.

## Harmonized bank and Education Practice — 2.14.0

MTH-15 supersedes the earlier read-only wording restriction under the user's explicit instruction to integrate the reviewed Question Bank 1.6. The 120 stable IDs/seeds/choice bindings/correct keys remain; active content uses the attached textbook/DSKP references, simpler teaching definitions, explicit context/Given/Find and source disclosure. The latest user instruction makes Hint 1 show actual values in all tables/Venn diagrams, with no question-mark placeholders. Unspecified values say “Not given”; final selection marks and the answer panel retain their solution stage. More Hint adds the detailed method over the filled reference. Artifact and Mystery use this same bank.

MTH-16 adds Education Practice directly to Main Menu. It reuses the complete folio with Review and saved Learning, all 120 questions, Basics, worked steps and term meanings. Practice has no combat rewards/timer and uses a separate record; it never consumes rewarded question history. Existing Artifact correct-plus-final-Claim and Mystery rules remain. Source and actual checks: [Education 2.14.0](../EDUCATION_PRACTICE_2_14_0.md).


## Question language — 2.16.0

Whole-question English/Bahasa Melayu is implemented on education. Source review, scope and validation: [Question language](../QUESTION_LANGUAGE_2_16_0.md).


## Question menu — 2.17.0

MTH-17 — This run counts distinct Artifact/Mystery IDs from the current run receipts and pending encounters; New Run starts at zero. Lifetime retains profile exposure history. These are coverage counts, not answer/mastery scores. Existing no-repeat selection and Practice record separation remain. [Details](../QUESTION_MENU_2_17_0.md).


## Combat and Predict — 2.19.0

DISAHKAN: Ijamm replaces newly generated live-deck Predict with the authored 120-question bank. Predict, Artifact and Mystery share one exclusion ledger for the current run. Opening consumes an exposure, including abandonment. New Run resets exclusion; lifetime and mastery evidence remain. Practice/tutorial stay independent unscored review. Old saved live-deck predictions finish with their frozen source. First-try unaided correctness earns capped Focus once; guidance/retry earns none. Bank exhaustion has explicit unscored completion and no Focus; it can release a pending boss seal to prevent a completed bank blocking the run. See [Combat and Predict 2.19.0](../COMBAT_AND_PREDICT_2_19_0.md).


## Random gameplay questions — 2.21.2

DISAHKAN: every newly opened gameplay question must be random and unique in the current run, including the first Artifact trial and Predict. Rewarded consumers use uniform selection from unused eligible IDs, without difficulty/mastery weighting. Mystery draws from every unused item in its event topic; preferred IDs no longer restrict the draw. Shop and Rest currently have no quiz trigger and must not reset the ledger. New Run resets exclusion while lifetime evidence remains; Stage 1/2 Retry retains run exposures. Frozen pending questions survive reload and cannot be rerolled by reopening. Exhaustion never recycles a used ID. Owner and evidence: [Random questions 2.21.2](../QUESTION_RANDOM_2_21_2.md).


## Learning analytics preview — 2.25.0-analytics.1

DISAHKAN: Ijamm requests the feedback/learning analytics system in a feature branch before main. DITERUSKAN: observe existing canonical owner events for gameplay, Practice and separate Review; show chapter/SK/SP/skill evidence with distinct sample counts, independent/support/retry/reveal separation and linked Basics/review suggestions. Require three distinct answered IDs before a group guides revision. Never label a single error as a weakness or assign an official TP. Current run filtering excludes inherited lifetime-only records; Retry keeps the same analytics session. Selected BM SK/SP names come from the supplied DSKP printed pages42–45,48–49,68–70; English labels are working translations. Existing120 question content and selection remain authoritative. [Feature contract](../EDUCATION_ANALYTICS_2_25_0.md).


## In-game question workspace — 24 October 2026

DISAHKAN: Ijamm requests at most two submitted answers for bank Predict, Mystery and Artifact trials. First wrong unlocks Hint and More Hint without fabricating support use; second wrong reveals the canonical solution and locks answers. Correct retry is accepted. Education Practice and historical untagged records retain their learning/replay rules. This supersedes unlimited Artifact/Predict retries and the one-answer Mystery baseline for new bank gameplay. [Current policy and compatibility](../education/GAME_QUESTIONS.md).


## Education main integration — 2.36.0, 24 October 2026

DISAHKAN: Ijamm now requests publishing education-report to main. This supersedes
the earlier branch-only publication boundary. Merge af03f38 with main beb4a4d,
retaining the current tutorial, card rules, AI and production Dev access. Align
tutorial exercises/text, AI attempt termination and developer collection routes
with the versioned question policy. Run fresh combined-tree tests and record
actual results in [the main release](../education/MAIN_2_36_0.md). Earlier reports
remain historical evidence; live Google and pupil/device validation are separate.

## Reports and hint clarity — 2.37.0-report.4 branch preview

DISAHKAN: Ijamm selects in-game reports, private Google issue triage and the all 120 bilingual clarity pass for education-report only. Review all 120 English/BM prompts and scaffold Hint as concept/approach, More Hint as a more concrete partial setup. Preserve given facts, choices, keys and full solutions; retain filled GIVEN values but replace 63 answer-revealing references and inherited solved SVG titles. Explicit compatible contentRevision clarity-2026-10-24.1 preserves bank/comment identities. No sampling, attempt or reward change. [Contract and actual verification](../education/FEEDBACK_CLARITY.md).
