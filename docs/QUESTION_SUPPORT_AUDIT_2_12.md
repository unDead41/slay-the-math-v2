# Audit Example, Hint dan More Hint — 22 Oktober 2026 (Malaysia)

**ADA perkara yang perlu diharmonikan dalam bantuan glossary.** Bank soalan asal dikekalkan; tiada jawapan, hint, contoh atau token sumber ditulis semula dalam update game ini.

| Dapatan | Bukti | Tindakan untuk pemilik bank |
|---|---|---|
| Makna denominator biasa bercampur dengan common denominator | `qb:common-denominator` mempunyai alias `denominator` dan `denominators`. Definisi/example menerangkan penyebut sama untuk tambah/tolak/banding. | Sediakan entri denominator sendiri (nombor bawah pecahan); guna common denominator hanya apabila konsep penyebut sama diperlukan. Selaraskan richText, mathText/MathML dan themedRichText sekali. |
| PROB-008, More Hint | Perkataan **denominators** dalam arahan mendarab pembilang dan penyebut membuka Common denominator. Mendarab 2/5 × 1/4 tidak memerlukan penyebut sama. | Tukar binding kepada konsep denominator biasa, kekalkan pengiraan 1/10. |
| PROB-015, More Hint | Perkataan **denominator** dalam cancel common factors merujuk bahagian pecahan, bukan kaedah menyamakan penyebut. | Semak binding/example yang dibuka, tanpa mengubah jawapan 1/2. |
| PROB-038, Hint / nextStep | **clear the denominators** dalam persamaan x(x−1)/56=3/14 membuka bantuan tentang penyebut sama. | Bantuan perlu menerangkan darab kedua-dua belah dengan common multiple / 56 dalam konteks persamaan. Kekalkan x=4. |

Audit mesin menemui **10 binding calon pada 8 ID**: PROB-005, 008, 012, 015, 027, 028, 038, 040. Ini senarai untuk semakan konteks, bukan dakwaan semuanya salah: PROB-027 dan PROB-028 memang menggunakan penyebut sama dengan betul. Lokasi JSON tepat dalam `verification/question-support-audit-2-12.json`.

Semakan yang dibuat:

- Baca prompt, jawapan, Hint, More Hint dan tiga worked steps bagi kesemua 120 item (40 Probability, 40 Set, 40 Logic). Pengiraan dan contoh yang diterangkan tidak menunjukkan percanggahan jawapan dalam semakan ini.
- Bandingkan teks biasa dengan richText, mathText dan themedRichText; **0 ketidakpadanan**. Semak 240 hint steps, 120 More Hints dan 360 worked steps.
- Browser merender semua 120 item, 360 feedback salah, 120 More Hints, visual Hint/solution dan worked solutions. Solution kekal selepas jawapan betul; More Hint memerlukan Hint dibaca kemudian jawapan salah yang berikutnya. Ini juga disemak selepas reload.
- Bank asal SHA-256 `106e15d8c5b941234b44578a4bcff8716eae35d92a0a9c719c98b11cd7b2902a` tidak berubah. Audit ini ialah semakan kandungan/implementasi, bukan kelulusan kurikulum rasmi.

Pakej baharu daripada chat pemilik soalan patut mengekalkan ID/choice IDs/correct keys dan kontrak session 1.5, lalu membekalkan glossary serta semua binding yang selaras. Jangan reset sejarah exposure atau menukar jawapan yang sudah betul kerana pembetulan glossary ini.
