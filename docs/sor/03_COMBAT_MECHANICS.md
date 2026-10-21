# 03 — Mekanik tempur dan turutan giliran

Status: angka asas DITERUSKAN; timing dan peraturan terperinci CADANGAN. Ini sasaran kontrak, bukan laporan kod prototaip.

## Baseline

| Parameter | Nilai |
| --- | --- |
| HP maksimum awal MC | 60 |
| Tenaga pada awal giliran | 3 |
| Cabutan biasa setiap giliran | 4 kad |
| Saiz starter deck | 12 kad |
| Ramalan | Maksimum sekali setiap giliran; boleh langkau |
| Fokus | 0–3; +1 bagi Ramalan betul |
| Perbelanjaan Fokus | Pilihan 1 Fokus untuk +2 damage atau +2 perisai pada satu kad layak |
| Musuh aktif MVP | Satu pada setiap encounter |

Fokus dan cara membelanjakannya ialah cadangan baharu. Bonus tidak menambah tenaga, tidak boleh digandakan pada kad sama dan tidak terpakai pada Taktik. Pada kad multi-hit, +2 ialah tambahan **jumlah** damage, dimasukkan pada hit pertama.

## Lifecycle battle

1. Bina battle deck daripada run deck dan reset HP musuh, perisai, Fokus serta kawasan sementara.
2. Shuffle menggunakan RNG battle; papar musuh dan intent pertama.
3. Jalankan giliran pemain, kemudian giliran musuh sehingga hasil tamat.
4. Selesaikan kemenangan/kekalahan tepat sekali; tutup battle input.
5. Buang keadaan sementara. Hanya HP pemain, deck run dan progres yang dibenarkan dibawa ke node seterusnya.

**CBT-01:** Run deck tidak dipadam oleh Tapis, cabutan atau discard. Setiap salinan kad mempunyai instance ID berasingan.

## Awal giliran pemain

1. Kosongkan perisai pemain lama; tetapkan tenaga kepada 3.
2. Pastikan intent musuh untuk giliran ini sudah dipaparkan.
3. Tawarkan Ramalan daripada snapshot draw pile sebelum cabutan biasa. Snapshot mesti mempunyai hasil yang cukup bagi model soalan.
4. Kunci soalan/snapshot dan simpan keadaan `awaiting_prediction`. Jawapan betul memberi +1 Fokus sehingga had 3; jawapan salah tidak menolak HP/Fokus.
5. Papar penerangan. Selepas betul, salah atau langkau, cabut empat kad dan simpan keadaan `player_action`.

Jika tiada soalan sah, langkau Ramalan secara automatik dengan mesej ringkas. Cabutan biasa tetap diteruskan. Pemain yang mematikan Ramalan dalam tetapan masih boleh bermain tetapi tidak mendapat Fokus daripada soalan.

## Mainkan kad

**CBT-02:** Turutan transaksi: sahkan fasa → kad dalam tangan → sasaran sah → tenaga cukup → pilihan tambahan/Tapis sah → potong kos → resolve kesan → pindahkan kad → semak hasil → simpan → mainkan VFX.

Kad yang sedang dimainkan dikeluarkan daripada tangan ke kawasan resolving supaya ia tidak dicabut semula oleh kesannya sendiri. Selepas resolve, masukkan ke discard kecuali definisi kad menyatakan zon lain.

Pembatalan sebelum commit tidak menggunakan tenaga. Selepas commit, animasi yang dihentikan atau dilangkau tidak membatalkan keputusan.

**CBT-03:** Damage ditolak daripada perisai sasaran dahulu, kemudian HP. HP minimum 0 dan heal tidak melebihi HP maksimum. Perisai kekal sehingga waktu luputnya; bukan ditolak automatik selepas satu hit.

**CBT-04:** Apabila draw pile kosong, shuffle discard ke draw pile ketika kad seterusnya diperlukan. Hand, resolving dan kawasan Tapis tidak disertakan. Jika kedua-dua pile kosong, berhenti mencabut tanpa soft-lock.

## Tamat giliran dan tindakan musuh

1. Pemain mengesahkan Tamat Giliran; kunci input.
2. Buang baki tangan ke discard. Tenaga berbaki luput.
3. Pada awal giliran musuh, kosongkan perisai musuh lama.
4. Resolve intent yang sudah diumumkan; setiap kesan hanya sekali.
5. Jika battle belum tamat, jadualkan intent seterusnya dan mulakan giliran pemain.

Perisai musuh yang diberikan dalam langkah 4 melindunginya sepanjang giliran pemain berikutnya. Perisai pemain melindungi pemain sepanjang giliran musuh ini dan luput pada awal giliran pemain seterusnya.

## Fasa boss

Pada HP boss pertama kali menjadi ≤50% dan masih >0, tandakan fasa kedua. Intent yang sudah dipaparkan **kekal** untuk giliran musuh seterusnya. Selepas intent itu dilaksanakan, intent baharu bermula pada indeks 0 pola fasa kedua. Perubahan fasa tidak menghasilkan serangan segera.

## Hasil dan idempotensi

- **CBT-05:** Semak kematian selepas setiap kesan atomik. Jika musuh mati, jangan jalankan baki tindakan musuh.
- **CBT-06:** Baseline tidak mempunyai revive atau damage serentak. Jika peluasan menyebabkan kedua-dua HP 0 dalam transaksi sama, kekalahan pemain diutamakan dan rule baharu mesti didokumenkan.
- **CBT-07:** Double-click, input ketika animasi, refresh dan resume tidak boleh mengulangi kos, Fokus, damage, ganjaran atau kemajuan node.
- **CBT-08:** Simpan RNG dan soalan yang sudah ditetapkan. Refresh tidak memberi cubaan kedua atau susunan baharu.
- **CBT-09:** Fokus dan perisai reset pada battle baharu; tenaga reset setiap giliran. HP pemain berterusan sepanjang run kecuali heal yang dinyatakan.

Kontrak kad di [04](04_CARD_SYSTEM.md), RNG/save di [13](13_TECH_ARCHITECTURE_DATA.md), dan semakan kritikal di [15](15_QA_RELEASE.md).

## Penyelarasan 2.0 — label dan Passive

Teks BM dalam penerangan ini ialah dokumentasi. Label game: Energy, Block, Focus, Predict, Draw dan Filter mengikut [10](10_UI_UX_ACCESSIBILITY.md).

**CBT-10:** Gambar Passive tidak mengubah giliran ini. Ward belum aktif; jangan memberi 1 Block setiap turn daripada imej sahaja. Reset Block dan timing sedia ada dikekalkan.

Predict sebelum draw kekal T1 Probability. Challenge T2/T3 memerlukan penempatan/trigger tersendiri; jangan memasukkan soalan algebra ke snapshot peluang tanpa kontrak.

## Artifact Edition 2.4

The explicit artifact implementation request adds event-driven Starting, Elite/Mystery and Boss effects. Base card, Focus and probability rules retain their owner. Strength modifies Attack damage, Agility modifies Defense Block; per-card bonuses occur before enemy mitigation. Reset order, Exhaust batch ordering, thresholds, retaliation and persistent counters are specified in SOR 19. All numeric artifact values are sourced from artifact-data.js, derived from the supplied V3.1 catalogue.
