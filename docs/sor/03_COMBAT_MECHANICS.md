# 03 — Mekanik tempur dan turutan giliran

Status: angka asas DITERUSKAN; timing dan peraturan terperinci CADANGAN. Ini sasaran kontrak, bukan laporan kod prototaip.

## Baseline

| Parameter | Nilai |
| --- | --- |
| HP maksimum awal MC | 60 |
| Tenaga pada awal giliran | 3 |
| Cabutan biasa setiap giliran | 4 kad |
| Saiz starter deck | 12 kad |
| Ramalan | Maksimum sekali setiap giliran; boleh langkau |
| Fokus | 0–3; +1 bagi Ramalan betul |
| Perbelanjaan Fokus | Pilihan 1 Fokus untuk +2 damage atau +2 perisai pada satu kad layak |
| Musuh aktif MVP | Satu pada setiap encounter |

Fokus dan cara membelanjakannya ialah cadangan baharu. Bonus tidak menambah tenaga, tidak boleh digandakan pada kad sama dan tidak terpakai pada Taktik. Pada kad multi-hit, +2 ialah tambahan **jumlah** damage, dimasukkan pada hit pertama.

## Lifecycle battle

1. Bina battle deck daripada run deck dan reset HP musuh, perisai, Fokus serta kawasan sementara.
2. Shuffle menggunakan RNG battle; papar musuh dan intent pertama.
3. Jalankan giliran pemain, kemudian giliran musuh sehingga hasil tamat.
4. Selesaikan kemenangan/kekalahan tepat sekali; tutup battle input.
5. Buang keadaan sementara. Hanya HP pemain, deck run dan progres yang dibenarkan dibawa ke node seterusnya.

**CBT-01:** Run deck tidak dipadam oleh Tapis, cabutan atau discard. Setiap salinan kad mempunyai instance ID berasingan.

## Awal giliran pemain

1. Kosongkan perisai pemain lama; tetapkan tenaga kepada 3.
2. Pastikan intent musuh untuk giliran ini sudah dipaparkan.
3. Tawarkan Ramalan daripada snapshot draw pile sebelum cabutan biasa. Snapshot mesti mempunyai hasil yang cukup bagi model soalan.
4. Kunci soalan/snapshot dan simpan keadaan `awaiting_prediction`. Jawapan betul memberi +1 Fokus sehingga had 3; jawapan salah tidak menolak HP/Fokus.
5. Papar penerangan. Selepas betul, salah atau langkau, cabut empat kad dan simpan keadaan `player_action`.

Jika tiada soalan sah, langkau Ramalan secara automatik dengan mesej ringkas. Cabutan biasa tetap diteruskan. Pemain yang mematikan Ramalan dalam tetapan masih boleh bermain tetapi tidak mendapat Fokus daripada soalan.

## Mainkan kad

**CBT-02:** Turutan transaksi: sahkan fasa → kad dalam tangan → sasaran sah → tenaga cukup → pilihan tambahan/Tapis sah → potong kos → resolve kesan → pindahkan kad → semak hasil → simpan → mainkan VFX.

Kad yang sedang dimainkan dikeluarkan daripada tangan ke kawasan resolving supaya ia tidak dicabut semula oleh kesannya sendiri. Selepas resolve, masukkan ke discard kecuali definisi kad menyatakan zon lain.

Pembatalan sebelum commit tidak menggunakan tenaga. Selepas commit, animasi yang dihentikan atau dilangkau tidak membatalkan keputusan.

**CBT-03:** Damage ditolak daripada perisai sasaran dahulu, kemudian HP. HP minimum 0 dan heal tidak melebihi HP maksimum. Perisai kekal sehingga waktu luputnya; bukan ditolak automatik selepas satu hit.

**CBT-04:** Apabila draw pile kosong, shuffle discard ke draw pile ketika kad seterusnya diperlukan. Hand, resolving dan kawasan Tapis tidak disertakan. Jika kedua-dua pile kosong, berhenti mencabut tanpa soft-lock.

## Tamat giliran dan tindakan musuh

1. Pemain mengesahkan Tamat Giliran; kunci input.
2. Buang baki tangan ke discard. Tenaga berbaki luput.
3. Pada awal giliran musuh, kosongkan perisai musuh lama.
4. Resolve intent yang sudah diumumkan; setiap kesan hanya sekali.
5. Jika battle belum tamat, jadualkan intent seterusnya dan mulakan giliran pemain.

Perisai musuh yang diberikan dalam langkah 4 melindunginya sepanjang giliran pemain berikutnya. Perisai pemain melindungi pemain sepanjang giliran musuh ini dan luput pada awal giliran pemain seterusnya.

## Fasa boss

Pada HP boss pertama kali menjadi ≤50% dan masih >0, tandakan fasa kedua. Intent yang sudah dipaparkan **kekal** untuk giliran musuh seterusnya. Selepas intent itu dilaksanakan, intent baharu bermula pada indeks 0 pola fasa kedua. Perubahan fasa tidak menghasilkan serangan segera.

## Hasil dan idempotensi

- **CBT-05:** Semak kematian selepas setiap kesan atomik. Jika musuh mati, jangan jalankan baki tindakan musuh.
- **CBT-06:** Baseline tidak mempunyai revive atau damage serentak. Jika peluasan menyebabkan kedua-dua HP 0 dalam transaksi sama, kekalahan pemain diutamakan dan rule baharu mesti didokumenkan.
- **CBT-07:** Double-click, input ketika animasi, refresh dan resume tidak boleh mengulangi kos, Fokus, damage, ganjaran atau kemajuan node.
- **CBT-08:** Simpan RNG dan soalan yang sudah ditetapkan. Refresh tidak memberi cubaan kedua atau susunan baharu.
- **CBT-09:** Fokus dan perisai reset pada battle baharu; tenaga reset setiap giliran. HP pemain berterusan sepanjang run kecuali heal yang dinyatakan.

Kontrak kad di [04](04_CARD_SYSTEM.md), RNG/save di [13](13_TECH_ARCHITECTURE_DATA.md), dan semakan kritikal di [15](15_QA_RELEASE.md).

## Penyelarasan 2.0 — label dan Passive

Teks BM dalam penerangan ini ialah dokumentasi. Label game: Energy, Block, Focus, Predict, Draw dan Filter mengikut [10](10_UI_UX_ACCESSIBILITY.md).

**CBT-10:** Gambar Passive tidak mengubah giliran ini. Ward belum aktif; jangan memberi 1 Block setiap turn daripada imej sahaja. Reset Block dan timing sedia ada dikekalkan.

Predict sebelum draw kekal T1 Probability. Challenge T2/T3 memerlukan penempatan/trigger tersendiri; jangan memasukkan soalan algebra ke snapshot peluang tanpa kontrak.

## Artifact Edition 2.4

The explicit artifact implementation request adds event-driven Starting, Elite/Mystery and Boss effects. Base card, Focus and probability rules retain their owner. Strength modifies Attack damage, Agility modifies Defense Block; per-card bonuses occur before enemy mitigation. Reset order, Exhaust batch ordering, thresholds, retaliation and persistent counters are specified in SOR 19. All numeric artifact values are sourced from artifact-data.js, derived from the supplied V3.1 catalogue.

## Run result clock — 2.9.0

**CBT-11:** Record `finished` once in the synchronous defeat, final-victory or Stage 1 clear transaction. Result Time uses that timestamp minus `started`, never a fresh wall clock. Menu/dialog visits, reload, export and import preserve it. Continuing Stage 2 removes the intermediate timestamp before making its checkpoint. The existing elapsed wall-clock convention during an unfinished run is retained.


## Supplied 40-card mechanics and display — 2.18.0

The explicit request to apply the supplied 40-card package supersedes the earlier Passive exclusion and eight/twelve-card pool baseline. Current scope, stable-ID compatibility, base values/upgrade extension, transaction and rendering owners: [Cards and display 2.18.0](../CARDS_AND_DISPLAY_2_18_0.md). Source-authoritative mechanics remain playtest tuning.


## Combat and Predict — 2.19.0

DISAHKAN: the compact combat HUD has live status badges, active/triggered Passive cards and chronological actor/turn logs. Preserve all supplied card amounts and conditions: only Last Ember grants Focus in the 40-card package, alive at HP <=30%, once/combat, cap 3. Show actual capped gains. Passive cards never spend armed Focus. Ember Core stops its trigger bookkeeping when the focused card already killed the sole enemy. Predict now uses the shared 120-question run ledger; legacy saved predictions remain supported. See [Combat and Predict 2.19.0](../COMBAT_AND_PREDICT_2_19_0.md).


## Passive and supplied audio — 2.20.0

The cap and swap request is DISAHKAN. DITERUSKAN: three active Passives per combat (not a deck ownership cap), with an unpaid fourth-card choice and atomic paid replacement. Remove outgoing ongoing/stat contributions, retain resolved results and bounded combat trigger history, and avoid hand-discard artifact hooks. Legacy over-cap saves trim free after existing pending sessions. `DCConfig.PASSIVE_LIMIT` and card-combat own the rule. See [Passive and Music 2.20.0](../PASSIVE_AND_MUSIC_2_20_0.md).


## Combat balance experiment — 23 October 2026

CADANGAN: branch `balance/combat`, base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`, evaluates SOR Balance v1.2 through the real engine in an isolated Node loader. Candidate values are development-only; no player numeric data, loot/prices, IDs, artwork or questions are activated/changed. See [Combat/Card Synergy handoff](../balance/combat/SOR_COMBAT_CARD_SYNERGY.md), raw results and CSVs for measured context and limitations. Optional explicit-upgrade execution fields preserve existing definition fallbacks. Human full-run win targets remain unverified.


## Deep Combat/Synergy follow-up — 23 October 2026

DISAHKAN: Ijamm requests deep evolved-deck/Predict/setup/exploit/artifact-trigger testing. The development-only harness and measured handoff are in [Deep Combat report](../balance/combat/deep-results/DEEP_COMBAT_REPORT.md). Candidate Hard/growth risk requires Master review with Economy/Map; bot results are not student win rates. Production numbers, ID/assets/questions and Economy policy are unchanged by this follow-up.


## Master integration — game 2.27.0

The explicit Easy/Medium/Hard playtest now uses the integrated [Master SOR](23_MASTER_BALANCE.md). It supersedes the earlier integration gaps only for that versioned candidate. See [Master handoff](../balance/master/HANDOFF.md) for actual source/validation and unmeasured pupil targets; legacy entry and historical specialist evidence retain their own definitions.


## Percentage status phases and Last Ember — 2.33.0

DISAHKAN: Ijamm approves all card-audit proposals, initially for feature-branch publication; the later “okay push ke main” instruction authorizes integration as game 2.34.0. [Main integration](../CARD_EFFECTS_MAIN_2_34_0.md). The new ordinary/Master percentages, phase timing, card values, fallback search, Passive growth/activation and prior-save contracts supersede the corresponding earlier rules for new runs. Owner: [Card effects 2.33.0](../CARD_EFFECTS_2_33_0.md). Unmarked ordinary runs retain their original definitions; do not reinterpret old receipts.

## In-game question workspace — 24 October 2026

Bank Predict consumes the turn on its second wrong answer, with zero Focus and no boss seal. Keep independent first-try Focus and any-correct seal gates; retry/help never grants first-try credit. Failure counters are separate from correct/assisted counters. Close/reload cannot add a reward or duplicate log. Snapshot live-deck predictions remain historical compatibility. [Current contract](../education/GAME_QUESTIONS.md).


## Education main integration — 2.36.0, 24 October 2026

DISAHKAN: Ijamm now requests publishing education-report to main. This supersedes
the earlier branch-only publication boundary. Merge af03f38 with main beb4a4d,
retaining the current tutorial, card rules, AI and production Dev access. Align
tutorial exercises/text, AI attempt termination and developer collection routes
with the versioned question policy. Run fresh combined-tree tests and record
actual results in [the main release](../education/MAIN_2_36_0.md). Earlier reports
remain historical evidence; live Google and pupil/device validation are separate.


## Current Combat/Synergy recheck — 24 October 2026

DISAHKAN: Ijamm requests a fresh current-main recheck and publication to balance/combat for Master, excluding main. Runtime50d3af4/game2.36.0 (ordinary card-effects-1; Master candidate.4) is remeasured; all24 loaded production dependencies remain identical at6376a22/game2.37.0, whose other changes are preserved. New internal evidence covers all40 states, complete selected pair/triple factorials, Focus opportunity cost, real campaigns and artifact/restore contracts. No runtime values or CP UI are changed. Historical numbers retain their original profiles. Current owner/report: [Combat recheck handoff](../balance/combat/recheck-2026-10-24/HANDOFF_MASTER.md); [branch audit](../audits/balance-combat/LATEST.md). Pupil90/70/50 remains unmeasured; ordinary Spool scope is a recorded latent discrepancy, not silently fixed.
