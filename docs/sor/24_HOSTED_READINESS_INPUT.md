# SOR — First Load, Audio Readiness & No Select/Drag

## Current main integration authorization — 2.51.0

Ijamm now requests listing the changes still pending and publishing them to main.
This authorizes the combined Online/Offline feature e941 and immutable registry
snapshot e057 with main 09a5 / 2.50.0 as 2.51.0, preserving current education,
VFX/Idle, numerical, save/RNG, language, AI and original-asset owners. This
supersedes the relevant branch-only boundaries below; their source pins and
original test outcomes remain history. Combined scoped compatibility is **VALID with carried P2 findings**: 175 focused
checks on 7a, 23 fresh final checks on 20b and the stated native groups pass.
Publication remains **PENDING** until actual expected-head ref readback.
No simulation campaign, collector or model update is included. [Current scope,
evidence and limits](../ONLINE_OFFLINE_MAIN_2_51_0.md).


## SE-OFFLINE-01 — current candidate2.49.1-offline.2

DISAHKAN: Ijamm requests fixing the four batch cold-restart failures on the feature branch only. This supersedes the earlier pending-main2.49.1 compatibility note: its Idle changes are now preserved in this branch. Persist and verify release-bound startup shell/manifest/runtime before Online Enter; cold workers reconstruct the launch receipt even for the original partial-startup cases. A launch receipt never grants full offline Ready or pet API permission. Complete installation retains its all-file verification/receipt contract. Preserve the original batch's seeds/saves and immutable FAIL evidence; regression replays are not new independent samples or AI training data. [Audit](../audits/se-offline-01/LATEST.md), [Simulation handoff](../SE_OFFLINE_01_HANDOFF.md).

## Online/Offline mode — branch candidate 2.49.0-offline.1

**DISAHKAN:** Ijamm requests one Online/Offline Settings preference shared with pet AI, complete verified player resources before offline Ready, and browser-process restart tests. Work stays on `fix/online-offline-readiness`; no main merge/push/deployment. Base main is `d77b3e0ce87d573de89e84a9b2374df97ad625b9` (2.49.0). Main subsequently advanced to 2.49.1; retain its Idle changes when Master integrates and rebuild shared generated outputs.

**DITERUSKAN:** `STMPlayMode` owns the sole preference. Default Online preserves the existing important-package loading, but pet API calls require an explicit Online choice. Browser connection hints and actual request outcomes are separate. Offline blocks/aborts API requests and uses packaged BM/English FAQ; no provider/backend/key is added. This adapter is the published contract for the external pet owner, not a claim that a missing live pet service is complete.

Offline Ready requires every current-release player runtime file, shell HTML/worker, canonical manifest, bank/Practice, BM/BI, all registered media/Tutorial/VFX/audio and local pet help in retained CacheStorage, complete hash/length checks, a matching receipt and compatible active worker. Session hits and historical completion counts do not qualify. Cache identities include shell changes; pinned navigation cannot mix releases. Show true remaining files/bytes, failure, Pause/Retry/Resume and quota/persistence limits. Full offline installation can exceed three minutes; keep the existing Online entry timeout. Developer/server/private files and API responses are excluded.

[Owner audit and evidence](../ONLINE_OFFLINE_READINESS.md), [Master audit](../audits/online-offline-readiness/LATEST.md), [pet integration contract](../pet-ai/PLAY_MODE_HANDOFF.md). Browser-cache offline and the embedded standalone portable file are separate formats. Preserve original art/voices, gameplay/save/RNG, bank and main 2.49 combat continuity. Physical-device/other-browser durability and a live external pet API remain unmeasured.

## Implementation Plan · v1.3.0

> Untuk pelaksana: gunakan aliran executing-plans untuk melaksanakan tugasan secara berurutan apabila Ijamm mengarahkan pelaksanaan dalam chat tersebut. Dokumen ini ialah arahan dan kriteria penerimaan; ia tidak membuktikan ciri sudah dibina.

**Goal:** Pemain baharu melihat persediaan aset yang jelas, boleh mengaktifkan audio dan memulihkan kegagalan, serta tidak mengalami pemilihan teks atau seretan gambar secara tidak sengaja pada permukaan game.

**Architecture:** Gunakan bootstrap ringan, manifest aset daripada build sebenar, muat turun mengikut pack dan cache berasaskan kandungan. Kekalkan satu enjin audio sedia ada dan satu polisi input yang digunakan dalam dokumen utama serta Education Practice.

**Tech Stack:** JavaScript/CSS sedia ada, Web Audio, Fetch, Cache Storage dan Service Worker pada HTTPS; Node.js hanya untuk build dan ujian. Tiada pertukaran framework atau backend baharu.

**Spec:** Bahagian 1–7 dokumen ini. Destinasi SOR yang dicadangkan semasa integrasi: `docs/sor/24_HOSTED_READINESS_INPUT.md`. Semak nombor yang masih kosong pada main ketika itu.

| Metadata | Nilai |
|---|---|
| Tarikh | 24 Oktober 2026 · Asia/Kuala_Lumpur |
| Baseline yang diaudit | `main` · game `2.35.0` |
| Commit baseline | `bb0e80f288ced028f51cc69b84ca3ff5bcc02165` |
| Repositori | https://github.com/unDead41/slay-the-math-v2 |
| Hosted project path | `https://undead41.github.io/slay-the-math-v2/` |
| Status dokumen | SOR disediakan untuk pelaksana; tiada implementasi atau push dilakukan oleh Master |
| Branch pelaksanaan dicadangkan | `fix/hosted-readiness-input`; belum dicipta oleh dokumen ini |

Runtime mula diaudit pada `beb4a4d76248fb2cc88c5532075876f9ca3fef48`. Semakan akhir mendapati main bergerak ke `bb0e80f288ced028f51cc69b84ca3ff5bcc02165`: hanya AGENTS, Master SOR, indeks, keputusan dan changelog berubah; semua fail runtime kekal pada hash yang sama. Rujukan telah diselaraskan dengan Master SOR 1.1.0.


## Pindaan pelaksanaan 1.3.0 — branch candidate 2.38.0

DISAHKAN: arahan Ijamm seterusnya membenarkan pelaksanaan dan push ke branch kerja sahaja. Sediakan loading sebelum menu, had menunggu 180 saat dengan recovery, Practice on demand dan download latar yang mengutamakan run sebenar. Larangan push/merge main kekal. Ini menggantikan sempadan Master/SOR-only untuk tugasan pelaksanaan ini; catatan audit 2.35.0 di bawah kekal sejarah.

Base awal pelaksanaan: main 2.36.0, commit 50d3af423cdc2240e949f4ddf29e023865304b65. Integrasi semasa: main 2.37.0, commit 6376a222169815af582cf55aa4794f3c809a3515, Master SOR 1.2.0. Branch: fix/hosted-readiness-input. Kekalkan dua percubaan soalan, Learning Report, Practice, Developer Hub dan icon clarity terkini. Calon versi menjadi 2.38.0 kerana 2.37.0 sudah diterbitkan oleh pemilik ikon.

Ruling: bank canonical sekitar 4 MB kekal dalam engine kerana pemilihan bergantung pada progres/exposure dan validasi save, bukan seed sahaja. Bundle renderer Practice sekitar 1.15 MB dimuat apabila Practice dibuka. Jangan mendakwa question bank telah dipecahkan per seed. Aset actor diutamakan daripada map sebenar yang sudah diputuskan; loader tidak menggunakan RNG.

Pelaksanaan memerlukan 13.3 MiB sebelum menu daripada kira-kira 215 MiB resource berdaftar; audio menu 4.5 MiB boleh selesai berasingan. Saiz fail sebelum pemampatan HTTP, bukan ukuran kelajuan rangkaian. Gunakan transport content-verified dengan maksimum empat permintaan/dua background, worker/cache scoped pada projek, first-frame warmup menggunakan cache atlas canonical, serta no native select/drag dengan pengecualian form. Angka core ialah saiz fail sebelum pemampatan HTTP dan berubah mengikut build.

180 saat ialah had menunggu/recovery, bukan jaminan kelajuan internet. Background/full downloads boleh diteruskan selepas menu. Update yang tidak sepadan memerlukan Reload Game dan tidak memaksa reload semasa combat. Pre-entry resources tidak mengubah kedudukan/RNG/deadline; kegagalan selepas restore menggunakan fallback dan retry. Tiada tuntutan bahawa seluruh game sentiasa offline-ready atau semua aset sudah decoded serentak.

Panduan dan bukti candidate: docs/HOSTED_READINESS_2_38_0.md.

## 1. Keputusan, masalah dan kuasa pelaksanaan

**DISAHKAN — arahan Ijamm**

- Rakan membuka game dan mengalami keadaan senyap/seolah-olah resources belum tersedia.
- Ijamm meminta sistem download/persediaan untuk penggunaan pertama.
- Paparan game tidak sepatutnya boleh dipilih dan diseret secara native seperti kandungan laman biasa.
- Master menyediakan SOR/arahan untuk chat pelaksana dahulu. Tugasan Master ini tidak memberi kebenaran mengubah kod, merge atau push main.

**DITERUSKAN — baseline teknikal untuk pelaksana**

- Persediaan aset berperingkat, pengaktifan audio yang jelas dan larangan native selection/drag yang mengekalkan kawalan permainan.
- Butiran teknikal di bawah ialah keputusan kerja yang boleh diuji. Jangan menamakannya sebagai keputusan khusus Ijamm jika ia tidak dinyatakan oleh beliau.
- Chat pelaksana mesti membaca main terkini dan arahan sesi sendiri sebelum mula. Dokumen ini tidak mengatasi arahan Ijamm yang lebih baharu.

**PERLU_VERIFIKASI**

Punca tepat pada peranti rakan belum disahkan. Kemungkinan yang mesti dibezakan: tiada interaksi pengguna, AudioContext suspended, mute/volume, muat turun perlahan/terputus, HTTP 404/path salah, decode/format audio, atau output audio/peranti. Download aset sahaja tidak menjamin browser membenarkan audio.

## 2. Bukti audit baseline

Bukti berikut daripada commit yang dipinkan di atas, bukan keputusan ujian pada peranti rakan.

| Lokasi sebenar | Pemerhatian | Implikasi |
|---|---|---|
| `package.json` | Versi 2.35.0 | Jangan menggunakan 2.33.0 sebagai baseline implementasi baharu. |
| `dist/audio.js:51–60`; `dist/app.js:533–535` | Sudah ada unlock/resume melalui pointerdown dan keydown | Audit dan sambung laluan sedia ada; jangan membina audio engine kedua. |
| `dist/audio.js:108–139` | Audio di-fetch, dibaca penuh sebagai ArrayBuffer, kemudian decode; timeout 15,000 ms setiap source | Sambungan perlahan boleh menangguhkan atau menggagalkan trek. Ini risiko kod, belum bukti punca pada rakan. |
| `dist/audio.js:135–138` | Cache decoded audio dalam memori, maksimum dua setiap bus | Kekalkan had RAM; cache fail termampat pada disk ialah tanggungjawab berbeza. |
| `dist/music-data.js` | 85 aset audio canonical: 10 BGM, 75 voice | Gunakan registry sebenar, alias dan source aktif; jangan preload fail legacy secara rawak. |
| Tree `dist/` | 706 fail, 253,279,835 bytes, kira-kira 253 MB | Ini saiz folder runtime yang dijejak, bukan ukuran first-load atau keseluruhan output produksi. Jangan wajibkan semuanya sebelum menu. |
| Trek menu aktif | `assets/music/menu_ancient_stone_keep.mp3`, 4,701,741 bytes | Hampir 4.7 MB perlu tersedia sebelum laluan decode penuh boleh memainkannya. Kekalkan rakaman ini. |
| `dist/app.js:425–437` | Status audio terperinci dikemas kini pada panel Music and Sound | Pemain perlu melihat tindakan pemulihan tanpa perlu meneka bahawa panel Sound harus dibuka. |
| `dist/app.js:315`; `tools/build-education-practice.cjs` | Practice menggunakan iframe srcdoc yang dijana | CSS/listener dokumen induk sahaja tidak menyelesaikan selection/drag dalam iframe. |
| `dist/style.css`, `dist/app.js`, sumber Practice yang diperiksa | Tiada polisi menyeluruh native selection/drag ditemui pada permukaan yang diaudit | Bentuk satu polisi dengan pengecualian input; jangan hanya membaiki satu gambar. |
| `tools/build-production.cjs` | Build 2.35.0 menambah static Developer Hub melalui `tools/dev/build-production.cjs` | Kekalkan integrasi Dev 2.35.0; jangan mengembalikan polisi produksi lama yang membuang Hub. |

**Status audit skop:** PERLU UPDATE bagi readiness/polisi input yang diminta; BELUM DISAHKAN bagi punca tepat senyap pada peranti rakan. Ini audit modul pada snapshot main yang direkodkan, bukan audit feature branch: branch pelaksanaan belum diwujudkan dan tiada dakwaan ahead/behind atau merged dibuat.

Tree dan entrypoint yang diaudit tidak menunjukkan modul khusus readiness/persistent asset cache/service worker. Pelaksana tetap mesti menyemak semula main kerana perubahan chat lain mungkin sudah masuk.

## 3. Global Constraints

- Kekalkan nilai kad 2.34.0/terkini, profil balance, gameplay RNG, question RNG, stable IDs, save keys, bank soalan dan ledger ganjaran.
- Kekalkan artwork, sprite, timing animasi, rakaman audio, volume pengguna dan polisi Motion Off/reduced motion.
- Loader tidak boleh memainkan kad, memulakan New Run, mengambil reward, membuka soalan atau menggunakan RNG sebagai cara mencari aset.
- Kekalkan Developer Hub produksi 2.35.0 dan AI Playtester yang memerlukan server tempatan. Jangan meluaskan akses atau mengganti login/lock.
- Tiada perubahan nama game dalam tugasan ini. Jika penjenamaan sudah berubah pada main baharu, ikut pemilik teks semasa.
- Jangan overwrite `AGENTS.md`, sumber artwork/audio atau fail kerja pengguna.
- Data save, komen, learning report, consent dan pending delivery bukan cache aset. Jangan padam atau cache sebagai respons awam.
- Semua first-load, cache dan worker mesti berfungsi pada project subpath, bukan menganggap laman berada pada `/`.
- Sebarang versi game baharu ditentukan daripada main semasa apabila ciri dibina; versi SOR ini tidak menaikkan versi game.
- Dokumen ini tidak membenarkan push/merge main atau deploy. Pelaksana menyediakan branch dan bukti untuk semakan mengikut arahan chat pelaksanaan.

## 4. SOR loading, download dan audio

### LOAD-01 — Paparan pertama yang boleh difahami

Paparkan shell ringan sebaik HTML tersedia, sebelum modul game besar selesai. Tajuk, teks status, progress dan butang pemulihan tidak boleh bergantung pada artwork besar atau semua library game.

Aliran pemain:

1. Semak resources yang sudah tersedia.
2. Jika perlu: tunjuk saiz anggaran pack dan butang **Prepare Game**.
3. Muat turun aset core dengan progress sebenar.
4. Paparkan **Enter Game** apabila core sah; klik ini juga mencuba audio unlock.
5. Jika audio masih tersekat: tawarkan **Enable Sound**. Jika audio gagal: **Retry Audio** atau **Continue Without Sound**.

Returning visitor tidak perlu mengulang keseluruhan muat turun jika resources masih sah. Audio mungkin tetap memerlukan interaksi dalam sesi/tab baharu.

Jangan tunjuk 100% berdasarkan timer palsu. Bezakan checking, downloading, verifying, ready dan kegagalan. Nyatakan secara berasingan jika audio masih dimuatkan.

### LOAD-02 — Core dan pack berperingkat

Core merangkumi kod/CSS yang benar-benar diperlukan untuk boot, ikon UI asas, artwork menu aktif dan fallback yang diperlukan. Baki artwork menu, aset stage, atlas, tutorial dan audio boleh diprefetch mengikut keperluan.

- Menu tidak menunggu keseluruhan kira-kira 253 MB.
- Audio boleh disediakan bersama core tetapi kegagalannya tidak menghalang **Continue Without Sound** apabila core sendiri sudah lengkap.
- Sediakan pilihan **Download Resources** untuk pack tambahan; paparkan saiz dan kemajuan sebelum menggunakan data yang banyak.
- Full pack bermaksud semua entri pack aktif berjaya disahkan. Jangan melabel keseluruhan game sebagai offline-ready tanpa ujian semua laluan yang dijanjikan.
- Registry aktif ialah sumber canonical. Pilih format yang disokong; jangan memuat turun MP3 dan OGG bagi trek sama tanpa keperluan fallback.
- Muat turun menggunakan maksimum empat permintaan serentak. Jangan decode semua BGM/voice/atlas ke RAM.
- Deduplicate permintaan bagi URL canonical yang sama antara loader dan audio. Klik Prepare Game tidak boleh memulakan dua download BGM serentak melalui listener unlock dan download manager.
- Perkataan “download” merujuk kepada resources yang disimpan browser; pemain tidak perlu memasang Node.js, ZIP atau executable.

### LOAD-03 — Manifest daripada output sebenar

Jana manifest selepas output build dimuktamadkan. Setiap entri mempunyai `url`, `bytes`, `sha256`, `kind`, `packId` dan `required`.

Manifest mempunyai `schemaVersion: 1`, `gameVersion`, `releaseBuild` dan `manifestId`. `manifestId` ditentukan daripada senarai kandungan yang stabil; perubahan aset mesti dikesan walaupun nombor game belum berubah.

Elakkan hash circular antara manifest, worker dan release.js. Manifest tidak menyenaraikan dirinya sebagai input hash sendiri. Padankan URL berquery versi dengan dependency graph yang sebenar; jangan mengabaikan query cache-busting secara menyeluruh.

Semak response berjaya dan hash sebelum menandakan fail verified. HTML halaman ralat yang diterima bagi URL media tidak boleh dianggap gambar/audio sah. Fail personal, source ZIP, database dan output offline HTML besar tidak termasuk pack web.

### LOAD-04 — Cache persisten dan path yang betul

Gunakan Cache Storage untuk respons fail statik dan Service Worker untuk penggunaan semula pada HTTPS. Cache mesti dipisahkan mengikut projek dan manifest kandungan.

- Resolve asset menggunakan runtime base yang sebenar. Pada Pages, worker diterbitkan di bawah `/slay-the-math-v2/` dan skopnya terhad pada projek itu.
- Jangan menggunakan worker root `/sw.js` atau mengambil alih projek GitHub Pages lain pada origin sama.
- Fail lama yang hash-nya sama boleh digunakan semula. Muat turun hanya entri baharu/berubah/belum lengkap.
- Browser boleh mengosongkan cache. Jika marker “installed” wujud tetapi fail tiada, detect dan muat turun fail yang hilang.
- Jika quota penuh, private mode mengehadkan storage atau API tidak tersedia, tawarkan mod online/session dengan mesej ringkas. Jangan memerangkap pengguna dalam spinner.
- Pemadaman cache hanya menyentuh cache aset milik projek ini. Jangan menggunakan `localStorage.clear()`, memadam semua origin caches atau mengubah data pembelajaran.
- `file://` dan portable HTML menggunakan fallback tanpa worker. Kekalkan `DC_ASSETS`, `DC_MUSIC`, `DC_VOICE`; jangan download semula resources yang sudah embedded.

Cache membantu penggunaan semula; tiada janji resources disimpan selama-lamanya.

### LOAD-05 — Audio mendapat interaksi sebenar

Kekalkan `DCAudio.unlock()`, mixer, bus BGM/voice dan generation/cancellation guards.

- Panggil context creation/resume dalam handler klik/keyboard yang dipercayai, sebelum menunggu download yang panjang.
- Selepas persediaan asynchronous, **Enter Game** atau **Enable Sound** memberi interaksi baharu jika browser masih memerlukannya.
- Tunjuk keadaan **Sound needs a tap**, **Loading audio**, **Sound ready**, **Muted**, **Audio unavailable** dengan tindakan yang sesuai.
- Jangan menyamakan mute/volume 0 dengan resources hilang. Hormati pilihan pengguna.
- Asingkan network/HTTP, timeout, decode dan activation error dalam diagnostik; jangan menelan semuanya sebagai satu kegagalan tanpa sebab.
- Timeout loader berdasarkan kemajuan mesti mengendalikan sambungan perlahan yang masih memindahkan data; jangan sekadar menyalin abort mutlak 15 saat kepada semua pack. Tetapkan had menunggu/no-progress yang jelas dan uji.
- Untuk kegagalan sementara, maksimum dua retry automatik selepas percubaan asal, dengan sela 1 dan 3 saat; hormati Retry-After bagi 429. 404/format tidak disokong memerlukan mesej/tindakan, bukan loop retry.
- Jangan “unlock” dengan memainkan semua voice atau mengulang greeting yang sudah consumed. Kekalkan deadline, frozen variant, scope dan receipt audio sedia ada.
- Audio readiness tidak mengubah markah, turn, peluang, susunan soalan atau hasil pertandingan.

### LOAD-06 — Kegagalan dan pertukaran scene

Jika core wajib gagal, paparkan mesej dan **Retry Resources**; jangan membenarkan game memulakan run yang tidak boleh dirender. Jika pack tambahan/audio gagal, gunakan fallback yang munasabah dan pilihan cuba semula.

Scene yang memerlukan aset menggunakan readiness check sebelum komitmen kemasukan baharu apabila sesuai; guard double-click mesti kekal. Jangan reroll node/soalan/reward untuk mencuba download.

Loader tidak boleh mereset, memanjangkan atau membekukan deadline Mystery yang sudah aktif. Untuk run yang diteruskan, kekalkan polisi timer pemilik modul; gunakan fallback/nonblocking recovery apabila menunggu aset boleh mengubah keputusan. Masa persediaan sebelum New Run direkod berasingan jika diukur.

### LOAD-07 — Update tanpa campur versi

Stage dan sahkan resources bagi manifest baharu sebelum menukarkan cache aktif. Jangan membersihkan versi yang masih diperlukan tab/run aktif.

- Paparkan **Update ready** apabila versi baharu benar-benar tersedia.
- Jangan auto reload atau memaksa worker mengambil alih di tengah combat, soalan, transaksi Shop atau save/import.
- Aktifkan pertukaran pada titik selamat seperti main menu, atau selepas tindakan pengguna yang jelas dengan save selesai.
- Jika download update gagal, kekalkan set resources lama yang lengkap dan beritahu status. Jangan mencampurkan HTML lama dengan JS/CSS baharu.
- Uji dua tab, build aset baharu dengan nombor versi sama, dan rollback ke release sebelumnya.
- Selepas main kelak dipush, proses Pages automatik sedia ada kekal; semak deployment berjaya secara berasingan daripada ujian tempatan.

### LOAD-08 — Diagnostik yang berguna

Laporan developer menyatakan manifest/build, URL aset dalam projek, kategori kegagalan, HTTP status, cache hit/miss, tempoh download/decode dan keadaan AudioContext.

Simpan secara bounded pada peranti. Jangan menghantar laporan secara automatik atau memasukkan komen, jawapan murid, token, endpoint Google peribadi atau isi save. Jika disalin/dimuat turun, ia tindakan pengguna.

### LOAD-09 — Ikon, watak dan animasi mesti siap dipaparkan

**VIS-01 — Download siap dan visual siap ialah dua semakan berbeza.** Fail yang sudah berada dalam cache masih perlu decode sebelum digunakan oleh renderer. Animasi baseline `dist/animation.js` sudah menggunakan `image.decode()` dalam laluan texture/play; kekurangannya yang perlu diperiksa ialah persediaan sebelum scene/action memerlukannya, bukan menganggap decode langsung tiada.

Aliran scene baharu: **Loading scene resources → Preparing images and animations → paparan pertama sah → scene dibuka**. Download 100% sahaja tidak membenarkan loader menyatakan visual sudah ready.

**VIS-02 — Pack visual mengikut scene.** Sebelum menu dibuka, sediakan artwork aktif dan semua ikon kawalannya. Sebelum combat baharu dibuka, sediakan background semasa, Alyssa, musuh semasa, poster/fallback, ikon HP/Energy/Focus/status serta artwork/frame kad yang diperlukan. Sebelum Shop/Artifact/Mystery/Tutorial dibuka, sediakan aset visual wajib bagi paparan tersebut.

Ambil senarai daripada registry dan state yang sudah diputuskan oleh engine. Jangan memanggil RNG, membuka soalan, menukar tawaran atau mencipta run hanya untuk mengumpul nama aset. Prefetch fail action actor semasa dan ikon kecil yang mungkin muncul; baki stage boleh disediakan di latar.

**VIS-03 — Decode dan paparan pertama.** Bagi raster yang perlu dipaparkan serta-merta, tunggu decode berjaya dan dimensi sah. SVG/CSS background/icon sprite juga mesti mempunyai semakan load/fallback yang sesuai; jangan mengandaikan semua visual ialah elemen img. Untuk atlas, sahkan rectangle/frame dan lukis frame pertama yang betul melalui renderer canonical sebelum menghilangkan gate scene. Jangan menggunakan opacity 0 sebagai satu-satunya tanda siap.

Status UI mesti membezakan muat turun fail daripada persediaan visual. Simpan ruang/layout ikon dan watak supaya aset yang siap kemudian tidak mengalihkan HP bar, kad atau butang. Scene tidak boleh dilepaskan sebagai ready dengan ikon kawalan kosong atau actor hilang.

**VIS-04 — Fallback semasa aksi.** Aset action aktif boleh diprefetch sebagai fail termampat, tetapi decode/pinning tekstur mesti bounded; jangan memuatkan semua atlas kedua-dua stage ke RAM. Kekalkan had cache tekstur baseline empat dan jejak actor semasa sebelum mempertimbangkan sebarang perubahan had.

Jika tekstur animasi belum siap semasa aksi, kekalkan frame/poster sah bagi actor yang sama pada pivot, saiz dan arah yang sama. Paparkan ikon fallback yang menerangkan fungsinya, bukan kotak kosong. Teruskan menggunakan static fallback jika animasi gagal, dengan Retry Resources yang jelas apabila sesuai.

Jangan menangguhkan penyelesaian damage, Block, draw, turn, save atau deadline untuk menunggu animasi. Jangan memainkan semula animasi serangan lama apabila download lewat selesai selepas turn/scene/actor sudah berubah; gunakan generation/cancellation guards sedia ada. Motion Off/reduced motion menggunakan visual statik yang sudah tersedia.

**VIS-05 — Cold cache, warm cache dan telefon.** Uji cold download serta keadaan semua fail sudah cached tetapi decode/render diperlahankan. Catat masa network, decode dan first frame secara berasingan. Prefetch mesti mengurangkan kelewatan tanpa menambah fetch berulang, listener/timer berganda atau penggunaan RAM yang tidak bounded.

**VIS-06 — Maksud penerimaan.** Pemain mesti sentiasa mendapat visual lengkap atau fallback yang bermakna; tiada janji semua frame semua scene akan tersedia serta-merta pada setiap peranti. Kegagalan aset wajib mesti kelihatan melalui loading/error/retry, bukan dibiarkan sebagai ruang kosong sementara permainan berjalan.

## 5. SOR no select / no native drag

### INPUT-01 — Permukaan permainan

Gunakan `user-select: none` serta prefiks WebKit yang diperlukan pada artwork, HUD, kad, ikon, tooltip, teks paparan, soalan dan jalan kerja.

Gunakan `draggable="false"` untuk elemen HTML gambar/link paparan yang berkenaan dan cegah `dragstart` native secara delegated. Tangani kandungan yang ditambah selepas render; jangan hanya menetapkan atribut pada gambar pertama.

Hasil dikehendaki: drag pada artwork/kad/paparan tidak menghasilkan highlight teks atau ghost image browser. Klik/tap untuk memilih jawapan, kad dan node tetap berfungsi.

### INPUT-02 — Pengecualian yang wajib

Kekalkan selection/copy/edit dalam `input`, `textarea`, kawasan contenteditable yang sebenar dan kawasan khusus `[data-allow-selection]`.

Pengecualian termasuk komen soalan, carian koleksi, input jawapan, collection link serta output diagnostik/teks eksport yang memang perlu disalin. Pengecualian selection tidak memberi kebenaran menyeret artwork di sekelilingnya.

Kekalkan slider volume, scrollbar, scroll sentuh, text caret, paste, native dropdown, keyboard focus, Tab/Enter/Space dan tooltip aksesibel.

Jangan menggunakan `preventDefault()` global untuk pointerdown/touchmove/mousedown atau mematikan semua pointer events. Jangan menyekat Ctrl+C/Ctrl+V/Ctrl+A secara menyeluruh. Native context menu tidak perlu dibuang bagi mencapai dua matlamat ini.

### INPUT-03 — Iframe dan kandungan dijana

Gunakan polisi yang sama dalam Education Practice srcdoc melalui sumber/generator pemilik. Parent CSS/listener tidak melintasi dokumen iframe.

Polisi mestilah idempotent bagi setiap document, menjaga kandungan dinamik dan dibersihkan apabila dokumen/scene dibuang. Jangan mengumpul listener atau observer pada setiap render.

Jangan menyunting `dist/education-practice.js` sahaja: perubahan mesti datang daripada sumber/generator dan kekal selepas rebuild. Tooltip, MathML/SVG, pecahan, butang soalan dan ruangan komen mesti terus berfungsi.

Ini polisi interaksi pemain, bukan jaminan aset tidak boleh disalin melalui browser.

## 6. Peta fail dan kontrak integrasi

Nama fail baharu di bawah ialah keputusan kerja yang dicadangkan. Semak clash pada main; rekod jika ditukar.

| Pemilik | Fail/tanggungjawab |
|---|---|
| Manifest | Baharu `tools/build-asset-manifest.cjs` → output `dist/asset-manifest.json`; integrasi selepas build dimuktamadkan |
| Loader | Baharu `dist/bootstrap.js`, `dist/asset-readiness.js`, `dist/boot.css`; shell kecil dalam `dist/index.html` |
| Cache | Baharu `dist/sw.js`; tiada cache respons peribadi/API/Google receiver/Dev backend |
| Audio | `dist/audio.js`, sambungan UI/status `dist/app.js`; sumber cue kekal `dist/music-data.js` |
| Input bersama | Baharu `dist/input-guard.js`, `dist/input-guard.css`; satu polisi yang boleh dimasukkan dalam srcdoc |
| Visual readiness | `dist/animation.js`, `dist/animation-data.js`, `dist/visuals.js`, registry ikon/kad, renderer dan CSS fallback dalam `dist/app.js` |
| Practice | `tools/build-education-practice.cjs`, sumber `modules/mechanics/source/QUESTION_BANK/learning/`; jana semula output |
| Entrypoints/build | `tools/sync-game-entrypoints.cjs`, `tools/build-production.cjs`, `build-portable.cjs` dan urutan `tools/import-mechanics.cjs` mengikut impak sebenar |
| Ujian | Baharu `tests/asset-readiness.test.cjs`, `tests/hosted-readiness-browser.cjs`, `tests/input-guard-browser.cjs`; guna harness browser sedia ada |
| Dokumen | SOR domain 10/11/13/15, indeks SOR, DECISIONS, CHANGELOG dan `docs/GITHUB_PAGES.md` mengikut kontrak yang berubah |

Antara muka bersama:

- `STMAssetReadiness.prepare({packId, signal, onProgress}) → Promise<ReadinessResult>`.
- `STMAssetReadiness.fetchAsset(url, {signal}) → Promise<Response>` membekalkan respons validated daripada cache atau satu permintaan bersama; setiap pemanggil mendapat clone respons yang boleh dibaca sendiri. Sambungkan laluan fetch audio kepada pemilik ini tanpa menggandakan engine/decode.
- `ReadinessResult`: `manifestId`, `packId`, `state`, `verifiedFiles`, `totalFiles`, `verifiedBytes`, `totalBytes`, `cacheMode`, `failed`.
- `state`: `checking | downloading | verifying | decoding | rendering | ready | degraded | failed | cancelled`.
- `cacheMode`: `persistent | session | online`; `failed` ialah senarai `{url, kind, httpStatus, retryable}`. `onProgress` menerima snapshot bentuk sama; `signal` ialah AbortSignal.
- Audio readiness dilapor berasingan daripada kemajuan core; `DCAudio.unlock()` kekal entrypoint pengaktifan.
- `STMInputGuard.bind(document) → dispose()`, idempotent; digunakan bagi dokumen utama dan dimasukkan melalui generator untuk Practice.
- Tentukan manifest ID sebelum penggunaan runtime; jangan bergantung pada package version sahaja atau pada marker installed dalam localStorage.

## 7. Review Focus dan kriteria penerimaan

Lima risiko terpenting: cold visit dengan autoplay disekat, sambungan perlahan/terputus, cache quota/eviction, update ketika run aktif, dan input/iframe yang menjadi rosak akibat guard terlalu luas. Setiap risiko mesti mempunyai semakan di bawah.

| ID | Senario wajib | Bukti lulus |
|---|---|---|
| QA-01 | Profil browser baharu, tiada cache, belum berinteraksi | Shell/status kelihatan; tiada janji audio sudah bermain; Enter/Enable Sound berfungsi. |
| QA-02 | Muat turun menu MP3 dihadkan supaya melebihi 15 saat | Progress bergerak; kegagalan/pemulihan jelas; tiada blank screen atau spinner tanpa jalan keluar. |
| QA-03 | Force 404, timeout, offline separuh jalan, decode gagal | Kategori betul; retry terhad; Continue Without Sound hanya jika core lengkap. |
| QA-04 | Lawatan kedua | Aset hash sama digunakan semula; bukti cache/network sebenar, bukan marker UI sahaja. |
| QA-05 | Quota ditolak, cache dibuang, browser tanpa worker | Fallback berfungsi; marker lapuk dibaiki; save/komen/report/pending delivery tidak dipadam. |
| QA-06 | Manifest baharu, nombor game sama; dua tab; rollback | Perubahan kandungan dikesan; set versi tidak bercampur; tab aktif tidak dipaksa reload. |
| QA-07 | Download/update ketika combat atau Mystery aktif | RNG, reward, HP, soalan dan deadline tidak berubah kerana loader; tiada aksi berganda. |
| QA-08 | Mute/volume 0, background tab, kembali ke tab | Pilihan pengguna dan suspend/resume dihormati; tiada replay voice lama. |
| QA-09 | Desktop: drag artwork, kad, ikon, HUD, soalan/jalan kerja | Tiada native selection/ghost image; klik, hover dan keyboard masih betul. |
| QA-10 | Telefon Android Chrome dan iPhone Safari | Long press tidak memilih teks pada permukaan game; scroll, tap dan input masih boleh digunakan. |
| QA-11 | Komen, carian, link, input jawapan, slider volume | Edit, selection dalam input, copy/paste, dropdown, slider dan caret berfungsi. |
| QA-12 | Practice iframe dan render soalan baharu | Polisi sama kekal; tooltip, MathML, pecahan, scroll dan komen tidak rosak. |
| QA-13 | Pages project subpath, localhost, root launcher, portable HTML | URL aset betul; mod embedded tidak fetch resources web; tiada worker salah skop. |
| QA-14 | New Run, Continue save lama, Settings, Tutorial, Learning Report, Dev Hub | Tiada kehilangan data atau regresi aliran utama; AI local-only tidak diubah. |

| QA-15 | Cold visit kemudian buka combat/Shop/Artifact/Mystery | Aset wajib dan ikon sah sebelum scene didedahkan; tiada actor hilang, slot ikon kosong atau layout melonjak. |
| QA-16 | Semua fail cached; sengaja perlahan/gagalkan decode atlas | Download 100% tidak terus menjadi visual-ready; frame pertama atau static fallback sah dipaparkan. |
| QA-17 | Aksi Attack/Defend/Skill/Damaged ketika tekstur baharu lambat | Actor kekal kelihatan; tiada animasi lama dimainkan lewat; resolusi turn/RNG/save/deadline tidak menunggu render. |
| QA-18 | Tukar scene/actor ketika fetch/decode tertangguh; ulang pada telefon dan Motion Off | Hasil load lapuk tidak menimpa scene baharu; fallback dan cache bounded; tiada callback/render berganda. |

Ujian browser mesti menggunakan gesture sebenar dan semakan interaksi sebenar; dispatch event palsu sahaja tidak membuktikan audio unlock atau native drag telah dibaiki. Tiada tuntutan ujian peranti fizikal lulus tanpa peranti sebenar.

## 8. Pelan pelaksanaan berurutan

### Task 1 — Reproduce dan rekod punca

**Files:** nota bukti branch, `dist/audio.js`, `dist/app.js`; tiada perubahan artwork/data.

**Consumes:** baseline main semasa dan laporan pemain. **Produces:** kategori punca, langkah reproduce dan pemerhatian sebelum pembaikan.

- [ ] Rekod main SHA, branch SHA dan versi sebenar; baca MASTER_SOR_PROJECT.md, AGENTS dan SOR domain semasa.
- [ ] Gunakan profil ujian terasing; jangan clear data browser pemain sebenar.
- [ ] Bezakan cold visit sebelum/selepas gesture, mute, slow download, HTTP path dan decode. Rekod QA-01/02/03/08 sebelum pembaikan.
- [ ] Jalankan semakan native selection/drag termasuk iframe dan input. Rekod apa yang benar-benar dapat direproduce.
- [ ] Jika peranti rakan belum tersedia, nyatakan BELUM DISAHKAN untuk peranti itu; teruskan ujian terkawal tanpa menamakan hipotesis sebagai fakta.

### Task 2 — Bootstrap, manifest, download dan audio recovery

**Files:** pemilik manifest/loader/audio/build dalam Bahagian 6. **Consumes:** hasil Task 1. **Produces:** API readiness dan UI loading/audio mengikut LOAD-01 hingga LOAD-06/08/09, termasuk VIS-01 hingga VIS-06.

- [ ] Tulis ujian meaningful untuk salah path, timeout/no-progress, hash mismatch, cancel, retry dan core-vs-audio failure; jalankan dan pastikan gagal atas sebab yang dimaksudkan.
- [ ] Laksanakan API readiness serta manifest; kekalkan unlock/mixer canonical dan RAM bounded.
- [ ] Hubungkan loader kepada entrypoint/generator; pastikan UI pertama tidak menunggu semua modul besar.
- [ ] Jalankan ujian yang sama hingga lulus dan uji QA-01/02/03/08/13 serta QA-15 hingga QA-18 melalui browser. Simpan bukti sebelum/selepas.
- [ ] Commit perubahan terfokus apabila diarahkan melaksanakan branch; jangan commit offline HTML besar atau fail ujian peribadi.

### Task 3 — Cache dan update

**Files:** pemilik cache/manifest/loader/build. **Consumes:** API dan output Task 2. **Produces:** persistent reuse/fallback dan pertukaran manifest yang selamat.

- [ ] Tulis dan jalankan kes gagal untuk eviction, quota, update separuh siap, dua tab dan asset-only change.
- [ ] Laksanakan LOAD-04/07 tanpa mengubah save/learning/consent/pending delivery.
- [ ] Jalankan QA-04/05/06/07/13. Jika offline penuh tidak diuji, jangan label offline-ready.
- [ ] Rekod cache scope, ukuran pack dan batas sokongan; commit terfokus.

### Task 4 — No select/drag dalam semua dokumen

**Files:** pemilik input bersama, app/entrypoint dan sumber/generator Practice. **Consumes:** kontrak guard Bahagian 6. **Produces:** polisi INPUT-01 hingga INPUT-03.

- [ ] Rekod/tulis ujian yang gagal bagi native image drag, selection paparan, pengecualian input dan iframe.
- [ ] Laksanakan bind/dispose yang idempotent, CSS berprefiks dan pengecualian yang dinyatakan; jana semula Practice.
- [ ] Jalankan QA-09/10/11/12, termasuk drag/tap sebenar, volume slider, scroll, keyboard dan komen.
- [ ] Semak tiada listener/observer berganda selepas beberapa render; commit terfokus.

### Task 5 — Semakan gabungan dan handoff Master

- [ ] Semak diff terhadap main terkini. Jika main bergerak, integrasikan pada branch kerja dan ulang hanya semakan yang terjejas.
- [ ] Jalankan `npm run check` dan ujian focused audio/readiness/input; arahan baharu mesti benar-benar tersedia sebelum dipetik dalam laporan.
- [ ] Jalankan `npm run build:prod`; pastikan manifest mewakili output akhir, Dev Hub kekal dan tiada data peribadi masuk pack.
- [ ] Jalankan QA-13/14 dan ujian browser yang relevan; QA package yang tiada atau kes skipped dilapor sebagai belum diuji.
- [ ] Semak save/RNG/soalan/art/audio asal terhadap baseline. Loader atau guard tidak membenarkan perubahan balancing.
- [ ] Kemas kini SOR domain, indeks, keputusan, changelog dan panduan hosted untuk kontrak yang benar-benar dilaksanakan.
- [ ] Serah nama branch/SHA, main SHA pembanding, senarai fail, keputusan QA, saiz pack, screenshot/video perlu dan isu belum selesai.
- [ ] Beri status **VALID / PERLU UPDATE / CONFLICT / BELUM DISAHKAN** dengan sebab. Jangan push/merge main atau deploy tanpa arahan Ijamm seterusnya.

## 9. Arahan salin ke chat pelaksana

> Baca SOR ini, MASTER_SOR_PROJECT.md, AGENTS.md dan main terkini repositori unDead41/slay-the-math-v2. Laksanakan first-load/resource readiness, audio activation/recovery, kesiapsiagaan ikon/watak/animasi sebelum scene dibuka, dan no native select/drag pada branch fix/hosted-readiness-input. Mulakan dengan reproduce dan rekod punca; jangan anggap senyap semestinya fail tiada. Kekalkan save, RNG, gameplay, aset asal, Dev Hub produksi dan pengecualian input/iframe. Ikut kriteria QA dan serahkan bukti kepada Master. Jangan push/merge main atau deploy. Ikut arahan saya dalam chat ini untuk sebarang push branch kerja.

## 10. Rujukan dan had semakan dokumen ini

Pindaan SOR 1.1.0 menambah VIS-01 hingga VIS-06 dan QA-15 hingga QA-18 selepas Ijamm melaporkan ikon/animasi muncul lewat. Baseline runtime kekal snapshot 2.35.0 yang dinyatakan; tiada audit GitHub/runtime baharu atau pembaikan game didakwa bagi pindaan ini.

Rujukan projek dipinkan kepada baseline:

- [Master SOR 1.1.0](https://github.com/unDead41/slay-the-math-v2/blob/bb0e80f288ced028f51cc69b84ca3ff5bcc02165/MASTER_SOR_PROJECT.md).
- [AGENTS.md](https://github.com/unDead41/slay-the-math-v2/blob/bb0e80f288ced028f51cc69b84ca3ff5bcc02165/AGENTS.md).
- [Audio runtime](https://github.com/unDead41/slay-the-math-v2/blob/bb0e80f288ced028f51cc69b84ca3ff5bcc02165/dist/audio.js).
- [App dan input/audio integration](https://github.com/unDead41/slay-the-math-v2/blob/bb0e80f288ced028f51cc69b84ca3ff5bcc02165/dist/app.js).
- [Practice generator](https://github.com/unDead41/slay-the-math-v2/blob/bb0e80f288ced028f51cc69b84ca3ff5bcc02165/tools/build-education-practice.cjs).
- [Production build](https://github.com/unDead41/slay-the-math-v2/blob/bb0e80f288ced028f51cc69b84ca3ff5bcc02165/tools/build-production.cjs).
- SOR 00, 01, 03, 10, 11, 13, 15, 16, 18 serta DECISIONS dibaca sebagai kontrak pemilik; tambahan Dev/main 2.35.0 mengatasi nota sejarah produksi yang bercanggah.

Rujukan API primer, disemak 24 Oktober 2026:

- [MDN: Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — gesture dan pemulihan audio yang disekat.
- [MDN: Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — quota, eviction dan kegagalan storage.
- [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) — scope, lifecycle dan cache update.
- [MDN: image.decode()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode) — membezakan fail dimuat turun dengan imej yang sudah decoded.
- [MDN: user-select](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select) — kawalan pemilihan teks.
- [MDN: draggable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable) — kawalan seretan native elemen HTML.

**Semakan sebenar Master:** baca main GitHub, pin SHA, audit sumber berkaitan, kira saiz/fail runtime daripada Git tree, semak registry audio dan rujuk dokumentasi API. Catatan ini merekod fasa penyediaan SOR dahulu, ketika tiada pembaikan atau penerbitan dibuat. Pelaksanaan branch kemudian dikawal oleh pindaan 1.2.0 di atas dan rekod candidate berasingan. Ujian dalam Bahagian 7–8 ialah syarat pelaksana, bukan ujian yang sudah lulus.

## Pindaan25 Oktober2026 — automatic startup candidate2.46.0

DISAHKAN: Ijamm requests checking why published background downloads stop, preparing75% of important resources before entry and applying appropriate performance improvements. Use the existing verified manager and actual build bytes. The important early-game package includes current code/UI, hero, Stage1 and shared card/scene artwork; Boss/Stage2/Practice payloads remain outside its startup target. Complete all hard-core resources and whole files reaching at least75%; do not decode all prefetched textures.

Remaining registered game resources start automatically after Enter, except lazy Practice. Prioritize the actual run, keep one speculative transfer during combat/two otherwise, and stop new speculative work while hidden/offline/explicitly paused. Resume/retry without restarting successful downloads. Report verified versus retained bytes separately; quota-denied browsers get explicit online continuation only after essential runtime/visual preparation.180 seconds remains recovery, not a speed guarantee. Preserve all main2.45 V5/VFX/game/save owners. [Current audit](../audits/hosted-readiness/LATEST.md) distinguishes work-branch verification from main deployment.

## Main integration — 2.47.0

Ijamm now explicitly requests main publication of this completed update. Integrate feature82db6d5 with current main65ccce7 /2.46.0 and preserve its complete illustrated tutorial and corrected full-history CI checkout. Use a distinct 2.47.0 release/cache identity and verify the combined manifest, actual preload/background/recovery, verified tutorial images and deployment. [Release record](../HOSTED_PRELOAD_MAIN_2_47_0.md) supersedes this update's earlier branch-only boundary; historical verification is not relabelled as new evidence.
