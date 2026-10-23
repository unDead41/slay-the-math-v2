# Google Sheets — Slay the Math

Preview **2.28.0-sheets.1**, branch **education-google-sheets**, based on main **e2c323a / 2.27.0**. This branch adds Google collection to the existing offline Learning Report. It does not publish to main or configure a Google account automatically.

## Apa yang anda dapat

- Learning Report kekal dalam **Main Menu**, **Settings** dan **Education Practice**. Laporan dan komen boleh digunakan tanpa pangkalan data atau internet.
- Pilihan penghantaran automatik ke Google Sheets. Google mengendalikan Apps Script; anda tidak perlu menjalankan server database sendiri.
- Rekod cubaan, jawapan salah, Hint, More Hint, Asas, langkah kerja, bab/SP dan komen. Learning Report dalam game masih menyediakan graf dan cadangan ulang kaji; Sheet menyediakan baris untuk semakan atau analisis guru.
- Perkongsian bermula dengan persetujuan pemain. Tiada nama atau e-mel pemain diminta. Setiap pemasangan menerima ID peranti rawak.

## 1. Jalankan branch ini

Dalam PowerShell, di folder projek:

```powershell
git status -sb
# Jika ada fail yang diubah, simpan dahulu (jangan buang perubahan sendiri):
git stash push -m "backup-before-google-sheets"
git fetch origin education-google-sheets
if ($LASTEXITCODE -eq 0) { git switch -c education-google-sheets --no-track FETCH_HEAD }
if ($LASTEXITCODE -eq 0) { npm.cmd start }
```

Jika branch tempatan sudah wujud, gunakan `git switch education-google-sheets`, kemudian `git pull --ff-only origin education-google-sheets` sebelum `npm.cmd start`. Berhenti dan semak mesej jika mana-mana arahan gagal; jangan teruskan pull ketika terdapat konflik. Jangan jalankan `stash pop` ke branch ini tanpa menyemak perubahan yang disimpan.

Buka **http://localhost:4173**. Terminal dan menu perlu memaparkan **v2.28.0-sheets.1**. Hentikan server lama dengan Ctrl+C dahulu jika port digunakan. Google collection menggunakan `npm start` biasa; `start:analytics` hanya diperlukan bagi pilihan SQLite yang lama.

## 2. Cipta penerima Google sekali sahaja

1. Buka [Google Apps Script](https://script.google.com/) menggunakan akaun Google yang akan memiliki data. Pilih **New project**.
2. Buka fail repo **integrations/google-sheets/Code.gs**. Salin **seluruh fail** ke `Code.gs` dalam editor Apps Script, menggantikan kod contoh. Simpan projek sebagai `Slay the Math Collection`.
3. Di bahagian atas fail terdapat `STM_ALLOWED_GAME_ORIGINS`. `http://localhost:4173` dan `http://127.0.0.1:4173` sudah disediakan. Jika game dihoskan, tambah origin tepat, misalnya `https://game-sekolah.example` — tanpa path atau slash terakhir. Domain contoh ini perlu diganti dengan domain sebenar anda.
4. Pilih fungsi **setupCollector_** dalam dropdown editor, kemudian **Run**. Benarkan kebenaran Google yang diperlukan untuk mencipta dan mengubah Spreadsheet. Semak kod dan projek milik anda sebelum meneruskan paparan kebenaran Google.
5. Buka **Execution log**. Pautan `Open your private collection Sheet: …` membawa ke Google Sheet baharu dalam Drive anda. Menjalankan setup sekali lagi akan menggunakan Sheet yang sama.
6. Pilih **Deploy → New deployment → Web app**. Tetapkan **Execute as: Me** dan akses **Anyone** supaya pemain tidak perlu login. Pilihan akses bergantung pada dasar akaun/organisasi; jika `Anyone` tanpa login tidak dibenarkan, pentadbir perlu membenarkannya atau gunakan eksport manual/SQLite dahulu. Jangan anggap deployment yang meminta login pemain sudah sedia untuk aliran ini.
7. Klik **Deploy** dan salin **Web app URL** berakhir dengan `/exec`. Jangan gunakan pautan Spreadsheet, Drive, editor atau `/dev`.

Google Sheet sendiri kekal private. Pemain berhubung dengan skrip penerima, bukannya memperoleh akses membaca keseluruhan Sheet. Jangan jadikan Sheet awam untuk mengaktifkan game. Tiada token OAuth, kata laluan Google atau Sheet ID perlu dimasukkan ke game/Git.

## 3. Sambungkan dalam game

1. **Main Menu → Learning Report → Collection link / Pautan pengumpulan**.
2. Tampal pautan `/exec`, kemudian **Use Google Sheets / Gunakan Google Sheets**.
3. Semak destinasi yang dipaparkan. Tekan **Enable sharing / Aktifkan perkongsian**. Menyimpan pautan sahaja belum menghantar data.
4. Jawab soalan atau hantar komen dalam Education Practice. **Pending** hanya berkurang selepas Google mengesahkan simpanan lengkap.
5. Buka Sheet melalui Drive anda. Tab **Learning** mengandungi rekod pembelajaran; **Comments** mengandungi komen. Muat turun daripada Google Sheets melalui **File → Download** jika mahu CSV/Excel.

Pautan disimpan pada browser dan origin game itu. Gunakan alamat yang sama setiap kali: `localhost` dan `127.0.0.1`, port berlainan, profil browser dan komputer lain mempunyai simpanan berasingan. Mod developer dan fail HTML `file://` tidak menghantar; jalankan game melalui HTTP untuk collection.

## Untuk semua pemain tanpa tampal pautan seorang demi seorang

Tetapkan `googleScriptUrl` dalam **dist/learning-collection-config.js** kepada URL `/exec` anda, kemudian bina/hoskan versi game tersebut. Contoh:

```js
globalThis.DCLearningCollectionConfig={
  googleScriptUrl:'https://script.google.com/macros/s/ID_DEPLOYMENT_ANDA/exec'
};
```

Ini URL destinasi awam, bukan rahsia Google. Browser baharu menggunakan tetapan ini. Pilihan yang pernah disimpan pemain mengatasinya; pemain masih perlu mengaktifkan perkongsian. Operator hanya perlu menyebarkan game yang telah ditetapkan ini, bukannya akses editor Apps Script atau Sheet.

## Apabila tiada Wi-Fi

Rekod disimpan pada peranti. Apabila internet pulih **dan game masih dibuka**, penghantaran dicuba semula secara terhad. Jika game ditutup semasa offline, buka semula **alamat dan browser yang sama** selepas internet pulih. Anda juga boleh menekan **Send pending records**. Tiada penghantaran latar belakang apabila browser ditutup.

Jangan clear site data sebelum penerimaan disahkan atau sebelum mengeksport salinan. Selepas kegagalan berulang, gunakan butang hantar semula, sambung semula internet atau buka semula game. Respons hilang selepas Google menyimpan tidak menggandakan baris; revision yang sama dipadankan semula. Komen yang diedit dikemas kini dan pemadaman dihantar sebagai penanda pemadaman apabila perkongsian diaktifkan.

## Cara membaca Sheet

| Tab / medan | Maksud |
| --- | --- |
| Learning | Satu baris bagi satu soalan dalam satu sesi/sumber; kemas kini menggunakan ID dan revision yang sama |
| Answered | 1 jika ada sekurang-kurangnya satu cubaan; soalan yang hanya dibuka tidak dikira |
| Wrong attempts | Jumlah cubaan salah dalam rekod itu |
| Independent first try | Betul pada cubaan pertama tanpa Hint/More Hint/Asas |
| Help on first attempt | Bantuan telah dibuka sebelum cubaan pertama; Hint used boleh juga berlaku selepas cubaan salah |
| Retry success / Revealed | Betul selepas beberapa cubaan / jawapan didedahkan |
| Scope | gameplay, practice atau review; asingkan review ketika mengukur latihan tanpa pendedahan jawapan |
| Learning standards / Skills | SP dan kemahiran terpilih daripada bank sebenar, bukan dakwaan meliputi seluruh DSKP |
| Comments | Kategori, teks komen asal, konteks bahasa dan Deleted; baris terkini menggantikan komen terdahulu |
| _Records / _Clients | Tab teknikal tersembunyi untuk payload lengkap dan hash capability; jangan susun semula/edit/padam kolumnya |

Laporan ini diagnostik, bukan Tahap Penguasaan rasmi. Gunakan bilangan soalan berbeza sebagai konteks dan sekurang-kurangnya tiga soalan berbeza sebelum cadangan ulang kaji. Jangan anggap kadar menang tempur sebagai pencapaian matematik.

## Had dan penyelenggaraan

Pratonton ini mengehadkan satu Sheet kepada **10,000 rekod** dan **1,500 ID peranti**, serta 25 entri setiap batch. Apps Script juga tertakluk pada [kuota Google](https://developers.google.com/apps-script/guides/services/quotas). Jika sibuk, kuota habis, deployment salah, atau iframe Google disekat, rekod kekal Pending dan boleh dieksport. Tiada jaminan penerimaan dibuat daripada respons `no-cors` atau muat naik fail sahaja.

Sheet bukan transaksi SQL. Skrip menyemak keseluruhan batch sebelum menulis, mengunci penulisan, menyimpan payload, membaiki tab bacaan dan menjalankan `SpreadsheetApp.flush()` sebelum ACK. Kegagalan perkhidmatan boleh meninggalkan sebahagian penulisan; cubaan semula membaikinya sebelum penerimaan disahkan. Teks seperti `=FORMULA(...)` disimpan sebagai teks inert, bukan formula. Payload asal menggunakan lima cebisan berawalan `json:`; jika mengekstrak JSON daripada tab _Records, buang awalan itu daripada setiap sel yang tidak kosong, kemudian cantum mengikut turutan. Awalan ini mengelakkan kandungan pada sempadan cebisan diubah oleh tafsiran formula/apostrof Google Sheets.

Jika mengemas kini skrip Google, gunakan **Deploy → Manage deployments → Edit → New version** untuk mengekalkan URL. Deployment baharu dengan ID lain dianggap destinasi baharu: perkongsian dijeda dan rekod yang diketahui perlu disahkan semula. Setiap destinasi mempunyai consent/identity/receipt sendiri; data dan jurnal destinasi lama dikekalkan dalam browser. Eksport dalam game merangkumi giliran **destinasi semasa**, bukan gabungan semua jurnal destinasi lama. Gunakan destinasi yang sepadan untuk menyemak giliran terdahulu.

Untuk mengarkib koleksi yang mencapai had: eksport/salin Sheet melalui akaun pemilik; sediakan projek Apps Script berasingan untuk koleksi baharu dan tukar URL game. Jangan padam tab teknikal ketika masih ada penghantaran. Tetapkan tempoh simpanan dan siapa boleh mengakses fail dalam akaun pemilik; tiada sistem akaun guru, dashboard pusat atau jadual pemadaman automatik dibina dalam pratonton ini.

## Status pengesahan

Kod, protokol, simpanan terputus/cuba semula dan iframe Google bersarang diuji dengan browser sebenar serta sempadan perkhidmatan Google yang disimulasi. **Akaun, Sheet sebenar dan deployment Google belum dikonfigurasi atau diuji secara langsung.** Langkah 2–3 perlu diselesaikan pemilik sebelum menguji penghantaran sebenar. Semak satu rekod ujian pada Sheet sebelum digunakan dengan kelas.

Rujukan pelaksanaan rasmi: [Web apps dan deployment](https://developers.google.com/apps-script/guides/web), [HtmlService server communication](https://developers.google.com/apps-script/guides/html/communication), [iframe restrictions](https://developers.google.com/apps-script/guides/html/restrictions), [frame options](https://developers.google.com/apps-script/reference/html/x-frame-options-mode), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service). Build penerima daripada sumber: `npm run build:google-sheets`.

Branch ini berasaskan main 2.27.0 pada `e2c323a`. Main menerima update lain secara berasingan semasa kerja ini berjalan (termasuk 2.28.0). Kerja ini tidak mengubah main. Semasa integrasi nanti, gunakan merge/compare Git dan selesaikan perubahan versi serta fail berkongsi; jangan menggantikan keseluruhan main dengan salinan branch.
