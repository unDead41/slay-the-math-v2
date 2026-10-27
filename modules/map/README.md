# Mathematics Slayer — Map Module for VS Code

Nama game semasa ialah **Mathematics Slayer**. Folder ZIP, package/global IDs,
seed snapshots dan data eksport ialah identifier legasi; jangan jana semula data
kerana tajuk. Arahan ZIP dan hasil asal di bawah ialah konteks pakej sumber.

Pakej sumber untuk modul peta: JavaScript, CSS, PNG dan SOR Markdown.

## Mula di VS Code

1. Extract ZIP.
2. Dalam VS Code, pilih **File → Open Folder → Slay_the_Math_Map_VSCode**.
3. Baca `SOR/00_READ_FIRST.md` dan `APPLY_TO_PROJECT.md`.

Terminal PowerShell, dari folder yang diekstrak:

```powershell
code .
```

## Kandungan

| Folder / fail | Kegunaan |
| --- | --- |
| `src/map-rng.js` | Generator CommonJS / browser script biasa |
| `src/map-rng.mjs` | Generator ES module |
| `src/map-screen.mjs` | Komponen paparan peta dan pemeriksaan bilik |
| `src/index.mjs` | Entry point untuk import dalam projek game |
| `styles/map.css` | Styling peta yang dihadkan kepada komponen peta |
| `assets/map-icons/square/` | 6 ikon PNG 1080 × 1080 untuk nod peta |
| `assets/map-icons/fhd/` | 6 eksport PNG 1920 × 1080 |
| `data/` | 100 seed, 200 snapshot peta, katalog CSV dan validation report |
| `SOR/` | Peraturan RNG, ikon dan integrasi |
| `examples/` | Contoh pemasangan komponen ke aplikasi sedia ada |
| `test/` | Ujian RNG, compatibility dan entry point modul |
| `tools/` | Jana semula data dan sahkan pakej |
| `AGENTS.md` | Arahan projek untuk bantuan coding dalam VS Code |

**100 seed × 2 stage = 200 peta unik.** Kesemua 50 seed asal dikekalkan.

## Peraturan utama

| Path awal | Shop | Elite | Rest, termasuk level 9 |
| --- | --- | --- | --- |
| 3 | 1 | 4 | 2 |
| 4 | 2 | 6 | 3 |
| 5 | 3 | 7 | 4 |

Level 5 ialah Mystery untuk semua laluan; level 9 ialah Rest untuk semua laluan;
boss di level 10. Rest boleh dikongsi. Laluan boleh bercabang dan bercantum.

## Semakan developer

Node.js digunakan untuk ujian dan penjanaan data. Tiada dependency npm tambahan.

```powershell
npm test
npm run validate
npm run build:data
```

Ini ialah modul untuk dimasukkan ke game utama. Paparan yang disertakan ialah
map inspector; combat, penyelesaian bilik, inventori dan save game dikawal oleh
projek game yang memasukkannya. `onRoomInspect` hanya memaklumkan bilik dipilih.

Ujian generator, eksport CommonJS/ES module dan integriti aset telah dijalankan.
Paparan browser sebenar dan integrasi dengan kod game utama belum diuji dalam
persekitaran ini; kod game utama tidak disertakan dalam lampiran.
