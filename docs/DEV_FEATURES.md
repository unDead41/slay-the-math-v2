# Feature Dev — 2.35.0

Release: `main` 2.35.0. DISAHKAN: Ijamm kini membenarkan integrasi ke main pada 24 October 2026.

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

## Lima feature tambahan — sudah tersedia

| Feature | Cara guna |
| --- | --- |
| Exact Question | Questions & Status → pilih satu daripada 120 ID, konteks Predict/Artifact/Mystery dan BM/English → Open Exact Question. Membuka fixture baharu; Mystery memilih event topik yang sepadan. |
| Status editor | Questions & Status → target, status, value dan expiry → Set Status. Nilai 0 membuang status. |
| Salin save pemain | Dalam main menu/Settings production, unlock Dev → Copy Player Run to Dev. Dalam Hub → Presets → Load Copied Player Run. Atau pilih fail Export Save melalui Import Player Save. |
| Bug report | Logs → tulis nota → Capture Screen + Download Report. Pilih tab/tetingkap dalam prompt browser. Fail HTML tunggal mengandungi screenshot dan data diagnosis. Pilihan tanpa screenshot juga tersedia. |
| Built-in scenarios | Presets → pilih Low HP, Full Hand, Empty Draw pile atau Three Active Passives → Launch Built-in Scenario. |

### Status dan expiry sebenar

Weak/Vulnerable disokong pada pemain/musuh, maksimum 3 turn mengikut peraturan percentage semasa. Native expiry mengekalkan duration; Current turn memerlukan nilai 1. Thorns pemain mengikut cap dan tamat selepas enemy phase. Block pemain/musuh, Strength/Agility pemain (0–30 modifier combat) dan Defense musuh juga disokong. Kombinasi yang tidak disokong atau duration tidak sah ditolak. Strength/Agility menggunakan saluran modifier combat sedia ada; ia bukan Passive baharu. Defense pemain ditentukan oleh mekanik Passive; jangan memalsukan nilai yang melanggar validator. Editor tidak mencipta duration beberapa turn yang tiada dalam engine.

### Pengasingan dan diagnosis

- Exact Question mengehadkan candidate bank hanya sepanjang panggilan synchronous fixture, dan sentiasa memulihkan bank asal dalam finally. Jawapan, hints dan validator asal kekal. Setiap preview ialah run baharu, jadi ia boleh mengulang ID untuk diagnosis tanpa mengubah polisi non-repeat biasa.
- Copy Player Run membaca hanya save profil aktif setelah butang ditekan, menyimpan satu salinan sementara dalam session transfer dan tidak menulis ke key save asal. Hub memuatkan profil balance yang sama melalui URL. Import yang rosak/berbeza profil ditolak; salinan transfer dibuang selepas import berjaya. Tiada import automatik.
- Capture screenshot memerlukan HTTPS/localhost, browser yang menyokong Screen Capture dan pilihan/izin pengguna setiap kali. Stream dihentikan selepas satu frame atau kegagalan. Jika dibatalkan, tiada report screenshot dicipta. Gunakan report tanpa screenshot jika capture tidak disokong. Fail hanya dimuat turun, tidak diupload.
- Low HP menetapkan 1 HP; Full Hand memindahkan kad fizikal dari Draw; Empty Draw memindahkan Draw ke Discard; Three Active Passives memainkan tiga kad Passive sebenar melalui engine. Nilai/kos/limit mekanik asal tidak ditukar.

AI Playtester kekal melalui server local dev (`npm run start:dev`), bukan dalam static production Hub.
