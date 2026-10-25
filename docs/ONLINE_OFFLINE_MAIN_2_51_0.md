# Online/Offline main integration — 2.51.0

26 Oktober 2026, Asia/Kuala_Lumpur. **VALID dalam skop yang diuji, dengan penemuan P2 dan had di bawah dikekalkan. Penerbitan main VERIFIED pada `338e1f82d89a8fa54882ea08ab6d0e1ebe7d5a2b`; exact-code Pages run 40225058693 SUCCESS.** Ijamm meminta senarai yang belum masuk dan menerbitkannya; hanya dua pakej semasa dipilih. Semua command gagal, RED dan hasil lulus kemudian kekal berasingan.

## Snapshot dan perkara yang diterbitkan

| Peranan | Branch / versi | SHA penuh |
| --- | --- | --- |
| Main asas | main 2.50.0 | `09a5aa49645a37ee011317f1b784f0dd9affdf02` |
| Ciri pemain | fix/online-offline-readiness | `e9411eba938dc819f12382fe636aa02ec5059271` |
| Snapshot registry owner | codex/master-map-simulation-protocol | `e0574af7a4b705a90a31e4d4c360ebf95d15df3e` |

Inventori GitHub sebenar mempunyai 38 branch, termasuk main. Daripada 37 yang lain, 17 ialah ancestor main dan 14 mempunyai **seluruh tree tepat sama** dengan commit squash/adoption dalam ancestry main. Tiga specialist Combat/Economy/Map sejarah sudah dipertimbangkan secara terpilih oleh Master; `balance/master` sendiri ialah ancestor. Preview kad dwi bahasa lama telah diganti oleh pemilik kad dan bahasa semasa. Branch ini bukan ciri baharu yang perlu digabung semula. Semua branch asal dikekalkan; tiada raw merge dataset lama, empat profil agent lama, artwork atau preview kad yang sudah diganti. [Inventori penuh dan bukti](verification/online-main-20261026/INVENTORY.md).

**Status audit branch:** dua pakej semasa ialah VALID dalam skop diuji. Combat/Economy/Map ialah sejarah yang diterima secara terpilih; reaktivasi baki alat/data mereka pada 2.51.0 ialah BELUM DISAHKAN dan memerlukan audit khusus. Preview dual-language lama telah diganti dan PERLU UPDATE jika mahu dihidupkan semula. Behind sahaja tidak membuktikan branch rosak.

Ciri pemain menambah satu pilihan Online/Offline dalam Settings, pemasangan lengkap yang mengesahkan fail disk/resit/worker, resit startup yang mengikat shell kepada release, serta FAQ BM/English tempatan. Pet API memerlukan pilihan Online eksplisit dan transport milik provider; tiada backend, key, animated pet atau live API baharu didakwa tersedia.

## Registry: hasil owner kekal mengikut sumber asal

Perubahan selepas snapshot 6e364 hanya `docs/simulation/RUN_REGISTRY.json`. Semakan metadata bebas mengesahkan tiga run, 23 seed unik, identiti commit/tree, had tiga agent dan semua `trainingEligible:false`; rekod pilot asal tidak berubah.

| Rekod owner dalam e057 | Sumber sebenar | Hasil yang dikekalkan |
| --- | --- | --- |
| Pilot asal | b3dc / main 2.49.1 | COMPLETE, 6 PASS / 4 FAIL |
| Breadth | b3dc / main 2.49.1 | COMPLETE, 8 PASS / 2 FAIL; keyboard/focus lama dibawa sebagai finding source-bound |
| Journey | 509be90 / main 2.50.0 | CENSORED_HARNESS_AND_BUDGET, 0 complete campaigns / 0 final boss reached |

Ini bukan ukuran 2.51.0. Archive breadth/journey baharu tidak dibuka secara bebas dalam semakan metadata ini. Input replay asal dipadankan melalui hash; folder private dan raw save tidak dimasukkan ke Git atau pakej bukti. Integrasi tidak menjalankan collector, pilot baharu, kempen balance atau latihan model. Hanya replay regresi A2/A4 yang dinyatakan di bawah dibuat pada calon gabungan.

## Integrasi dan pemeliharaan

Offline mempunyai lapan conflict metadata/history: package, lima fail entry/generated, keputusan dan changelog. App auto-merge bersih; seluruh app main, termasuk tiga pembaikan pendidikan 2.50.0, kekal tepat selepas dua hook Settings pilihan dibuang untuk **analisis diff sahaja**. Ujian provenance Tutorial akhir membandingkan app sebenar secara strict, tanpa membuang hook.

Package mengekalkan semua arahan main, termasuk VFX alignment, sambil menambah pemeriksaan offline. Pemilik semasa menjana index/release/cache/Practice sebagai 2.51.0. Alyssa Idle/blink (280 ms closed span, 3,460 ms cadence), VFX alignment, semua angka/kad/bank/AI/model, archived/current save/RNG, bahasa, audio dan artwork asal kekal. Audit bebas mengesahkan 16 kumpulan owner dan 610 aset asal. [Bukti audit akhir](verification/online-main-20261026/integration-auditor/preservation-20b83585.json).

| Checkpoint tempatan | SHA penuh | Tree / peranan |
| --- | --- | --- |
| Sumber capture penuh | `6033478c0d6279258ed153dae4e0e19ef83bff1d` | `11675d86b21bab796171174b6a84db24a68aec24`; full 98 |
| Calon semakan awal | `7a830e50c468c43442162b25823616c9cda62846` | `df7acbeda6d80f34a4b40dc89dc6ce2d6a95bf22`; 175 focused, dua command native gagal |
| Keyboard dan capture menu | `ff3dcb5dbf4de5dd1ec72bf320ea8c209455e4a2` | `ff0907988895735fe08a21fc6b128a6f1dcbdfca`; menu 20 |
| Calon runnable akhir | `20b835855e00b8279c75d4b516b5da9f98624708` | `ae67c4324438fda926052d36253cd6748954ce51`; fresh 23 dan native akhir |

Checkpoint ini tempatan sahaja, bukan pautan commit GitHub. Publication API boleh mempunyai SHA berbeza; tree dan runnable-byte equivalence mesti dipadankan, dengan ordered parents main 09a5, offline e941 dan protocol e057. Selepas QA, hanya dokumentasi/bukti ditambah; tiada build atau source/test/config berubah.

## Masalah disahkan dan pembetulan terhad

| ID / keutamaan / keyakinan | Bukti dan tindakan |
| --- | --- |
| REL-251-CLEAR / P2 / tinggi — fixed dalam skop | `localStorage.clear()` dari tab lain tidak membatalkan izin pet yang lama. RED 12 test: 10 PASS / 2 FAIL; GREEN 12/12 selepas handler menerima null key bagi localStorage, membatalkan inflight/stale work dan mengabaikan area/key lain. |
| REL-251-KEYBOARD / P2 / tinggi — fixed dalam skop | Portable native membuktikan Space pada Online yang sudah checked tidak merekod pilihan eksplisit. Root menambah pengendalian Space/Enter pada radio mod sahaja, menggunakan click contract sedia ada serta guard repeat/composition/disabled. Clean semantic RED: 2 PASS / 1 FAIL; GREEN UI+mode 15/15 dan fresh native keyboard akhir lulus. Markup/default visual dan app tidak berubah. |
| SE-OFFLINE-01 — sejarah dan skop regresi | Empat cold restart asal pada local HTTP project URL gagal pada b3dc. Pembaikan branch menambah shell/manifest/startup receipts dan full installation. Current full-install native14 serta replay **A2/A4 sahaja** lulus; A1/A3 original-save replay tidak dibuat semula pada 2.51.0. Empat FAIL registry asal tidak ditulis semula. |

Fail draft test yang memeriksa `defaultPrevented` sebelum outcome dikekalkan sebagai sejarah pengarang ujian; clean RED kemudian memeriksa izin sebenar. Dua command native awal yang gagal tidak dilabel lulus: full-native terhenti selepas lapan PASS dengan Target/Page crash semasa import combat; portable observer gagal pada Space. Tiada assertion/input diturunkan untuk mendapatkan PASS.

## Bukti Tutorial dan verifikasi sebenar

Pemilik capture sebenar dijalankan sekali untuk **98 gambar** pada 603: 49 EN / 49 BM, 415.879 saat, 0 GROUP FAILED; 86 bitmap byte-identical. Selepas pembaikan keyboard, CLI canonical `TUTORIAL_CAPTURE_GROUP=menu` menangkap **20 gambar menu** pada ff3d dalam 37.797 saat, 0 GROUP FAILED. Katalog akhir masih 98 unik: **20 batch baharu + 78 rekod/bitmap asal yang tepat**. Dua snapshot berbeza hanya pada index/UI/release; raw app/engine kekal sama. Semua 107 input runtime batch menu kekal tepat sepanjang capture dan generation akhir. Tiada full 98 repeat, fabricated image atau strip-app exception.

| Semakan | Hasil sebenar / batas |
| --- | --- |
| Inventori / ancestry / exact-tree adoption / preservation | PASS; dua source heads dan baseline main ialah ancestors calon |
| Focused awal pada 7a | **175/175 PASS**; bukan suite penuh gabungan akhir |
| Focused akhir pada 20b | **23/23 PASS**, termasuk permukaan baharu/terjejas; bukti unit RED/GREEN berasingan |
| Owner generation normal / production akhir | PASS selepas keyboard + menu capture; 765 source dan 766 production entries semuanya padan hash/length |
| Complete retained installation / cold browser restart | **14/14 PASS** pada ulang canonical akhir; 769 fail lengkap, browser proses baharu, server asal dihentikan dan HTTP cache tidak menjadi bukti readiness |
| Original-save partial startup | **A2/A4 2/2 PASS**; save/RNG tepat. Startup separa tidak mendakwa full Ready; gambar yang belum tersedia menunjukkan Retry dengan jujur |
| Storage/worker fault native | **4/4 PASS**; tiada false Ready pada kegagalan yang diuji |
| Online preload | **9/9 PASS**; bukan bukti membaiki finding counter lama |
| Portable dan keyboard | **3/3 canonical checks PASS**, empat keadaan radio keyboard dan tiga tindakan Enter FAQ/ask; 0 HTTP, 0 browser errors, save tepat |
| Suite Node besar / kempen balance / 75-pose matrix | NOT_RUN semula; pemilik/source yang tidak berubah dibuktikan secara berasingan |
| Pages / public browser / live services | Source Pages run 40225058693 SUCCESS pada exact 338e1f82; receipt-head workflow disahkan berasingan selepas follow-up. Public-browser, real Google/provider API, peranti fizikal dan OS reboot NOT_RUN |

Portable akhir ialah 312,186,494 bytes, SHA-256 `7dfc9bd13e40e7db253bd9b6cc50318e8713e0a991daa34797fa127fb918875d`. Selepas semua portable consumers selesai dan hash dipadankan, fail generated ignored itu dibuang mengikut kebenaran root untuk menyediakan headroom; source dan semua hasil/hash kekal. Production manifest akhir `afd18ff1cbcc0308b2bbaa60`, SHA-256 `b9fd17f3116886a74169a3e26fcabfbf92217dba0dd9c723ece7ec2e73a70bc7`.

Tekanan ruang/memori diperhatikan pada Target/Page crash awal, tetapi tiada counter OOM baharu; **punca tepat tidak disahkan**. Cleanup hanya melibatkan output generated task yang sudah tutup, dedup immutable byte-equal dan public upload-temp. Semua 3,500 tracked hashes kekal sama sebelum/selepas reclaim pertama. Kira-kira 312 MB lagi dilepaskan selepas portable akhir PASS; canonical14 kemudian diuji semula sekali dengan DEBUG browser dan headroom berbeza. Ini bukan tuntutan bahawa runtime memory/GPU umum telah dibaiki.

## Risiko berpotensi dan penambahbaikan

- **P2/open, inherited:** CI-247-01 dan QA-248-PRELOAD-01 kekal. Fresh native/preload PASS tidak menutup finding CI atau transient retained-count lama.
- **P2/source-bound:** dua kegagalan D1/D2 keyboard/focus breadth pada b3dc kekal dalam registry; current reproduction/penutupan khusus belum disahkan. Journey censored tidak dikira PASS atau full campaign.
- **Retention / keyakinan tinggi:** Ready ialah pemerhatian release/disk semasa. Quota, corruption atau eviction selepas audit boleh memerlukan repair; browser temp-profile restart bukan OS reboot, semua browser atau jaminan storage kekal.
- **P3/optional:** satu ayat EN/BM Tutorial kemudian boleh menjelaskan pilih Offline dan tunggu Ready, tahap Online entry berbanding full installation, serta scroll untuk control bawah. Tiada bab, exercise atau mode selector lain ditambah di sini.
- MODEL.zip, lampiran textbook/DSKP baharu, live Google/pet provider, human audio/recognition, Windows/physical devices, pupil outcomes dan universal performance tidak disahkan. Tiada matematik atau balancing baharu dicipta.

Bukti raw/indeks dan batas disimpan di [direktori verifikasi](verification/online-main-20261026/). Main memerlukan fresh ref, `expected_sha` dan `force:false`; jika head bergerak, hentikan write dan audit delta. Selepas source publication, satu receipt dokumentasi merekod ref/tree/parents/version sebenar; Pages disemak berasingan. Jika rollback kemudian dibenarkan, gunakan corrective commit biasa yang disemak dengan lease baharu, mengekalkan shared history dan save; jangan reset shared main.

## Actual source publication

The expected-head non-forced update moves main from `09a5aa49645a37ee011317f1b784f0dd9affdf02` to `338e1f82d89a8fa54882ea08ab6d0e1ebe7d5a2b`, exact tree `b94729255bbbd2dfdcabf8cddf4308ed560a13d2`, version 2.51.0. API readback verifies the three ordered parents and both pinned source ancestries. All six retained source/specialist refs remain unchanged at the observation timestamp. Local reviewed e1e0 and published source share the same tree; local test checkpoints remain distinguished from GitHub commits.

[Exact-code Pages run 40225058693](https://github.com/unDead41/slay-the-math-v2/actions/runs/40225058693) completed successfully. [Publication metadata](verification/online-main-20261026/publication.json) records actual times, refs, parents, hashes and limits. This single receipt closes current PENDING clauses using observed facts; it adds documentation only and leaves the 152-row closed evidence index and all original QA bytes unchanged. The final receipt head and its Pages run are verified afterward without another status commit loop. No public-browser or live-service success is inferred from the workflow.
