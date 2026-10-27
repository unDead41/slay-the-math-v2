# MASTER SOR — Mathematics Slayer

## Main 2.53.0 — skop penerbitan semasa, 27 Oktober 2026

Ijamm kini mengarahkan audit dan penerbitan semua pakej yang benar-benar pending.
Ini membenarkan integrasi Emberlyn daripada `07677f62ede996e2dd66d9b53f9fd5e152069863`
ke main `7a49fff83388347f0157616fc6b051ddbda4c694` / 2.52.0 sebagai **2.53.0**.
Klausa branch-only/no-main di bawah kekal sejarah untuk sumber asalnya dan
superseded bagi integrasi ini sahaja. Kontrak keselamatan, satu pemilik
Online/Offline, local help, original Hint, save/RNG dan semua pemilik semasa kekal.
**QA gabungan VALID dalam skop yang dinyatakan; penerbitan main PENDING**
sehingga expected-head update dan readback sebenar tersedia. Calon tempatan
`728d25e7a9969b3570e7e8943664b9a6c43ce67c` / tree
`2bb0b762478cc76243097cc9aba7300bebab6524` mempunyai 126 focused Node,
54 native Pet, 15 cold-offline dan dua portable PASS; ini bukan full suite atau
live provider validation. Ini tidak mengaktifkan provider atau backend awam.
[Skop, bukti dan had semasa](docs/PET_MAIN_2_53_0.md).

Nama rasmi ialah **Mathematics Slayer**, dipersetujui pada 26 Oktober 2026.
Calon dipulihkan pada 27 Oktober selepas maintenance. Pelaksanaan dan verifikasi
terhad baharu ialah **DILAKSANAKAN / VALID**, dengan penemuan P2 dan jurang stdout
asal dinyatakan. Penerbitan main **DITERBITKAN / VERIFIED** pada
`20df8844936fa265ee5c5da60606410ad0df505d`, game 2.52.0. Pages exact code run
40453530679 SUCCESS; [receipt](docs/verification/mathematics-slayer-20261027/publication.json).
[Status pemulihan dan bukti](docs/RENAME_MATHEMATICS_SLAYER_2_52_0.md).

| Medan | Rekod |
| --- | --- |
| Versi SOR | 1.3.0 |
| Tarikh | 27 Oktober 2026, Asia/Kuala_Lumpur |
| Pemilik keputusan | Ijamm |
| Repository rujukan | https://github.com/unDead41/slay-the-math-v2 |
| Branch utama | main |

## 0. Bacaan wajib sebelum kerja lain

**AUD-READ-01:** Pada awal sesi dan sebelum menyambung atau mengemas kini mana-mana branch, baca Master SOR ini daripada main terkini terlebih dahulu. Selepas itu baca AGENTS.md, governance, keputusan dan SOR modul serta laporan audit/handoff terkini yang berkaitan. Jika salinan branch ketinggalan, rujuk versi main; jangan bergantung pada ingatan atau laporan lama.

Bacaan ini mendahului perancangan perubahan, penulisan kod, perubahan data/aset/dokumentasi, build, ujian, commit dan push. Operasi baca minimum untuk mengenal pasti repository, branch, SHA dan lokasi dokumen boleh dilakukan untuk mendapatkan rujukan tersebut.

Nyatakan versi SOR, SHA main/branch dan penemuan terbuka yang relevan sebelum memulakan perubahan. Jika laporan terdahulu tiada, jalankan audit awal tanpa mereka sejarah audit. Jika dokumen atau GitHub tidak dapat dicapai, nyatakan batasan itu dan jangan mendakwa bacaan atau keserasian terkini telah disahkan.

Arahan ini ialah kontrak kerja sesi yang mengakses repository. Penambahan fail Markdown tidak memasang pemantauan latar GitHub, hook atau CI yang membuktikan setiap agent telah membaca arahan.

## Kedudukan dalam repository

Dalam repository ini, SOR bermaksud **Set of Rules** dan berfungsi sebagai rujukan bersama. Dokumen Master ini mengawal kaedah audit merentas branch, semakan kesan merentas modul dan pengendalian perubahan identiti.

Baca bersama [AGENTS.md](AGENTS.md), [indeks SOR](SOR_README.md), [governance](docs/sor/00_GOVERNANCE.md) dan [daftar keputusan](docs/sor/DECISIONS.md). Keutamaan arahan serta pemilik setiap domain kekal mengikut governance. SOR Master tidak menggantikan nilai mekanik, topik, model, bahasa atau kontrak modul semasa.

Laporan audit menggunakan VALID, PERLU UPDATE, CONFLICT dan BELUM DISAHKAN. Status ini berasingan daripada status keputusan DISAHKAN, DITERUSKAN, CADANGAN dan PERLU_VERIFIKASI dalam governance.

Sesi coding yang membaca checkout repository menggunakan fail ini melalui AGENTS.md. Jika salinan branch lebih lama, semak dokumen semasa pada main. Penerbitan fail ini di GitHub tidak mengubah Project Instructions atau menambah fail ke Project Sources dalam ChatGPT.

## 1. Tujuan dan penggunaan

Dokumen ini ialah SOR bersama untuk audit, pembangunan, identiti, mekanik, UI, pendidikan, aset, dokumentasi dan pelepasan projek.

Baca versi semasa SOR sebelum menjalankan tugas yang berkaitan. Gunakan arahan ringkas dalam bahagian 10 untuk merujuk dokumen ini daripada Project Instructions atau chat lain.

Dokumen yang tersedia dalam satu chat tidak dengan sendirinya mengubah arahan chat lain, kod, tetapan projek atau repository. Penggunaan merentas chat memerlukan dokumen dan arahan rujukan tersedia kepada chat tersebut.

SOR menerangkan keperluan dan cara bekerja. GitHub menunjukkan keadaan kod sebenar. Jika kedua-duanya berbeza, laporkan jurang antara sasaran yang dipersetujui dengan pelaksanaan semasa.

## 2. Keputusan, cadangan dan fakta semasa

Bezakan empat jenis maklumat:

| Jenis | Cara menggunakan |
| --- | --- |
| Arahan eksplisit terkini daripada Ijamm | Tentukan skop dan tindakan yang dibenarkan. |
| Keputusan projek yang telah dipersetujui | Jadikan keperluan semakan selagi belum diganti oleh arahan baharu. |
| Keadaan main dan branch yang disemak | Gunakan sebagai bukti pelaksanaan sebenar, dengan SHA dan tarikh. |
| Cadangan, ingatan atau laporan lama | Gunakan sebagai petunjuk carian; sahkan semula sebelum membuat kesimpulan. |

Cadangan dalam contoh atau pertanyaan tidak menjadi keputusan rasmi secara automatik. Jangan anggap ciri, angka, nama atau arahan lama masih terpakai tanpa menyemak keputusan terkini yang tersedia.

Apabila arahan baharu sudah jelas, teruskan dalam skopnya tanpa meminta pengesahan berulang. Jika maklumat penting tidak tersedia, jalankan semakan yang boleh dibuat dan nyatakan batasannya.

## 3. Daftar identiti projek

| Medan | Rekod pada versi SOR ini |
| --- | --- |
| Nama rasmi | Mathematics Slayer |
| Status keputusan | DIPERSETUJUI — arahan eksplisit Ijamm, 26 Oktober 2026; ditegaskan semula dalam sesi pemulihan 27 Oktober. |
| Nama lama / sejarah | Slay the Math: Dungeon of Chance; Slay the Math. |
| Repository teknikal | unDead41/slay-the-math-v2 |
| Skop | Nama paparan pemain/panduan, metadata dan label eksport; game 2.52.0. |
| Pelaksanaan / pelepasan | DILAKSANAKAN / DITERBITKAN; scoped QA VALID, main 20df8844936fa265ee5c5da60606410ad0df505d / 2.52.0, tree f30c6a1e971feac28e0a48af12b16b901fc22dd9 dan Pages code SUCCESS. |
| Branch / main asas | release/mathematics-slayer-2.52.0; main ce586507dd5a5b55a72ee008ec60a547cd5c2b7e / 2.51.0. |

**IDN-01:** Gunakan ejaan **Mathematics Slayer** dalam BM dan English; jangan
mengekalkan subtitle lama sebagai identiti aktif. Alyssa, nama watak/stage/kad,
topik, artwork dan nilai mekanik kekal mengikut pemilik semasa.

**IDN-02:** Kekalkan slug/URL/origin, package ID, storage keys (`duel-cube-*` dan
`slay-the-math.*`), schema, global `STM*`/`DC*`, API/payload bindings dan asset IDs.
Rename paparan tidak membenarkan migrasi/reset save atau namespace pemain baharu.

**IDN-03:** Portable utama ialah `MATHEMATICS-SLAYER-OFFLINE.html`; alias
`SLAY-THE-MATH-OFFLINE.html` mesti byte-identical untuk URL fail lama. Ini tidak
menjanjikan storage berpindah antara origin/path. Bukti build/readback diperlukan.

**IDN-04:** Rekod, source packs, dataset dan screenshot sejarah kekal nama/pin
asal. Jangan relabel bukti lama atau mencipta lampiran hilang. Capture/QA baharu
mempunyai identiti source dan indeks baharu.

Apabila Ijamm mengarahkan penggunaan nama rasmi baharu, rekod ejaan tepat, tarikh keputusan, skop, branch pelaksanaan dan bukti pelepasan. Bezakan status DIPERSETUJUI, DILAKSANAKAN dan DITERBITKAN.

Jangan anggap persetujuan nama baharu turut membenarkan pertukaran repository, URL awam, ID dalaman atau data simpanan pemain.

## 4. Prosedur Master Audit — Branch Compatibility

1. Semak repository sebenar di GitHub. Rekod masa semakan, nama branch, SHA penuh main dan SHA penuh sasaran. Baca fail pada SHA tersebut supaya bukti tidak bercampur antara beberapa versi.
2. Semak hubungan commit, merge base, ahead/behind, perubahan fail dan PR yang berkaitan. Jika perlu, periksa perubahan setara hasil squash atau cherry-pick.
3. Bezakan keadaan Git daripada keserasian fungsi. Branch yang wujud belum tentu masih aktif; branch yang behind belum tentu rosak; merge tanpa conflict belum tentu mengekalkan kandungan yang tepat.
4. Tentukan perubahan mana sudah berada dalam main, belum masuk, telah diganti atau telah dibatalkan. Jangan samakan commit yang pernah merged dengan fungsi yang masih wujud sekarang.
5. Jika modul sudah merged, utamakan pelaksanaannya dalam main semasa. Gunakan branch lama untuk memahami asal dan tujuan perubahan.
6. Semak hubungan kod, mekanik, UI, pendidikan, dokumentasi, screenshot dan latihan/tutorial yang berkenaan.
7. Jalankan ujian yang sepadan dengan risiko dan skop. Bezakan semakan statik, ujian automatik, semakan visual dan penggunaan manual.
8. Sebelum menutup audit, semak sama ada SHA main telah berubah. Jika berubah, laporkan bahawa keputusan merujuk snapshot terdahulu dan semak semula bahagian yang terjejas sebelum menganggapnya sah untuk main baharu.

Jika akses GitHub gagal, nyatakan bukti yang tersedia dan tandakan bahagian yang bergantung pada semakan itu BELUM DISAHKAN.

## 4A. Audit masalah, risiko dan penambahbaikan pada setiap kemas kini branch

**AUD-UPDATE-01:** Setiap set perubahan branch mesti disertai audit tertumpu terhadap masalah sebenar, masalah yang mungkin berlaku dan penambahbaikan yang munasabah. Ini terpakai kepada kod, data, aset, UI dan dokumentasi. Satu audit dibuat bagi set perubahan yang siap dikongsi; ia bukan arahan menjalankan semula suite besar pada setiap save fail.

**AUD-UPDATE-02:** Lakukan dua semakan dalam aliran kerja:

1. Sebelum perubahan: selepas bacaan wajib, semak keadaan semasa, diff terhadap main yang relevan dan laporan/handoff terdahulu. Kenal pasti isu terbuka yang boleh menjejaskan tugasan.
2. Selepas perubahan, sebelum commit/push: semak diff akhir dan kesan terhadap modul berkaitan; jalankan ujian yang sesuai, semak semula isu lama dan laporkan penemuan baharu. Selepas push yang dibenarkan, sahkan ref sebenar dan rekod SHA terbitan dalam handoff. Jangan label snapshot atau laporan lama sebagai bukti untuk kod baharu.

**AUD-UPDATE-03:** Bezakan kategori ini dalam laporan:

| Kategori | Bukti dan cara melaporkan |
| --- | --- |
| MASALAH DISAHKAN | Nyatakan tingkah laku atau percanggahan yang diperhatikan, langkah reproduksi jika sesuai, fail/lokasi, SHA, kesan dan pembetulan yang diperlukan. |
| RISIKO BERPOTENSI | Nyatakan asas teknikal, keadaan yang boleh mencetuskan masalah, kesan, tahap keyakinan dan semakan yang masih diperlukan. Jangan tulis andaian sebagai bug terbukti. |
| PENAMBAHBAIKAN | Nyatakan perubahan konkrit, manfaat kepada pemain/pembangunan, fail terlibat, keutamaan dan cara menilai manfaatnya. Bezakan cadangan daripada arahan pelaksanaan. |

Gunakan keutamaan P0–P3 mengikut [QA dan release](docs/sor/15_QA_RELEASE.md). Nyatakan skop serta keyakinan penemuan. Status keseluruhan tetap menggunakan VALID, PERLU UPDATE, CONFLICT atau BELUM DISAHKAN; kategori penemuan tidak menggantikannya. Cadangan pilihan sahaja tidak menjadikan branch PERLU UPDATE, dan risiko yang belum diuji tidak boleh disahkan secara senyap.

**AUD-UPDATE-04:** Pilih semakan berdasarkan perubahan sebenar. Antara perkara yang relevan: kontrak fungsi/data dan pengguna modul lain; save/reload/RNG/transaksi; input kosong, sempadan atau rosak; UI/teks BM/BI, tutorial dan screenshot yang ketinggalan; pemuatan aset, offline dan saiz/peranti; ketepatan matematik; serta jurang ujian. Jangan mendakwa semua kawasan diperiksa jika hanya sebahagian disentuh.

**AUD-UPDATE-05:** Baca dan kemas kini laporan audit/handoff branch yang sedia ada. Jika tiada, gunakan rekod seperti `docs/audits/<nama-branch>/LATEST.md`, dengan tarikh, skop, SHA yang diperiksa, penemuan, bukti, ujian dan batasan. Kekalkan penemuan yang belum selesai; tandakan selesai hanya selepas ada bukti baharu. [Audit dokumentasi main](docs/audits/main/LATEST.md) ialah contoh skop dokumentasi, bukan audit seluruh game.

Jika tiada penemuan tambahan, tulis “Tiada isu tambahan ditemui dalam skop yang disemak” dan senaraikan semakan serta batasan. Tiada kuota masalah atau cadangan; jangan mencipta penemuan untuk memenuhi format.

**AUD-UPDATE-06:** Melaporkan penemuan tidak membenarkan pembetulan di luar skop. Pembaikan yang telah diminta boleh diteruskan dengan bukti semakan; cadangan tambahan direkodkan dahulu. Kebenaran push/merge tetap mengikut arahan Ijamm bagi tugas tersebut.

## 5. Semakan kesan merentas modul

Gunakan baris yang berkaitan dengan perubahan; audit tidak memerlukan semua modul diperiksa setiap kali.

| Perubahan | Kawasan yang perlu disemak |
| --- | --- |
| Nama atau identiti projek | Tajuk, menu, loading, credits, tutorial, metadata, eksport, dokumentasi, screenshot dan bahan pertandingan. |
| Kad, buff, debuff atau ekonomi | Kod mekanik, teks BM/BI, rich text, ikon, AI/playtester, reward/shop, tutorial dan ujian berkaitan. |
| Pendidikan atau peraturan menjawab | Predict, event, artifact, practice, hint, more hint, had percubaan, rekod pembelajaran dan paparan BM/BI. |
| Map, shop atau mystery | Laluan, syarat masuk, ganjaran, harga, event, dev tools, tutorial dan screenshot. |
| UI, ikon atau animasi | Aset sebenar, saiz, arah, clipping, kebolehbacaan, tooltip, resolusi dan tangkapan skrin berkaitan. |
| Audio atau suara | Rujukan fail, pencetus, fallback, kelantangan dan rekod sumber/lesen yang tersedia. |
| Build atau deployment | Fail yang dijana, versi release, laluan aset, cache/offline, URL dan arahan menjalankan game. |

Untuk kandungan Matematik, gunakan buku teks dan DSKP yang tersedia serta berkaitan dengan topik. Jangan mengaku telah membaca keseluruhan bahan atau mengesahkan semua soalan jika hanya sebahagian diperiksa.

Jika aset rujukan seperti MODEL.zip tidak tersedia, nyatakan kegagalan itu dan minta muat naik semula apabila diperlukan untuk semakan visual. Jangan mendakwa konsistensi model telah disahkan.

## 6. Prosedur pertukaran nama

Bahagian ini digunakan selepas arahan pertukaran nama diberikan.

1. Cari variasi nama lama, termasuk huruf besar/kecil, tajuk penuh, nama ringkas dan subtitle.
2. Senaraikan lokasi aktif yang memaparkan nama kepada pemain atau pembaca: tajuk tab, menu, loading, pause/result, credits/about, tutorial, output eksport dan metadata.
3. Periksa teks dalam imej, logo, screenshot, poster, abstract dan video yang termasuk dalam skop. Carian teks kod sahaja tidak mengesahkan kandungan imej atau video.
4. Bezakan teks aktif dengan rekod sejarah. Jangan menulis semula sejarah commit atau memadam rujukan asal yang masih perlu.
5. Periksa repository slug, URL, package ID, storage key, save schema, integrasi, analytics dan format eksport sebelum mempertimbangkan pertukaran teknikal. Kekalkan keserasian atau sediakan migrasi apabila perubahan teknikal diperlukan dan dibenarkan.
6. Semak BM/BI, fallback, fail sumber, fail yang dijana, portable build, production build dan cache mengikut struktur projek sebenar.
7. Uji paparan nama baharu, pautan, pemuatan aset dan pembacaan save lama jika aliran tersebut terjejas.
8. Laporkan nama lama yang masih wujud beserta sebab: sejarah, identifier teknikal, bahan lama atau perkara yang belum dikemas kini.

Jangan lakukan penggantian teks secara menyeluruh tanpa memahami fungsi setiap padanan. Menaikkan versi atau menerbitkan release mengikut skop arahan yang diberikan; jangan andaikan pertukaran nama telah diterbitkan.

## 7. Pengujian dan bukti

- Baca skrip dan panduan projek sebelum memilih arahan ujian. Jangan menganggap arahan npm tertentu tersedia atau selamat dijalankan dalam semua branch.
- Dalam audit baca sahaja, jalankan build atau ujian yang menjana fail dalam salinan kerja terasing. Jangan mengubah fail kerja pengguna.
- Pilih ujian yang mengesan kesan sebenar perubahan. Tambah semakan merentas modul apabila terdapat pergantungan yang relevan.
- Rekod arahan, SHA, keputusan dan sebab ujian tidak dijalankan. Bezakan ujian lulus dengan ujian yang tiada atau tidak boleh dijalankan.
- Semak screenshot daripada build yang dikenal pasti. Rekod SHA, skrin, bahasa, resolusi dan keadaan game yang relevan.
- Screenshot lama boleh menjadi rujukan sejarah, tetapi tidak membuktikan UI semasa.
- Jika hanya semakan statik dibuat, jangan menyatakan seluruh modul atau pengalaman pemain telah disahkan.

## 8. Status dan format laporan audit

| Status | Maksud |
| --- | --- |
| VALID | Bukti dan ujian yang dinyatakan menyokong keserasian dalam skop audit. Batasan masih mesti disebut. |
| PERLU UPDATE | Terdapat kandungan, tingkah laku atau dokumentasi yang terbukti perlu dikemas kini. |
| CONFLICT | Terdapat conflict Git yang disahkan atau ketidakserasian logik/kontrak antara perubahan. Nyatakan jenis dan buktinya. |
| BELUM DISAHKAN | Bukti atau ujian penting belum tersedia untuk menentukan keserasian. |

Laporan mesti mengandungi:

1. Sasaran, tarikh, repository, branch dan SHA penuh main serta sasaran.
2. Keadaan Git dan perubahan yang masih belum masuk.
3. Status keserasian serta sebab.
4. Jadual penemuan mengikut MASALAH DISAHKAN, RISIKO BERPOTENSI dan PENAMBAHBAIKAN: status, P0–P3, keyakinan, bukti, fail/lokasi, kesan dan tindakan diperlukan. Nyatakan jika tiada penemuan dalam sesuatu kategori.
5. Ujian yang dijalankan beserta keputusan.
6. Semakan yang belum dibuat dan had kesimpulan.
7. Tindakan seterusnya dalam skop kebenaran pengguna.

Gunakan pautan fail GitHub pada SHA yang diperiksa apabila sesuai. Jika ada beberapa penemuan berlainan, beri status setiap penemuan dan jelaskan status keseluruhan tanpa menyembunyikan ketidakpastian.

## 9. Had tindakan

Arahan audit sahaja membenarkan semakan dan laporan; jangan merge, mengubah atau push kod.

Jika Ijamm meminta pembetulan, laksanakan dalam skop yang diberikan. Jika diminta push ke branch sahaja, jangan push atau merge ke main. Jika diminta push/merge ke main, semak main terkini dan ujian berkaitan sebelum tindakan itu.

Jangan meluaskan arahan satu modul kepada semua modul secara senyap. Jangan membatalkan kerja pengguna atau menulis semula sejarah Git tanpa arahan yang sesuai.

SOR ini tidak menjadi kebenaran umum untuk menerbitkan, menukar nama repository atau mengubah data pemain.

## 10. Penggunaan merentas sesi

Untuk sesi repository, baca fail ini pada root bersama AGENTS.md dan SOR modul berkaitan. Versi repository ialah rujukan semasa untuk sesi coding yang mengakses repository. Jika menggunakan salinan daripada sumber lain, semak versinya dan laporkan perbezaan sebelum menganggap salinan itu terkini.

Untuk chat dalam ChatGPT Project, sediakan fail ini sebagai sumber projek dan gunakan arahan ringkas berikut dalam Project Instructions. Penerbitan di GitHub sahaja tidak memasang arahan tersebut:

Gunakan MASTER_SOR_PROJECT.md yang tersedia dalam sumber projek sebagai SOR bersama untuk semua tugas berkaitan projek ini. Baca versi semasanya dan laporan audit/handoff berkaitan terlebih dahulu sebelum kerja lain. Semak arahan terkini Ijamm. Pada setiap kemas kini branch, audit masalah sebenar, risiko berpotensi dan penambahbaikan sebelum serta selepas perubahan. Bezakan cadangan, keputusan rasmi dan keadaan kod sebenar. Semasa audit, rekod branch serta SHA main dan sasaran; periksa kesan merentas modul; laporkan VALID, PERLU UPDATE, CONFLICT atau BELUM DISAHKAN dengan bukti, ujian dan batasan. Audit sahaja tidak membenarkan perubahan, merge atau push kod. Jika fail SOR tidak tersedia, nyatakan batasan itu dan gunakan arahan eksplisit yang tersedia.

## 11. Rekod pindaan

| Versi SOR | Tarikh | Perubahan |
| --- | --- | --- |
| 1.3.0 | 26–27 Oktober 2026 | Nama rasmi Mathematics Slayer, status implementasi/penerbitan berasingan, pemeliharaan ID/save/URL dan alias portable; pemulihan bukti selepas maintenance direkod tanpa menganggap hasil lama sebagai ujian calon baharu. |
| 1.2.0 | 24 Oktober 2026 | Bacaan Master SOR dan audit terdahulu sebelum kerja lain; audit masalah, risiko dan penambahbaikan bagi setiap kemas kini branch, dengan bukti serta had skop. |
| 1.1.0 | 24 Oktober 2026 | Integrasi repository melalui AGENTS.md dan indeks SOR; kekalkan governance/pemilik domain serta bezakan pemasangan repository daripada ChatGPT Project. |
| 1.0 | 24 Oktober 2026 | SOR projek bersama dan prosedur audit; Mathematics Slayer direkod sebagai cadangan nama. |

Versi SOR berasingan daripada versi game. Rekod ini tidak membuktikan bahawa game telah ditukar nama, kod telah dikemas kini, audit modul telah selesai atau arahan telah dipasang pada semua chat.

## Rujukan penggunaan Project

Panduan rasmi OpenAI, “Projects and chats”, disemak pada 24 Oktober 2026:
https://learn.chatgpt.com/docs/projects

Panduan tersebut menerangkan bahawa Project Instructions terpakai merentas chat dalam projek yang sama dan Sources menyediakan fail rujukan bersama. Peraturan teknikal dan audit dalam SOR ini ialah arahan kerja projek yang disusun daripada kehendak Ijamm.
