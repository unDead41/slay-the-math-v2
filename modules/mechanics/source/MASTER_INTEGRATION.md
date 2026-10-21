# MASTER INTEGRATION — Slay the Math

Panduan utama untuk menggabungkan **Artifact 3.5**, **Question Bank 1.5.0** dan **STM_SHARED 1.0.0** dalam satu folder `MECHANIC_INTEGRATED`. Baca fail ini dahulu apabila menerima pakej ini bersama ZIP game, kad, model atau animasi yang lain.

Dokumen ini merujuk kepada entry, data dan API yang memang terdapat dalam pakej. Pemasangan serta sambungan kepada projek game sebenar perlu menggunakan kod game semasa. Runtime artifact, sesi soalan dan rich text sudah dipadankan; skrin soalan dan resolver game sebenar perlu disambungkan pada titik yang diterangkan di bawah.

## 1. Fail yang perlu dimuat turun

| Kategori | ZIP | Keperluan |
|---|---|---|
| Artifact, bahagian 1 | `ARTIFACT_MECHANIC_v3_5_Part01_of_02.zip` | Wajib bersama bahagian 2. |
| Artifact, bahagian 2 | `ARTIFACT_MECHANIC_v3_5_Part02_of_02.zip` | Melengkapkan satu kategori artifact. |
| Question bank | `QUESTION_BANK_MECHANIC_v1_5.zip` | Mengandungi bank serta salinan STM_SHARED yang sepadan. |

Setiap ZIP mesti kurang daripada **150,000,000 bait (150 MB)**. Kedua-dua ZIP artifact mempunyai saiz bait yang sama. Ini ialah ZIP biasa yang membawa fail berlainan; extract setiap satu, tanpa menyambungkan bait ZIP atau menamakan semula menjadi `.001`/`.002`.

Extract ketiga-tiganya ke **parent folder yang sama**. Setiap ZIP sudah membawa root `MECHANIC_INTEGRATED`; elakkan root berganda seperti `MECHANIC_INTEGRATED/MECHANIC_INTEGRATED`.

Jika sudah extract berasingan, gabungkan *kandungan* root-root tersebut menjadi satu root lengkap. Salinan fail shared dan panduan yang sama daripada keluaran ini boleh digabungkan. Jika fail tempatan sudah diubah atau datang daripada keluaran lain, bandingkan fail dan contract terlebih dahulu.

## 2. Struktur akhir dan urutan bacaan

| Lokasi relatif kepada root | Tujuan |
|---|---|
| `ARTIFACT/` | Katalog, aset, tracker, UI, runtime adapter dan panduan artifact. |
| `QUESTION_BANK/` | Bank 120 soalan, rich text, sesi pembelajaran, visual dan public integration entry. |
| `STM_SHARED/` | Registry istilah, renderer/tooltips, CSS dan contract bersama. |
| `MASTER_INTEGRATION.md` | Panduan utama ini. |
| `MECHANIC_INDEX.md` | Index ringkas dan peta sumber setiap modul. |
| `MECHANIC_MANIFEST.json` | Module ID, versi, entry, guide, pemilik state dan dependency yang boleh dibaca mesin. |
| `IMPLEMENTATION_GUIDE.md` | Langkah pemasangan terperinci, preflight, backup dan rollback. |
| `SOR_CROSS_CATEGORY_RICH_TEXT.md` | Aturan rich text merentas kategori. |
| `VERIFY_SUITE.cjs` | Semakan integriti keseluruhan pakej. |
| `APPLY_ARTIFACT_UPDATE.cjs` | Pemasang extension artifact dan rollback berasaskan receipt. |
| `INTEGRATION_REPORT.json` | Bukti semakan serta status ujian game/browser. |

Urutan bacaan: **MASTER_INTEGRATION → MECHANIC_INDEX → MECHANIC_MANIFEST → panduan modul yang hendak dipasang**. `MECHANIC_LAYOUT.md` memetakan nama folder lama kepada struktur ini. Import aktif menggunakan `QUESTION_BANK`, dengan underscore.

## 3. Versi dan sumber yang menjadi rujukan

| Modul | Package version | Entry utama | Sumber kandungan |
|---|---|---|---|
| `artifact` | `3.5` | `ARTIFACT/runtime/artifact-host-adapter.js` | `ARTIFACT/artifact_catalog.json` |
| `question-bank` | `1.5.0` | `QUESTION_BANK/integration/index.mjs` | `QUESTION_BANK/question-bank-form4-120.json` |
| `stm-shared` | `1.0.0` | `STM_SHARED/index.mjs` atau classic loader di bawah | `STM_SHARED/registry.json` dan `STM_SHARED/contract.json` |

Suite ID: `slay-the-math.mechanic-integrated`. Layout version: `1.1`. Revisi dokumen panduan ini: `2026-10-22`.

Registry yang dipadankan:

```text
881ed46c93d9444d01853bf2056a09e5216a8b5278ecb3aacdb069ca21818201
```

Binding kategori direkodkan dalam `ARTIFACT/runtime/rich-text-compatibility.json` dan `QUESTION_BANK/integration/compatibility.json`. Kedua-duanya mesti sepadan dengan `STM_SHARED/contract.json`.

Kandungan kekal merangkumi **31 artifact, 70 PNG artifact dan 120 soalan**. Versi kandungan katalog artifact masih `3.4`, manakala versi bank ialah `form4-review-1.4.0`; nombor ini berlainan daripada package version kerana kemas kini integrasi tidak menukar kesan atau jawapan asal.

Question bank membawa Hint/More Hint, 360 feedback pilihan salah, 360 worked steps, 120 pasangan visual, 7 modul asas dengan 14 latihan, progress 30 kemahiran dan pemilihan adaptif tanpa ulangan. PDF semakan 246 halaman turut dikekalkan.

## 4. Pemilik state dan transaksi

| Perkara | Pemilik yang perlu digunakan |
|---|---|
| HP, Energy, Gold, kesan combat, harga akhir dan pemilikan artifact | Resolver serta save owner game semasa. |
| Counter, cooldown dan rekod activation artifact | Artifact tracker; adapter menyimpan snapshot pada `run.stmArtifactUI`. |
| Discovery/profile Codex artifact | Modul Codex asal; key `slay-the-math.artifact-codex.v1` dikekalkan. |
| Soalan terdedah, pending question, attempts, Hint/More Hint dan progress | Satu runtime question bank bagi satu player save. |
| Simpanan sesi question bank | Callback `persist(session)` melalui save owner game semasa. |
| Bahasa dan tema | Settings owner game semasa, dibaca melalui callback. |
| Warna token, definisi dan lifecycle tooltip | Satu servis STM_SHARED dalam document yang sama. |
| Timer run, score, penalti, reward dan combat RNG | Pemilik sedia ada dalam game. |

Hover, preview dan pembukaan bantuan tidak melaksanakan transaksi artifact. Jawapan soalan perlu dinilai melalui sesi, dan pemberian reward perlu diselaraskan dengan transaksi game. Event/attempt ID digunakan untuk mengenal pasti tindakan yang sudah diproses.

## 5. Semak pakej sebelum pemasangan

Buka terminal dalam folder **MECHANIC_INTEGRATED yang lengkap**. Node.js digunakan untuk runtime/tools JavaScript; Python diperlukan untuk semakan dan rebuild data sahaja, bukan untuk menjalankan bank dalam browser.

```powershell
node .\VERIFY_SUITE.cjs
node .\APPLY_ARTIFACT_UPDATE.cjs --verify
python .\QUESTION_BANK\verify_package.py
```

Semakan penuh perlu melaporkan `PASS`, `31` artifact, `120` soalan dan `176` canonical terms. Jika bahagian artifact hilang, import terputus atau registry berlainan, lengkapkan/padankan pakej dahulu. Kegagalan compatibility tidak memerlukan reset save pemain.

## 6. Sambungan shared rich text

### Classic loader untuk artifact

Muatkan shared CSS, registry dan servis sebelum script artifact. Installer yang dibekalkan menyediakan urutan ini:

```html
<link rel="stylesheet" href="STM_SHARED/rich-text.css">
<script src="STM_SHARED/registry.js"></script>
<script src="STM_SHARED/rich-text.js"></script>
```

Selepas itu barulah muatkan data, core, UI dan host adapter artifact. Sesuaikan prefix laluan dengan entry game sebenar. Public ESM entry question bank mengimport `../../STM_SHARED/index.mjs` secara automatik dan menggunakan singleton yang sama.

### Gaya token

| Kategori | Tema gelap | Tema cerah | Garis bawah |
|---|---|---|---|
| Math terms | Pink `#E7A1C4` | `#984669` | Putus-putus / dashed. |
| Game terms | Hijau `#9ED5B0` | `#316A48` | Putus-putus / dashed. |
| Calculation | Ungu `#B9A3E3` | `#70528F` | Bertitik / dotted. |

Gunakan stylesheet `STM_SHARED/rich-text.css` dan root UI `data-stm-richtext`. `QUESTION_BANK/integration/styles.css` mengimport shared CSS dan layout pembelajarannya. Elakkan memuatkan stylesheet token lama yang menindih nilai ini.

Registry menggabungkan 55 key artifact dan 124 key question bank kepada **176 entri**. Attack, Skill dan Energy berkongsi makna canonical yang sama. Istilah lain mengekalkan skop asal; **Guard dalam teaching pool tidak ditukar secara automatik kepada Defend**.

Calculation memaparkan hasil pada token dan langkah dalam tooltip. Origin wajib membezakan `question-solution`, `resolved`, `preview` dan `example`. Langkah jawapan penilaian hanya dibuka selepas soalan selesai. Teaching pool dan contoh artifact tidak mewakili peluang drop atau snapshot live pemain.

Servis tooltip menyokong hover, fokus, keyboard dan tap; satu popup aktif dikongsi merentas kategori. Event tooltip perlu kekal terasing daripada pemilihan jawapan serta tindakan Claim/Buy.

### Bahasa dan tema

```js
// currentSettings ialah contoh sambungan kepada settings owner game sebenar.
STMSharedRichText.configure({
  getLanguage: () => currentSettings.language, // 'en' atau 'ms'
  getTheme: () => currentSettings.theme        // 'dark' atau 'light'
});
// Panggil selepas settings owner menerima perubahan.
STMSharedRichText.refresh();
```

Untuk ESM, gunakan export `configureRichText` daripada question entry atau `STM_SHARED/index.mjs`. Teruskan menggunakan settings owner yang sama pada semua scene.

## 7. Pasang extension artifact

Back up projek game semasa. Dari root pakej lengkap, gunakan laluan projek sebenar:

```powershell
node .\APPLY_ARTIFACT_UPDATE.cjs "C:\Users\ijmah\Desktop\slay-the-math-v2"
```

Installer memeriksa entry HTML yang disokong, compatibility dan fail destinasi sebelum menulis. Ia membuat backup, menyalin extension/assets/shared runtime dan menambah loader. Fail yang sudah berubah di luar baseline dikenali akan menyebabkan pemasangan dihentikan untuk semakan. Pemasangan semula tidak menggandakan loader.

Resolver combat, Claim dan Buy disambungkan menggunakan API yang sedia ada:

| API | Masa untuk digunakan |
|---|---|
| `STMArtifactBridge.syncRun(run)` | Selepas run dipulihkan atau state sebenar berubah. |
| `STMArtifactBridge.notifyActivation(event)` | Selepas resolver menerima dan melaksanakan kesan; hantar event ID, before/after serta steps. |
| `STMArtifactBridge.mountOffer(container, artifactId, options)` | Untuk UI `kind: 'claim'` atau `kind: 'buy'`; `onConfirm` menyerahkan transaksi kepada resolver game. |

Rujuk contoh payload dalam [ARTIFACT/INTEGRATION_ARTIFACT_FEATURES.md](ARTIFACT/INTEGRATION_ARTIFACT_FEATURES.md). Wrapper automatik dan hook manual untuk kejadian kad yang sama perlu diselaraskan supaya tracker menerima satu kejadian. Installer extension tidak mencipta resolver 31 kesan artifact dalam projek yang belum memilikinya.

Untuk rollback, gunakan **receipt sebenar yang dicetak installer**:

```powershell
node .\APPLY_ARTIFACT_UPDATE.cjs --rollback "C:\path\to\game\STM_ARTIFACT_BACKUPS\install-...\receipt.json"
```

Rollback menyemak hash sebelum memulihkan backup dan akan menolak fail yang berubah selepas pemasangan. Simpan receipt serta backup tersebut.

## 8. Sambungkan question bank

Kekalkan `QUESTION_BANK` dan `STM_SHARED` bersebelahan dalam lokasi modul game. Gunakan public entry `QUESTION_BANK/integration/index.mjs` dan CSS `QUESTION_BANK/integration/styles.css`. Baca tiga JSON melalui loader/bundler game:

| Input runtime | Fail |
|---|---|
| `bank` | `QUESTION_BANK/question-bank-form4-120.json` |
| `glossary` | `QUESTION_BANK/rich_text/glossary.json` |
| `foundations` | `QUESTION_BANK/learning/foundations.json` |

`rich-text-glossary.json` ialah kamus asal 116 definisi untuk semakan; presentation runtime menggunakan `rich_text/glossary.json`.

```js
import { createQuestionBankRuntime } from './QUESTION_BANK/integration/index.mjs';

const qb = createQuestionBankRuntime({
  bank: questionBankJson,
  glossary: presentationGlossaryJson,
  foundations: foundationsJson,
  savedSession: savedQuestionBankSession ?? null,
  seed: 127031,
  persist: commitQuestionBankSession
});

const selection = await qb.next({ topicCode: 'PROB' });
// reason === 'exhausted': paparkan keadaan pool habis.
// Selain itu, render selection.view dalam UI game sedia ada.
```

Nama JSON, saved session dan `commitQuestionBankSession` dalam contoh ialah input integrasi yang perlu dipetakan kepada projek sebenar. Callback simpanan mesti mengemas kini field sesi secara atomik melalui save owner game, mengekalkan field lain dan reject/throw jika simpanan gagal.

Satu runtime dikongsi merentas scene bagi player save yang sama. Semua mutation perlu **di-await** sebelum UI atau transaksi game diteruskan. Jika persistence gagal, committed session, RNG soalan dan progress runtime kekal pada keadaan sebelumnya.

| Tindakan | API / aturan |
|---|---|
| Pilih soalan belum digunakan | `await qb.next({ topicCode })`; kod topik `PROB`, `SET`, `LOGIC`. |
| Hantar jawapan | `await qb.submit({ questionId, choiceId, attemptId })`; guna ID unik dan stabil bagi tindakan yang sama. |
| Buka Hint | `await qb.openSupport({ questionId, kind: 'hint' })`. |
| Buka More Hint | `kind: 'moreHint'`, selepas `view.support.moreHintUnlocked` benar. |
| Buka Basics | `kind: 'foundation'`; latihan asas tidak menjadi assessment attempts. |
| Show Steps | `kind: 'steps'`, selepas jawapan betul atau explicit final reveal. |
| Dedah jawapan akhir | `await qb.reveal({ questionId })`; item ditamatkan sebagai revealed. |
| Ambil paparan | `qb.getView()` atau `qb.getLegacyView()` daripada sesi yang sama. |
| Run baharu | `await qb.startNewRun()`; sejarah exposure serta pending question dikekalkan. |

Aliran More Hint ialah **baca Hint → hantar jawapan salah selepas Hint → More Hint dibuka**. Jawapan salah sebelum Hint tidak membukanya apabila Hint kemudian dibaca. Full steps, visual lengkap dan calculation jawapan kekal tersembunyi semasa retry.

`next()` menyimpan reservation sebelum memulangkan paparan dan menyambung pending question selepas reload. Apabila pool habis, kekalkan sejarah. `submit()` dengan attempt ID sama tidak menghasilkan completion baharu; rujuk `accepted`, `duplicate` dan `completedNow` bersama transaksi game.

Rendering lengkap menggunakan `renderRichText`, `renderVisual` dan `attachRichTextTooltips`. Bersihkan calculation index ketika rerender dan panggil `tips.destroy()` ketika surface ditutup. Lihat [QUESTION_BANK/integration/README.md](QUESTION_BANK/integration/README.md) untuk contoh penuh. Native Phaser text memerlukan DOM surface atau pemetaan renderer yang sesuai bagi MathML/tooltips.

## 9. Hubungan soalan dengan Claim Artifact

Pakej ini menyediakan titik sambungan sesi soalan dan offer artifact. Aturan game seperti **bila soalan muncul, sama ada salah boleh retry, berapa penalti dan bila Claim dibenarkan** perlu disambungkan pada encounter/reward flow sebenar.

Untuk integrasi pada Claim, baca dahulu kod claim/reward dan save semasa. Kaitkan completion soalan kepada reward encounter yang sedang aktif, semak ia belum dituntut dan selesaikan simpanan/reward melalui transaksi game. `completedNow` membantu mengenal pasti completion baharu tetapi bukan pengganti rekod transaksi reward. Scene reload atau event berulang perlu menyambung encounter yang sama.

Tiada mandatory Claim Artifact gate dipasang secara automatik oleh installer artifact atau STM_SHARED. Polisi gate dan hubungan encounter perlu disahkan daripada kod game yang dibekalkan.

## 10. Save, compatibility dan rollback kategori

Sesi rujukan question bank v1.4 dengan schema `version: 1` boleh dipulihkan. Save rosak, pending question yang tidak dikenal pasti atau format lain memerlukan semakan/mapping daripada source sebenar; ia ditolak tanpa reset automatik. Exposure ID lama kekal reserved.

Schema artifact tracker kekal. Pastikan save owner mengekalkan `run.stmArtifactUI` bersama run. Bahasa, timer, score, history dan reward perlu kekal berkait dengan owner masing-masing.

Simpan folder question bank terdahulu untuk rollback package. Pulihkan bundle serta shared compatibility yang sepadan dan gunakan save backup yang sesuai jika diperlukan; jangan mencampurkan runtime lama dengan registry baharu secara rawak.

## 11. Apabila menerima banyak ZIP lain

Untuk pembaca/agent yang akan menggabungkan pakej ini kemudian:

1. Baca `AGENTS.md`, entry game, build config serta save/reward/resolver source projek semasa yang dibekalkan.
2. Inventori setiap ZIP: root sebenar, README/MD, manifest, versi, module ID, dependency, source data dan consumers.
3. Gunakan `MECHANIC_MANIFEST.json` untuk mengenal pasti tiga modul ini. Buka fail source yang dirujuk sebelum membuat padanan API atau ID.
4. Bandingkan contract dan registry ID bagi sebarang salinan STM_SHARED; kekalkan satu matched service. Sumber authored glossary ialah `ARTIFACT/rich_text/glossary.json` dan `QUESTION_BANK/rich_text/glossary.json`.
5. Padankan ID artifact, card, question, actor, animation dan asset path menggunakan data sebenar dalam ZIP berkenaan. Nama fail sahaja tidak menentukan mapping.
6. Sambungkan public entry kepada consumers game. Kekalkan satu sesi soalan, satu settings owner dan transaksi save/reward yang konsisten.
7. Jika modul tambahan membekalkan istilah baharu, kemas kini authored source serta proses registry/compatibility secara terkawal. `STM_SHARED/build_registry.py` membina registry untuk dua domain semasa; domain baharu memerlukan perubahan builder yang disemak.
8. Jalankan semakan pakej serta build/test game sebenar. Catat konflik yang diselesaikan, source yang menjadi rujukan, mapping API/asset dan perkara yang masih memerlukan input.

MD dan manifest menyediakan peta hubungan; padanan sebenar tetap perlu dibuktikan daripada kod dan aset ZIP yang diterima. Source lama dalam `docs/source_history` atau `QUESTION_BANK/docs/history` ialah rekod sejarah, bukan entry runtime aktif.

## 12. Pengesahan dan status pemasangan

Laporan rujukan berada dalam `TEST_RESULTS.json`, `INTEGRATION_REPORT.json` dan `CROSS_SUITE_DELIVERY_CHECK.json` di sebelah ZIP keluaran. Pakej mempunyai 165 ujian rujukan: 126 Node dan 39 Python. Semakan ini meliputi state/aliran, rich text dalam DOM model dan installer pada fixture sementara; status semasa perlu dibaca daripada laporan selepas menjalankan ujian.

Untuk ujian rujukan penuh dari root:

```powershell
node --test ARTIFACT/runtime/*.test.cjs STM_SHARED/tests/*.test.cjs QUESTION_BANK/test-more-hint-state.mjs QUESTION_BANK/rich_text/test-renderer.mjs QUESTION_BANK/learning/test-session.mjs QUESTION_BANK/learning/test-bank-session.mjs QUESTION_BANK/integration/test-integration.mjs
```

Kemudian dari `QUESTION_BANK`:

```powershell
python -m unittest discover -v
```

Pengesahan selepas integrasi game perlu merangkumi tooltip merentas kategori, paparan kecil, keyboard/touch, bahasa/tema, Hint/More Hint, reveal/steps/visual, artifact counters/discounts, Claim/Buy, reload, history tanpa ulangan, reward sekali sahaja dan timer run. Gunakan command build/typecheck projek sebenar.

**Status keluaran:** pakej rujukan dan integriti arkib disemak; pemasangan serta build dalam game sebenar, ujian visual browser dan eksekusi installer native Windows belum dilakukan. ZIP projek game semasa diperlukan untuk melengkapkan sambungan tersebut.
