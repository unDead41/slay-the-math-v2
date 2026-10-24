# Audit dwi bahasa — branch tempatan

Tarikh: 24 Oktober 2026, Asia/Kuala_Lumpur. Repository: `unDead41/slay-the-math-v2`. Master SOR yang dibaca daripada main: **1.2.0**. Arahan Ijamm: baca main terkini, semak BM/BI, istilah matematik dan identiti, kemas kini SOR serta bahasa game pada branch ini, **tanpa push Git**.

**Status: VALID** dalam skop teks hidup pada snapshot di bawah. Had suara/screenshot asal, matriks terhad dan ujian kefahaman murid masih dinyatakan. Semakan akhir GitHub mengesahkan main masih pada SHA asas 2.41.0 yang sama.

## Snapshot dan keadaan Git

| Rujukan | SHA / keadaan |
| --- | --- |
| Main pada audit awal | `ade5d3a21e55b9d2911bfa935c8095c95801bd8c`, game 2.39.0 |
| Main selepas kemas kini kad | `b730cad0cb27b53ffbdf687d8fc9edaed143ef43`, game 2.40.0 |
| Main yang menjadi asas akhir | `45d2378302196d9b0b79af7b371e6f16d4f5768c`, game 2.41.0 |
| Branch kerja tempatan | `dual-language-bm-bi`; HEAD pada SHA main akhir di atas, perubahan bahasa dalam working tree |
| Branch bahasa remote yang dibandingkan pada awal | `c42828d560c968500eb8a9071e41557608213e2a` |
| Merge base perbandingan awal | `a63b9e009c04a1be6ff3e79fcabea82991b6f619` |

Pada perbandingan awal, main mempunyai 74 commit tambahan dan branch bahasa remote mempunyai satu commit tersendiri. Hubungan Git ialah diverged. Ini tidak bermaksud seluruh kandungan branch lama tiada dalam main: pakej 40 kad sudah aktif melalui implementation lebih baharu. Commit katalog lama tidak dimainkan semula di atas mekanik semasa.

Main berubah dua kali ketika kerja berlangsung. Perubahan tempatan dicheckpoint dengan stash, branch dimajukan secara fast-forward, kemudian perubahan bahasa digabung semula dan fail terjana dibina daripada sumber semasa. Nilai kad 2.40.0, arkib save, Master candidate.5, verified resource loading dan retained combat actors 2.41.0 dikekalkan. Stash checkpoint masih disimpan. Tiada commit ciri, merge remote, push atau deployment dibuat oleh tugas ini. Nombor game kekal 2.41.0; hash build membezakan kandungan tempatan.

SOR bahasa menggunakan **[26_DUAL_LANGUAGE.md](../../sor/26_DUAL_LANGUAGE.md)** kerana main baharu menggunakan SOR 24 bagi hosted readiness dan SOR 25 bagi runtime optimization. Kedua-dua dokumen itu dikekalkan.

## Hasil dalam skop

Satu pilihan **Settings → Game language / Bahasa permainan** mengawal teks hidup dalam menu, dialog, peta, kad, status, Artifact, Shop, Rest, Mystery, laporan, bantuan, mesej ralat dan label kebolehcapaian. Skrin muat turun sebelum menu menggunakan pilihan bahasa yang sama. English boleh dipilih semula. Tutorial bermula dalam bahasa Settings dan masih mempunyai pilihan bahasa sendiri. Practice menggunakan pemilik bahasa sedia ada dan pilihan yang sama.

BM menggunakan ayat pendek dan arahan terus. Sasaran bacaan ialah Tingkatan 1; kandungan matematik kekal pada tiga topik Tingkatan 4. Sasaran bacaan ini belum diuji dengan murid. Nama game kekal **Slay the Math: Dungeon of Chance**, MC **Alyssa, the Clairvoyance**. Mathematics Slayer masih CADANGAN menurut Master SOR. Nama watak, stage, Artifact dan nama kad BM yang telah ditulis dikekalkan.

Istilah seperti HP, Energy, Block, Focus, Strength, Agility, Defense, Attack, Defend, Skill, Passive, Buff, Debuff, Weak, Vulnerable, Draw, Deck, Hand, Discard, Exhaust, Gold, Artifact dan Predict dikekalkan serta diterangkan dalam BM. Defend ialah jenis kad; Defense ialah atribut. Label Defense dalam soalan legacy yang disimpan kekal mengikut soalan asal, dengan nota perbezaan. Label Fire, Ice dan Guard dalam kumpulan contoh tidak ditafsir sebagai peraturan deck sebenar.

## Penemuan masalah disahkan

Semua penemuan di bawah berkeyakinan tinggi, tahap P2, dan **diselesaikan secara tempatan** dalam skop bahasa.

| ID | Bukti awal / kesan | Pembetulan dan bukti akhir |
| --- | --- | --- |
| LANG-001 | Kebanyakan menu, scene, toast dan error dalam `dist/app.js` belum mengikut bahasa soalan. | Kamus UI dan unjuran DOM yang boleh dipulihkan; Settings dinamakan Bahasa permainan. Matriks dua bahasa dan regresi pertukaran bahasa. |
| LANG-002 | Tooltip Artifact dipaksa ke English; reconciliation menyalin definisi English ke `definition_ms`. | Bahasa tooltip mengikut panel; 55 definisi BM disemak berpasangan dengan English. Build menolak sumber definisi yang tidak sepadan. |
| LANG-003 | Kad/status menggunakan Block/Blok, Strength/Kekuatan dan Defend/Pertahanan secara tidak konsisten. | Adapter paparan selepas pemilik effects semasa; terma antarabangsa dikekalkan, penerangan BM dipermudah. Arkib input tidak diubah. |
| LANG-004 | SOR menetapkan English sahaja; sebahagian copy meminta mencari istilah bergaris. | SOR 26 dan SOR berkaitan dikemas kini. Arahan menyebut istilah berwarna; tiada garis hiasan ditambah. |
| LANG-005 | Definisi Passive menyatakan tiada kad Passive; contoh Focus menyebut had belum disahkan; Defend bercampur dengan Defense. | Penerangan mengikut mekanik semasa. Contoh Focus menggunakan `DCConfig.FOCUS_CAP`; angka Artifact mengikut profil biasa/Master aktif. |
| LANG-006 | Bentuk Predict lama dan sebahagian accessible labels masih BI. | Enam bentuk soalan asal dilokalkan tanpa mengubah data, susunan pilihan atau jawapan. Notasi matematik dan binding contoh dilindungi. |
| LANG-007 | Main 2.41.0 menambah loading/download/recovery UI sebelum modul soalan dimuatkan. | Servis bahasa dibuka sebelum bootstrap, membaca preference key yang sama. Progress fail/MB/saat dan mesej pemulihan mempunyai BM. Native capture pada dua viewport. |
| LANG-008 | Semakan diff akhir menemui penggantian string dalam pembina kad yang merosakkan escape nama dengan tanda kurung. Reproduksi VM menghasilkan SyntaxError pada nama contoh. | Replacement callback mengekalkan literal `$&`. Regresi mengesahkan nama contoh dengan tanda kurung dan perkataan Bertahan kekal tepat, sedangkan Blok di luar nama menjadi Block. |
| DOC-001 / DOC-002 | Audit dokumentasi main merekod topik lama dan identiti MC lama dalam AGENTS. | AGENTS tempatan kini menyebut tiga topik bank aktif dan Alyssa yang diluluskan. Tiada topik/MC runtime ditukar. Audit sejarah main tidak ditulis semula. |

Perubahan dalam `dist/card-combat.js` terhad kepada dua string kategori Defense → Defend. `dist/bootstrap.js` hanya memasang servis bahasa. [Semakan pemeliharaan](preservation.json) membandingkan 23 pemilik numerik/sumber serta loader, animasi dan patcher dengan main akhir secara byte-for-byte, serta mengesahkan artwork asal tidak berubah.

Practice tidak memasang observer bahasa global kedua. Percubaan awal itu mengimbas DOM yang sudah mempunyai pemilik bahasa sendiri dan menambah tekanan memori pada ujian 120 soalan. Ia dibuang; ujian Practice asal berjalan tanpa kelonggaran atau penambahan yield untuk menyembunyikan masalah.

## Istilah matematik dan sumber

Sumber diperiksa ialah PDF yang dibekalkan: `02-Mathematics-Form-4-KSSM.pdf`, `03-DSKP-KSSM-MATEMATIK-TG-4-dan-5.pdf` dan `04-Matematik-Tingkatan-4-KSSM.pdf`. Jadual halaman PDF/halaman bercetak serta standard pembelajaran disimpan dalam [SOR 26](../../sor/26_DUAL_LANGUAGE.md).

Antara istilah yang disemak: statement/pernyataan, compound statement/pernyataan majmuk, negation/penafian, converse/akas, inverse/songsangan, contrapositive/kontrapositif, universal set/set semesta, intersection/persilangan, union/kesatuan, complement/pelengkap, outcome/kesudahan, sample space/ruang sampel, dependent/peristiwa bersandar, independent/peristiwa tak bersandar dan mutually exclusive/peristiwa saling eksklusif. Takrif BM ringkas melengkapkan istilah formal. Notasi, ID, jawapan, hint dan worked solution bagi 120 item asal dipelihara.

Ini semakan istilah dan pembentangan, bukan audit matematik bebas yang baharu terhadap setiap jawapan. Ujian soalan sedia ada tetap dijalankan. MODEL.zip tidak tersedia dan tiada dakwaan konsistensi model dibuat.

## Bukti dan liputan sebenar

Keputusan bernombor, masa dan hash runtime disimpan dalam **[verification.json](verification.json)**. Suite akhir lengkap **1037/1037 lulus**, 0 gagal/dilangkau/dibatalkan; [log penuh](full-suite.log). Ujian tertumpu kad/bahasa **237/237 lulus**; [log](card-language-targeted.log). [Build](build.log) dan [syntax](syntax.log) lulus. Output portable 304,219,360 bait. Runtime akhir sepadan dengan fingerprint input suite. Matriks yang boleh diulang: **[English](ui-matrix-en.json)** dan **[BM](ui-matrix-ms.json)**, 240 keadaan bagi setiap bahasa. Semakan meliputi menu/dialog utama, 40 kad, 10 status, semua Passive, 31 Artifact, 15 Mystery, bab Tutorial, enam Predict asal dan tiga kesukaran Master. Semua 31 penerangan Artifact juga dibandingkan pada setiap profil Master: 93 penerangan, dengan angka sebenar dikekalkan. Semua 55 takrif Artifact mempunyai BM tersendiri.

Ujian bahasa khusus memeriksa input/komen pengguna tidak diterjemah, pilihan/jawapan/ID tidak berubah, pertukaran bahasa tidak memberi ganjaran atau menukar HP/Gold/deck/RNG/attempts/feedback/deadline, accessible labels yang muncul kemudian, skop Tutorial, kad lama dan canvas combat yang dikekalkan. Mesej error literal dan ayat log bercantum turut diliputi. String tak dikenali dikumpul secara terhad dalam memori untuk QA; tiada penghantaran rangkaian atau kutipan input pengguna.

Native Chromium diuji pada **1440×900** dan **390×844**, termasuk loading BM, Settings BM→BI→BM, status Weak dengan peratus/tempoh sebenar, canvas sama selepas pertukaran bahasa dan Practice BM→BI→BM. [Bukti pelayar](browser-verification.json) merekod ralat/aset gagal dan lebar scroll. Capture yang diperiksa secara visual: [loading telefon](loading-bm-390.png), [Settings telefon](settings-bm-390.png), [status telefon](status-bm-390.png), serta desktop yang sepadan. Teks membalut dan panel boleh ditatal tanpa overflow mendatar.

Arahan yang digunakan:

```sh
npm run build
npm run check
DOM_QA_MODULE=<jsdom path> node --test --test-concurrency=1 tests/*.test.cjs
DOM_QA_MODULE=<jsdom path> node --test --test-concurrency=1 tests/game-language.test.cjs tests/card-*.test.cjs
DOM_QA_MODULE=<jsdom path> LANG_AUDIT=en node tools/audit-game-language.cjs
DOM_QA_MODULE=<jsdom path> LANG_AUDIT=ms node tools/audit-game-language.cjs
QA_BROWSER_EXECUTABLE=<chromium path> node tests/game-language-browser.cjs
git diff --check
```

Percubaan suite 2.41.0 pertama menghasilkan 1035 lulus / 1 gagal: ujian retained combat masih menjangka label Lemah. Ia dikemas kini kepada keyword Weak yang diminta, dengan semakan tambahan bahawa ukuran status dan tajuk Settings benar-benar BM; pemeriksaan canvas/save/Motion dikekalkan. Semakan diff turut membetulkan escape nama kad, disahkan oleh ujian kad/bahasa 237/237. Selepas kedua-duanya, suite penuh diulang pada [hash runtime akhir yang dipakukan](full-suite-inputs.json), bersama build/syntax, matriks dan native browser. [Hash percubaan awal](initial-suite-inputs.json) disimpan supaya bukti tidak bercampur. Bukti 1003/1003 pada snapshot 2.40.0 terdahulu bersifat sejarah dan tidak menggantikan semakan 2.41.0.

Semakan tambahan pada output akhir: [24 keadaan status](status-verification.json), meliputi enam viewport × dua bahasa × dua saiz status, serta [41 keadaan ikon/UI](icon-verification.json), termasuk keyboard, sentuhan, peratus Weak/Vulnerable BM, arkib save dan panel telefon. Tiada ralat dilaporkan. Harness ikon lama kini menunggu skrin resources selesai sebelum screenshot/focus; pemeriksaan ikon, save, fokus dan geometri asal dikekalkan. Dua percubaan harness sebelum itu menemui panel belum terbuka ketika kawasan game masih tersembunyi; penantian kini mengikut readiness yang dilihat pemain. Tiada kod game dilonggarkan untuk harness.

Satu cubaan suite akhir berakhir dengan exit 0 tetapi [log separa](partial-suite.log) sahaja, tanpa ringkasan. Ia tidak dikira lulus. Suite diulang secara berasingan selepas semua Chromium tambahan ditutup. Tekanan ruang scratch diperhatikan; punca tepat cubaan separa tidak disahkan. Output portable sementara dipindahkan ke RAM untuk semakan, dan tiada kod worker/balance diubah.

Build portable dan metadata/hash cache dijana semula daripada package 2.41.0. Native browser, bukan jsdom, mengesahkan pemuatan hosted sebenar. Tempat simpan sementara Chromium berada dalam RAM kerana tekanan ruang scratch; ini tidak mengubah kod, peraturan atau syarat ujian.

## Risiko berpotensi dan batas kesimpulan

| ID / tahap / keyakinan | Status / kesan / tindakan susulan |
| --- | --- |
| R-LANG-01 / P2 / sederhana | Matriks adalah terhad. Gabungan ayat dinamik atau teks baharu pada masa depan mungkin belum dipetakan. Kekalkan audit string dan tambah terjemahan bersama perubahan pemilik teks. Ini bukan bug yang terbukti pada semua laluan. |
| R-LANG-02 / P2 / tinggi | Suara asal dan teks English yang dilukis dalam screenshot Tutorial kekal. Teks hidup dan caption dilokalkan; tiada rakaman BM atau bitmap BM dicipta. Ini pengecualian yang dinyatakan, bukan dakwaan semua media sudah BM. |
| R-LANG-03 / P2 / tinggi | Dua viewport pelayar diuji; peranti fizikal dan kefahaman murid pelbagai aras belum diuji. Bahasa ringkas ialah sasaran copy, bukan pengesahan kajian pengguna. |
| R-LANG-04 / P2 / sederhana | Snapshot main dipakukan pada SHA yang dinyatakan. Main masa depan perlu diaudit semula, terutama pemilik card/status/education, bootstrap dan generated entrypoint. Tiada deployment branch ini diuji kerana tiada push dibenarkan. |

Penambahbaikan dalam skop telah dilaksanakan: satu preference bahasa, daftar istilah konsisten, takrif ringkas, unjuran mengikut nilai semasa, audit boleh diulang dan pautan SOR. Tiada isu tambahan ditemui dalam skop diff akhir yang disemak. Cadangan pilihan selepas ini ialah ujian kefahaman dengan murid serta media BM yang diluluskan; ia tidak dilaksanakan secara senyap dalam tugas bahasa ini.

Had tindakan kekal: kerja tersedia untuk semakan pada branch tempatan. **Jangan push atau menerbitkan branch ini tanpa arahan Ijamm yang baharu.**
