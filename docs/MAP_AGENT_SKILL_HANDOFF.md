# Map agents and skill — handoff to Master

25 Oktober2026, Asia/Kuala_Lumpur. Report kind: AGENT_SKILL_SETUP. Master SOR1.2.0.

## Hasil

Empat profil Codex A–D dan skill `slay-map-balance` kini disediakan untuk skop Map. Semua agen menilai aspek yang sama bagi seed masing-masing; parent menyelaras, memiliki collector, menggabungkan/verifikasi data dan menerbitkan laporan. Ini menyediakan konfigurasi dan prosedur yang boleh digunakan; tiada scheduler merentas agen atau collector shard adapter baharu.

| Agen | Agihan awal daripada registry100 | Batc pertama |
| --- | --- | --- |
| A | STM-001,005,…,097 —25 seed | 001,005,009,013,017 |
| B | STM-002,006,…,098 —25 seed | 002,006,010,014,018 |
| C | STM-003,007,…,099 —25 seed | 003,007,011,015,019 |
| D | STM-004,008,…,100 —25 seed | 004,008,012,016,020 |

Setiap seed meliputi semua difficulty/polisi/Predict/ulangan dalam manifest yang dibekukan. Batc belum bermula boleh diserah semula oleh parent selepas pemilik lama dilepaskan.25% ialah sasaran beban analisis; masa dan speedup belum diukur.

## Fail yang boleh digunakan

- [Konfigurasi](../.codex/config.toml): cap empat spawned threads, tidak termasuk parent, pada Codex yang menyokong setting ini.
- Profil [A](../.codex/agents/map_balance_a.toml), [B](../.codex/agents/map_balance_b.toml), [C](../.codex/agents/map_balance_c.toml), [D](../.codex/agents/map_balance_d.toml): skop sama, tanpa override model/effort/permissions; tiada collector, child agent atau push daripada worker.
- [Skill projek](../.agents/skills/slay-map-balance/SKILL.md), [kontrak worker](../.agents/skills/slay-map-balance/references/worker-contract.md) dan [pengesahan](../.agents/skills/slay-map-balance/references/verification.md): input/output, sumber/konteks, CP, resume, semakan mengikut risiko dan handoff.
- [Laporan berstruktur](../reports/map-balance/agent-skill-setup-v1/summary.json) dan [hasil empat tugasan](../reports/map-balance/agent-skill-setup-v1/forward-tests.json).

Dalam ChatGPT Work, parent menggunakan alat subagent sesi dan menguatkuasakan cap empat; fail TOML tidak mengubah orchestrator Work secara automatik. Profil memberi arahan kerja, bukan sandbox keselamatan berasingan. Tiada daemon atau kerja latar dipasang. Native Codex loader tidak tersedia dalam sesi ini; kesahihan format disemak dan tingkah laku diuji melalui alat subagent sebenar dengan profil sebagai input.

Skill turut disimpan pada workspace Skills pengguna; salinan repository ialah rujukan untuk Master/checkout. Elakkan memuat dua salinan bernama sama pada host yang mengimbas kedua-dua lokasi. Tiada plugin luar baharu diperlukan.

## Skill penting mengikut keperluan

| Skill | Penggunaan |
| --- | --- |
| slay-map-balance | Aliran utama: seed/laluan, konteks sebenar, recovery/risk-reward, CP pembangunan dan handoff. |
| dispatching-parallel-agents | Pecahan bebas, input tepat, output terasing dan penyatuan empat worker. |
| systematic-debugging | Apabila terdapat kegagalan sebenar atau hasil bercanggah. |
| verification-before-completion | Bukti semasa sebelum dakwaan lulus/siap atau penerbitan. |
| using-git-worktrees / requesting-code-review | Isolasi perubahan kod dan semakan implementation yang material. |

Skill sokongan digunakan jika tersedia dan relevan; langkah teras sudah ada dalam skill Map. Spreadsheet/document hanya untuk deliverable format berkenaan. Skill release khusus untuk permintaan Master Audit/integrasi/release yang dibenarkan, bukan autorisasi main daripada kerja Map.

Contoh arahan: “Gunakan $slay-map-balance untuk recheck Map pada source semasa, maksimum4 agen, kemudian sediakan dan push laporan ke balance/map untuk Master.”

## Sumber, semakan dan had

Main diperiksa `68d61e75ecb241c5100fc894ee57231f00f3932f`, game2.48.0. Map sebelum perubahan `280278ea1d67af0579a7c66f2103d885938207cc`. Merge base `b730cad0cb27b53ffbdf687d8fc9edaed143ef43`; sebelum set ini Map ahead5/behind26. Compare GitHub memulangkan300 fail dan tidak dianggap audit penuh diff runtime.

Master SOR semasa, AGENTS, governance/visi/design/keputusan, audit main serta owner/audit Map dibaca. Main tiada konfigurasi .codex/.agents sedia ada pada snapshot yang diperiksa. DOC001/DOC002 main sudah diselesaikan oleh addendum2.43. Branch ini tidak mengintegrasi main2.48; penambahan profil tidak menandakan source lama serasi dengan semua perubahan main.

Semakan set ini ialah syntax/metadata/link/diff, agihan100 seed tanpa overlap dan empat tugasan return-only menggunakan konteks baharu. Tugasan meliputi agihan, provenance versi, resume record terputus dan batas CP/missing Stage2. Ia menguji prosedur; **bukan analisis seed yang selesai atau simulasi numerik baharu**. Semua completedSeeds kosong dan runtime source/context ujian tidak diada-adakan.

Tiada kod/data/aset game, stat kad/musuh, harga, generator atau cohort sejarah diubah. Suite game dan campaign tidak diulang untuk set arahan/config ini. Data v1.5 kekal game2.40.0/candidate.5; balance2.48, ranking berulang semasa, benchmark kelajuan, visual/model dan kadar murid90/70/50 belum disahkan.

Rujukan format rasmi yang dibuka pada25 Oktober2026: [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [skills](https://learn.chatgpt.com/docs/build-skills). Konfigurasi menggunakan `max_concurrent_threads_per_session` dan standalone TOML `name/description/developer_instructions`; tiada andaian API/model baharu.

## Langkah Map seterusnya

Gunakan skill ini pada permintaan recheck numerik seterusnya: bekukan runtime main sebenar dan manifest eksperimen baharu, semak input Combat/Economy/Master, jalankan satu collector terhad dan agihkan analisis kepada maksimum4 worker. Kekalkan historical evidence serta batas coverage/CP. [Protokol empat agen](MAP_FOUR_AGENT_PROTOCOL.md) dan [handoff pengukuran v1.5](MAP_BALANCE_V1_5_HANDOFF.md) terus dirujuk.

## Penerbitan

Receipt kandungan dan readback branch direkod selepas penerbitan dalam laporan berstruktur; hanya balance/map dibenarkan. Main tidak diubah.
