# Publisher handoff — recovered pet API

## Main 2.53.0 — skop penerbitan semasa, 27 Oktober 2026

Ijamm kini mengarahkan audit dan penerbitan semua pakej yang benar-benar pending.
Ini membenarkan integrasi Emberlyn daripada `07677f62ede996e2dd66d9b53f9fd5e152069863`
ke main `7a49fff83388347f0157616fc6b051ddbda4c694` / 2.52.0 sebagai **2.53.0**.
Klausa branch-only/no-main di bawah kekal sejarah untuk sumber asalnya dan
superseded bagi integrasi ini sahaja. Kontrak keselamatan, satu pemilik
Online/Offline, local help, original Hint, save/RNG dan semua pemilik semasa kekal.
**QA gabungan VALID dalam skop yang dinyatakan; penerbitan main PENDING**
sehingga expected-head update dan readback sebenar tersedia. Calon tempatan
`728d25e7a9969b3570e7e8943664b9a6c43ce67c` / tree
`2bb0b762478cc76243097cc9aba7300bebab6524` mempunyai 126 focused Node,
54 native Pet, 15 cold-offline dan dua portable PASS; ini bukan full suite atau
live provider validation. Ini tidak mengaktifkan provider atau backend awam.
[Skop, bukti dan had semasa](PET_MAIN_2_53_0.md).

Resume follow-up,27 October: the two deferred Minor fixes are implemented on the same feature branch. The operator guide now explicitly requires a hosted HTTP(S) game URL for Online; remote HTTPS configuration does not enable file-origin chat. The widget maps only401/UNAUTHORIZED and409/VERSION_MISMATCH to reviewed localized recovery copy, retaining local fallback and manual retry. Existing source/production build owners regenerate their own content identities; do not reuse the earlier production5c4c7a receipt as proof for these changed bytes. [Current follow-up audit](audits/pet-assistant/LATEST.md) supersedes the earlier source-currentness/Minor-open statements below; no new live API or main deployment is implied.

Follow-up code publication VERIFIED on codex/ai-pet-online-20261025 at b5026ceee84da7d66bf071b5e047f298df67677d /2.53.0-pet.1. Actual tree, parent, expected-head update and unchanged main/original-ai readback are retained in the [current receipt](verification/pet-online-followup-20261027/publication.json). Production4599ce7cacd82477dc5e6525 cold-offline acceptance passes15/15; native pet54/54. This closure updates documentation only and does not activate a public backend.

Ijamm requested Publisher instructions first; the original prompt was delivered before the initial implementation. Main has since published the actual shared Online/Offline/installation owners as2.51.0. This note supersedes the earlier proposed duplicate DCConnection/readiness module. **Use the current published contract in [PLAY_MODE_HANDOFF](pet-ai/PLAY_MODE_HANDOFF.md).**

The pet now registers once via STMPetHelp.setTransport. All requests use the mandatory STMPlayMode.requestOnline boundary. Default Online is not API consent; player must explicitly choose Online in the sole existing Settings group. The pet has no second selector, and never derives permission/readiness from navigator.onLine. API failure leaves the selected mode unchanged and falls back locally.

New player resources are enumerated by existing build/manifest/portable owners:

- pet-config.js (public base endpoint only), pet-knowledge.js, pet-assistant.js, pet-assistant.css;
- original `assets/pet-emberlyn-original.png`,4,427,889bytes/SHA25651ac9681...;
- updated app/index/release/build outputs and genuine current tutorial captures.

A previously installed2.51 release is not complete for the new pet release. Verify/persist the new matching manifest, shell/worker and all runtime resources before showing Ready offline. Keep existing retry/resume/quota/corruption/retention protections and release-pinned cold restart. Do not cache API responses, credentials, backend, developer datasets or player records. Preserve current numerical/save/RNG/question/audio/VFX/motion and explicitly consented learning-sharing owners.

Offline pet uses packaged help/reference maths; no offline generative model is claimed. The portable file remains separate from a browser-cache Ready receipt. Online static hosting needs the operator's HTTPS Node backend, exact CORS origin, model/key/private classroom code and optional caps; none belongs in public assets. See [operator guide](PET_ASSISTANT.md).

Before any separately authorized main publication, inspect current main, regenerate through current owners, test the new full persistent package and cold restart with the actual pet bytes, and record exact release/manifest/source IDs. Old install/test evidence cannot establish new-package readiness. This candidate does not authorize main publication or deployment.

Current acceptance on Mathematics Slayer main2.52.0: candidate2.53.0-pet.1 passes native36/cold-offline15, including actual Emberlyn after a new-process/server-stopped reload. Production manifest5c4c7a63452a6ceefdb74de4 lists773 files plus its canonical manifest; source545c4964 is a distinct build-owner identity. Publish/verify the actual selected output's own manifest. Hosted Online requires configured backend inputs; file-origin Online is unsupported by current CORS (see audit erratum); portable local help works. No main deployment is implied. [Actual evidence](verification/pet-online-recovery/evidence.json).

Feature-only publication VERIFIED on codex/ai-pet-online-20261025 at code a59c6833 /2.53.0-pet.1. Main7a49fff and original ai807be676 are unchanged. [Actual ref/tree/version receipt](verification/pet-online-recovery/publication.json). Public backend/live API activation remains operator work.
