# Mathematics Slayer 2.52.0 — bukti awam

QA source tempatan `d8e92d82e472dbdf1dde294e944049e902394140` dan checkpoint
GitHub `39f8d1302173c1dd817442a865b2b0bbd504dd92` mempunyai tree tepat
`eea5bdefd0b4128ceff34273c037fc10c9aa29cb`. Pakej ini ialah bukti calon;
main 2.52.0 publication VERIFIED pada `20df8844936fa265ee5c5da60606410ad0df505d`,
tree `f30c6a1e971feac28e0a48af12b16b901fc22dd9`; Pages code run 40453530679 SUCCESS.
[Receipt](publication.json) ditambah di luar archive tertutup. Head dokumentasi
akhir dan workflow-nya disahkan selepas follow-up, tanpa mengubah original QA.

- Focused: 170 actual OK yang direkod + 30 fresh disjoint tail = 200 kes unik;
  bukan satu command lengkap 200/200. Original TAP kekal separa.
- Native offline 14 PASS; portable canonical EN + alias BM 2 PASS dan actual
  production Developer Hub PASS. Raw save/export bodies tidak diterbitkan.
- Owner capture sebenar 98 / 49 EN + 49 BM, 107 raw inputs tepat. Stdout asal
  hanya 20 baris / 9 completion; metadata/catalogue/files lengkap disemak. Sebab
  jurang stdout belum disahkan; tiada line dicipta atau capture retry.

`public-evidence.tar.gz` mengekalkan 124 original files / 8,427,984 bytes dalam
allowlist: 86 QA originals / 7,984,638 bytes serta 38 carriers dan bukti awam lain.
Archive 6,959,564 bytes; SHA-256
`04b312304a60d5d2c9e848e52d53cc47abdbc36fc71fc316750e9c3b7ecdf520`.
Semua hash/length/path/mode disahkan melalui roundtrip tanpa mengekstrak.
Ini lossless untuk bytes yang tersedia dan dipilih; bukan dakwaan semua stdout
asal tersedia. Current setup/preflight FAILs dan partial TAP disimpan apa adanya.

Lihat [indeks](evidence-index.json) untuk setiap originalPath/archivePath dan
SHA-256. [QA evidence](qa-evidence.json), [focused coverage](focused-coverage.json),
[privacy](privacy.json), [static audit](final-static.json) dan
[inventori](inventory-37-current-main.json) ialah exact readable copies;
pemetaan dan hash mereka direkod dalam indeks. [Ringkasan release](release-verification.json)
ialah rekod coordinator berasingan, bukan pengganti raw originals.

Untuk membaca semua originals dan pautan relatif dalam QA_SUMMARY asal:

```sh
tar -xzf public-evidence.tar.gz
```

Paths dalam metadata/QA summary merujuk ahli archive selepas ekstrak, contohnya
`qa/QA_SUMMARY.md`, `qa/artifact-index.json`, `capture/owner-full.log` dan
`integration-auditor/FINAL_HANDOFF_d8e92d82.md`. Helper pembungkusan turut disimpan
sebagai `helpers/package-public-evidence.py`; ia tidak menjalankan tests game.

Private save/session/RNG/download bodies, browser profiles/temp/dependencies,
base64 upload payloads dan recovered source copies dikecualikan. Privacy QA PASS
ialah pada allowlist semasa; tiada old 4b raw evidence yang hilang dicipta semula.
Inherited P2, source-bound D1/D2, stdout limits dan unrun physical/live/human-audio
checks kekal mengikut laporan utama. Tiga PDF tersedia/tidak dibaca semula;
hanya MODEL.zip tidak tersedia.

[Semakan bebas coordinator](coordinator-review.json) mengesahkan semua 124 originals,
mode/hash/path/size, QA allowlist dan privacy. Fail ini ditambah selepas archive
ditutup dan tidak termasuk di dalamnya, mengelakkan rujukan hash berulang.
