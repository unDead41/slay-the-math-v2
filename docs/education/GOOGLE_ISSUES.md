# Papan isu dalam Sheet private

## Current main integration authorization — 2.50.0

The current explicit user request authorizes combining combat, education and
Master Map protocol candidates with main 2.49.1 as 2.50.0. Scoped compatibility
is VALID with carried P2 findings and explicit limits; original failed commands
and later focused/native evidence remain separate. Publication is PENDING actual
main ref readback. This supersedes the relevant earlier branch-only boundary;
original source pins, histories and current main owners remain. The completed
owner pilot stays tied to source b3dc, not 2.50. [Scope, results and limits](../ALL_CANDIDATES_MAIN_2_50_0.md).


Keluaran main2.38.0,24 Oktober2026: Ijamm membenarkan penggabungan pratonton
`education-report`. Maklum balas dalam game dan Practice menggunakan penerima
serta Sheet peribadi sedia ada. Deployment Google masih dikemas kini oleh pemilik.
[Panduan main dan bukti integrasi](MAIN_2_38_0.md).

## Kemas kini penerima yang sama

Gunakan hasil terkini `integrations/google-sheets/Code.gs` dalam projek Apps
Script yang sedia ada. Kekalkan Script Properties, `SPREADSHEET_ID`, origin game
sebenar, deployment dan URL `/exec` yang sama. Pilih **setupCollector → Run**
dalam editor untuk menyediakan/mengemas kini tab. Pilihan **refreshIssueBoard →
Run** membina semula papan daripada tab Comments apabila diperlukan. Kedua-dua
fungsi editor menyemak e-mel akaun aktif berbanding akaun pelaksana sebelum
mengakses Sheet.

Untuk mengaktifkan kod penerima baharu, gunakan **Deploy → Manage deployments →
Edit → New version → Deploy**. Tiada Sheet, projek atau database baharu diperlukan.
Sheet kekal private; jangan terbitkan atau kongsikan aksesnya kepada pemain.

## Cara membaca Issues

Satu baris mewakili **Question ID + Category**, merentas versi bank dan sumber.
Satu laporan dengan beberapa kategori menyumbang sekali kepada setiap kategori
berkaitan. Komen tanpa kategori masuk ke `other`. Penanda pemadaman dan rekod
yang hanya mengandungi tick **Sudah disemak** tidak dikira sebagai isu aktif.

| Lajur | Maksud |
| --- | --- |
| Pelapor unik (peranti) | Bilangan ID peranti berbeza dalam laporan aktif bagi isu itu; bukan bilangan individu yang disahkan |
| Active reports | Bilangan entri maklum balas aktif; satu peranti boleh mempunyai entri daripada beberapa versi bank |
| Sources / Languages / Bank versions | Sumber, bahasa dan versi bank laporan aktif; sumber lama menggunakan mod `learn` atau `review`, sumber game ialah `predict`, `artifact` atau `mystery` |
| First reported at / Latest report at | Tarikh penciptaan terawal dan kemas kini laporan terkini yang diketahui; baris lama tanpa Created at menggunakan Updated at sebagai fallback |
| Last received at | Masa penerimaan laporan aktif terkini yang diketahui |
| Latest comment / Question | Petikan diagnostik terkini; penanda lama `[REVIEWED]` tidak menjadi sebahagian bukti isu |
| Status | Status semakan developer yang boleh dipilih terus dalam Sheet |
| Developer notes / Fixed in version | Nota developer dan versi pembetulan yang disunting terus oleh pemilik |

Status menggunakan dropdown **Baharu → Sedang disemak → Selesai**. Ini berasingan
daripada tick semakan pemain, jawapan betul/salah dan status pembelajaran.

Refresh mengekalkan status, nota dan versi pembetulan. Isu **Selesai** dibuka
semula sebagai **Baharu** apabila laporan aktif baharu atau bukti aktif yang
berubah diterima pada revision lebih baharu. Retry, revision lama, perubahan
timestamp/tick sahaja, penyingkiran kategori, penyingkiran komen sahaja dan
tombstone tidak membuka semula isu. Perubahan komen, sumber, bahasa atau konteks
bantuan yang benar-benar baharu boleh membukanya semula.

Baris kekal walaupun semua laporan dibuang: kiraan menjadi sifar, manakala
petikan diagnostik terakhir, tarikh sejarah dan nota developer dikekalkan.
Dengan kiraan sifar, Sources/Languages/Bank versions juga merupakan snapshot
terakhir, bukan dakwaan masih terdapat laporan aktif.

## Data dan penerimaan

Comments mengekalkan 16 lajur asal dan menambah **Source, Hint used, More Hint
viewed, Steps viewed, Context status, Created at** di hujung. Migrasi header tidak
menulis semula baris lama; retry rekod akan melengkapkan diagnostiknya. Learning,
Comments, `_Records` dan `_Clients` sedia ada dikekalkan. `_IssueReports` ialah
tab tersembunyi untuk key/revision/hash bukti terkini, termasuk selepas pemadaman;
ia bukan sejarah penuh semua teks lama. Jangan edit atau padam tab teknikal.

Pengagregatan membaca Comments terkini, menyahgandakan key laporan, kemudian
refresh sekali selepas semua projection batch. Status dan sel yang dikira
disimpan sebelum signature diingati. Kegagalan projection, papan, signature atau
flush tidak memberikan ACK; retry membaiki data dan tidak menambah kiraan.
`ScriptLock` melindungi penulisan skrip dan flush selesai sebelum ACK tepat.
Kolum nota/versi menggunakan format teks; teks laporan yang menyerupai formula
ditulis sebagai teks inert. Refresh tidak menulis semula nota developer.

RPC pemain kekal hanya `status`, `register` dan `batch`. Tiada endpoint membaca
papan atau mengedit status developer. Consent, giliran offline dan identiti
maklum balas `bankVersion:questionId` kekal milik aliran penghantaran sedia ada.

## Pengesahan

Ujian fokus: `node --test tests/google-issues.test.cjs tests/google-sheets-receiver.test.cjs`.
Meliputi konteks lama/game, beberapa kategori, dedup ID peranti merentas versi,
replay/revision lama, edit/pemadaman, kiraan sifar, pembukaan semula, nota/status
manual, guard pemilik, migrasi header, formula dan pembaikan kegagalan separa.

Perkhidmatan Google disimulasi dalam V8. Akaun, Sheet, deployment dan kuota Google
sebenar belum disahkan oleh ujian ini. Pemilik perlu menyemak satu penghantaran
ujian dalam Sheet sebenar selepas mengemas kini deployment.


## Pratonton kebolehpercayaan penghantaran — 2.45.1-education.1

Branch `codex/education-delivery-reliability` menambah **Game version** dan **Content revision** di hujung Comments, serta **Game versions** dan **Content revisions** di hujung Issues. Status, Developer notes, Fixed in version dan lajur sedia ada kekal pada tempatnya. Rekod lama tanpa metadata kekal kosong; tick semakan tidak melabel semula versinya.

Sebelum mencuba kutipan daripada branch ini, salin **seluruh Code.gs baharu** ke projek Apps Script yang sama, kekalkan Script Properties/Sheet/deployment, jalankan **setupCollector**, kemudian **Deploy → Manage deployments → Edit → New version → Deploy**. Receiver lama mungkin menolak metadata baharu; rekod yang tidak mendapat ACK kekal pending pada peranti. Jangan buang data atau cipta Sheet lain untuk mengatasi penolakan ini.

Origin Pages projek, **https://undead41.github.io**, kini disediakan bersama localhost. Tambah origin tepat sendiri jika menggunakan host lain. URL `/exec` masih perlu ditetapkan melalui Developer Hub tempatan dan disertakan dalam build pemain; tiada pautan sebenar direka oleh branch ini. Menyimpan pautan bukan bukti penghantaran sudah berjaya.

Semak satu komen sebenar dalam browser pemain baharu selepas consent, kemudian edit komen ketika offline dan sambungkan semula. Pastikan satu rekod dikemas kini, versi betul, nota developer kekal dan pending menjadi sifar selepas pengesahan. Retry berterusan pada sela maksimum 60 saat semasa tab aktif; ia dijeda apabila tab tersembunyi, offline atau perkongsian dimatikan. Tiada database baharu diperlukan.
