# Aset visual — Edisi Ahli Sihir Merah

Dikemas kini: 18 Oktober 2026. Versi aplikasi 1.1.0; format simpanan kekal v1.

## Rujukan

Watak perempuan berambut merah yang dimuat naik oleh Ijamm ialah rujukan identiti: wajah, rambut panjang, jubah merah/ivori, perincian emas, but merah dan api pada tangan dikekalkan. Dua aset dihasilkan dengan Imagegen terbina dalam dan dimasukkan terus dalam projek. Latar aset mempunyai alpha transparency; salinan WebP dioptimumkan tanpa perubahan piksel yang kelihatan; simbol geometri ialah hiasan, manakala soalan dan formula sebenar dirender sebagai teks oleh game.

## Fail dan pemilik paparan

| Fail | Digunakan pada | Pemilik |
|---|---|---|
| `dist/assets/hero-crimson.webp` | Menu utama, pemain dalam pertarungan, kemenangan | `homeView`, `battleView`, `summaryView` |
| `dist/assets/math-emblem.svg` | Favicon ringan, bulatan bersilang dan segi tiga | `dist/index.html` |
| `dist/assets/math-artifacts.webp` | Semua 12 kad, logo, tutorial, ikon menu utama dan rehat | `mathArt` dan `cardView` |
| `dist/crimson.css` | Susun atur dan gerakan edisi merah | Pemilik lapisan visual; token asas dari `style.css` |

Atlas dibaca dalam empat lajur dan tiga baris. Posisi dikawal sekali sahaja dalam `artSlots`, dan digunakan semula di tangan, ganjaran, koleksi, tapisan serta naik taraf. Jangan kembalikan ikon garis pada mana-mana varian kad.

| Slot | Kunci kad | Ilustrasi matematik |
|---|---|---|
| 0 | strike | Jangka lukis segi tiga |
| 1 | ember | Api dengan kiub geometri |
| 2 | guard | Perisai ais dengan dua bulatan bertindih |
| 3 | flameguard | Perisai bara dengan segi tiga |
| 4 | filter | Penapis dengan pepejal geometri |
| 5 | draw | Kad rajah matematik dan dadu geometri |
| 6 | blast | Ledakan pepejal geometri |
| 7 | fort | Kubu kiub ais dan sesiku |
| 8 | balance | Neraca dengan kiub seimbang |
| 9 | clarity | Astrolab dengan bulatan bersilang |
| 10 | pierce | Bilah alat lukisan geometri |
| 11 | renew | Hati kristal dengan simbol infiniti |

## Gerakan

Menu utama: kemasukan teks dan watak, watak terapung, halo geometri berputar, kilauan butang berkala, bara api dan parallax pointer yang ringan. Tiada akses sensor atau izin peranti diperlukan. Touch tidak memerlukan parallax. Butang Animasi serta tetapan sistem `prefers-reduced-motion` menghentikan semua hiasan bergerak. Tetapan kekal melalui mekanisme simpanan asal. Ini animasi ilustrasi dalam UI; sprite tidak mempunyai rig atau animasi rangka.

## Prompt watak

Use case: identity-preserve / background-extraction. Asset type: transparent full-body protagonist sprite for an educational fantasy deckbuilding browser game. Input image 1 is the exact character identity and outfit reference. Recreate this SAME red-haired female mage faithfully: same face, amber eyes, very long flowing scarlet hair with side bun, crimson and ivory layered robe, ornate gold diamond/star fastenings, black belt and red boots, one open hand conjuring a warm orange flame, other hand extended. Keep the silhouette, costume construction, face, and pose as close as possible to the reference. Improve edge quality and make the background genuinely transparent with no black rectangle and no ground shadow. Keep the entire head, hair, hands, robe and both boots within the image with a little clear margin. Add only three small elegant floating gold mathematical sigils near her magic: a triangle outline, two intersecting circle outlines, and a small cube outline. These should look like refined magical geometry, not writing. Polished hand-painted anime fantasy game illustration matching the original. Front three-quarter full-body view, facing slightly left, tall portrait composition. No text, no letters, no watermark, no UI, no extra characters. Preserve the female identity from the reference. Deliver one isolated character on alpha transparency.

## Prompt atlas

Use case: stylized-concept. Asset type: one production game card-art atlas containing TWELVE distinct square illustrated icons in an EXACT FOUR-COLUMN by THREE-ROW grid, all cells equal, 4:3 landscape canvas. Input image 1 is STYLE AND PALETTE reference only: scarlet-haired female mage, red robes, ornate gold geometry, ivory details, orange fire. Build a cohesive set of hand-painted anime fantasy MATHEMATICS artifacts for her educational card deck. Each icon has a distinct bold silhouette, polished dimensional materials and painterly edges, gold outlines, crimson/ivory accents, a few cool pale cyan accents for ice. Each square cell is centered and self-contained with generous transparent padding; no objects crossing a cell edge, NO grid lines, no labels, no backgrounds, alpha transparent between and behind items. Exact slot order, reading left to right: ROW 1: (1) a beautiful gold drawing compass whose open tips form a sharp triangle, with crimson blade-like points; (2) a glowing orange flame holding a floating golden geometric cube; (3) a blue crystalline circular shield with two overlapping golden circle rings; (4) a crimson-and-gold shield with a golden triangular geometric center and embers. ROW 2: (5) an ornate gold sieve/funnel filtering small ruby and ivory numbered-die-like cubes; (6) two ivory magical probability cards with tiny geometric diagrams, fanned apart with a gold probability die; (7) an exploding orange wireframe dodecahedron crystal with crimson sparks; (8) a blue ice fortress built out of translucent geometric cubes with a gold set-square. ROW 3: (9) an elegant gold balance scale with two equal crystal cubes; (10) a glowing golden astrolabe of intersecting probability rings surrounding a cyan orb; (11) a blue crystal spear shaped like a mathematical drawing compass with gold ruler-like marks; (12) a crimson healing crystal heart clasped by a golden infinity-shaped ribbon. These are full detailed illustrated object icons, NOT thin line UI glyphs. No words, no legible numbers, no equations, no lettering, no logos, no watermark, no borders. Make each of the twelve equally detailed and consistent, exactly aligned inside its own equal square tile. This is one atlas artwork, not a UI screenshot.
