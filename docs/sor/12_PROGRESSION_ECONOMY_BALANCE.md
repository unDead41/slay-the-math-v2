# 12 — Progres, Gold, reward dan balance

Versi: 2.0.0. Shop/Rest/Mystery/Elite dalam skop terkini. Semua nilai berikut CADANGAN untuk playtest; tiada dakwaan runtime sudah melaksanakannya.

## Ganjaran laluan

**BAL-01:** Battle biasa, Elite dan boss stage 1 menawarkan pilih satu daripada tiga definisi kad aktif atau Skip. Boss stage 2 terus ke ringkasan.

**BAL-02:** Tawaran tiga definisi unik daripada lapan kad aktif [04](04_CARD_SYSTEM.md), seragam tanpa pengulangan dalam tawaran. Ward/Passive draf dikecualikan.

**BAL-03:** Offer dan claim disimpan; refresh tidak menjana semula. Pemain boleh memiliki banyak salinan definisi sama.

Saiz deck = 12 + reward dipilih + pembelian − kad dibuang secara sah. Tiada saiz akhir global 17: Shop boleh menambah kad. Contoh graph [09](09_WORLD_STAGE_LEVEL.md) memberi lima peluang reward kad sepanjang run sebelum tamat, serta Shop pada laluan yang dipilih.

## Gold dan Shop

| Parameter | Nilai cadangan |
| --- | --- |
| Gold mula | 50 |
| Menang battle biasa | +15 |
| Menang Elite | +30 |
| Boss stage 1 | +40 |
| Kad asas di Shop | 40 |
| Stok | 3 definisi unik daripada pool aktif |
| Had beli | 1 kad setiap Shop yang dilawati |

**BAL-04:** Kos jelas sebelum Buy. Pembelian memotong Gold, menambah satu instance dan menanda stok/room dalam transaksi sama. Tiada Gold negatif, jual/beli tanpa had atau restock selepas reload.

Belum ada servis remove-card, jual kad atau relik. Jangan membina sistem itu kerana ia lazim dalam genre.

## Rest dan Mystery

Rest: heal 10 HP sehingga maksimum 60 atau upgrade satu instance sekali. Tiada heal automatik selepas battle. Pilihan tidak berguna disabled; Continue tersedia.

Cadangan event Mystery minimum: pilih “Take 10 Gold” atau “Recover 5 HP”, dengan hasil sebenar dipratonton. Pilihan heal disabled jika HP penuh. Setiap room hanya satu pilihan; cadangan ini bukan bank event penuh.

## Sumber tempur

HP berterusan; Focus/Block reset pada battle baharu, Energy reset setiap giliran. Salah Predict tidak menolak HP/Focus. [03](03_COMBAT_MECHANICS.md) kekal pemilik timing.

## Sasaran dan ujian

| Ukuran | Sasaran untuk diuji |
| --- | --- |
| Tutorial asas | 3–5 minit |
| Battle biasa | 2–4 minit |
| Boss | 4–7 minit |
| Run dengan room tambahan | 25–40 minit aktif |
| Menang pemain baharu selepas tutorial | 40–70% dalam sampel awal |

Julat ini hipotesis, bukan hasil kajian. Banding route normal/Elite, Shop/Mystery, strategi Attack/Defense/Skill dan run dengan banyak Predict dilangkau.

**BAL-05:** Ubah satu kumpulan nilai pada satu masa. Rekod versi, seed, route, HP, Gold, deck, giliran, hint/skip dan sebab kalah.

**BAL-06:** Jangan memanipulasi draw tersembunyi atau formula untuk membetulkan balance. Nilai kad mengambil kira kos, draw, Block dan thinning, bukan damage sahaja.

Sampel kecil dilaporkan sebagai bilangan dan konteks. Analitik jauh atau maklumat peribadi murid bukan prasyarat.

## Penerimaan

Shop memberi pilihan bermakna tanpa Gold negatif; event/kem/reward berlaku sekali; boss tetap wajib dicapai; route berisiko mempunyai manfaat yang diuji; passive draf tidak mengubah ekonomi.

## Source Edition 2.0 update

The user requested a rebuild against nine current menu references plus the supplied arena/MC/enemy/music packages. Runtime evidence, exact scope, source mappings, new Shop tuning, route-version compatibility and limits are maintained in [Source Edition](../SOURCE_EDITION.md), decisions 35–39, `DESIGN.md` and `UX-CONTRACT.md`. Earlier prototype examples in this document remain history where superseded. The implemented evaluator remains Probability; other planned math modes are not claimed active.

## Artifact Edition 2.4 override

The user's implementation request supersedes the earlier no-artifact scope. New Challenge: one of three eligible random Starting offers before map. Elite: existing card reward then one artifact; Mystery: optional artifact discovery; Boss Stage 1: one of all three Boss artifacts before the next checkpoint. Ration gives +5 Max HP once, Purse +25 Gold once, and Shop uses the best owned 5%/15% discount with ceil rounding. Values remain source-proposal tuning, not a balance guarantee. Complete ownership/compatibility rules: SOR 19.


## Map, modes, Boss and Shop — 2.12.0

2.12 user override: six unique Shop card offers (3×2), exactly one random seeded 60% sale, paid removal once per visit, six artifact slots (3 Starting/2 Elite-Mystery/1 Boss, 3×2). Both modes support paid purchases; Challenge free gift education remains. Config defaults: artifacts 80/140/220 Gold, removal 50 Gold, minimum deck ten. Sale reduces normal card base price by 60%, then best owned artifact discount applies with ceil/minimum-one rounding; discounts update immediately after purchase. IDs/base prices/sale slot never reroll. Sold-out artifact tiers keep empty slots. Existing visits retain their legacy three-card stock. These numbers are reversible implementation tuning. Full transactional/save policy: GAME_UPDATE_2_12_0.md.


## Mystery Events — 2.13.0

Mystery v2 rewards/costs/failures now follow [MYSTERY_EVENTS.md](MYSTERY_EVENTS.md). Correct optional trades charge only at confirmation, costs and bundles commit atomically, and wrong/timeout/abandon damages are nonlethal outside combat. Mystery removal may leave one card (nonempty deck), superseding the old generic Mystery minimum ten. Shop removal retains its own minimum ten. An event Artifact is earned through that event’s shared-bank question and is not gated by a second Artifact question.


## Supplied 40-card mechanics and display — 2.18.0

The explicit request to apply the supplied 40-card package supersedes the earlier Passive exclusion and eight/twelve-card pool baseline. Current scope, stable-ID compatibility, base values/upgrade extension, transaction and rendering owners: [Cards and display 2.18.0](../CARDS_AND_DISPLAY_2_18_0.md). Source-authoritative mechanics remain playtest tuning.


## Combat balance experiment — 23 October 2026

CADANGAN: branch `balance/combat`, base `2800f9aeba5ed594e6ef3f991bcf4dfa498a5de7`, evaluates SOR Balance v1.2 through the real engine in an isolated Node loader. Candidate values are development-only; no player numeric data, loot/prices, IDs, artwork or questions are activated/changed. See [Combat/Card Synergy handoff](../balance/combat/SOR_COMBAT_CARD_SYNERGY.md), raw results and CSVs for measured context and limitations. Optional explicit-upgrade execution fields preserve existing definition fallbacks. Human full-run win targets remain unverified.


## Deep Combat/Synergy follow-up — 23 October 2026

DISAHKAN: Ijamm requests deep evolved-deck/Predict/setup/exploit/artifact-trigger testing. The development-only harness and measured handoff are in [Deep Combat report](../balance/combat/deep-results/DEEP_COMBAT_REPORT.md). Candidate Hard/growth risk requires Master review with Economy/Map; bot results are not student win rates. Production numbers, ID/assets/questions and Economy policy are unchanged by this follow-up.
