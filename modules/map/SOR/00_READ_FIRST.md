# SOR — Mula di sini

Set of Rules ini ialah rujukan bagi Ijamm dan pembantu coding sepanjang
pembangunan modul peta Mathematics Slayer.

| Dokumen | Kandungan |
| --- | --- |
| `01_MAP_RNG.md` | 10 level, path, kuota bilik, seed dan validation |
| `02_MAP_ICONS.md` | Identiti enam ikon, warna, bingkai dan eksport PNG |
| `03_MAP_INTEGRATION.md` | Cara modul berhubung dengan game dan progress run |
| `04_MAP_COMBAT_POWER.md` | Audit seed/laluan, anggaran tekanan, CP dalaman, konteks simulasi dan handoff Master |

Keputusan pengguna yang disahkan mengatasi pilihan pelaksanaan. Jika pengguna
mengubah peraturan, kemas kini kod dan dokumen yang berkaitan bersama-sama.
Jangan menganggap angka atau kadar tambahan sebagai keputusan pengguna apabila
ia hanya pilihan pelaksanaan yang ditandakan dalam `01_MAP_RNG.md`.

Pakej ini merangkumi modul peta dan aset nod peta. Ia tidak menetapkan statistik
combat, kos kad, kadar event, harga Shop atau mekanik keseluruhan game.

Audit balance v1.3 menambah polisi adaptif, replay entry setara, recovery/risiko–ganjaran, sensitiviti Predict dan semakan regresi. CP hanya rujukan pembangunan; jangan paparkan pada menu, map, HUD atau UI pemain. [Hasil semasa dan had](../../../docs/MAP_BALANCE_V1_3_HANDOFF.md); [audit v1.2](../../../docs/MAP_BALANCE_HANDOFF.md) kekal sejarah.
