# Feature Dev — 2.31.1-dev.2

Branch: `dev-tools`. DISAHKAN: kemas kini di branch ini sahaja; jangan merge ke main tanpa arahan baharu.

## Buka dalam production

Run `npm run start:prod`, buka http://localhost:4173, hidupkan Dev pada main menu atau Settings, masukkan `demo41`, kemudian pilih **Open Developer Hub**. Folder `release-prod` yang sama boleh diupload ke Netlify. Ini renderer/game production sebenar dalam preview sandbox; save pemain kekal berasingan. Password statik ialah kunci UI, bukan keselamatan server.

## Feature yang tersedia

| Feature | Cara guna / skop |
| --- | --- |
| Semua node map | Scenes → pilih Stage → List All Nodes → Enter Selected Node. Boleh melangkau ke Battle, Elite, Shop, Rest, Mystery atau Boss pada kedua-dua stage. Dalam preview Map, semua node boleh diklik apabila Click any map node aktif. |
| God Mode | Butang God Mode pada toolbar. ON menghalang HP berkurang termasuk serangan yang sepatutnya membunuh; OFF mengembalikan damage biasa. HP masih tertakluk pada Max HP. Force Defeat memerlukan God OFF. |
| Tambah kad | Cards → pilih kad → Copies → Upgraded → Draw pile atau Hand now → Add Selected Card. Tiada kos Shop. Di luar combat, kad masuk deck untuk combat seterusnya. |
| Semua 15 Mystery | Scenes → pilih event → Open Selected Mystery · Auto Setup. Menyediakan 20 HP, 500 Gold dan satu Starting artifact, serta stage yang disokong, supaya syarat event boleh diperiksa. Launch Scene biasa masih menggunakan input manual. |
| Setup combat | Pilih musuh/boss sebenar, elite, stage, seed, Learn/Challenge, intent, HP pemain/musuh, Gold, Energy, Focus, deck dan artifact. |
| Scene terus | Shop, Rest, Dungeon Master, Map, Card Reward, Victory dan Defeat. |
| Inspector kad | Bandingkan Base, Upgraded, Focus dan Upgraded + Focus. Passive hanya Base/Upgraded. Test Card in Combat menggunakan plan engine sebenar. |
| Motion | Pilih actor/animation; play/pause, step/seek frame, speed, loop, scale, offset, flip dan guide. Bandingkan original dengan preview dan export cadangan. |
| Shortcut | Refill HP/Energy, draw, enemy turn, force win/defeat, Return to Map dan restart setup semasa. |
| Preset dan diagnosis | Save/load/import/export setup, log tindakan, snapshot run dan version untuk menghasilkan semula bug. |

## Batas preview

- Semua perubahan hanya dalam sandbox. Progress dibuang apabila refresh/menutup preview; preset menggunakan key dev tersendiri.
- Teleport mengekalkan deck, inventory dan HP semasa. Ia membina prefix laluan sah dalam snapshot supaya engine boleh menjalankan node pilihan, tanpa melawan bilik yang dilangkau. Jika sumber telah kalah, teleport memulihkan HP untuk membuka preview semula. Ini bukan bukti progression sebenar.
- Selesaikan soalan atau pilihan card/artifact yang sedang menunggu sebelum teleport atau tambah kad. Kad maksimum 60; Hand limit dan peraturan tiga Passive aktif masih digunakan. Memasukkan Passive tidak terus mengaktifkannya.
- Menambah kad semasa combat memasukkan UID fizikal yang sama ke deck dan zon dipilih. Tidak mengubah kos, Focus, buff atau statistik kad.
- God Mode adalah diagnostik: trigger yang memerlukan kehilangan HP mungkin tidak tercetus. Keputusan God/teleport/force win tidak boleh digunakan sebagai bukti balancing. Max HP sacrifice dan kelayakan pilihan masih dimiliki engine.
- Restart selepas teleport/tambah kad bermula daripada baseline preview yang baru diedit. God/free-map ialah toggle sementara, bukan medan save.
- Auto Setup event menggantikan preview dengan fixture baharu; ia tidak mengubah save pemain atau memalsukan jawapan/ganjaran event.

## Cadangan seterusnya — belum diimplementasikan

1. Pilih ID soalan tertentu dan bahasa untuk mengulang bug soalan dengan tepat.
2. Tambah/buang status buff/debuff dengan stack dan duration tertentu.
3. Salin save pemain ke sandbox melalui tindakan jelas, tanpa menulis balik perubahan.
4. Butang laporan bug yang mengumpulkan screenshot, versi, seed, node, deck dan log.
5. Preset senario khas: HP rendah, Hand penuh, draw kosong dan tiga Passive aktif.

Feature ini cadangan sahaja. Jangan gambarkan ia sudah ada.
