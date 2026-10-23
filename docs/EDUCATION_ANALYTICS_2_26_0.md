# Education analytics pada main — v2.26.0

Integrasi `education-analytics` (`1acefda`) dengan main v2.25.1 (`7afb0aa`), atas arahan Ijamm pada 23 Oktober 2026 (Malaysia). Animasi kad, artwork asal 40 kad/31 artifak, MUSIC(5), bank 120 soalan, save dan RNG dikekalkan. Learning Report tersedia melalui Main Menu, Settings dan Education Practice, dalam BM/English.

## Pilih cara guna

| Tujuan | Perlu backend? | Cara |
| --- | --- | --- |
| Main, cuba soalan, lihat graf pembelajaran dan muat turun laporan sendiri | Tidak | `npm.cmd start` atau `npm.cmd run start:prod` |
| Cuba penghantaran komen/analitik pada PC sendiri | Ya; backend sudah disertakan | `npm.cmd run start:analytics:prod`; SQLite dicipta automatik |
| Kumpul data daripada komputer pemain lain ke satu tempat | Ya; perlukan satu server yang boleh dicapai | Hoskan game dan receiver di alamat sama, dengan storan database kekal |

Pakej ini tidak memerlukan pemasangan MySQL, PostgreSQL atau akaun database luar untuk penggunaan tempatan. Ia tidak menyediakan akaun guru, senarai kelas atau dashboard guru berpusat. Laporan dalam game ialah laporan bukti pada browser berkenaan; operator boleh mengekstrak semua rekod yang dihantar daripada database.

## Update projek Windows

Hentikan terminal server lama dengan **Ctrl+C**. Dalam PowerShell pada folder projek, jalankan blok ini supaya kegagalan Git menghentikan langkah seterusnya:

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git status -sb
    git stash push -m "backup-before-analytics-main"
    if ($LASTEXITCODE -ne 0) { throw "Backup perubahan tempatan gagal. Salin mesej terminal." }
    git switch main
    if ($LASTEXITCODE -ne 0) { throw "Gagal tukar ke main. Salin mesej terminal." }
    git pull --ff-only origin main
    if ($LASTEXITCODE -ne 0) { throw "Pull gagal. Salin mesej terminal; jangan terus jalankan versi lama." }
    node -p "require('./package.json').version"
    npm.cmd run start:prod
}
```

`git stash push` menyimpan perubahan pada fail yang sudah dijejak, termasuk fail build yang mungkin menghalang pull. Fail tempatan baharu yang belum dijejak kekal pada tempatnya; jika Git melaporkan pertindihan, semak fail itu dahulu. Database sebenar diabaikan oleh Git dan kekal pada tempatnya. Jangan `stash pop` fail generated lama terus ke atas keluaran baharu. Untuk senarai backup, gunakan `git stash list`.

Buka alamat yang dicetak terminal; lalai **http://localhost:4173**. Selepas update ini, menu memaparkan **v2.26.0** (atau versi main yang lebih baharu jika sudah ada update susulan). Tutup tab lama atau refresh selepas restart. Kod di GitHub tidak mengemas kini PC secara automatik.

## Jalankan backend dan database tempatan

Semak `node -v`. Receiver memerlukan **Node 22.13+** kerana menggunakan `node:sqlite` terbina dalam ([dokumentasi rasmi Node](https://nodejs.org/api/sqlite.html)); Node 24 LTS boleh digunakan. Tiada `npm install` diperlukan untuk bermain atau menjalankan receiver ini.

Hentikan server biasa dengan **Ctrl+C**, kemudian:

```powershell
npm.cmd run start:analytics:prod
```

Command ini membina player production dan menjalankan **game + API + SQLite** dalam satu terminal. Buka **http://localhost:4173**, pilih **Learning Report / Laporan Pembelajaran**, kemudian **Enable sharing / Aktifkan perkongsian**. Perkongsian dimatikan secara lalai; semua browser pemain perlu mengaktifkannya sendiri. Gunakan alamat browser yang sama seperti sebelumnya supaya rekod setempat masih tersedia.

- Database dan jadual `clients`/`records` dicipta automatik di `tools/analytics/data/education.sqlite`.
- Server mendengar pada `127.0.0.1` secara lalai; mod ini untuk PC sendiri.
- Status **Received / Diterima** bermaksud versi rekod itu telah disahkan selepas database commit. Pending bermaksud belum disahkan.
- Biarkan terminal terbuka semasa pengumpulan. Menutup terminal menghentikan receiver; fail database tidak dipadamkan.
- `npm.cmd run start:analytics` menjalankan receiver yang sama terus daripada `dist` untuk kerja source. `npm start` dan `start:prod` biasa tidak menjalankan API pengumpulan.

## Cuba offline dan sambung semula

1. Jawab soalan/simpan komen dengan perkongsian ditangguhkan. Bukti pembelajaran kekal pada browser.
2. Aktifkan perkongsian apabila receiver tersedia. Pending hanya dibersihkan untuk revision yang sudah disahkan.
3. Jika sambungan receiver terputus, rekod baharu kekal dalam queue. Selepas sambungan kembali, game yang terbuka mencuba semula; **Send pending records** boleh digunakan untuk cuba segera.
4. Jika game ditutup ketika offline, buka semula **alamat dan browser yang sama** apabila game boleh dicapai. Queue cuba dihantar semula; tiada penghantaran semasa browser ditutup.

`localhost` pada PC yang sama tidak memerlukan Wi-Fi. Reconnect Wi-Fi sahaja tidak menghantar data kepada Ijamm jika tiada receiver pusat yang dipasang. Browser/port/domain lain mempunyai simpanan berasingan. Jangan padam data browser sebelum rekod diterima atau dieksport.

Game yang sudah dimuatkan boleh merekod tanpa sambungan receiver. Versi ini tidak menambah pemasangan PWA atau jaminan membuka URL remote buat kali pertama ketika offline; aset yang belum dimuatkan masih memerlukan sambungan. Portable HTML menyimpan laporan/komen pada peranti dan menyediakan eksport, tetapi bukan sambungan automatik antara origin `file:` dan server pusat.

## Extract data dan backup

Pemain boleh muat turun CSV/JSON terus dari Learning Report tanpa backend. JSON mengandungi bukti penuh, komen, pending dan snapshot recovery setempat; tiada capability secret dieksport. CSV ialah unjuran analitik. Review diasingkan daripada Game + Practice secara lalai.

Untuk operator, buka terminal kedua pada folder projek dan jalankan:

```powershell
npm.cmd run analytics:export -- --format json --output education-data.json
npm.cmd run analytics:export -- --format csv --output education-data.csv
```

Eksport operator mengandungi learning records dan komen yang **sudah diterima** oleh receiver; pending pada browser lain belum termasuk. ID peranti membezakan sumber tanpa meminta nama/email. Tiada endpoint awam untuk memuat turun data semua pemain. Simpan eksport di tempat terkawal; fail data/eksport diabaikan oleh Git.

Untuk backup database ringkas, hentikan receiver dengan **Ctrl+C** dahulu, kemudian salin seluruh folder `tools/analytics/data` (termasuk fail WAL/SHM jika masih ada) ke tempat backup. Jangan salin hanya `.sqlite` ketika receiver sedang menulis. Untuk database pada lokasi lain, tambahkan `--db "C:\lokasi\education.sqlite"` pada command eksport.

## Apabila hendak kumpul data daripada pemain lain

Perlu disediakan satu server Node yang boleh dicapai oleh pemain, bersama disk/volume kekal untuk SQLite. Hoskan game **dan** `/api/education` melalui origin yang sama; URL GitHub Pages/static hosting sahaja tidak menjalankan receiver. Pastikan database tidak berada dalam `dist` atau `release-prod`.

Pilihan operasi yang sudah disokong:

| Pemboleh ubah | Kegunaan |
| --- | --- |
| `STM_ANALYTICS_DB` | Path fail database pada disk/volume kekal di luar folder game awam |
| `STM_ANALYTICS_HOST` | Alamat bind; default `127.0.0.1`, `0.0.0.0` untuk rangkaian/server yang dikonfigurasi |
| `PORT` | Port backend; default `4173` |
| `STM_ANALYTICS_ORIGIN` | Origin public tepat seperti `https://game.example.edu`, jika menggunakan reverse proxy |

Untuk internet, gunakan HTTPS/reverse proxy, satu proses receiver dengan disk kekal, backup dan polisi akses/penyimpanan data sekolah. Reverse proxy perlu meneruskan route game dan API; jangan membuka fail SQLite sebagai muat turun awam. Penerbitan kod ini belum menyewa hosting, mengaktifkan domain, menyediakan HTTPS atau mencipta akaun cloud. Konfigurasi sebenar bergantung pada tempat game nanti dihoskan.

Setiap PC yang menjalankan `localhost` sendiri mempunyai receiver/database sendiri. Untuk satu database Ijamm, pemain mesti menggunakan alamat server pusat yang sama. Tiada migrasi/import automatik rekod browser antara alamat berbeza; eksport dahulu jika menukar alamat.

## Tafsiran laporan dan batas

Bank kekal `form4-review-1.6.0` dengan 120 ID dan kandungan yang sama. Label BM SK/SP mengikut DSKP KPM/BPK September 2018 bagi Bab 3, 4 dan 9; label English SK/SP ialah ringkasan kerja. Pemetaan meliputi 28 SP/9 SK terpilih yang digunakan bank ini. [Makna metrik dan sumber halaman](EDUCATION_ANALYTICS_2_25_0.md#what-the-report-means).

Cadangan ulang kaji memerlukan sekurang-kurangnya tiga ID soalan berbeza yang sudah dijawab. Betul tanpa bantuan, betul dengan bantuan, betul selepas salah dan reveal sahaja dibezakan. Ini diagnostik latihan berasaskan bukti browser; bukan TP rasmi, keputusan peperiksaan atau sistem anti-cheat. Rekod browser mempunyai had dan boleh gagal jika storan penuh; mesej ralat dan eksport tersedia. [Bukti integrasi dan had ujian](EDUCATION_ANALYTICS_MAIN_VERIFICATION.md).
