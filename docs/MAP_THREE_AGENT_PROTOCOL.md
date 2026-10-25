# Map — protokol tiga subagent

## Current main integration authorization — 2.50.0

The current explicit user request authorizes combining combat, education and
Master Map protocol candidates with main 2.49.1 as 2.50.0. Scoped compatibility
is VALID with carried P2 findings and explicit limits; original failed commands
and later focused/native evidence remain separate. Game 2.50.0 publication is VERIFIED at runtime commit
`509be90a3f211004c29379c96469f4e3a70cc0a4`. [Actual readback and Pages](verification/all-main-20261025/publication.json). This supersedes the relevant earlier branch-only boundary;
original source pins, histories and current main owners remain. The completed
owner pilot stays tied to source b3dc, not 2.50. [Scope, results and limits](ALL_CANDIDATES_MAIN_2_50_0.md).


25 Oktober 2026. Menggantikan kapasiti empat worker dalam pakej Map lama untuk pengambilan Master ini. Fail sejarah [protokol empat agent](https://github.com/unDead41/slay-the-math-v2/blob/8ca19526ec6a69d1183bae96803e461a77e3acfc/docs/MAP_FOUR_AGENT_PROTOCOL.md) kekal sebagai bukti asal.

## Had dan pemilikan

- Maksimum **3 subagent spawned** secara keseluruhan, parent tidak dikira. Tiada nested delegation. Tiga ialah had, bukan kewajipan; gunakan satu apabila cukup.
- Parent menyelaras, memiliki satu collector dan menjadi satu-satunya penulis journal/laporan global. Worker hanya menganalisis seed/kes yang ditugaskan. Tiada collector, commit atau push daripada worker.
- Untuk kutipan baharu, maksimum **3 worker Node agregat**, dikurangkan lagi mengikut kuota CPU/RAM. Bilangan proses Node berbeza daripada bilangan agent LLM.
- Baca sumber dan CLI semasa. Pada main yang diperiksa, recheck berdefault 8 worker dan regression berdefault 2; kedua-duanya tidak menguatkuasakan cap agregat merentas proses. Nyatakan budget dan override pekerja secara eksplisit. Contoh fragmen argumen yang disokong: `--workers 3` (atau lebih rendah mengikut budget). Ini bukan arahan lengkap atau kebenaran menjalankan cohort.
- Satu invocation sahaja. Jangan jalankan tiga proses dengan tiga worker setiap satu. Jangan gunakan panggilan `--seed-limit` berulang sebagai shard: selector sebenar mengambil prefix registry yang sama.

## Profil dan agihan

Gunakan profil [A](../.codex/agents/map_balance_a.toml), [B](../.codex/agents/map_balance_b.toml), [C](../.codex/agents/map_balance_c.toml) serta [skill projek](../.agents/skills/slay-map-balance/SKILL.md). Ketiga-tiganya mempunyai skop sama: semua difficulty, polisi, Predict dan repetition yang ditetapkan bagi seed masing-masing.

Baca [registry sebenar](../modules/map/data/seed-registry.json). Agihan awal mengikut posisi ialah A 1,4,…,100; B 2,5,…,98; C 3,6,…,99: **34/33/33** seed. Gunakan batch sekitar lima; beza satu seed tidak membuktikan runtime sama. Parent boleh menyerah semula batch yang belum bermula selepas pemilik lama melepaskannya.

[Pelan setup](../reports/map-balance/three-agent-setup-20261025/plan.json) ialah pemilikan analisis, bukan jadual pengukuran, seed analisis yang selesai atau collector shard adapter. Gunakan manifest kes sebenar sebelum simulasi. Tiada completed seed atau timing direka.

## Sumber dan pengesahan

Ikut [protokol simulasi dan bukti bersama](simulation/SIMULATION_EVIDENCE_PROTOCOL.md) sebelum menuntut cohort. Main sudah mengadaptasi teras Map364; pelihara tools/replay, adapter, telemetry gross Gold dan output defaults main. Jangan menyalin alat lama atau mengubah config sejarah untuk mematuhi had baru.

Bekukan source/config/engine/policy/context/case/entry/RNG; simpan loss, error, censor dan missing berasingan. Jangan pool versi/difficulty atau puratakan CP worker. Stage2 survivor bank kekal conditional; missing entry memberi CP null. Gate integriti bukan kelulusan balance dan bot bukan murid.

Recheck numerik dilakukan selepas sumber gabungan stabil. Edit profil/MD ini hanya memerlukan semakan syntax, metadata, pautan, agihan dan pemilikan. Tiada campaign atau suite seluruh game diperlukan untuk mengesahkan penukaran arahan sahaja.

## Rujukan sejarah

- [Handoff v1.4](https://github.com/unDead41/slay-the-math-v2/blob/364a844879b8cd9463c4771eac15291a3fd22075/docs/MAP_BALANCE_V1_4_HANDOFF.md)
- [Handoff v1.5](https://github.com/unDead41/slay-the-math-v2/blob/364a844879b8cd9463c4771eac15291a3fd22075/docs/MAP_BALANCE_V1_5_HANDOFF.md)
- [Validation index v1.5](https://github.com/unDead41/slay-the-math-v2/blob/364a844879b8cd9463c4771eac15291a3fd22075/reports/map-balance/validation-v1.5/validation-index.json)

Data itu kekal game2.40.0; tiada dakwaan balance main2.49 disahkan. Format TOML disediakan untuk host yang menyokongnya. Ia tidak mengubah orchestrator ChatGPT Work, memasang daemon atau mencipta sandbox berasingan; parent Work mesti menguatkuasakan had tiga.
