# Google Sheets — Mathematics Slayer

Rename paparan tidak membuat deployment Google atau memindahkan Sheet. Kekalkan
URL/receiver/payload dan data sedia ada. Tiada live Google test didakwa oleh
perubahan nama. Panduan versi terdahulu mengekalkan konteks asalnya.

Keluaran main **2.38.0** (dikekalkan dalam **2.39.0**) menambah butang **Laporkan masalah**, Hint yang
diperjelas dan tab **Issues** peribadi. Ikut [panduan main dan kemas kini penerima
yang sama](education/MAIN_2_38_0.md). Gunakan keseluruhan Code.gs baharu,
**setupCollector → Run**, kemudian deploy versi baharu dengan URL `/exec`
sedia ada. [Cara membaca Issues dan status developer](education/GOOGLE_ISSUES.md).

Keluaran main **2.36.0** menggabungkan Learning Report, tick/komen Practice dan polisi dua cubaan dalam game. Akaun Google, Sheet dan deployment Apps Script disediakan pemilik sekali sahaja; laporan terus berfungsi tanpa Google. [Panduan keluaran main](education/MAIN_2_36_0.md).

## Kemas kini penerima sedia ada untuk 2.36.0

Perubahan soalan **dalam game** kini mempunyai event polisi dua cubaan. Gantikan
Code.gs dalam projek Apps Script yang sama dengan fail repo terkini, kekalkan
STM_ALLOWED_GAME_ORIGINS sebenar, kemudian **Deploy → Manage deployments → Edit →
New version → Deploy**. Kekalkan deployment dan URL /exec yang sama; Sheet dan
Script Properties sedia ada tidak perlu dibina semula. Penerima lama boleh menolak
rekod polisi baharu; rekod belum disahkan kekal dalam giliran. [Panduan perubahan
soalan dan langkah terperinci](education/GAME_QUESTIONS.md).

## Apa yang anda dapat

- Learning Report kekal dalam **Main Menu**, **Settings** dan **Education Practice**. Laporan dan komen boleh digunakan tanpa pangkalan data atau internet.
- Pilihan penghantaran automatik ke Google Sheets. Google mengendalikan Apps Script; anda tidak perlu menjalankan server database sendiri.
- Rekod cubaan, jawapan salah, Hint, More Hint, Asas, langkah kerja, bab/SP dan komen. Learning Report dalam game masih menyediakan graf dan cadangan ulang kaji; Sheet menyediakan baris untuk semakan atau analisis guru.
- Perkongsian bermula dengan persetujuan pemain. Tiada nama atau e-mel pemain diminta. Setiap pemasangan menerima ID peranti rawak.

## 1. Jalankan main terkini

Hentikan server game lama dengan **Ctrl+C**. Dalam PowerShell di folder projek:

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git status -sb
    git stash push -m "backup-before-education-main-2.36"
    if ($LASTEXITCODE -ne 0) { throw "Backup perubahan gagal." }
    git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "Fetch gagal." }
    git switch main
    if ($LASTEXITCODE -ne 0) { throw "Gagal tukar ke main." }
    git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw "Pull gagal. Semak mesej Git di atas." }
    npm.cmd start
}
```

Perubahan yang belum dicommit disimpan dalam stash. Jangan jalankan `stash pop` tanpa menyemak perubahan itu terlebih dahulu. Buka **http://localhost:4173**. Terminal dan menu perlu memaparkan **v2.36.0**. Jika port digunakan, hentikan proses server lama dahulu. Google collection menggunakan `npm start` biasa; `start:analytics` hanya diperlukan bagi pilihan SQLite yang lama.

## 2. Cipta penerima Google sekali sahaja

1. Buka [Google Apps Script](https://script.google.com/) menggunakan akaun Google yang akan memiliki data. Pilih **New project**.
2. Buka fail repo **integrations/google-sheets/Code.gs**. Salin **seluruh fail** ke `Code.gs` dalam editor Apps Script, menggantikan kod contoh. Bagi projek baharu, gunakan nama paparan `Mathematics Slayer Collection`. Projek/deployment lama tidak perlu dinamakan semula; kekalkan URL `/exec`, Script Properties, schema/payload dan rekod lama.
3. Di bahagian atas fail terdapat `STM_ALLOWED_GAME_ORIGINS`. `http://localhost:4173` dan `http://127.0.0.1:4173` sudah disediakan. Jika game dihoskan, tambah origin tepat, misalnya `https://game-sekolah.example` — tanpa path atau slash terakhir. Domain contoh ini perlu diganti dengan domain sebenar anda.
4. Pilih fungsi **setupCollector** (tanpa `_`) dalam dropdown editor, kemudian **Run**. Benarkan kebenaran Google yang diperlukan untuk mencipta dan mengubah Spreadsheet. Semak kod dan projek milik anda sebelum meneruskan paparan kebenaran Google.
5. Buka **Execution log**. Pautan `Open your private collection Sheet: …` membawa ke Google Sheet baharu dalam Drive anda. Menjalankan setup sekali lagi akan menggunakan Sheet yang sama. Kekalkan kedua-dua fungsi `setupCollector` dan `setupCollector_` seperti dalam fail; tidak perlu menukar nama sebelum/selepas Run. Fungsi boleh dipilih itu menyemak akaun aktif berbanding akaun yang menjalankan skrip sebelum memanggil implementation private. Kebenaran identiti akaun hanya digunakan bagi semakan setup pemilik.
6. Pilih **Deploy → New deployment → Web app**. Tetapkan **Execute as: Me** dan akses **Anyone** supaya pemain tidak perlu login. Pilihan akses bergantung pada dasar akaun/organisasi; jika `Anyone` tanpa login tidak dibenarkan, pentadbir perlu membenarkannya atau gunakan eksport manual/SQLite dahulu. Jangan anggap deployment yang meminta login pemain sudah sedia untuk aliran ini.
7. Klik **Deploy** dan salin **Web app URL** berakhir dengan `/exec`. Jangan gunakan pautan Spreadsheet, Drive, editor atau `/dev`.

Google Sheet sendiri kekal private. Pemain berhubung dengan skrip penerima, bukannya memperoleh akses membaca keseluruhan Sheet. Jangan jadikan Sheet awam untuk mengaktifkan game. Tiada token OAuth, kata laluan Google atau Sheet ID perlu dimasukkan ke game/Git.

## 3. Tetapkan sambungan sebagai developer

Gunakan semula pautan `/exec` yang telah dideploy. Protokol penerimaan tidak berubah oleh pembetulan layout ini.

1. Hentikan server game dengan **Ctrl+C**, kemudian jalankan `npm.cmd start dev`.
2. Buka **http://localhost:4174**. Tekan **Dev: OFF** untuk mengaktifkannya, kemudian **Open Developer Hub**.
3. Dalam Hub, pilih **Education collection**. Tampal pautan Google Apps Script `/exec` dan tekan **Save Google Sheets connection**.
4. Tetapan disimpan dalam `dist/learning-collection-config.js` untuk projek ini. Sandbox developer tetap tidak menghantar data atau membaca simpanan pemain.
5. Hentikan server developer dan jalankan `npm.cmd start`. Buka **http://localhost:4173**.
6. Dalam game, buka **Learning Report → Sharing / Perkongsian**. Tekan **Enable sharing / Aktifkan perkongsian** jika mahu menghantar data.
7. Jawab satu soalan dan simpan satu komen. Semak **Waiting to send / Menunggu penghantaran**, kemudian tab **Learning** dan **Comments** dalam Sheet pemilik.

Hanya developer mengubah pautan melalui Hub. Pemain melihat persetujuan, status penghantaran dan sandaran JSON dalam bahagian tertutup. Kawalan CSV/import CSV dan perkongsian fail komen yang bertindih telah dikeluarkan daripada flow pemain. Import/Export Save permainan kekal berasingan.

Alamat penerima Google ialah konfigurasi awam yang diperlukan browser; menyembunyikan input tidak menjadikannya rahsia. Google Sheet tidak perlu dijadikan public. Developer Hub mengubah konfigurasi hanya melalui sambungan localhost pada komputer itu dan origin yang sama; mod pemain/production tidak menyediakan endpoint ini.

Pilihan destinasi yang pernah disimpan dalam browser dikekalkan bersama jurnal/consent/receipt asalnya. Jika destinasi berbeza daripada default Google projek, pemain boleh menekan **Use the organiser’s current connection / Gunakan sambungan semasa pengendali**. Pertukaran ini menjeda perkongsian dan memerlukan persetujuan semula; ia tidak memindahkan pengesahan penghantaran daripada destinasi lama.

## Untuk semua pemain

Selepas menyimpan pautan dalam Developer Hub, jalankan **`npm.cmd run build:prod`** dan sebarkan/hoskan hasil `release-prod` yang baharu. Browser baharu menggunakan tetapan projek, manakala pilihan browser terdahulu kekal sehingga pengguna memilih untuk menukarnya. Pemain masih perlu mengaktifkan perkongsian. Jangan sebarkan akses editor Apps Script atau private Sheet.

Untuk game yang dihoskan, tambah origin game sebenar pada `STM_ALLOWED_GAME_ORIGINS` dalam Apps Script dan kemas kini deployment. Contohnya, jika menggunakan laman repo `https://undead41.github.io/slay-the-math-v2/`, origin ialah `https://undead41.github.io` tanpa path. Ini contoh konfigurasi, bukan pengesahan bahawa hosting itu telah berjaya.

## Apabila tiada Wi-Fi

Rekod disimpan pada peranti. Apabila internet pulih **dan game masih dibuka**, penghantaran dicuba semula secara terhad. Jika game ditutup semasa offline, buka semula **alamat dan browser yang sama** selepas internet pulih. Anda juga boleh menekan **Try sending now / Cuba hantar sekarang**. Tiada penghantaran latar belakang apabila browser ditutup.

Jangan clear site data sebelum penerimaan disahkan atau sebelum mengeksport salinan. Selepas kegagalan berulang, gunakan butang hantar semula, sambung semula internet atau buka semula game. Respons hilang selepas Google menyimpan tidak menggandakan baris; revision yang sama dipadankan semula. Komen yang diedit dikemas kini dan pemadaman dihantar sebagai penanda pemadaman apabila perkongsian diaktifkan.

## Tick dan komen dalam Education Practice

Dalam branch ini, tick bermaksud **Sudah disemak**, berasingan daripada betul/salah. Komen boleh ditulis tanpa tick. Pilih tab **Maklum balas** pada soalan; semua perubahan disimpan secara automatik pada peranti. Tapisan **Belum disemak / Sudah disemak / Ada maklum balas** membantu menyambung semakan.

Apabila perkongsian diaktifkan, tick dan komen menggunakan penerima Google yang sama. Dalam tab **Comments**, medan **Question** bermula dengan `[REVIEWED] ` jika soalan ditick; medan **Comment** mengekalkan teks asal, termasuk had 2000 aksara. Untick mengekalkan komen/kategori dan mengemas kini baris sama. Jika tiada tick, komen atau kategori lagi, penanda pemadaman sedia ada digunakan. Perubahan tick/komen Practice sendiri tidak memerlukan lajur atau protokol baharu. Untuk pakej report.3 keseluruhan, kemas kini deployment seperti di atas kerana polisi soalan dalam game turut berubah; URL `/exec` yang sama boleh dikekalkan.

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

Penerima ini mengehadkan satu Sheet kepada **10,000 rekod** dan **1,500 ID peranti**, serta 25 entri setiap batch. Apps Script juga tertakluk pada [kuota Google](https://developers.google.com/apps-script/guides/services/quotas). Jika sibuk, kuota habis, deployment salah, atau iframe Google disekat, rekod kekal Pending dan boleh dieksport. Tiada jaminan penerimaan dibuat daripada respons `no-cors` atau muat naik fail sahaja.

Sheet bukan transaksi SQL. Skrip menyemak keseluruhan batch sebelum menulis, mengunci penulisan, menyimpan payload, membaiki tab bacaan dan menjalankan `SpreadsheetApp.flush()` sebelum ACK. Kegagalan perkhidmatan boleh meninggalkan sebahagian penulisan; cubaan semula membaikinya sebelum penerimaan disahkan. Teks seperti `=FORMULA(...)` disimpan sebagai teks inert, bukan formula. Payload asal menggunakan lima cebisan berawalan `json:`; jika mengekstrak JSON daripada tab _Records, buang awalan itu daripada setiap sel yang tidak kosong, kemudian cantum mengikut turutan. Awalan ini mengelakkan kandungan pada sempadan cebisan diubah oleh tafsiran formula/apostrof Google Sheets.

Jika mengemas kini skrip Google, gunakan **Deploy → Manage deployments → Edit → New version** untuk mengekalkan URL. Deployment baharu dengan ID lain dianggap destinasi baharu: perkongsian dijeda dan rekod yang diketahui perlu disahkan semula. Setiap destinasi mempunyai consent/identity/receipt sendiri; data dan jurnal destinasi lama dikekalkan dalam browser. Eksport dalam game merangkumi giliran **destinasi semasa**, bukan gabungan semua jurnal destinasi lama. Gunakan destinasi yang sepadan untuk menyemak giliran terdahulu.

Untuk mengarkib koleksi yang mencapai had: eksport/salin Sheet melalui akaun pemilik; sediakan projek Apps Script berasingan untuk koleksi baharu dan tukar URL game. Jangan padam tab teknikal ketika masih ada penghantaran. Tetapkan tempoh simpanan dan siapa boleh mengakses fail dalam akaun pemilik; tiada sistem akaun guru, dashboard pusat atau jadual pemadaman automatik dibina dalam keluaran ini.

## Status pengesahan

Kod, protokol, simpanan terputus/cuba semula dan iframe Google bersarang diuji dengan browser sebenar serta sempadan perkhidmatan Google yang disimulasi. **Akaun, Sheet sebenar dan deployment Google belum dikonfigurasi atau diuji secara langsung.** Langkah 2–3 perlu diselesaikan pemilik sebelum menguji penghantaran sebenar. Semak satu rekod ujian pada Sheet sebelum digunakan dengan kelas.

Rujukan pelaksanaan rasmi: [Web apps dan deployment](https://developers.google.com/apps-script/guides/web), [HtmlService server communication](https://developers.google.com/apps-script/guides/html/communication), [iframe restrictions](https://developers.google.com/apps-script/guides/html/restrictions), [frame options](https://developers.google.com/apps-script/reference/html/x-frame-options-mode), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service). Build penerima daripada sumber: `npm run build:google-sheets`.

Pratonton asal `education-google-sheets` kekal dalam sejarah pada `a535a04` / 2.28.0-sheets.1. Main 2.30.0 mengintegrasikannya dengan main 2.29.0. Branch education-report menambah laporan yang dikemas kini di atas main tersebut; main sendiri tidak diubah oleh pratonton ini.
