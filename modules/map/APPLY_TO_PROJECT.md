# Cara memasukkan modul peta ke projek game

## 1. Salin modul

Salin folder `Slay_the_Math_Map_VSCode` sebagai satu folder modul di dalam projek
game. Kekalkan struktur `src`, `styles`, `assets` dan `data`.
Semak fail peta lama sebelum menggantikan mana-mana entry point game.

## 2. Gunakan generator

Untuk projek JavaScript yang menyokong ES modules:

```js
import { generateMap, validateMap, SEEDS } from './Slay_the_Math_Map_VSCode/src/index.mjs';

const map = generateMap('STM-001', { stage: 1 });
const report = validateMap(map);
if (!report.valid) throw new Error(report.errors.join('; '));

console.log(SEEDS.length); // 100
console.log(map.nodes, map.edges);
```

Laluan import di atas ialah contoh apabila modul diletakkan di sebelah fail
entry point aplikasi. Laraskan mengikut struktur projek sendiri.

Untuk CommonJS, generator tersedia secara terus:

```js
const { generateMap, validateMap } = require('./Slay_the_Math_Map_VSCode/src/map-rng.js');
const map = generateMap('STM-001', { stage: 1 });
```

## 3. Gunakan paparan peta dengan ikon

Import CSS melalui kaedah yang digunakan oleh projek game, atau masukkan
stylesheet menggunakan `link` yang dibina oleh JavaScript seperti dalam
`examples/mount-map.mjs`.

```js
import { mountMapScreen } from './Slay_the_Math_Map_VSCode/src/index.mjs';

const host = document.querySelector('#map-root');
const screen = mountMapScreen(host, {
  seed: 'STM-001',
  stage: 1,
  onRoomInspect(room, map) {
    console.log('Inspect room:', room.id, room.type, map.seed);
  }
});

const snapshot = screen.getCurrentMap();
screen.setMap('STM-014', 2);

// Semasa meninggalkan screen peta:
screen.destroy();
```

`host` mestilah elemen DOM yang disediakan oleh game. Modul mengisi elemen itu
dengan paparan peta. Pilihan seed dan stage dalam komponen ialah kawalan inspector.
Sambungkan keadaan run sebenar melalui game store projek sebelum menggunakannya
sebagai peta perjalanan pemain.

Secara lalai, PNG dirujuk melalui URL relatif kepada folder modul. Jika projek
menggunakan bundler yang memindahkan modul atau mengurus aset secara berasingan,
salin `assets/map-icons` ke folder aset awam projek dan berikan URLnya:

```js
const screen = mountMapScreen(host, {
  assetBaseUrl: '/assets/map-icons/square/',
  seed: 'STM-001',
  stage: 1
});
```

Jalankan aplikasi menggunakan development server projek sendiri. Komponen
`.mjs` perlu dimuatkan sebagai modul oleh aplikasi; ia bukan fail untuk dibuka
melalui double-click dalam Windows.

## 4. Sambungkan perjalanan sebenar

`onRoomInspect` bukan arahan memasuki atau menyelesaikan bilik. Game perlu
menyemak `currentRoomId`, bilik yang sudah selesai dan `map.edges` sebelum
membenarkan masuk ke bilik seterusnya.

```js
const nextRoomIds = map.edges
  .filter(edge => edge.from === currentRoomId)
  .map(edge => edge.to);

if (!nextRoomIds.includes(requestedRoomId)) {
  throw new Error('Room is not connected to the current room');
}
```

Pada awal stage, pilihan ialah `map.levels[0].nodeIds`. Selepas memilih bilik
awal, ikut edge yang sah sahaja. Jangan membina sambungan baharu berdasarkan
kedudukan ikon atau kedekatan grafik.

Simpan snapshot JSON peta, versi generator, seed, stage dan progress run.
Continue memulihkan snapshot; ia tidak menjana seed baharu.

## 5. Semak selepas integrasi

Jalankan `npm test` dan `npm run validate` dari folder modul. Kemudian semak
paparan dan aliran bilik dalam game sebenar: PNG dimuatkan, aturan level 5/9
kekal wajib, dan pertukaran screen tidak mengubah run yang sedang berlangsung.
