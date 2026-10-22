# 13 — Seni bina, kontrak data, RNG dan simpanan

Versi: 2.0.0. Kontrak baharu ialah cadangan. Source code prototaip belum diaudit dalam penyediaan SOR ini. Gunakan teknologi projek sedia ada sebelum mempertimbangkan migrasi.

## Pembahagian tanggungjawab

| Modul logik | Tanggungjawab | Tidak dimiliki |
| --- | --- | --- |
| Combat engine | Fasa, kos, kesan, HP dan hasil | DOM, animasi, audio |
| Math engine | Snapshot, peristiwa, pecahan, jawapan | Reward atau pose musuh |
| Content/data | Kad, musuh, stage, strings, token | Mutasi state battle |
| Run progression | Node, reward, kem, tamat run | Formula kebarangkalian |
| Save service | Validate, version, save/load dan recovery | Menentukan damage |
| Presentation | UI, input, animasi dan akses | Mengira semula keputusan secara berbeza |
| Asset registry | ID, path, anchor, versi, lesen | Teks atau kos kad |

Ini sempadan logik; tidak perlu satu package/service berasingan bagi setiap modul. Untuk MVP, satu aplikasi frontend dengan simpanan browser mencukupi sebagai baseline. Backend/DB bukan prasyarat.

## Peraturan state

- **TEC-01:** Satu authoritative state; UI memaparkan state itu. Elakkan salinan HP/tenaga berbeza di komponen.
- **TEC-02:** Input pemain menjadi command; validator memeriksa state; resolver menghasilkan state/event baharu.
- **TEC-03:** Setiap command transaksi mempunyai ID dan event sequence. Command sudah diproses tidak diproses dua kali.
- **TEC-04:** Nilai balans/data tidak ditanam dalam komponen animasi atau teks.
- **TEC-05:** Async callback daripada battle lama mesti ditolak selepas skrin/run bertukar.

## Kontrak data minimum

| Entiti | Medan wajib |
| --- | --- |
| CardDefinition | id, nameKey, type, affinity, cost, rarity, target, effects, upgrade, assetId |
| CardInstance | instanceId, definitionId, upgradeLevel |
| EnemyDefinition | id, nameKey, maxHp, intentPatterns, phaseRule, assetId |
| StageDefinition | id, nodes, edges, startNodeId, bossNodeId, backgroundAssetId |
| Question | id, topicId T1/T2/T3, subtopicId, answerType, promptKey, answer, explanationKey, hintKeys; T1 menambah context/snapshot/replacement/events |
| ProbabilitySnapshot | id, eligibleInstanceIds, counts, knownConditions, drawCount, ordered, replacementMode |
| RewardOffer | id, sourceNodeId, definitionIds, selectedId, claimed |
| SaveEnvelope | schemaVersion, contentVersion, sorVersion, savedAt, run, settings |

ID stabil dalam data; nama BM boleh berubah tanpa merosakkan save. Jangan serialise fungsi, objek renderer atau reference DOM.

## RNG yang boleh diteruskan

**TEC-06:** Gunakan seed dan state PRNG yang disimpan. Pisahkan stream draw, reward dan question supaya animasi atau pilihan soalan tidak mengubah susunan deck.

**TEC-07:** Fisher–Yates atau algoritma shuffle yang betul menggunakan RNG tersuntik. Jangan gunakan sort dengan comparator rawak.

**TEC-08:** Simpan state RNG selepas transaksi dan hasil yang sudah dikunci. “Seed sama” sahaja tidak mencukupi jika bilangan panggilan RNG berubah antara versi.

Pelaksanaan PRNG/versi algoritma mesti dinyatakan dalam contentVersion atau medan khusus. Pemilihan kad bebas penggantian mengubah bilangan hasil secara nyata.

## Kandungan save run

Run menyimpan ID, status, stage/node, completedNodeIds, HP/maxHP, deck instances, masa aktif dan reward/kem yang belum selesai.

Jika battle sedang aktif, simpan musuh/HP/fasa, pendingPhase dan intent terkunci, turn/phase, tenaga/Fokus/perisai, hand/draw/discard/resolving/filtered, soalan/snapshot serta status jawapan, event sequence dan semua state RNG.

**TEC-09:** Boleh menyimpan selepas setiap transaksi stabil. Jika browser refresh ketika resolving, pulihkan checkpoint sebelum transaksi atau state selepas commit; jangan sambung separuh kesan.

**TEC-10:** Autosave selepas mula run, cabutan, jawapan, kad resolve, end turn, hasil battle, reward, kem dan tetapan. Papar status gagal jika operasi gagal; jangan mengaku tersimpan.

## Pengesahan dan recovery

Validate bentuk schema, ID kandungan, HP/julat integer, instance unik, setiap kad tepat satu zon battle, node transition dan reward claim. Run deck ialah rujukan pemilikan; ia tidak dikira sebagai zon battle tambahan. Medan rosak tidak boleh menyebabkan crash loop.

Simpan satu backup terakhir yang sah. Jika save tidak serasi, tawarkan backup atau run baharu dengan penjelasan; jangan padam simpanan lama secara senyap. Migration mesti diuji dengan contoh versi terdahulu sebelum schemaVersion dinaikkan.

Save browser ialah kemudahan sambung permainan, bukan sumber berautoriti untuk leaderboard atau pemarkahan rasmi. Jika ciri tersebut diperlukan kelak, reka kontrak pelayan berasingan.

## Pengendalian input dan aset

Input nombor di-parse secara terkawal; tiada eval atau HTML mentah daripada input pemain. Aset gagal mempunyai fallback; kad tetap memaparkan teks dan battle tidak tersekat kerana satu gambar hilang.

Tiada rahsia/API key dalam bundle frontend. Jangan tambah dependency berat hanya untuk fungsi kecil yang telah tersedia dalam projek.

## Penerimaan

Resolver boleh dijalankan tanpa renderer; evaluator berkongsi snapshot; seed/save menghasilkan sambungan konsisten; double-click ditolak; save rosak mempunyai recovery; semua angka UI datang daripada state/data.

Semakan terpenting disenaraikan dalam [15](15_QA_RELEASE.md).

## Kontrak 2.0 — route, room dan bahasa

**TEC-11:** Stage disimpan sebagai graph nodes/edges. RoomNode: id, stageId, roomType, encounterId/eventId/shopId jika relevan, serta musicCueId. Jenis room ialah entry, battle, elite, rest, shop, mystery atau boss.

**TEC-12:** Run menyimpan currentNodeId, chosenEdges, visitedNodeIds, completedNodeIds dan graph seed/hasil graph terkunci. Validate edge, reachability boss dan ketiadaan cycle. Jangan menentukan next room dengan index+1.

**TEC-13:** ShopState menyimpan offerId, stock, price, bought/left; EventState menyimpan offer/options/selected/resolved. Gold, kad dan claim dikemas kini atomic dengan event ID supaya reload tidak menggandakan manfaat.

**TEC-14:** Simpan Gold dan cue/setting audio yang diperlukan. Pilih music daripada stage/room state; cue rendering tidak memanggil RNG gameplay.

**TEC-15:** UI strings English di registry. Card definition ID lama kekal; adapter boleh memetakan Taktik kepada Skill dan Benteng/Lindung kepada Guard. Passive feature disabled dan tidak dimasukkan pool aktif.

Jika save linear sudah wujud, audit schema sebenar dahulu. Migration boleh mengekalkan node selesai dan memetakan route yang setara; jika pemetaan tidak selamat, simpan backup dan tawarkan recovery. SOR 2.0 bukan bukti schema runtime telah dinaikkan atau migration telah diuji.

## Source Edition 2.0 update

The user requested a rebuild against nine current menu references plus the supplied arena/MC/enemy/music packages. Runtime evidence, exact scope, source mappings, new Shop tuning, route-version compatibility and limits are maintained in [Source Edition](../SOURCE_EDITION.md), decisions 35–39, `DESIGN.md` and `UX-CONTRACT.md`. Earlier prototype examples in this document remain history where superseded. The implemented evaluator remains Probability; other planned math modes are not claimed active.

## Artifact Edition 2.4 additive save contract

Run format remains 1. Optional versioned artifactState stores independent RNG, unique owned IDs, source acquisition records, initial selection and pending frozen offers. New Challenge uses scene master until a valid claim. Existing saves without the field do not receive retroactive gifts. Battle artifacts persist counters, used flags, die, Energy budget and Clasp contribution. Restore validates Max HP/resources against owned effects without replaying them. Stage 2 checkpoint includes the chosen Boss artifact; retry restores the exact artifact snapshot. Details and actual tests: SOR 19 and docs/ARTIFACT_EDITION_2_4.md.

## Education 2.5 additive state and exposure history

`educationState` version 1 is optional for backward compatibility. It stores bankVersion, independent RNG, unique usedIds, completed claim-source records and one pending trial. Pending identifies the frozen artifact offer and bank item, choiceOrder, selectedId, attempted choice IDs, hinted and solved. The bank ID owns the prompt and correct key; imported display text cannot replace them. Scene `education` is validated against its owning master/reward/event/stageclear context before any claim. Pending offers remain unclaimed until the answered trial's final synchronous engine transaction commits artifact effect and original progression together.

The profile key `duel-cube-question-history.v1` stores the bank version and seen IDs on the same browser origin. app.js unions profile, in-memory and run IDs before choosing and saving. It writes the exposure reservation before the current run, so a refresh cannot draw that reserved ID afresh. Export carries the run's accumulated exposure set. Import/Retry never deliberately erase profile history. Browser storage failure keeps the in-memory trial playable with an Export warning; cross-session persistence cannot be promised when storage fails. An unreadable/incompatible history is preserved and reported rather than silently reset.

Completed trials record question/source, artifact, attempts and hint use separately from Predict mastery. Stage 2 checkpoints include the completed Boss trial. A saved Elite card reward is also represented in the ended battle's discard snapshot until that room completes, preserving the one-zone-per-owned-card invariant while its artifact trial is pending. No draw, play, discard-trigger effect or RNG call is fired by this bookkeeping.

Existing saves without educationState remain at their original scene; an unclaimed offer gains the gate when Claim is pressed. No retroactive artifact/question is injected into a completed room. Runtime 2.5 is required to read an active education scene; export before intentionally rolling back to an older runtime. Details and actual evidence: docs/EDUCATION_UPDATE_2_5_0.md.

## Optional calculation snapshots — 2.6.0

Save version remains 1. `calculationState` is additive and optional: `{version:1,nextId,entries}`. Entries store monotonic ID, source label, artifact IDs, stage/room/turn and separate results with label, integer value, explicit unit, kind, before, after and bounded explanation lines. The latest 64 entries are retained; values in deltas must equal after minus before. Other result values must equal their recorded after value. IDs, known units, shapes, text lengths, ordering and bounds are checked by `DCRichText.valid` during normal engine validation, including checkpoints. Older saves omit this field and resume normally.

Engine/artifact resolvers append snapshots after state changes. Rendering only reads them. Snapshots neither change the game RNG nor replay effects during restore. Display values and explanation strings are escaped. They are an explanation history for a local game, not a security proof or learning score; imported historical strings are not used to resolve gameplay. Source example snapshots are excluded from the runtime data bundle. Existing artifact/question/RNG schemas and trial commit ownership remain intact.

## Result clock and old hand saves — 2.9.0

Save version remains 1. `finished` is an optional finite timestamp, no earlier than `started`, valid only for the resolved result context (including its pending Boss artifact/education context). New results store it at resolution. A legacy result lacking it is stamped once on restore and immediately saved by the app. Its historical death time cannot be reconstructed because earlier saves did not record it. Existing victory timestamps are retained.

Restore normalizes overfull legacy hands after validation, preserving excess UIDs on top of Draw in original hand order. This compatibility repair neither shuffles nor fires triggers. Runtime draw enforces the single config cap for cards and artifacts; rich-text calculations report actual moved cards.


## Parchment map and integrated mechanics — 2.11.0

2.11.0 preserves run format 1 and educationState version 1, accepting old bankVersion form4-review-1.0.0. Its optional session field stores the supplied canonical ordered event log and dedicated question RNG. Host pending data is checked against replayed attempts, Hint and correct status; a revealed/forged record cannot unlock Claim. The same-origin question history optionally carries the session; merging retains exposures and closed evidence while allowing only one pending reservation. Abandoned conflicting pending records retain exposure without new credit. Legacy completed records lack enough evidence to invent skill scores. Optional stmArtifactUI is derived Challenge presentation state; core resources/ownership never read it as authority. Import cap is 2 MB for session/checkpoint growth. STM_SHARED is the single tooltip hub; source renderers sanitize MathML/SVG and keep calculations gated.


## Map, modes, Boss and Shop — 2.12.0

2.12 additive shop version 2: six frozen card offers/base prices/sale, card bought indices, ownedBefore entry snapshot, six tiered artifact offers and bought indices, and removed physical card or null. Restore recomputes offers, validates all purchase/ownership sources and rejects forged price/tier/sale/removal state. Legacy three-card shops continue until departure. Paid purchases are synchronous, once-only and independent of question/animation RNG. Artifact state may exist in Learn after paid purchase; optional shopOnly:true represents a legacy Challenge without an opening gift, without retroactive acquisition. No replay of purse/ration on restore. Run schema/key stays 1.


## Mystery Events — 2.13.0

Optional mysteryState v2 owns independent RNG, used event IDs, frozen offers, question/choice/deadline/outcome, selected targets, settlement keys, modifier queue and Max HP sacrifice. Artifact trades add a validated consumed ledger; education accepts Mystery exposures in both modes. Required random payloads are validated before restoring/importing. Run envelope stays version 1; source and schema details: [MYSTERY_EVENTS.md](MYSTERY_EVENTS.md).

## Education Practice — 2.14.0

Run schema and engine transaction ownership remain version 1. Education accepts previous bank versions 1.0/1.4/1.5 and current 1.6, preserving stable question/choice bindings and ordered events. Practice exclusively owns `slay-the-math.education-practice.v1`; it never merges with active run or rewarded exposure history. A generated isolated folio document receives the active bank/glossary/foundations at open time. There is one source bank, no fetch, no additional runtime package and no combat reward path from practice. Build regenerates its template and the offline HTML; the latter is a local ignored output because current source assets exceed GitHub's per-file limit. Details and compatibility checks: [Education 2.14.0](../EDUCATION_PRACTICE_2_14_0.md).


## Question feedback — 2.15.0

`slay-the-math.question-feedback.v1` exclusively owns versioned per-question comments, independent of run, rewarded history and Learning. Merge fresh records on write, preserve corrupt originals, retain failed writes in memory and offer explicit CSV/JSON export. Never submit automatically or invent a receiver. Native Share is an explicit user action with download fallback. The host accepts exit confirmation only from the current same-origin practice frame. No run schema/bank/answer/RNG changes. Owner: [Question feedback](../QUESTION_FEEDBACK_2_15_0.md).


## Question language — 2.16.0

Whole-question English/Bahasa Melayu is implemented on education. Source review, scope and validation: [Question language](../QUESTION_LANGUAGE_2_16_0.md).
