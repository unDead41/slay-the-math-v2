## Main publication addendum — 2.48.0, 25 October 2026

Ijamm now explicitly requests publishing the completed `balance/master` AI update
to `main`. This supersedes the original branch-only boundary for feature
`39ee5ab08d7f60ba9392bff0c3c3cab8eceefe91`. Integrate it with current main
`2b81a2cd80532324a76581563874a9ecd797cc42` / 2.47.0 as **2.48.0**.
The original experiment, source capsules, reports and branch publication below
remain historical evidence with their original SHAs and measured limitations.
Current numerical candidate.5, player saves/RNG, language, approved Alyssa V5,
live VFX, automatic downloads and the 23-chapter / 98-image / 12-practice tutorial
retain their existing owners. The two deferred P3 data validations remain deferred.
[Current main integration and fresh evidence](../balance/master/MAIN_RELEASE_2_48_0.md).

# 23 — Master balancing, branch2.46.0-ai.1

Current refresh publication target is **balance/master only**, following Ijamm’s latest request to read latest main2.45.0 and improve AI using simulation data. Current numerical binding is candidate.5; earlier publication approvals below refer to their recorded releases. [Current source review and checks](../balance/master/AI_DATA_2026_10_25.md). The three-source2.42 refresh below is historical.

Current main integration: [game2.40.0](../CARD_TUNING_MAIN_2_40_0.md). Ijamm now authorizes main publication of the completed card follow-up; earlier branch-only statements below are historical.

Pemilik: Ijamm. Tarikh: 23 Oktober 2026. Branch pembangunan: `balance/master`; destinasi penerbitan yang disahkan: `main`.

**DISAHKAN:** Ijamm meminta Master membaca ketiga-tiga branch yang siap, menyiapkan integrasi dan push ke branch Master. Sasaran murid ialah Easy 90%, Medium 70%, Hard 50% untuk menang keseluruhan dua stage. Sasaran ini belum diukur melalui murid.

**DISAHKAN — penerbitan main:** Arahan susulan Ijamm meminta update ini dipush ke `main`. Terbitkan game 2.27.0 daripada Master `bd0c11d` di atas main `b67298b`, dengan pilihan balance playtest dan nilai calon yang sama. Arahan ini menggantikan had penerbitan branch sahaja; sasaran murid kekal belum diukur. [Rekod penerbitan dan semakan](../balance/master/MAIN_RELEASE_2_27_0.md).

**IMPLEMENTED / CADANGAN UNTUK PLAYTEST:** Binding semasa `master-1.3.0-candidate.3` menyatukan 40 kad, 31 artifak, 12 musuh, profil HP/Focus/serangan/Rage, ekonomi, Shop, loot dan 15 Mystery events, dengan pembetulan satu musuh MB-06. Nilai bukan pengesahan kadar kemenangan murid. [Bukti integrasi terdahulu candidate.2](../balance/master/HANDOFF.md) dan [semakan semasa](../balance/master/SINGLE_TARGET_2_29_0.md).

## MB-01 — Sumber dan pemilikan nilai

- Asas integrasi: main `b67298b` (Learning Report/analytics 2.26.0, artwork/motion daripada `7afb0aa` 2.25.1), Map `5480273`, Combat `1bf6632` (tree sama dengan sumber tempatan `68dce74`), Economy `df53579`.
- Nilai kad/artifak/musuh asas: [spec v1.2](../../tools/balance/specs/balance-spec.v1.2.json), dilaksanakan oleh `tools/balance/candidate.cjs`.
- Pilihan Master dan pelarasan profil: [config Master](../../tools/balance/master/config.json). Economic artifacts kini Seal 10%, Purse +40 Gold, Contract 20%; highest discount sahaja, round up sekali.
- `tools/build-master-balance.cjs` menjana `dist/balance-data.js`. Jangan sunting output itu untuk menala nilai. `dist/balance.js` ialah binding yang sama bagi browser dan loader Node.
- Rarity, support requirements, duplicate suppression, harga, removal dan transaksi event masih dimiliki [22](22_ECONOMY_REWARDS.md). Profil penuh dibekalkan oleh Master; jangan kenakan bonus Elite atau pengurangan Learn dua kali.

## MB-02 — Cara bermain dan save

New Run → pilih Easy / Medium / Hard dalam bahagian balance playtest. Direct entry: `?balance=easy`, `?balance=medium`, `?balance=hard`. Ketiga-tiganya menyediakan Predict, Hint dan Starting artifact melalui flow Challenge. Label playtest kekal jelas; tiada CP atau kadar kemenangan murid dipaparkan sebagai fakta.

Setiap profil menggunakan save key versi/profil tersendiri. `balanceState` menyimpan versi, difficulty dan hash definisi. `economyState.combatVersion` mesti sepadan. Restore menolak profil/versi lain; retry dan checkpoint Stage 2 mengekalkan binding. Nilai run yang sudah disimpan tidak ditukar secara senyap. Learn/Challenge sedia ada masih boleh digunakan melalui entry biasa; save sedia ada kekal pada key asal. Question history dan tetapan masih menggunakan pemilik asal.

## MB-03 — Combat dan penerangan

3 Energy, draw 4, Hand 10, Focus 3, satu Focus card setiap turn dan maksimum tiga Passive aktif. Kad sama bagi semua difficulty. Strength sekali bagi setiap Attack pada hit pertama; Agility sekali bagi setiap Defend pada immediate Block pertama. Upgrade menggunakan nilai eksplisit, termasuk activation gift/cadence Passive, tanpa blanket Energy discount. Once-per-combat/turn limits dan sejarah swap kekal. Layered Shield tidak menggandakan Agility pada Block tertunda. Mana Reading ialah 1 Energy, draw sekarang + draw giliran berikutnya, Exhaust. Deep Study juga Exhaust.

Enemy HP, multi-hit, Block, Defense, phase dan Rage menggunakan profil penuh. Kad dan artifak dipaparkan daripada nilai sebenar calon, termasuk timing dan upgraded activation gift. Tooltip Focus umum menerangkan bonus mengikut kad, bukan bonus rata +3 untuk semua kad. Artifak retaliation memerlukan positive Block yang benar-benar menyerap positive attack.

## MB-04 — Map, sumber tawaran dan ekonomi

Topology asal dikekalkan: dua stage, sepuluh level, Mystery 5, Rest 9, Boss 10. Tiada jaminan laluan bebas Elite baharu. Gunakan [Map SOR](../../modules/map/SOR/04_MAP_COMBAT_POWER.md) untuk definisi contextual map CP. `createReplay(runtime)` membolehkan replay menggunakan engine Master; default replay lama kekal menggunakan baseline lama bagi keserasian bukti sejarah.

Normal menawarkan tiga kad distinct; Elite menawarkan tiga upgraded distinct kemudian artifak. Shop menawarkan enam kad distinct/satu sale serta artifak mengikut tier. Stage 1 tidak menjual Boss artifact. Event/transform mengikuti source/category yang sah. Semua pending offers mempunyai receipt dan tidak reroll apabila deck berubah atau save dimuatkan. Combat draw order tidak ditimbang mengikut CP. Support weighting berasaskan keupayaan deck, bukan skor CP rekaan; CP belum diukur kekal `null` dalam receipt.

Rest menggunakan Heal atau Upgrade yang sudah wujud. `Explore` tidak ditambah kerana tiada definisi runtime yang disahkan. Boss 2 tidak memberi Gold yang tidak boleh digunakan selepas run. Wang, deck, upgrade, artifak dan HP dibawa melalui API sebenar; simulasi Master tidak memberi kemenangan combat secara paksa.

## MB-05 — Bukti dan had penerimaan

Ujian campaign memadankan seed merentas difficulty, dua route policies dan tiga Predict scenarios. Mystery/Starting gift/Shop/Rest/Boss dan carried HP benar-benar berlaku. Snapshot sumber, manifest dan raw gzip disimpan di `reports/master-balance`. Rujuk summary setiap cohort; jangan campurkan keputusan sebelum dan selepas pelarasan profil.

Semakan kuasa baharu meliputi kesemua 40 kad biasa/upgraded dalam konteks fight pendek dan Boss, sepuluh pasangan dan empat triad terpilih: 624 paired/factorial cases, 1,632 encounter. Tiada invalid/censored dalam cohort ini. ICP ialah delta utility terhadap penggantian Rune Strike dalam deck sama saiz. Pair CCP ialah empat-cell interaction; triad memisahkan third-order interaction dan total synergy. Nilai bukan rating universal atau peluang memperoleh kombo. Tiga seed setiap cell ialah saringan kecil; jump utility kerana loss bertukar win bukan bukti exploit. Jangan auto-nerf atau ubah loot berdasarkan ranking ini sahaja.

90/70/50, keseimbangan manusia bagi semua archetype, device sebenar dan semua kemungkinan combo kekal **PERLU_VERIFIKASI**. Bot tidak mewakili murid, sampel bersyarat bukan data manusia dan kemenangan ulang seed bukan pemerhatian bebas. Censor/invalid mesti dilaporkan berasingan daripada loss.

## MB-06 — Satu musuh, game 2.29.0

**DISAHKAN:** Ijamm meminta kesan AoE/random-enemy ditukar kepada satu sasaran dan hanya bahagian berkaitan diseimbangkan semula. Audit katalog mendapati Rune Sweep dan Fate Storm sahaja mempunyai sasaran tersebut. Fate Storm kekal tiga hit pada musuh sama; multi-hit tidak bermaksud multi-enemy.

**IMPLEMENTED / CADANGAN UNTUK PLAYTEST:** Rune Sweep 2 Energy, 12 damage, Focus +4, upgrade +3. Fate Storm 2 Energy, 5+5+5 damage; Strength, Focus +4 dan upgrade +3 pada hit pertama sahaja. Nilai Master ini kekal; dua kad dalam mode biasa diselaraskan kepada nilai sama. Bahagian AoE Rune Sweep dibuang, bukannya ditambah sebagai damage percuma. RNG sasaran Fate Storm dibuang. Semua 40 kad kini mempunyai kesan serangan/debuff kepada satu musuh; self effects dan random draw kekal mengikut fungsi asal.

Adapter semasa: `tools/cards/single-target.cjs`, sebelum `tools/import-cards.cjs` menjana runtime. Input pembekal kekal rekod sejarah. Receipt baharu merekod versi definisi; receipt lama mode biasa disemak dengan definisi asal dan tidak diselesaikan semula. Master menggunakan `master-1.3.0-candidate.3` dan save key baharu; save candidate.2 kekal tersimpan di key asal. Nilai 38 kad lain, enemy, artifak, harga, weighting loot, topology dan bank soalan kekal. [Bukti perbandingan dan semakan](../balance/master/SINGLE_TARGET_2_29_0.md). Bukti MB-05 di atas berasal daripada candidate.2, bukan hasil baharu candidate.3.

## MB-07 — developer AI Playtester, branch ai

DISAHKAN, 24 October 2026: publish strategy/simulation AI to ai only and improve relevant shortcomings. Reuses candidate.3 bindings with unchanged card/enemy/artifact/economy/map/question numbers. Combat skill and Predict ability remain separate. Contextual complete-factorial individual/pair estimates and resolved usage telemetry do not constitute universal CP, exhaustive combinations or pupil 90/70/50 validation. See [guide](../AI_PLAYTESTER.md).

## MB-08 — AI strategy improvements, branch ai

DISAHKAN: Ijamm requests actual support-value measurement, multi-turn planning and synergistic acquisition. The AI developer harness consumes candidate.3 without changing numerical profiles. Named effect units/efficiencies and observed contextual deltas remain distinct; acquisition scores are heuristics. The shared specialist replay receives optional observation/policy callbacks only. Default specialist policies, source snapshots and pupil win-rate interpretation remain intact. [Design](../superpowers/specs/2026-10-24-ai-strategy-design.md), [verification](../verification/ai-strategy.json).

## MB-09 — AI main publication

DISAHKAN, 24 October 2026: Ijamm now authorizes publishing the completed AI update to main. This supersedes MB-07's ai-only boundary. The integration retains main game 2.32.1 and candidate.3 numeric profiles. Current support telemetry and sampled strategy remain developer diagnostics; pupil targets and exhaustive synergy validation remain unmeasured. [Fresh integration checks](../AI_PLAYTESTER_MAIN_2026_10_24.md).


## MB-10 — Card effects, feature build 2.33.0 / main 2.34.0

DISAHKAN: approved card audit, feature-branch publication only. Current binding is `master-1.4.0-candidate.4`; the earlier candidate.3 descriptions and measurements above remain historical where superseded. [Card effects 2.33.0](../CARD_EFFECTS_2_33_0.md) owns current percentage phases, affected values and growth caps. No enemy/difficulty/economic/map/question numbers change. Old save keys and measured cohorts remain intact. Pupil targets are still unmeasured.

## MB-11 — Card effects main integration, 2.34.0

DISAHKAN: Ijamm's follow-up “okay push ke main” supersedes MB-10's feature-only publication boundary. Merge card-effects `a9c49f0` with main `c54ce92` / 2.33.0 and identify the combined release as 2.34.0. Preserve both AI and audio histories. The AI consumes candidate.4 and uses actual engine incoming-damage calculations; phase-based status ownership and emergency retention telemetry follow the new rules. Older numeric AI reports remain evidence of their original candidate.3 source, not measurements of this revision. [Integration evidence](../CARD_EFFECTS_MAIN_2_34_0.md).


## MB-12 — Card tuning follow-up, assistant branch only

DISAHKAN: Ijamm's latest instruction authorizes this follow-up on `balance/card-effects-20261024` only; MB-11's earlier main approval applies to 2.34.0. Current branch identity is `master-1.5.0-candidate.5`. Last Page draws 2 +1 when Hand is empty; Recall costs 0 with Exhaust. Master Mana Barrier remains 7X with its existing Focus and upgrade allocation. Profiles, enemies, artifacts, economics, map and questions are unchanged. Candidate.4 saves and numeric cohorts remain historical and separate. [Current owner](../CARD_TUNING_2_38_0.md), [audit](../audits/card-effects/LATEST.md).


## Card tuning main publication — 2.40.0

DISAHKAN: Ijamm now authorizes publishing the completed card follow-up to main and updating the version. Integrate bb5f93b with current main ade5d3a /2.39.0 as2.40.0, preserving education reports/hints, status explanations/readiness and Dev Settings. Three approved card values and AI actual-choice accounting retain their feature owner; ordinary v0/v1 rules/payments/offers and Master candidate.5 keys remain separated. [Fresh combined-tree evidence and limits](../CARD_TUNING_MAIN_2_40_0.md).

## MB-13 — Current-source Master and AI refresh

DISAHKAN: Ijamm asks Master to read Combat/Map/Economy branch work, update necessary scope and AI, and put the result on its branch before main. DITERUSKAN: base main45d2378/game2.41; branch prerelease2.42.0-balance.1, candidate.5 unchanged. Adopt explicit Master map runtime/identity, correct gross Gold/canonical quotes and final-boss Gold; improve marginal artifacts and frozen Mystery decisions in sampled-turn-search-3. Preserve all numerical owners, topology, historical rules/saves and original assets. Historical candidate.4 evidence is not relabeled. Human targets and universal tuning remain unverified. [Handoff](../balance/master/REFRESH_2026_10_24.md), [audit](../audits/balance-master/LATEST.md).

## Main publication — 2.42.0, 24 October 2026

DISAHKAN: Ijamm now requests publishing the completed Master refresh to main. This supersedes the original branch-only boundary for balance/master b281dc69e752f84424b81d0d051644b9da154dd9. Base main45d2378302196d9b0b79af7b371e6f16d4f5768c remains the first merge parent; the reviewed Master branch is the second. Publish game2.42.0 through shared release metadata. Mastercandidate.5, numerical values, ordinary saves/rules, map, questions and artwork stay unchanged. Original prerelease cohorts retain their source identities. [Combined release and fresh checks](../balance/master/MAIN_RELEASE_2_42_0.md).
