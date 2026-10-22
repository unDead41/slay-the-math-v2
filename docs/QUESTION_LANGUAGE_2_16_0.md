# Bahasa soalan — 2.16.0

The language control changes the complete question display in Education Practice, Artifact trials and Mystery questions. All 120 prompts, choices, guidance, option feedback, worked steps, Given/Find panels and visual prose have authored BM mappings. Seven Basics modules and fourteen checks are included. The preference is separate from saves, learning and comments; choice IDs, correct answers, numerical data and deadlines are retained.

The supplied English textbook, Malay textbook and DSKP were compared directly. Topic source IDs, PDF pages and editorial decisions are recorded in `modules/mechanics/source/QUESTION_BANK/localization/{prob,set,logic}.ms.json`. These are teaching adaptations. Use kesudahan/ruang sampel, peristiwa bersandar/tak bersandar, kesatuan/persilangan/pelengkap and akas/songsangan/kontrapositif consistently. Preserve formal symbols and H/T labels, explicitly explaining muka gambar/muka angka; the BM book uses A/G. Source discrepancies remain documented rather than copied.

Run `npm run build`, then `npm start`; Main Menu → Education Practice → Question language / Bahasa soalan. The control also appears in in-game education questions. The education feature was subsequently integrated into main at Ijamm’s explicit request on 22 October 2026. See EDUCATION_MAIN_INTEGRATION.md.

Validation: 202 Node tests passed with jsdom enabled, including all 120 language transitions, wrong answers, Hint/More Hint, worked steps, persistent comments, exact answer bindings and in-game deadline preservation. Browser preview verified BM prompts, filled Hint tables and translated controls. Comments remain device-local until explicitly shared/downloaded.
