# Bukti integrasi Online/Offline 2.51.0

`evidence-index.json` memetakan setiap originalPath kepada storedPath, original hash/length serta stored hash/length. Fail besar JSON/log dikompres losslessly dengan gzip; selepas decompress, bytes mesti sepadan originalSHA256. Tiada private input folder, raw save, temporary browser profile atau upload-temp disalin.

75 fail QA asal dan dua fail handoff/index disahkan tepat. QA_SUMMARY.original.md mengekalkan ringkasan asal oleh QA. QA_SUMMARY.md ialah salinan pembaca: ayat GO dibetulkan atas arahan root dan spacing diperjelas tanpa mengubah keputusan. Kedua-dua hash direkodkan dalam derivatives. Original QA artifact-index masih merujuk identiti/logical paths asal; gunakan mapping index ini untuk fail fizikal.

Bukti asal gagal, RED, full98 pada603, menu20 padaff3d, native PASS akhir pada20b, privacy dan storage cleanup semuanya dikekalkan. Indeks ini ditutup sebelum publication; receipt publication.json boleh ditambah berasingan kemudian tanpa menulis semula indeks atau bukti QA.
