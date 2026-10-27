# Pet main 2.53.0 — public evidence

**QA scoped VALID; main publication PENDING.** Tested local candidate
`728d25e7a9969b3570e7e8943664b9a6c43ce67c`, tree
`2bb0b762478cc76243097cc9aba7300bebab6524`. A later docs/evidence-only tree is
reviewed separately; no local checkpoint is presented as a GitHub commit.
[Release report](../../PET_MAIN_2_53_0.md) · [QA original](qa-evidence.json) ·
[Privacy](privacy.json) · [Inventory](inventory.json) ·
[Static preservation](static-preservation.json) · [Math oracle](math-independent.json).

Fresh results: **126/126 focused Node**, zero fail/skip/cancel and full EOF;
**54 native Pet**, **15 production cold-offline**, **two portable** and seven
syntax files pass. Root independently checked **4,163 mathematical parameters**,
not Node cases, bank validation, training samples or pupil outcomes. Actual cold
readiness verifies 774/774 files for production ID b0d1369647d48acbf3bd64fd.
Provider calls use controlled test doubles. Online backend/key activation is not
performed. Phone dialogs may scroll; this is not an all-content-in-one-viewport claim.

## Lossless selected originals

`public-evidence.tar.gz` contains **66 allowlisted originals /
3,913,411 bytes**. The archive is 2,309,088 bytes,
SHA-256 `243cb6f9f40743a571a0f564c153dabd211a3946cc908fdd2862ed8ae6fbd83b`. All archive members roundtrip to the original
path/bytes/size/mode with no unsafe path, link or duplicate. This includes the
**47 QA originals / 3,310,579 bytes**, plus QA index/handoff, command EOF logs,
public drivers/diffs/screenshots, build identities, inventory, static and Root
proofs. The five critical JSON copies outside the archive are byte-identical;
[evidence-index.json](evidence-index.json) maps each one to its archived original.

Extract with `tar -xzf public-evidence.tar.gz`. Then `qa/QA_SUMMARY.md`, complete
stdout/commands, native reports/screenshots and original proof paths are available.
This is lossless for selected available originals. It does not invent missing
historical EOF or relabel old feature logs. The incoming feature's original failed
commands and partial capture/Node evidence remain in their original repository
folders and receipts. Mirror clone setup failures here are not product failures.

## Privacy and limits

Only the QA frozen public allowlist and explicit reviewed metadata are packaged.
Raw full save/session/RNG/export bodies, real records/credentials, profiles,
cache/temp/dependencies and upload payloads are excluded. Privacy review passed;
raw private body count is zero. Synthetic fixture hashes/equality flags are public.
The configured expected classroom code/policy is server-side; the player's typed
code intentionally lives in tab memory/Bearer. No real classroom/provider secret
was used. [Frozen QA index hash](evidence-index.json) preserves original QA evidence
SHA-256 `b0664555f568ae6767755b49ce6d0cb37c6cca989cda0f806aa90693eb0909de`.

The 98 Tutorial images remain their original source captures, with 107/111 current
input hashes matching and four stated differences. No fresh 98 capture is claimed.
Inherited findings and live/physical/pupil/all-browser/long-term eviction limits
remain. [Derived release summary](release-verification.json) keeps publication
PENDING until an actual expected-head write/readback; post-publication receipt
stays outside this closed archive and index.
