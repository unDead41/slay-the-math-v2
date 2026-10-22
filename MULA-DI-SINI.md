# Slay the Math — Education 2.15.0

Branch `education` menambah **Education Practice** pada main menu dan mengaktifkan bank harmonisasi buku teks/DSKP 1.6. Hint 1 terus mengisi nilai jadual/rajah, tanpa tanda soal. Rekod latihan berasingan daripada run/ganjaran.

Dalam terminal PowerShell VS Code untuk projek asal, hentikan server dengan Ctrl+C, kemudian:

```powershell
git fetch origin
git switch education
git pull --ff-only origin education
npm.cmd start
```

Buka http://localhost:4173 dan tekan Ctrl+F5. Pilih **Education Practice** untuk semua 120 soalan, atau Continue untuk sambung run. Tiada pakej npm diperlukan untuk bermain. Di bawah setiap soalan ada kategori penambahbaikan dan ruang komen. Komen disimpan pada peranti; gunakan Download comments atau Share comments untuk menghantarnya kepada Ijamm. Apabila keluar ke Main Menu, popup mengingatkan pemain supaya berkongsi komen untuk penambahbaikan.

Untuk fail offline terkini:

```powershell
npm.cmd run build
```

Buka `MAIN-SEKARANG.html` yang baru dijana. Fail ini kini hasil binaan tempatan, bukan fail yang disimpan di Git, kerana versi penuh artwork/animasi melebihi had satu fail GitHub. Jangan guna salinan HTML lama untuk menilai perubahan branch ini.

Rujukan semasa dan bukti: [Education 2.14.0](docs/EDUCATION_PRACTICE_2_14_0.md).

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
- Soalan yang sudah keluar direkod sebagai seen, termasuk soalan yang ditinggalkan ketika memulakan New Run. Ia tidak dicabut lagi. Sejarah disimpan pada browser/origin yang sama dan turut dibawa oleh Export/Import run.
- Refresh atau Menu > Continue menyambung soalan, pilihan, cubaan dan hint yang sama. Tiada reroll.
- Setelah 120 item habis, mesej jelas dipaparkan dan perjalanan boleh disambung tanpa mengulang soalan. Tiada auto-reset.
- Elite/Mystery/Boss artifact menggunakan gate yang sama. Predict dalam battle mengekalkan sistem Focus dan pemarkahan terdahulu.

## Save dan rollback

Gunakan Save and Settings > Export Save untuk backup atau berpindah peranti. Jika storage gagal, game memaparkan amaran dan masih boleh dimainkan dalam tab semasa; Export sebelum menutupnya. Browser/origin berbeza mempunyai storage berasingan.

Runtime 2.5 diperlukan untuk membuka save yang sedang berada di scene soalan. Eksport sebelum sengaja rollback. Installer tidak mengubah data browser. Hentikan server dan jalankan ROLLBACK-UPDATE.ps1 dalam folder backup dengan PowerShell -ExecutionPolicy Bypass untuk mengembalikan fail projek; perubahan baharu yang hash-nya tidak sepadan akan dilindungi.

## Semakan

Syntax/build, model soalan, save/restore, no-repeat 120 item, DOM, browser desktop/phone/4K, tiga topik, effects artifact, checkpoint Boss, map dan HTML offline sebenar disemak. Bukti terperinci: payload/docs/EDUCATION_UPDATE_2_5_0.md, payload/VERIFICATION-EDUCATION.json dan PACKAGE-VALIDATION.json.

Installer belum dijalankan pada Windows di sini; semakan statik dan simulasi hash pemasangan/idempotence/rollback disediakan. Artwork 4K dalam ARTWORK ialah eksport upscale 3840x2160 daripada sumber 1672x941 yang sama, bukan native 4K baharu.
