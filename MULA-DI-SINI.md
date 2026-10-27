# Mathematics Slayer — 2.52.0

## Jalankan salinan semasa

Dalam folder repository asal, jalankan `npm.cmd start` dan buka
**http://localhost:4173**. Folder/repo `slay-the-math-v2` tidak perlu ditukar.
`MAIN-SEKARANG.html` dan `index.html` kekal launcher asal bersama runtime `dist/`.

Untuk satu fail portable, jalankan `npm.cmd run build` dan buka
**MATHEMATICS-SLAYER-OFFLINE.html**. **SLAY-THE-MATH-OFFLINE.html** ialah alias
byte-identical bagi URL fail lama. Kekalkan laluan itu untuk storage browser
terdahulu; Export/Import diperlukan untuk pemindahan disengajakan.
[Status calon 2.52.0](docs/RENAME_MATHEMATICS_SLAYER_2_52_0.md): QA terhad VALID; penerbitan main masih PENDING readback.

## Sejarah panduan operasi — Slay the Math 2.20.0

Nama, filename dan versi di bawah ialah rekod lama; arahan semasa di atas mengatasinya.

## Buka game terkini

Dalam folder projek yang sama, hentikan server lama dengan Ctrl+C dan jalankan:

```powershell
git stash push -m "backup-before-v2.20.0"
if ($LASTEXITCODE -ne 0) { throw "Backup perubahan tempatan gagal. Semak Git dahulu." }
git switch main
if ($LASTEXITCODE -ne 0) { throw "Tidak dapat beralih ke main. Semak Git dahulu." }
git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { throw "Git pull gagal. Jangan mulakan salinan lama; semak mesej Git dahulu." }
npm.cmd start
```

Buka **http://localhost:4173**. `npm start` menyediakan semula modul pendidikan secara automatik. Main menu mempunyai **Education Practice — 120 questions**. Pilihan **Question language / Bahasa soalan** (English atau Bahasa Melayu) kini berada di **Settings**, dan turut tersedia dalam setiap trial Artifact dan Mystery.

Untuk membuka dari folder, klik **MAIN-SEKARANG.html** atau **index.html**. Kedua-duanya memuatkan runtime `dist/` terkini pada alamat fail asal; semua fail projek mesti kekal bersama. Paparan versi main menu ialah **v2.20.0**, sama seperti versi dalam Settings dan package.json. Selepas pull berjaya, hentikan server lama dan mulakan semula dari folder projek yang betul sebelum refresh browser. Launcher dan semua skrip/CSS menggunakan penanda kandungan build untuk mengelakkan campuran cache lama.

Kemas kini ini menghadkan **3 Passive aktif dalam combat**. Main Passive keempat untuk memilih kad aktif yang hendak diganti; Cancel tidak menggunakan Energy. Kad lama masuk ke Discard dan kesan berterusannya terhenti. Simpanan lama yang melebihi had meminta anda memilih tanpa bayaran.

Muzik daripada MUSIC(3).zip kini mengikut bilik/stage, dengan suara Dungeon Master dan Merchant. Buka **Sound / ikon speaker** untuk Music Volume, Sound FX Volume, Voice Volume dan mute berasingan. Klik mana-mana butang game untuk membenarkan audio browser bermula. Backup Git di atas kekal sebagai stash; jangan apply semula fail binaan lama secara automatik.

**Education Practice** menggunakan dokumen folio yang sama seperti preview 120 soalan. Ia merangkumi Hint, More Hint, jalan kerja, Asas dan komen. Komen kekal pada peranti sehingga dikongsi atau dimuat turun.

Jika mahu satu fail yang mengandungi semua artwork/audio untuk dipindahkan sendiri:

```powershell
npm.cmd run build
```

Hasilnya **SLAY-THE-MATH-OFFLINE.html**. Fail besar ini perlu dibina semula selepas kemas kini; ia berasingan daripada launcher MAIN-SEKARANG.html.

---

## Panduan ZIP 2.5.0 terdahulu

Kandungan di bawah ialah rekod installer lama; cara Git di atas ialah arahan untuk branch semasa.

# Slay the Math - Education Update 2.5.0

Sekarang Claim & Choose Your Path membuka soalan sebenar daripada bank 120. Bukan PDF sahaja. Pilih A-D, tekan Check Answer, baca penerangan, kemudian claim artifact dan pilih laluan.

## Pasang dalam folder game asal

Menyokong 2.3.0 / 2.3.1 / 2.3.2 / 2.4.0 / 2.4.1 / 2.4.2 / 2.4.3. Update kumulatif ini mengekalkan artwork Dungeon Master batu terkini, peta luas, legend kiri, surprise encounter, klik ikon terus masuk serta pembetulan HUD/floor terdahulu.

Simpan Slay_the_Math_Education_Update_v2_5_0.zip di Downloads. Dalam terminal PowerShell VS Code sedia ada, tekan Ctrl+C untuk hentikan server lama, kemudian paste:

```powershell
$stmZip = "$env:USERPROFILE\Downloads\Slay_the_Math_Education_Update_v2_5_0.zip"
$stmFix = "$env:TEMP\STM-Education-Update"
Expand-Archive -LiteralPath $stmZip -DestinationPath $stmFix -Force
powershell -NoProfile -ExecutionPolicy Bypass -File "$stmFix\STM-Education-2.5.0\APPLY-UPDATE.ps1" -ProjectPath "C:\Users\ijmah\Desktop\slay-the-math-v2" -Start
```

Installer menyemak hash, membuat backup sebelum penggantian, mengemas kini folder asal dan membina semula fail offline. Edit tempatan yang tidak dikenali dihentikan untuk semakan dahulu. Backup dicetak dengan akhiran `-backup-education-...`. Tiada projek Desktop atau tetingkap VS Code baharu dibuat.

Buka http://localhost:4173 dan tekan **Ctrl+F5**. Untuk mencuba aliran awal: **New Run > Challenge > pilih artifact > Claim & Choose Your Path**. Soalan akan muncul sebelum map. Jika save lama sudah melepasi Starting artifact, Continue kekal di scene itu; soalan tidak disuntik ke bilik yang sudah selesai. Offer yang belum dituntut akan menggunakan aliran soalan apabila Claim ditekan.

## Cara soalan berfungsi

- Bank asal: 40 Kebarangkalian Peristiwa Bergabung (Bab 9), 40 Operasi Set (Bab 4), 40 Penaakulan Logik (Bab 3), KSSM Matematik Tingkatan 4. English mudah, empat pilihan setiap item.
- Claim mengunci gift dan satu soalan rawak. Artifact/effect belum diberi. Pilih jawapan dan Check Answer.
- Jawapan salah boleh dicuba semula atau dibantu Hint. Tiada penalti HP atau countdown wajib.
- Jawapan betul memaparkan jawapan serta penerangan. Tindakan Claim/Continue terakhir memberi artifact sekali sahaja dan menyambung map/bilik/stage yang betul.
- Soalan yang telah dibuka direkod sebagai seen dan tidak diulang dalam run yang sama, termasuk soalan yang ditutup tanpa jawapan. New Run mengosongkan rekod run; sejarah lifetime kekal pada browser/origin yang sama dan turut dibawa oleh Export/Import run.
- Refresh atau Menu > Continue menyambung soalan, pilihan, cubaan dan hint yang sama. Tiada reroll.
- Setelah 120 item run ini habis, mesej jelas dipaparkan dan perjalanan boleh disambung tanpa mengulang soalan. Penyelesaian tanpa markah boleh membuka meterai bos tanpa Focus. New Run memulakan kitaran soalan baharu.
- Elite/Mystery/Boss artifact menggunakan gate yang sama. Predict dalam battle kini menggunakan bank 120 soalan yang sama, tanpa ulangan antara Predict, Artifact dan Mystery dalam run yang sama. Jawapan pertama betul tanpa bantuan memberi +1 Focus (had 3). New Run menetapkan semula rekod run; lifetime dikekalkan.

## Save dan rollback

Gunakan Save and Settings > Export Save untuk backup atau berpindah peranti. Jika storage gagal, game memaparkan amaran dan masih boleh dimainkan dalam tab semasa; Export sebelum menutupnya. Browser/origin berbeza mempunyai storage berasingan.

Runtime 2.5 diperlukan untuk membuka save yang sedang berada di scene soalan. Eksport sebelum sengaja rollback. Installer tidak mengubah data browser. Hentikan server dan jalankan ROLLBACK-UPDATE.ps1 dalam folder backup dengan PowerShell -ExecutionPolicy Bypass untuk mengembalikan fail projek; perubahan baharu yang hash-nya tidak sepadan akan dilindungi.

## Semakan

Syntax/build, model soalan, save/restore, no-repeat 120 item, DOM, browser desktop/phone/4K, tiga topik, effects artifact, checkpoint Boss, map dan HTML offline sebenar disemak. Bukti terperinci: payload/docs/EDUCATION_UPDATE_2_5_0.md, payload/VERIFICATION-EDUCATION.json dan PACKAGE-VALIDATION.json.

Installer belum dijalankan pada Windows di sini; semakan statik dan simulasi hash pemasangan/idempotence/rollback disediakan. Artwork 4K dalam ARTWORK ialah eksport upscale 3840x2160 daripada sumber 1672x941 yang sama, bukan native 4K baharu.


## 2.16.0 — Bahasa soalan

Pilih Question language / Bahasa soalan untuk menukar keseluruhan 120 soalan, Petunjuk, Petunjuk Lanjut dan jalan kerja antara English dan Bahasa Melayu. Kandungan dibandingkan dengan buku teks EN/BM dan DSKP. Fungsi pendidikan ini kini tersedia pada main.
