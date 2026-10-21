# SOR — Integrasi Map

## Tanggungjawab modul

Generator menghasilkan `nodes`, `edges`, metadata dan index sepuluh level.
Komponen paparan melukis peta, menunjukkan butiran bilik dan membolehkan
pemeriksaan seed. Komponen tidak menjalankan combat atau menyelesaikan bilik.

`mountMapScreen(host, options)` menerima elemen DOM dan mengembalikan:

- `getCurrentMap()`: salinan snapshot peta yang dipaparkan.
- `setMap(seed, stage)`: memilih peta lain dalam inspector.
- `destroy()`: memutuskan ResizeObserver dan membuang komponen yang dipasang.

`onRoomInspect(room, map)` menerima salinan data apabila bilik diperiksa.
Callback ini tidak mengesahkan bahawa pemain boleh memasuki bilik tersebut.

## Tanggungjawab game utama

Game store menyimpan seed, stage, snapshot peta, versi generator,
`currentRoomId`, bilik selesai dan keadaan encounter.

1. Pada awal stage, hanya bilik level 1 boleh dipilih untuk memulakan perjalanan.
2. Setelah bilik selesai, hanya destinasi dalam edge keluar bilik itu dibenarkan.
3. Jangan benarkan pengguna memilih seed/stage baharu untuk run yang sedang aktif.
   Kawalan katalog seed dalam inspector adalah untuk pembangunan; lindunginya
   daripada keadaan run sebenar sebelum menggabungkannya dalam gameplay.
4. Selepas boss selesai, game mengurus peralihan stage atau keputusan akhir.
5. Continue memulihkan snapshot dan progress tanpa reroll peta.

## Aset dan CSS

Pemetaan ikon datang daripada `src/map-icons.mjs`, bukan array mengikut index.
URL aset boleh ditetapkan melalui `assetBaseUrl` jika lokasi fail berubah.
CSS mesti kekal di bawah `[data-stm-map]` supaya gaya app lain tidak terganggu.
ID input diberikan prefix bagi setiap instance paparan.

## Had bukti semakan

Ujian RNG, import modul dan hash aset mengesahkan data dan pemakejan.
Ia tidak membuktikan bahawa aliran combat, ekonomi atau paparan pada semua
peranti telah diuji. Uji integrasi pada game utama selepas kodnya disambungkan.
