# 26 — Whole-game English / Bahasa Melayu

Current identity amendment: **Mathematics Slayer**, per LANG-03 and Master SOR
1.3.0. Earlier language rollout/source details below remain history.
[Current implementation/QA/publication status](../RENAME_MATHEMATICS_SLAYER_2_52_0.md).

Status: DISAHKAN by Ijamm, 24 October 2026. Local implementation on `dual-language-bm-bi`, refreshed to main `45d2378302196d9b0b79af7b371e6f16d4f5768c` (game 2.41.0); initial audit used `ade5d3a` / 2.39.0. The initial local-only restriction is superseded by Ijamm’s subsequent “push ni kalau tak push lagi please” authorization. Integrate with main ee65fa24a7f70157a946608277fa641652fe0057 / 2.42.0 and publish as 2.43.0 after current-source checks. This supersedes earlier English-only presentation requirements. It does not replace numerical or educational owners.

## Reading level and identity

**LANG-01:** Offer English and Bahasa Melayu throughout player text: menus, Settings, map, cards, rewards, Shop, Rest, Mystery, questions, help, glossary, status details, reports, calculation explanations, errors, accessible labels and text added after rendering. Settings calls this **Game language / Bahasa permainan**. Reuse the existing independent language key; `en` and `ms` remain canonical values. Accept BM/MS and BI/EN input aliases. A language change must not reset a run or learning progress.

**LANG-02:** Use short, direct sentences and familiar verbs. Aim for reading comprehension at Form 1 level in both languages. Explain one action or rule at a time. Keep precise school mathematics terms, then explain them in simple words. This is a copy target, not a measured readability score or a claim that every learner understands Form 4 mathematics.

**LANG-03:** The active official name is **Mathematics Slayer**, approved by Ijamm on 26 October 2026; use the same spelling in BM and English. The previous Slay the Math: Dungeon of Chance name/proposal state remains history. Preserve Alyssa, character/stage/artifact proper names, canonical card identities and authored BM card names. Never translate repository names, URLs, save keys, schemas, IDs, curriculum codes, answer bindings, asset paths or user-written comments. BM prompts do not change the bank's Form 4 curriculum level.

## Established game terms

**LANG-04:** Keep recognized keyword labels consistent in both languages. Translate the surrounding instructions and explain the keyword in BM. Do not use Defense for the Defend card category. A verb such as “ambil” or “pulihkan” may remain ordinary BM prose.

| Retained label | Simple BM explanation |
| --- | --- |
| HP / Max HP | Mata kesihatan semasa / had mata kesihatan. |
| Energy | Mata untuk membayar kos kad. |
| Block | Perlindungan yang menghalang damage sebelum HP berkurang. |
| Focus | Sumber untuk mendapat bonus pada satu kad yang layak setiap giliran. |
| Strength / Agility / Defense | Bonus damage Attack / bonus Block Defend / pengurangan damage setiap pukulan. Use the actual card preview and current rule profile. |
| Attack / Defend / Skill / Passive | Jenis kad. Passive memberi kesan berterusan selepas dimainkan. |
| Buff / Debuff | Kesan yang membantu / kesan yang menyusahkan. |
| Weak / Vulnerable / Thorns | Nama kesan. Terangkan nilai dan tempoh daripada profil mekanik semasa. |
| Draw / Draw Pile / Hand | Ambil kad / timbunan untuk mengambil kad / kad yang dipegang. |
| Deck / Discard / Exhaust | Semua kad anda / tempat kad terpakai menunggu / kad yang diasingkan sehingga pertarungan tamat. |
| Gold / Artifact / Predict | Wang game / item dengan kesan khas / tindakan menjawab soalan. |
| Boss / Elite | Jenis musuh. |

Examples: “Not enough Energy.” → “Energy tidak cukup.”; “End Turn” → “Tamat giliran”; “Gain 5 Block.” → “Dapatkan 5 Block.” Keep amounts and effects from their existing owner. A translation must never introduce a new value or change an effect.

## School terminology and sources

**LANG-05:** Use the supplied KSSM BM/English textbooks and DSKP for formal terms. Preserve mathematical notation. `Guard`, `Fire`, `Ice` and card IDs in fixed teaching pools remain the labels stated by the question; do not turn them into live-deck rules. Heads/Tails examples explicitly retain H/T bindings with their BM explanation.

| English | BM | Supplied source evidence |
| --- | --- | --- |
| Converse / inverse / contrapositive | Akas / songsangan / kontrapositif | BM PDF 56, 67; EN PDF 64, 75; printed 55, 66. DSKP PDF 56–57, printed 42–43, SP 3.1.5. |
| Statement / compound statement / negation | Pernyataan / pernyataan majmuk / penafian | BM PDF 56; EN PDF 64; printed 55. DSKP SP 3.1.1–3.1.4. |
| Universal set / intersection / union / complement | Set semesta / persilangan / kesatuan / pelengkap | BM PDF 99, 107; EN PDF 107, 115; printed 98, 106. DSKP PDF 62, printed 48, SP 4.1.1–4.2.3. |
| Outcome / sample space | Kesudahan / ruang sampel | BM PDF 245–246; EN PDF 253–254; printed 244–245. |
| Dependent / independent events | Peristiwa bersandar / peristiwa tak bersandar | DSKP PDF 82, printed 68, SP 9.2.1–9.2.3. |
| Mutually exclusive events | Peristiwa saling eksklusif | DSKP PDF 83, printed 69, SP 9.3. |
| Percent / random | Peratus / rawak | BM PDF 50, 245; EN PDF 58, 253; printed 49, 244. |

Files inspected: `02-Mathematics-Form-4-KSSM.pdf`, `03-DSKP-KSSM-MATEMATIK-TG-4-dan-5.pdf`, `04-Matematik-Tingkatan-4-KSSM.pdf`. PDF indices differ between editions; record printed pages too. The source check is terminology/presentation review; it is not a new independent mathematical validation of every answer. Advanced enrichment labels retain their existing curriculum classification.

## Ownership and invariants

**LANG-06:** `modules/localization/game.ms.json` owns authored game UI copy, dynamic templates and the 31 structured Artifact descriptions. `glossary.ms.json` owns the 55 current Artifact explanations. `runtime.mjs` projects display text only. `tools/build-game-language.cjs` generates `dist/game-language.js`; import-mechanics includes it in normal and offline game builds. The small loading shell loads this presentation service before deferred game modules and reads the same language preference; resource progress/recovery text also switches language. Keep the verified asset loader and retained combat canvases intact. Practice keeps its existing question/UI language owner and uses the same preference; do not install a second global DOM observer in that document. The card presentation adapter runs after current effects adapters; archived supplier inputs and numerical rules stay intact. Existing question localization remains owned by `QUESTION_BANK/localization/`.

**LANG-07:** Reconcile English and BM Artifact definitions together. Never copy an English override into `definition_ms`. Tooltip language follows the current panel/game language. Source examples must use confirmed mechanics; the old “Focus cap pending” example is superseded by a bounded example using `DCConfig.FOCUS_CAP`. An example is neither a reward nor evidence that an effect occurred.

**LANG-08:** Translation must preserve RNG streams, numbers, answer/choice IDs and order, attempts, hints, eligibility, effects, costs, offers, card transactions, deadlines, feedback text, schemas and saves. Work from current values; mismatched structured-description number counts must fail validation. Language storage failure may affect persistence only. A timed Mystery continues while reading or changing language.

**LANG-09:** Tutorial starts in the Settings language while retaining its chapter/completion history. Its explicit language buttons control that guide; the scoped language must be respected by global rendering. Practice uses the shared language preference with its own learning record. Do not leak either practice reducer into a real run.

**LANG-10:** Preserve original artwork and audio. This change localizes live text, accessible descriptions and UI; it does not dub existing voices or repaint baked English screenshots. Keep screenshot captions clear that they are examples. Source titles, proper names, mathematical notation and recognized game keywords may intentionally remain unchanged. No fabricated BM recording/image is implied.

**LANG-11:** Rich text uses soft pink for mathematics, green for game terms and purple for calculations, with working keyboard/touch tooltips. Say “colored term / istilah berwarna”, never instruct players to find decorative underlines.

## Acceptance and audit

**LANG-12:** Check both languages across main screens, dialogs, tooltips, errors, all 40 card descriptions, all 31 Artifact descriptions, all 55 Artifact definitions, the 120 existing question projections, tutorial and Practice. Inspect a small viewport and keyboard flow. Record coverage and exceptions honestly; a finite matrix is not proof of every possible generated sentence. Maintain a bounded in-memory list of unmapped text for QA, without network reporting or user input collection. Run current build/syntax and relevant state/save regressions. Link actual results in the [branch audit](../audits/dual-language-bm-bi/LATEST.md).
