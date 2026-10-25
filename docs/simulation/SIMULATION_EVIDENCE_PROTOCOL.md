# Simulasi bersama, data AI dan bukti game

## Current main integration authorization — 2.50.0

The current explicit user request authorizes combining combat, education and
Master Map protocol candidates with main 2.49.1 as 2.50.0. Scoped compatibility
is VALID with carried P2 findings and explicit limits; original failed commands
and later focused/native evidence remain separate. Game 2.50.0 publication is VERIFIED at runtime commit
`509be90a3f211004c29379c96469f4e3a70cc0a4`. [Actual readback and Pages](../verification/all-main-20261025/publication.json). This supersedes the relevant earlier branch-only boundary;
original source pins, histories and current main owners remain. The completed
owner pilot stays tied to source b3dc, not 2.50. [Scope, results and limits](../ALL_CANDIDATES_MAIN_2_50_0.md).


Versi1.0.0 —25 Oktober2026. Pemilik penyelarasan: Master; nilai dan keputusan domain kekal dengan owner asal.
Rujukan baseline semasa: main `d77b3e0ce87d573de89e84a9b2374df97ad625b9` /2.49.0, Master SOR1.2.0. Baca main sebenar semula sebelum setiap run; nombor ini bukan pin kekal untuk eksperimen masa depan.

## Tujuan dan autorisasi

Panduan ini menyelaraskan recheck selepas integrasi stabil, menggunakan satu kutipan untuk beberapa kegunaan apabila identitinya sepadan. Ia tidak memasang scheduler, mengunci chat lain, memulakan simulasi, melatih model atau membenarkan push/main secara automatik.

Chat baharu bernama **Simulation & Evidence** ialah pilihan organisasi. Master ini juga boleh menjalankan peranan penyelaras. Jika diwujudkan, chat itu memiliki bukti integrasi/browser dan registry; ia meminta atau menggunakan hasil domain yang sudah sah. Ia tidak menjalankan semula campaign yang sudah dimiliki chat lain. Maksimum tiga subagent, tiada nested worker; default satu dan tambah hanya untuk kerja bebas yang memerlukan.

## Pemilikan supaya tidak bertindih

| Skop | Pemilik utama | Kerja chat bukti |
| --- | --- | --- |
| Kos/kesan/Focus/kad/musuh, eksperimen Combat | Combat + Master Balance | Rujuk raw/context sedia ada; regresi gabungan khusus isu belum diliputi |
| Seed, route, recovery, stage entry, CP Map | Map | Rujuk cohort dan matched replay; jangan kutip semula registry yang sama |
| Harga, Gold, offer, reward/checkout | Economy | Rujuk receipt; semak sambungan end-to-end dan conservation yang belum diuji |
| Polisi AI, train/validation/model acceptance | AI / Master Balance | Bekalkan bundle sah; jangan train atau aktifkan model secara senyap |
| Jawapan, hint, rich text, Practice/report | Education | Uji paparan/aliran sebenar; ketepatan matematik disemak owner menggunakan buku/DSKP |
| Menu, load, save/reload, offline, transaksi lintas modul | Simulation & Evidence / Master | Jalankan senario integrasi yang dituntut, hantar isu kepada owner |
| VFX/motion/audio/asset | Owner visual/loader + chat bukti | Browser sebenar, urutan/timing, screenshot/video berkonteks; tiada penggantian art |
| Tutorial | Tutorial | Chat bukti membekal capture asal + metadata; Tutorial memilih dan menerangkan |
| Kefahaman, kekeliruan dan prestasi murid/peranti | Master / penyelidik / manusia | Triage heuristik dan rakaman membantu; keputusan memerlukan playtest sebenar |

Kes integrasi boleh melintasi domain kerana menguji kontrak sambungan. Tandakan `INTEGRATION`, pautkan kes owner dan jangan kira ulang hasil sebagai sampel bebas. Jika Map mengutip campaign, chat bukti memainkan semula kes terpilih dalam browser untuk visual; ia tidak menamakan replay itu campaign baharu.

## Jenis bukti dan tahap percaya

| Jenis | Boleh menyokong | Belum boleh menyokong |
| --- | --- | --- |
| Unit/contract dengan engine sebenar | Invariant yang diuji, kos, damage, transaksi, save/RNG dan regresi tertentu | Semua UI/VFX, setiap kemungkinan deck/seed |
| Campaign/matched replay engine | Hasil polisi pada source/context/kes yang dibekukan, W/N dan uncertainty | Kadar menang murid atau strategi optimum sejagat |
| Browser sebenar | Menu/aliran/DOM, screenshot, console/network, input/fokus, visual pada konfigurasi direkod | Semua GPU, telefon fizikal, audio/persepsi manusia |
| Screenshot/video | Keadaan/urutan yang benar-benar dirakam dengan sumber terikat | Capture tunggal membuktikan animasi sentiasa betul |
| Semakan manusia/buku/DSKP | Semantik soalan dan kefahaman pada skop diuji | Seluruh kurikulum atau semua murid tanpa sampel sesuai |

**Tiada jaminan100%.** Harness, adapter, polisi atau verifier juga boleh mempunyai bug. Laporkan PASS dalam skop, interval/N dan semua NOT_RUN. Gunakan pembanding bebas serta replay deterministik terpilih. Bagi VFX, semak beberapa frame/trigger/urutan; bagi bahasa mudah, pemeriksaan automatik hanya triage. Jangan menggunakan key soalan atau masa depan RNG sebagai ciri polisi umum.

## Daftar sekali sebelum menjalankan

1. Baca Master SOR/AGENTS, owner/audit dan [handoff data AI](../balance/SIMULATION_DATA_HANDOFF.md). Semak main dan branch sebenar; record commit40aksara dan tree.
2. Parent menetapkan satu lokasi registry kanonik (repository, ref dan path), kemudian membaca SHA terkini dan mengedarkan snapshot claim kepada owner. Jangan menganggap salinan registry pada branch masing-masing terkini. Periksa [RUN_REGISTRY.json](RUN_REGISTRY.json), semua output owner dan kerja yang sedang berjalan. Daftar claim dengan source branch/SHA, scope, owner, destination dan planned case manifest sebelum hasil diketahui. Jika registry/pemilikan tidak dapat disahkan, tangguhkan kutipan baru dan teruskan analisis bebas yang tidak bertindih.
3. Identiti run merangkumi hash source/dependencies/engine/definition, config/protocol/policy, cohort, difficulty, seed/runSeed/repetition, case input, actual entry/save/RNG serta browser/build bila berkaitan. Version label sahaja tidak cukup. ID task sahaja boleh berulang antara difficulty.
4. Jika claim/output sama dan lengkap, guna hasil itu. Jika masih berjalan, tunggu/handoff; jika terputus, lepaskan pemilik lama sebelum resume. Simpan claim terminal beserta outcome counts.
5. Registry JSON ini ialah kontrak koordinasi manual, **bukan lock atomik atau pemeriksa dedup automatik**. Parent tunggal memiliki penulisan; chat lain mesti mengakui claim. Pelaksanaan beberapa penulis serentak memerlukan locking/lease sebenar yang belum dibina.
6. Bila hash input yang relevan berubah, buat run ID/output baharu. Jangan overwrite source/context lama atau mengubah label lama supaya kelihatan baharu.

Contoh rekod claim yang perlu dilengkapkan dengan nilai sebenar (bukan hasil diukur): runId; kind; owner; status PLANNED/RUNNING/COMPLETE/PARTIAL/FAILED; sourceBranch/sourceCommit/sourceTree; identityHash; caseManifestPath+SHA256; outputPath; dependencies; startedAt/finishedAt; planned/returned/win/loss/invalid/censored/missing; evidenceIndex. Claim kecil boleh dirancang dahulu, tetapi jangan memulakan cohort tanpa sumber/kes/budget lengkap.

## Selepas integrasi stabil: urutan recheck

- Sediakan calon integrasi sebenar, semak diff dan selesaikan konflik dahulu. Semakan pada branch lama tidak menjadi semakan pada calon gabungan.
- Freeze manifest kes, split, sumber, entry/RNG dan budget sebelum outcome. Jalankan contract/smoke yang terjejas dahulu.
- Untuk balance semasa, minta owner Combat/Map/Economy menghasilkan cohort baru hanya bagi identiti/input yang berubah atau coverage yang diperlukan. Pilih seed/rank sebelum outcome; sebarang tambahan batch dipradefinisikan, bukan kerana tidak suka kemenangan.
- Gunakan satu collector/journal writer, maksimum tiga worker Node agregat dan lebih rendah jika kuota kecil. Agent LLM tidak menambah CPU. Nyatakan override CLI sebenar; default8 alat Map tidak mematuhi budget ini secara automatik.
- Berhenti dan rekod error, censor atau blocker apabila capacity tidak cukup. Sambung hanya case yang tiada rekod sah, source/context sama dan jadual sama. Kekalkan loss/censor/error; jangan ganti dengan outcome lebih baik.
- Jalankan verifier bebas atas raw dan expected-case manifest: duplicates, unexpected/missing IDs, hash/size, exact source, stage-entry bank, gross/net Gold, counts/denominators dan W/N. `checkFiles()` yang membaca gate tersimpan bukan pengiraan semula bebas.
- Pada calon akhir, jalankan checks lebih luas yang relevan sekali; jangan ulang suite besar untuk setiap save, subagent atau edit laporan. Fail yang berubah kemudian memerlukan penilaian semula bukti terjejas.

Kegunaan semula berdasarkan dependency identity sebenar, bukan semua edit semestinya menjalankan semula seluruh cohort. Perubahan teks mungkin memerlukan semakan UI sahaja; perubahan stat/polisi/input mungkin memerlukan eksperimen baru. Cohort2.40/candidate.5 tidak menjadi2.49 walaupun definitionHash tertentu sama.

## Data untuk AI

Gunakan kontrak dan fungsi sebenar di [handoff data AI](../balance/SIMULATION_DATA_HANDOFF.md), bukan format baharu yang kelihatan serupa. Output immutable: manifest.json, observations.jsonl, summary.json, raw dan README; SHA256/bytes, provenance dan manifest jadual pra-outcome mesti dipelihara.

- Simpan ciri pilihan awam, tindakan sah, kos sebenar, keadaan sebelum/selepas, outcome terminal dan identiti polisi. Tanda synthetic oracle, Dev-injected state, limit, error dan censor dengan jelas. Data Dev untuk ujian bukan bukti prestasi pemain biasa.
- Tiada hidden draw order, answer key, future event/Shop atau data peribadi dalam ciri fitting. Synthetic oracle boleh menjadi diagnostic berlabel; ia tidak mengajar polisi umum atau membuktikan murid pandai.
- Train/validation/test ditetapkan sebelum pengumpulan dan diasingkan pada seed/kumpulan scenario yang bermakna. Repetition/route daripada entry sama bukan sampel bebas. Jangan gunakan holdout untuk fitting atau memilih calon berulang tanpa melabel validation/retest.
- Learner semasa hanya fit **Combat factorial acquisition** yang lengkap. Export Map/Economy menyokong diagnosis/provenance; ia belum menjadikan route/economy learner tervalidasi. Validator envelope Map/Economy juga belum membuktikan semua field semantik/coverage cukup; reconcile raw dengan manifest owner secara berasingan.
- CLI semasa mempunyai seed latihan93 dan validation701/702. Jadual baru memerlukan perubahan protokol/adapter owner yang disengajakan sebelum kutipan; jangan mereka flag atau menukar seed senyap.
- Model hasil training ialah fail calon. Uji terhadap baseline/off pada source/polisi sama serta holdout; lapor perubahan HP/menang dan kegagalan, bukan pilih contoh yang menang sahaja. Tiada self-learning atau aktivasi automatik.

Contoh validator sedia ada, hanya selepas bundle sebenar tersedia:

```text
node tools/ai-playtester/experience-cli.cjs validate PATH_TO_EXISTING_BUNDLE
```

Jika manifest/summary tidak konsisten, jangan fit atau mendakwa data dipercayai. Hasil validator bukan pengesahan generalisasi atau kelulusan model.

## Bukti screenshot/video untuk tutorial

Rakaman mesti daripada game sebenar pada commit/build yang direkod; tiada image generation untuk bukti. Simpan PNG/WebM/trace asal dan indeks dengan sha256, sourceCommit/tree/buildHash, browser/OS/viewport/DPR, bahasa, mode/difficulty, seed/case/action/step, frame/time, expected/observed dan capturePath. Jika source mempunyai uncommitted runtime delta, gunakan snapshot source yang boleh dihasilkan semula dan tandakan; jangan dakwa semua byte datang daripada commit lama.

Capture minimum mengikut diff: menu/Settings, masuk run/map, kategori kad/Focus/Passive, Predict/hint/report, Shop/reward/Rest/Mystery/boss, save/reload, failure/offline, kemudian BM/English pada viewport terpilih. Matriks dipilih mengikut perubahan; senarai ini bukan tuntutan semua telah dirakam.

Hasil satu run boleh membekalkan trace, diagnosis dan calon gambar tutorial jika source/context sepadan. Jangan mengira setiap gambar sebagai trial tambahan. Pisahkan gambar failure daripada gambar panduan yang telah disemak; tulis caption dan jangan menyembunyikan HUD/label debug tanpa menjelaskan manipulasi. Tutorial menyemak kesesuaian kepada release semasa; screenshot lama ialah sejarah selepas UI berubah.

## Kos token dan budget

Pilih kes sekali; biar kod Node/Python/browser menjalankan loop dan menulis raw di luar chat. Parent membaca summary/manifest serta kes gagal/anomali, bukan menyalin setiap turn atau semua JSONL ke LLM. Guna snapshot/case yang sama untuk beberapa tujuan, resume hasil sah dan simpan indeks ringkas.

Default satu agent; maksimum tiga untuk pecahan bebas. Nyatakan had masa, case, disk, artifact dan replay sebelum run. Capture checkpoint/failure yang dipilih, bukan meminta LLM menilai setiap frame/turn. Jangan mengurangkan kes wajib atau membuang hasil negatif untuk nampak jimat. Tiada panggilan LLM/API setiap tindakan diperlukan oleh workflow cadangan ini.

Kod simulasi mengguna compute, tetapi arahan, context, hasil tool, analisis dan semakan imej oleh model tetap boleh menggunakan allowance. Dokumen rasmi menyatakan usage bergantung pada model, saiz/kerumitan task, context, reasoning dan tool; allowance boleh dikongsi antara chat dan had mingguan mungkin terpakai. Baki/kos akaun sebenar tidak diketahui di sini. Chat baru bukan allowance baru; semak dashboard penggunaan.

Rujukan produk disemak25 Oktober2026: [OpenAI pricing/usage](https://learn.chatgpt.com/docs/pricing). Angka penjimatan atau bilangan run bagi baki mingguan tidak direka.

## Laporan dan isu terbuka

Setiap handoff menyatakan kind SETUP/ENGINE/BROWSER/HUMAN, source/context, coverage/planned/returned, W/N, invalid/error/censor/missing, integrity/score gate, findings P0–P3/confidence/owner/action, actual commands, artifacts dan NOT_RUN. Gunakan VALID/PERLU UPDATE/CONFLICT/BELUM DISAHKAN mengikut skop.

Tiga gap pemulihan pendidikan, default Google /exec kosong, syarat receiver provenance, isu readiness ikon dan boundary preload yang diaudit sebelum ini tidak ditutup oleh panduan ini. Guna laporan owner sebelum membuat run baru. MODEL.zip tidak tersedia; jangan dakwa semakan model asal.

## Prompt untuk chat pilihan

> Chat ini ialah Simulation & Evidence untuk unDead41/slay-the-math-v2. Baca Master SOR main terkini, AGENTS, docs/simulation/SIMULATION_EVIDENCE_PROTOCOL.md dan audit owner dahulu. Rekod SHA. Maksimum tiga subagent, default satu, tiada nested. Miliki registry dan bukti integrasi/browser; gunakan data Combat/Map/Economy sah tanpa mengulang cohort milik mereka. Bekukan manifest/source/seed/split/budget sebelum kutipan; satu collector. Simpan raw, kegagalan, uncertainty dan capture sebenar beserta indeks untuk AI/Tutorial. Jangan fit semua domain secara automatik, ubah nilai atau push main tanpa arahan. Mulakan dengan inventori bukti dan cadangan batch; satu cohort baharu hanya apabila tugas run dan budgetnya sudah dibenarkan.
