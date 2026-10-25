# Ringkasan QA — 2.51.0

QA mengesyorkan penerbitan; Release Manager menunggu GO Root untuk tree akhir.

Calon akhir tempatan: `20b835855e00b8279c75d4b516b5da9f98624708`, tree `ae67c4324438fda926052d36253cd6748954ce51`. Cadangan ialah VALID dalam skop diuji, dengan P2 dan batas yang dikekalkan. Ringkasan asal oleh QA disimpan sebagai `QA_SUMMARY.original.md`; pembetulan ini tidak mengubah log, screenshot, input atau keputusan ujian.

| Semakan | Hasil |
| --- | --- |
| Focused pertama pada 7a | 175/175 PASS |
| Focused akhir pada 20b | 23/23 PASS, 0 skip/cancel |
| Full retained offline restart akhir | 14/14 PASS, 769 fail / 232,968,331 bytes, 0 browser errors |
| Original startup A2/A4 | 2/2 PASS; EN 1440 / BM 390; 319 launch files, 339/337 daripada 766 cached; full Ready false, save/RNG tepat |
| Storage faults | 4/4 PASS |
| Production preload | 9/9 PASS; 765/765 non-Practice, 0 errors |
| Portable dan keyboard | 3 canonical checks, 4 keadaan radio dan 3 tindakan Enter PASS; 0 HTTP/errors, save tepat |

Full native 14 mengesahkan proses browser baharu, server/network asal dihentikan, response 200 melalui SW dan release `afd18ff1cbcc0308b2bbaa60` yang sama. Coverage termasuk Practice 120, Tutorial 23/114 exposures/98 gambar unik, 85 MP3 decode, satu muted source start/end, kedua-dua stage/boss, real VFX/card commands dan exact battle/RNG/deck/stats, eviction serta corrupt-bootstrap503. Ini bukan OS reboot, hardware atau human-audio proof.

Semua 3,500 fail tracked kekal tepat sepanjang window akhir. 7a → 20b hanya 12 path: UI/test UI, empat gambar menu sebenar, katalog capture dan generated release/HTML/manifest. Pemilik runtime dilindungi; Practice hanya fallback version 2.50→2.51 dan app hanya dua hook Settings. Analisis diff ini bukan exception provenance capture.

Dua P2 dibetulkan melalui RED→GREEN: cross-tab localStorage.clear membatalkan izin/stale pet work; keyboard Space/Enter pada checked Online mengaktifkan pilihan eksplisit. Google consent mengekalkan owner berasingan. Pemadaman storage sendiri tetap boleh memadam data.

Kegagalan asal kekal: VM RED 10/12; portable keyboard FAIL; canonical 14 pertama pada 7a lapan PASS kemudian Page crash semasa import combat. Tiada signal/counter cgroup OOM baharu membuktikan punca tunggal. Ulang 14 akhir PASS selepas pembetulan keyboard dan reclaim resource; command asal tidak dilabel PASS dan tiada runtime/GPU fix claim.

Actual full 98 ditangkap pada 603, kemudian actual menu 20 pada ff3d. Akhirnya 98 unik: 20 batch menu baharu dan 78 rekod/bitmap asal yang tepat. App/engine raw kekal sama; snapshot index/UI/release berbeza secara jujur. A4 partial startup menunjukkan missing-image/Retry, bukan full installation. A1/A3 original-save replay NOT_RUN fresh; original empat FAIL kekal.

Registry e057 memelihara pilot 10 (6/4), breadth 10 (8/2 D1/D2 menu-focus FAIL), journey 3 CENSORED_HARNESS_AND_BUDGET /0 final boss. Ini bukan kempen atau training baharu. CI-247-01, QA-248-PRELOAD-01 dan D1/D2 source-bound kekal terbuka.

Portable 312,186,494 bytes / SHA-256 `7dfc9bd13e40e7db253bd9b6cc50318e8713e0a991daa34797fa127fb918875d` lulus, semua consumer ditutup, kemudian fail ignored direclaim dengan izin root. Source dan production bytes tepat. Private replay input/raw save di luar repository/pakej; hanya hash, seed, case identities, assertions, command metadata dan screenshot UI dibenarkan.

Public Pages/live Google/live pet, OS reboot/peranti fizikal/GPU/browser lain, human/model.zip comparison, full campaign/training, suite besar dan 75-pose matrix NOT_RUN semula. Rujuk evidence.json dan original artifact index untuk arahan/masa/hash/batas sebenar.
