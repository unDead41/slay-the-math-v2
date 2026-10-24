# MASTER SOR — PROJEK PERMAINAN MATEMATIK

| Medan | Rekod |
| --- | --- |
| Versi SOR | 1.1.0 |
| Tarikh | 24 Oktober 2026, Asia/Kuala_Lumpur |
| Pemilik keputusan | Ijamm |
| Repository rujukan | https://github.com/unDead41/slay-the-math-v2 |
| Branch utama | main |

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
| Nama lama yang disebut pengguna | Slay the Math: Dungeon of Chance |
| Nama calon yang disebut pengguna | Mathematics Slayer |
| Kedudukan nama calon | CADANGAN; contoh pertukaran nama, belum dianggap arahan pelaksanaan. |
| Repository teknikal | unDead41/slay-the-math-v2 |
| Pertukaran identiti game dalam tugas ini | Tiada; hanya dokumentasi diterbitkan. |

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
4. Jadual penemuan: status, bukti, fail/lokasi, kesan dan pembetulan diperlukan.
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

Gunakan MASTER_SOR_PROJECT.md yang tersedia dalam sumber projek sebagai SOR bersama untuk semua tugas berkaitan projek ini. Baca versi semasanya dan semak arahan terkini Ijamm sebelum bertindak. Bezakan cadangan, keputusan rasmi dan keadaan kod sebenar. Semasa audit, rekod branch serta SHA main dan sasaran; periksa kesan merentas modul; laporkan VALID, PERLU UPDATE, CONFLICT atau BELUM DISAHKAN dengan bukti, ujian dan batasan. Audit sahaja tidak membenarkan perubahan, merge atau push kod. Jika fail SOR tidak tersedia, nyatakan batasan itu dan gunakan arahan eksplisit yang tersedia.

## 11. Rekod pindaan

| Versi SOR | Tarikh | Perubahan |
| --- | --- | --- |
| 1.1.0 | 24 Oktober 2026 | Integrasi repository melalui AGENTS.md dan indeks SOR; kekalkan governance/pemilik domain serta bezakan pemasangan repository daripada ChatGPT Project. |
| 1.0 | 24 Oktober 2026 | SOR projek bersama dan prosedur audit; Mathematics Slayer direkod sebagai cadangan nama. |

Versi SOR berasingan daripada versi game. Rekod ini tidak membuktikan bahawa game telah ditukar nama, kod telah dikemas kini, audit modul telah selesai atau arahan telah dipasang pada semua chat.

## Rujukan penggunaan Project

Panduan rasmi OpenAI, “Projects and chats”, disemak pada 24 Oktober 2026:
https://learn.chatgpt.com/docs/projects

Panduan tersebut menerangkan bahawa Project Instructions terpakai merentas chat dalam projek yang sama dan Sources menyediakan fail rujukan bersama. Peraturan teknikal dan audit dalam SOR ini ialah arahan kerja projek yang disusun daripada kehendak Ijamm.
