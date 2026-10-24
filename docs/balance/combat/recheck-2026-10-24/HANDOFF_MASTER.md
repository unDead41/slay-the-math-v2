# Combat & Card Synergy — Master handoff

24 Oktober 2026, Asia/Kuala_Lumpur. Branch **balance/combat**. Arahan Ijamm: semak semula selepas perubahan main dan push branch untuk Master; tiada main publication atau tuning automatik.

## Status dan sumber

**PERLU UPDATE** bagi keselarasan scope Spool biasa; **VALID dalam skop semakan engine/data yang dinyatakan**; sasaran murid dan kelulusan balance akhir **BELUM DISAHKAN**. Tiada conflict Git yang dikesan semasa branch diselaraskan.

- Runtime diuji: main **50d3af423cdc2240e949f4ddf29e023865304b65**, game2.36.0, ordinary **card-effects-1**, Master **master-1.4.0-candidate.4**.
- Branch Combat sebelumnya **1bf66320ed275755d25734ad907395443f71176f** sudah menjadi ancestor main. Branch kerja dibawa maju dahulu; perubahan chat lain dipelihara.
- Base penerbitan **6376a222169815af582cf55aa4794f3c809a3515**, game2.37.0. Main berubah ketika kerja berjalan; kemas kini ikon/SOR dipelihara. **24 fail pergantungan engine** disemak byte demi byte sama dengan runtime snapshot, bukan laporan lama yang dilabel semula. Bukti: MAIN_PARITY.json dan INTEGRITY.json.
- Before-effects sebenar: **c54ce92fdd8e43544b03a16ed995431da6fdb8f0**, game2.33.0, ordinary asal/Master candidate.3; dibaca daripada objek Git dan disimpan dalam historical-source.json.gz.
- Master SOR1.1.0 dibaca pada awal; versi1.2.0 dan audit dokumentasi main dibaca apabila main berubah. Isu DOC-001/DOC-002 panduan topik/MC kekal di bawah pemilik dokumentasi, bukan ditukar dalam audit combat.

Tiada perubahan angka runtime kad, buff/debuff, musuh, profile, harga/odds, soalan, save, artwork atau UI pemain. Tiada CP ditambah pada UI. Versi game diwarisi daripada main.

## Coverage sebenar

**28,056 execution encounter** dalam **10,106 task** utama, termasuk **368 percubaan campaign** dua stage. Reload dikira dua encounter/pasangan. Audit640 keadaan semasa +640 before,116 contract dan124 probe artifak berasingan daripada jumlah encounter. Saringan setiap cartridge:780 pasangan berbeza +40 duplicate, tag kekal unmeasured.

| Cohort | Tasks | Engine encounters | Invalid | Censored |
|---|---:|---:|---:|---:|
| icp | 3200 | 6400 | 0 | 0 |
| focus | 1200 | 1200 | 0 | 0 |
| pairs | 1872 | 7488 | 0 | 0 |
| triads | 192 | 1536 | 0 | 0 |
| triads_reverse | 192 | 1536 | 0 | 0 |
| evolved | 1080 | 1080 | 0 | 92 |
| roster | 864 | 864 | 0 | 0 |
| clusters | 200 | 400 | 0 | 0 |
| reload | 200 | 400 | 0 | 0 |
| revision | 288 | 1152 | 0 | 0 |
| campaign | 228 | 2645 | 0 | 0 |
| ordinary_campaign | 60 | 699 | 0 | 0 |
| followup | 300 | 1200 | 0 | 0 |
| focus_followup | 150 | 450 | 0 | 0 |
| artifact_gate | 80 | 1006 | 0 | 0 |

Counter worker asal bagi Master mengira room battle/elite/boss. Agregator menambah event room yang benar-benar memasuki combat melalui Predict opportunity, dan menyimpan kedua-dua counter. Ia tidak menganggap setiap Mystery ialah battle. Semua task, part/hash, source dan index diperiksa. **200/200 reload pairs MATCH**, 19,284 boundary reload dalam cohort itu; tiada mismatch.116 contract juga meliputi348 checkpoint restore terarah.

92 censoring Evolved berlaku dalam always-skip Predict:360 kes,0 win,268 loss,92 had benchmark. Ia dikekalkan dalam denominator; bukan92 kekalahan murid, bukan bukti loop. Boss kekal sekurang-kurangnya1 HP ketika seal belum dibuka, termasuk fixed HP damage. Tiada seal dipaksa terbuka dalam power/campaign.

## Perubahan kad dan kekuatan individu

[Indeks40 kad](40_CARDS.md), [CSV640 keadaan sebelum/selepas](../../../../reports/combat-recheck-2026-10-24/40-cards-before-after-all-states.csv), [ICP/CCP](../../../../reports/combat-recheck-2026-10-24/ICP-CCP.csv) dan [Focus](../../../../reports/combat-recheck-2026-10-24/Focus-value.csv) ialah data pembangunan. Audit merangkumi Normal, Focus, Upgrade dan Upgrade+Focus. Passive Focus dilabel tidak layak dan terbukti tidak membayar Focus.

Nilai ordinary dan Master tidak dipool: Twin Shot ordinary masih menerima Strength pada kedua-dua hit, Master pada hit pertama; Layered Shield ordinary menyimpan snapshot Agility bagi grant tertunda, Master fixed. Peratus Weak/Vulnerable, growth4/5 dengan cadence3/2, kos/Exhaust draw baharu, activation gift sekali, fallback search dan emergency retention digunakan mengikut definisi aktif. Lama kekal replay/archive, bukan semakan semula HP/receipt.

ICP:5 seed setiap cell; short wisp/long dealer; ordinary dan Master Medium; deck12, slot diganti Rune Strike dengan upgrade sepadan. Pembukaan physical UID diatur, target diprioriti jika legal, kos sebenar dibayar. Focus: stok awal1, assisted Predict tidak menambah Focus. Normal menyimpan Focus untuk kad lain; focused menggunakannya pada target pertama jika layak. Ini nilai polisi encounter bersyarat, bukan bonus universal setiap cast. Tambahan never-Focus memberi opportunity cost. Passive/delayed payoff short/long ada dalam cell yang sama. Banyak utility loss boleh sama walaupun baki HP musuh berlainan; lihat timeline/remaining HP, bukan menganggap deltaU0 sebagai kad tiada fungsi.

## Kombinasi dan follow-up

Lite asal30 pasangan ditambah9 risiko status/draw/duplicate;4 membership cells setiap seed, A→B dan B→A. Lapan triple asal mempunyai8 cells, forward dan reverse, bukan semua enam permutation. Semua saiz/slot/seed/upgrade/resource dikawal. Membership intervention boleh mengubah draw/RNG exposure secara sah. Setiap cell menyimpan order lengkap, turn, pembayaran dan sama ada kad sempat dimainkan. Jangan panggil semua factorial cell sebagai kombo yang terlaksana pada satu turn.

U=100*win+20*terminalHP/maxHP-min(10,turns/2). CCP total = UAB−U00; interaction = UAB−UA−UB+U00. Triple memisahkan third-order daripada total synergy. Statik priority/merit tidak digunakan sebagai power; unit Block/draw/status/buff/retaliation tidak ditambah semula kepada U. CI ialah deskriptif dalam konteks bot, paired/reused seeds dan banyak perbandingan.

Tiga konteks pilot diperluas kepada50 seed baharu bagi **setiap urutan**, selection bias dikekalkan:

| Konteks / kad | Order | n | Total combination ΔU [95%] | Interaction ΔU [95%] |
|---|---|---:|---|---|
| master/medium: Flash Ward + Clear Mind | 0→1 | 50 | 47.94 [31.07, 64.80] | 12.86 [-5.14, 30.85] |
| master/medium: Flash Ward + Clear Mind | 1→0 | 50 | 47.93 [31.06, 64.80] | 14.91 [-2.47, 32.29] |
| ordinary: Clear Choice + Blazing Spirit | 0→1 | 50 | 61.91 [47.62, 76.20] | -6.15 [-24.49, 12.18] |
| ordinary: Clear Choice + Blazing Spirit | 1→0 | 50 | 69.96 [55.14, 84.78] | -14.67 [-29.83, 0.49] |
| master/medium: Mana Reading + Deep Study (upgraded) | 0→1 | 50 | -66.91 [-81.21, -52.61] | 10.97 [-11.81, 33.75] |
| master/medium: Mana Reading + Deep Study (upgraded) | 1→0 | 50 | -66.91 [-81.21, -52.60] | 4.90 [-17.66, 27.46] |

Flash Ward + Clear Mind kuat dalam konteks ini dengan setup berbayar; tiada bukti daripada ujian ini bahawa ia mendominasi semua pilihan. Clear Choice + Blazing Spirit boleh mempunyai total positif tetapi interaction negatif: majoriti nilai datang daripada komponen, bukan surplus interaksi. Mana Reading + Deep Study boleh mempunyai interaction positif walaupun gabungan masih lebih buruk daripada dua reference Attack; draw melebihi keperluan/tempo bukan damage percuma. Tiada nerf/buff automatik daripada satu nombor.

Follow-up Focus50 seed baharu; stok dan bayaran kekal nyata:

| Kad / konteks | n | Target / reserve / never wins | Target−reserve ΔU [95%] | Target−never ΔU [95%] |
|---|---:|---|---|---|
| Ember Wall, master/medium/dealer | 50 | 8/5/5 | 6.22 [-4.56, 17.00] | 6.18 [-6.09, 18.45] |
| Hold the Line+, master/medium/dealer | 50 | 6/8/6 | -4.13 [-9.94, 1.68] | 0.00 [0.00, 0.00] |
| Rune Strike+, ordinary/dealer | 50 | 7/6/4 | 2.30 [-11.24, 15.83] | 6.07 [-0.84, 12.97] |

Pilot buruk Ember Wall tidak kekal apabila seed diperluas; CI masih luas/merentas0. Hold the Line+ target Focus tidak mengubah U dalam50 kes ini, tetapi itu bukan bukti bonus tidak berfungsi atau tidak berguna pada keadaan Block lain. Nilai Focus memerlukan timing, incoming, kad alternatif dan ketepatan Predict, bukan boost pada semua kad secara menyeluruh.

## Campaign dengan deck berkembang

Master memakai map/offer/Ganjaran/Shop/Rest/Mystery sebenar, Gold terhad, deck policy berdasarkan mekanik, HP carry, dua stage dan boss. Tiada deck/HP injection selepas battle. Source-aware selection tetap heuristic, bukan CP/rarity yang sudah diukur. Prepared-deck cohort menggunakan recheck-visible-phase-greedy-1; Master menggunakan sampled-turn-search-2/skill. Kedua-dua polisi berbeza dan keputusan tidak boleh disamakan dengan murid.

| Difficulty | Skill | Predict | Route | Wins/n | Reached Stage2 | Mean Focus spent |
|---|---|---|---|---:|---:|---:|
| easy | intermediate | feedback | health-recovery | 10/10 | 10/10 | 22.90 |
| easy | intermediate | feedback | seek-reward | 10/10 | 10/10 | 30.80 |
| easy | intermediate | high | health-recovery | 10/10 | 10/10 | 39.90 |
| easy | intermediate | high | seek-reward | 10/10 | 10/10 | 51.10 |
| easy | intermediate | low | health-recovery | 10/10 | 10/10 | 24.10 |
| easy | intermediate | low | seek-reward | 10/10 | 10/10 | 31.60 |
| medium | intermediate | feedback | health-recovery | 7/10 | 10/10 | 14.10 |
| medium | intermediate | feedback | seek-reward | 6/10 | 10/10 | 19.00 |
| medium | intermediate | high | health-recovery | 9/10 | 10/10 | 40.30 |
| medium | intermediate | high | seek-reward | 8/10 | 10/10 | 59.90 |
| medium | intermediate | low | health-recovery | 6/10 | 10/10 | 16.50 |
| medium | intermediate | low | seek-reward | 3/10 | 10/10 | 20.20 |
| hard | intermediate | feedback | health-recovery | 0/10 | 9/10 | 12.10 |
| hard | intermediate | feedback | seek-reward | 0/10 | 8/10 | 14.40 |
| hard | intermediate | high | health-recovery | 5/10 | 10/10 | 43.10 |
| hard | intermediate | high | seek-reward | 1/10 | 10/10 | 53.60 |
| hard | intermediate | low | health-recovery | 1/10 | 9/10 | 15.10 |
| hard | intermediate | low | seek-reward | 1/10 | 4/10 | 13.40 |
| medium | beginner | high | health-recovery | 1/3 | 3/3 | 0.00 |
| medium | beginner | high | seek-reward | 0/3 | 3/3 | 0.00 |
| medium | beginner | low | health-recovery | 1/3 | 3/3 | 0.00 |
| medium | beginner | low | seek-reward | 0/3 | 2/3 | 0.00 |
| medium | expert | high | health-recovery | 3/3 | 3/3 | 34.33 |
| medium | expert | high | seek-reward | 2/3 | 3/3 | 44.33 |
| medium | expert | low | health-recovery | 2/3 | 3/3 | 15.00 |
| medium | expert | low | seek-reward | 1/3 | 3/3 | 20.33 |
| hard | beginner | high | health-recovery | 0/3 | 1/3 | 0.00 |
| hard | beginner | high | seek-reward | 0/3 | 0/3 | 0.00 |
| hard | beginner | low | health-recovery | 0/3 | 1/3 | 0.00 |
| hard | beginner | low | seek-reward | 0/3 | 0/3 | 0.00 |
| hard | expert | high | health-recovery | 1/3 | 3/3 | 37.33 |
| hard | expert | high | seek-reward | 2/3 | 3/3 | 47.33 |
| hard | expert | low | health-recovery | 0/3 | 3/3 | 13.33 |
| hard | expert | low | seek-reward | 1/3 | 2/3 | 15.33 |

High/low ialah85%/25% sintetik correct-first Predict dengan jawapan canonical; abandon wrong pertama. Feedback memilih pilihan belum dicuba secara uniform, mematuhi had2 salah semasa dan tidak membaca Hint. Artifact/Mystery menggunakan feedback bagi semua profil. Maka perubahan hasil bukan ukuran Focus sahaja: seal, cabaran artifak, hadiah, route dan RNG exposure turut terlibat. Expert menggunakan sampled public draw pools, finite lookahead dan tiada future Predict income dalam planning; bukan optimum/RL. Time Mystery ialah jam sintetik, bukan masa bacaan murid. Distinct Predict opportunities digunakan sebagai bilangan turn entered; room.playerTurns lama ialah completed-reset counter.

Sensitivity berasingan mengubah **jawapan trial artifak sahaja** kepada correct-first sintetik melalui API trial/claim sebenar; Predict dan Mystery kekal polisi yang sama. Ini optimistic artifact-ability sensitivity, bukan batas atas kadar kemenangan atau cadangan memberi artifact percuma atau mengubah had2 cubaan.

| Difficulty | Predict | Route | Artifact ability | Wins/n |
|---|---|---|---|---:|
| medium | high | health-recovery | visible feedback / max2 | 4/5 |
| medium | high | health-recovery | synthetic correct-first | 5/5 |
| medium | high | seek-reward | visible feedback / max2 | 4/5 |
| medium | high | seek-reward | synthetic correct-first | 5/5 |
| medium | low | health-recovery | visible feedback / max2 | 2/5 |
| medium | low | health-recovery | synthetic correct-first | 5/5 |
| medium | low | seek-reward | visible feedback / max2 | 3/5 |
| medium | low | seek-reward | synthetic correct-first | 5/5 |
| hard | high | health-recovery | visible feedback / max2 | 4/5 |
| hard | high | health-recovery | synthetic correct-first | 4/5 |
| hard | high | seek-reward | visible feedback / max2 | 4/5 |
| hard | high | seek-reward | synthetic correct-first | 4/5 |
| hard | low | health-recovery | visible feedback / max2 | 0/5 |
| hard | low | health-recovery | synthetic correct-first | 3/5 |
| hard | low | seek-reward | visible feedback / max2 | 1/5 |
| hard | low | seek-reward | synthetic correct-first | 3/5 |

Secondary ordinary campaign menolak Mystery sebelum bermula dan menggunakan artifact feedback sebenar, jadi ia bukan perbandingan terasing ordinary-vs-Master:

| Predict | Route | Wins/n | Mean turn entered | Mean Energy / Focus |
|---|---|---:|---:|---|
| independent | risk | 5/10 | 46.20 | 120.50 / 39.40 |
| independent | safe | 8/10 | 51.20 | 135.00 / 43.70 |
| developing | safe | 5/10 | 51.80 | 135.70 / 28.50 |
| developing | risk | 5/10 | 52.10 | 139.00 / 28.00 |
| struggling | risk | 3/10 | 41.30 | 109.80 / 9.70 |
| struggling | safe | 2/10 | 44.40 | 119.60 / 9.50 |

Sasaran murid **Easy90%, Medium70%, Hard50% masih belum diukur**. Easy bot sangat forgiving; Hard sensitif kepada soal-jawab, seal, keputusan dan perkembangan deck. Jangan kalibrasi nombor kad untuk memaksa satu bot menyamai sasaran murid. Master perlu menggabungkan pressure/Rage, peluang membina deck, acquisition dan bantuan soalan dengan had2 cubaan yang telah dipersetujui.

## Artifak, exploit dan penemuan

31 ID setiap empat cartridge diperiksa dengan source values:123/124 scope probes lulus, satu masalah laten Spool ordinary.26 combat artifacts mempunyai positive runtime evidence;4 lain acquisition/quote APIs; Spool ialah negative eligibility/discard-scope test. Legal positive Hand-discard action belum wujud. Chance Die meliputi enam face dan no-reroll, Flask threshold/death/reset, energy/draw/once-per-turn dan counter. Ownership batch bukan bukti semua trigger; lihat setiap row.

**MASALAH DISAHKAN — CCS-01, P2, keyakinan tinggi:** forced-owned ordinary e13 Chain Weaver's Spool, walaupun ineligible pada pool semasa, trigger daripada discard Draw Pile oleh Clear Choice. Master hand-only menolak trigger itu. Source: dist/card-combat.js discard scope, dist/card-data.js.rules dan dist/artifacts.js; bukti audit.json.gz → ordinary/e13 (plan, receipts, Block/draw, log, restore). Ini risiko saved/dev/forced-owned state; bukan bukti artifak itu boleh didapati melalui offer biasa semasa. Pembetulan peraturan new ordinary perlu dinilai Master/pemilik kad sambil mengekalkan receipt/save lama. Tiada nerf atau perubahan produksi dibuat oleh audit ini.

**RISIKO BERPOTENSI — CCS-02, P1, keyakinan tinggi untuk bot/sederhana untuk murid:** Hard+question/artifact gates+deck growth masih boleh menghasilkan jurang besar. Data campaign dan artifact_gate menyokong siasatan, bukan satu punca tunggal atau pupil rate. Kos/odds/tawaran/rest/Mystery kekal domain Economy/Map/Master. Saring sebelum menggantikan profile atau menaikkan semua Focus.

**PENAMBAHBAIKAN — CCS-03, P2, CADANGAN:** ulang matched campaign selepas Master menetapkan perubahan merentas domain, gunakan peluang memperoleh pair yang benar-benar dibeli/dimenangi, dan playtest murid dengan pola Hint/More Hint serta masa membaca sebenar. Tooling ini menyediakan seed/task/source yang boleh direplay. Broader policy/unknown-deck sampling dan semua permutation tidak didakwa selesai.

Contract116 meliputi first-activation cadence/cap merentas salinan upgrade berlainan, stat removal/reactivation, hadiah sekali, slot3 atomic swap/cancel, stale/forged choices, Recall tidak mengambil Exhaust, search fallback, queue Agility/Hand cap, Last Ember baki sahaja, status peratus/fasa dan Predict dua salah. Fixture mengatur kad milik sebenar, refill Energy atau mengawal enemy untuk sejarah panjang; ia bukan ICP encounter atau acquisition data. Tiada unlimited loop dikesan dalam coverage ini; ketiadaan semua loop belum dibuktikan.

## Integriti, semakan dan batas

First Focus write mengandungi1180/1200 rekod (satu part380 vs400). Ia **dikecualikan**, disimpan berasingan dan diganti keseluruhan cohort. Semua1180 rekod lama yang tersedia sepadan tepat dengan rerun;20 missing dijana semula. Writer kini fsync + count/index validation sebelum part diterima. Fail .pending bukan evidence. Source snapshots asal dikekalkan; wrapper Elite ditambah untuk roster sahaja dan tidak menukar hasil ICP/Focus. Exact replays mengesahkan perbandingan cross-snapshot.

- 31 full serialized task replays sepadan; semua source bundles, part hashes/bytes, task indices, factorial masks dan cartridge provenance disemak. INTEGRITY.json menyimpan semua bukti.
- Semakan harness/probe baharu17/17, boss phase/seal8/8 dan canonical artifact-gate1/1 lulus (26 semakan). Targeted engine suite270 tests:269 lulus,1 UI badge test terhalang kerana jsdom tiada; jangan label suite itu semua hijau. Syntax check lulus. Log sebenar dalam validation/.
- UI/browser/audio/physical device dan kandungan Matematik tidak diaudit semula; original art/questions tidak diubah. MODEL.zip tidak tersedia dan tidak digunakan; PDF sumber tidak diubah.
- Had100 cycle/500 paid play/10,000 estimated API/preview work ialah had benchmark, bukan game timer atau instrumentation semua atom. Censored U kekal null. Baseline/win-threshold sensitivity, forced openings, synthetic accuracy, adaptive selection dan reused seeds mengehadkan tafsiran.

Raw/CSV/source yang disebut berada di [reports/combat-recheck-2026-10-24](../../../../reports/combat-recheck-2026-10-24). Cara ulangan dan polisi: [tool README](../../../../tools/balance/recheck/README.md). Rekod audit branch: [LATEST](../../../audits/balance-combat/LATEST.md). Ref terbitan disahkan berasingan selepas push; tiada main push oleh sesi ini.

## Verified GitHub publication

Measured data/source tree published and remote ref verified at **678818448d0668a7f9e330e8588f85c66635ed88** on balance/combat. Tree042f7a2b9e27f5fdd69f2b31d49921a406201f42 exactly matches the reviewed local source. [Publication receipt](../../../audits/balance-combat/PUBLICATION.json). The subsequent documentation-only receipt commit adds this publication record; no measurements or production files change. Main publication was not performed by this session.
