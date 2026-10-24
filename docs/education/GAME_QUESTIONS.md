# Soalan dalam game — dua cubaan

Pratonton **2.31.0-report.3** pada branch **education-report**. Belum digabungkan
ke main. Bank 120 soalan, sumber buku teks/DSKP dan kandungan BM/English kekal.

Predict, event Mystery dan trial artifact kini menggunakan susunan yang sama:

| Tab | Apa yang pemain buat |
| --- | --- |
| Soalan | Baca konteks, maklumat diberi dan perkara yang dicari; pilih jawapan. Predict/artifact menggunakan Semak Jawapan; event menghantar apabila A–D dipilih. |
| Bantuan | Buka Petunjuk, Petunjuk Lanjut atau Asas; kemudian Kembali ke Soalan. Membuka tab sahaja tidak merekod penggunaan bantuan. |
| Keputusan | Semak jawapan dan penerangan, buka langkah kerja/visual, kemudian teruskan. Tab ini tersedia selepas soalan tamat. |

Arahan **Langkah seterusnya** dan baki cubaan sentiasa diterangkan. Selepas salah
pertama, notis memfokuskan perhatian kepada **Buka Bantuan** dan kedua-dua petunjuk
tersedia, walaupun Petunjuk belum pernah dibuka. Membuka bantuan tidak menggunakan
cubaan menjawab. Jawapan yang sudah salah tidak boleh dihantar semula.

Salah kedua menamatkan soalan, membuka Keputusan dan mengunci semua jawapan.
Betul pada cubaan kedua masih diterima. Refresh, Menu/Continue dan pertukaran bahasa
mengekalkan soalan, cubaan serta bantuan yang benar-benar telah dibuka.

| Jenis | Selepas salah kedua |
| --- | --- |
| Predict | Kembali ke pertempuran; Predict giliran itu telah digunakan. Tiada Focus atau meterai bos. Betul pertama tanpa bantuan masih memberi Focus; mana-mana jawapan betul masih membuka meterai yang menunggu. |
| Mystery | Semak keputusan, kemudian Teruskan untuk kesan gagal asal event itu. Timer asal berjalan semasa retry/Bantuan; masa tamat juga menamatkan cabaran. Tiada kesan gagal selepas salah pertama sahaja. |
| Artifact | Teruskan tanpa artifact yang dipilih. Tiada kesan Gold/Max HP/stat daripada artifact gagal. Starting ke map; Elite/Mystery melengkapkan bilik; Boss menyambung ke Stage 2. |

Had ini untuk bank soalan dalam game. **Education Practice** kekal ruang latihan
dan semakan dengan sistem tick/komen/report sedia ada. Snapshot Predict live-deck
sebelum integrasi bank 120 ialah format sejarah yang dikekalkan; soalan baharu
sentiasa menggunakan bank dan peraturan di atas.

Panel Ink sahaja menatal. Artwork kekal berlatar saiz viewport. Jadual/ungkapan
yang lebar boleh ditatal dalam ruang visualnya. Tab menyokong klik, keyboard
Arrow Left/Right, Home/End serta fokus yang kelihatan. Bahasa soalan berada dalam
Settings; legenda kecil warna istilah kekal.

## Cuba pada Windows

Hentikan server lama dengan Ctrl+C. Jika ada run penting, gunakan Export Save di
Settings dahulu: kod lama tidak memahami rekod polisi baharu, tetapi versi ini
masih membaca rekod lama. Jangan padam data browser ketika bertukar branch.

```powershell
& {
    Set-Location "C:\Users\ijmah\Desktop\slay-the-math-v2" -ErrorAction Stop
    git stash push -m "backup-before-game-questions"
    if ($LASTEXITCODE -ne 0) { throw "Backup gagal." }
    git fetch origin
    if ($LASTEXITCODE -ne 0) { throw "Fetch gagal." }
    git switch education-report
    if ($LASTEXITCODE -ne 0) { throw "Gagal tukar branch." }
    git pull --ff-only origin education-report
    if ($LASTEXITCODE -ne 0) { throw "Pull gagal." }
    npm.cmd start
}
```

Buka **http://localhost:4173** dan semak versi **2.31.0-report.3**. Cuba New Run
Challenge untuk trial pertama, atau Continue run sedia ada untuk Predict/event.
Stash menyimpan fail projek; Export Save menyimpan kemajuan browser. Jangan terus
`stash pop` fail build lama ke atas versi baharu.

## Penerima Google yang sudah disediakan

**Kemas kini kod penerima sebelum mengutip rekod game baharu.** Peraturan baharu
mempunyai event polisi tersendiri supaya sejarah bantuan/analitik kekal benar.

1. Buka projek Apps Script penerima yang sama dan gantikan seluruh Code.gs dengan
   fail repo `integrations/google-sheets/Code.gs` yang terkini.
2. Kekalkan origin sebenar game dalam `STM_ALLOWED_GAME_ORIGINS` jika pernah ditambah.
3. Simpan, kemudian **Deploy → Manage deployments → Edit → New version → Deploy**.
   Gunakan deployment sedia ada supaya URL `/exec` kekal.
4. Buka semula game pada browser/alamat yang sama, kemudian cuba penghantaran dalam
   Learning Report. Persetujuan pemain dan giliran offline kekal di bawah owner asal.

Tidak perlu mencipta Sheet, projek Google atau database baharu. Jangan ubah Script
Properties, ID Sheet, kolum/tab teknikal atau pautan kepada Sheet. Penerima lama
boleh menolak event polisi baharu; entri tidak disahkan kekal dalam giliran. Semakan
automatik menggunakan perkhidmatan Google simulasi, bukan akaun Google sebenar.

## Pemilik teknikal

`learning/session.mjs` memiliki `GAME_QUESTION_POLICY`, `GAME_MAX_ATTEMPTS`, replay
dan penamatan. `GAME_POLICY_APPLIED` ditambah pada soalan game baharu; pada pending
lama ia ditambah **selepas** event sebenar, supaya cubaan lalu tidak tiba-tiba
ditandakan menggunakan Hint. Salah kedua mendedahkan penyelesaian tanpa menukar
status menjadi betul. Rekod lama/Practice tanpa event polisi mengekalkan replay asal.

Predict merekod kegagalan berasingan daripada first/assisted success. Artifact
menyimpan receipt declined yang disahkan bersama trial gagal; refresh tidak memberi
atau menawarkan semula hadiah daripada sumber sama. Mystery hanya menyelesaikan
kesan selepas hasil akhir. RNG, tawaran dan deadline tidak dikocok semula.

Penerima Google dijana daripada reducer/validator sama; protokol, lajur, consent dan
receipt sedia ada dikekalkan. Metadata operator masih developer sahaja. Laporan
balancing terdahulu ialah bukti sejarah untuk peraturan terdahulu; kemas kini ini
tidak menala kad, musuh, ekonomi atau sasaran kadar menang murid.

Semakan dan imej sebenar: [GAME_QUESTIONS_VERIFICATION.md](GAME_QUESTIONS_VERIFICATION.md).

Simulator penyelenggaraan kini memilih jawapan belum dicuba dan menghormati
penamatan/gagal tanpa hadiah. Model ekonomi tidak memaksa jawapan keempat menjadi
betul. Golden trace semasa untuk seed 1075022600 ialah
`d0c0ea2f0f47a80b55ac0e6e780b5b6743f1e691af58a91c305b284043a3c0f7`;
hash terdahulu kekal bukti sejarah, bukan jaminan urutan sama selepas polisi berubah.
