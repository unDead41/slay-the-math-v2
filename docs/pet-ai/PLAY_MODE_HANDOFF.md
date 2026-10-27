# Pet AI: canonical play-mode and offline-readiness handoff

## Identiti semasa — Mathematics Slayer 2.52.0

Ijamm mengarahkan nama rasmi **Mathematics Slayer** pada 26 Oktober 2026.
Nama ini sama dalam BM dan English. Kekalkan repo/URL, identifier, storage keys,
schema, save/RNG, Alyssa, topik, angka, model dan aset asal. Portable utama ialah
`MATHEMATICS-SLAYER-OFFLINE.html`; `SLAY-THE-MATH-OFFLINE.html` ialah alias
byte-identical untuk laluan fail lama, bukan nama paparan semasa.
**DILAKSANAKAN; VALID dalam skop verifikasi yang dinyatakan, dengan P2 inherited
dan jurang bukti stdout dikekalkan.** Calon tempatan d8e92d82 sama tree dengan
checkpoint GitHub 39f8d130. 200 kes unik disokong oleh 170 OK yang direkod dan
30 tail baharu yang disjoint, bukan satu command 200/200. Native offline 14,
dua portable dan Dev Hub lulus. **Penerbitan main 2.52.0 VERIFIED** pada
`20df8844936fa265ee5c5da60606410ad0df505d`, tree `f30c6a1e971feac28e0a48af12b16b901fc22dd9`.
Pages exact code run 40453530679 ialah SUCCESS.
[Receipt sebenar](../verification/mathematics-slayer-20261027/publication.json). Public browser dan live services kekal NOT_RUN;
workflow head receipt disahkan berasingan selepas follow-up dokumentasi.
[Skop, bukti dan status](../RENAME_MATHEMATICS_SLAYER_2_52_0.md). Nota keluaran terdahulu di bawah ialah sejarah
mengikut pin dan hasil asalnya; ujian lama bukan bukti calon pemulihan baharu.

## Historical main integration authorization — 2.51.0

Ijamm now requests listing the changes still pending and publishing them to main.
This authorizes the combined Online/Offline feature e941 and immutable registry
snapshot e057 with main 09a5 / 2.50.0 as 2.51.0, preserving current education,
VFX/Idle, numerical, save/RNG, language, AI and original-asset owners. This
supersedes the relevant branch-only boundaries below; their source pins and
original test outcomes remain history. Combined scoped compatibility is **VALID with carried P2 findings**: 175 focused
checks on 7a, 23 fresh final checks on 20b and the stated native groups pass.
Main publication is **VERIFIED** at `338e1f82d89a8fa54882ea08ab6d0e1ebe7d5a2b`, game 2.51.0,
with exact reviewed tree `b94729255bbbd2dfdcabf8cddf4308ed560a13d2`.
[Actual ref/parents/version and exact-code Pages SUCCESS](../verification/online-main-20261026/publication.json).
This documentation receipt preserves the verified runnable/test/configuration bytes.
No simulation campaign, collector or model update is included. [Current scope,
evidence and limits](../ONLINE_OFFLINE_MAIN_2_51_0.md).


Base main `d77b3e0ce87d573de89e84a9b2374df97ad625b9` /2.49.0. Candidate `2.49.0-offline.1`, branch `fix/online-offline-readiness`. Branch publication only; no main merge/deployment authorized. This is the shared adapter/local-help contract, not a claim that an animated pet, provider backend or live API has been integrated. No pet runtime/handoff exists in the pinned main or published ai807be676 / balance-master39ee5ab snapshots inspected at task start.

## One preference, separate observations

Settings owns the only `[name="stm-play-mode"]` group. Do not add a second selector inside the pet, Practice or Tutorial. Pet surfaces subscribe to the canonical owner. An iframe must delegate to the host through its existing trusted bridge rather than create another preference owner.

| Interface | Contract |
| --- | --- |
| `window.STMPlayMode.snapshot()` | `{mode, explicit, persisted, connectionHint, petAPIAllowed}`. `mode` is `online` or `offline`; it is a player preference. |
| `STMPlayMode.set(mode)` | Settings action only. Uses key `slay-the-math.play-mode.v1`, JSON `{version:1, mode, chosen:true}`; no gameplay/learning keys. Clicking the checked Online option also explicitly chooses it. |
| `STMPlayMode.subscribe(listener)` | Receives changes; returns unsubscribe. Cross-tab changes cancel outstanding requests too. |
| `STMPlayMode.canUsePetAPI()` | Permission only: explicitly selected Online. Default Online preserves prior asset loading but does not implicitly grant pet API permission. |
| `STMPlayMode.requestOnline(signal => promise)` | Mandatory boundary for every pet API request. Blocks unselected/Offline calls, aborts on a choice change or 12-second deadline, and rejects stale responses even if a transport ignores AbortSignal. |
| `connectionHint` | Browser hint only: `disconnected` or `unknown`. Never prove internet/API reachability from `navigator.onLine`; never rewrite the selected mode after a request fails. |

Online retains the 75% important-package entry gate and bounded background resources. Offline prepares the whole current release, including lazy Practice and local pet help. Choosing Offline does not pretend the physical network disconnected: downloads needed for preparation may still use it. Existing separately consented learning-sharing transports retain their education owner; this is not a new consent setting or a universal network kill switch.

## Pet adapter

`window.STMPetHelp` provides packaged English/BM FAQ guidance, including Block, Focus, Predict/help, cards, map and offline. Unknown free-form questions get local Tutorial/Practice guidance, not a fabricated offline LLM answer. It does not read or change the run, answer bindings, question attempts, learning history or RNG.

```js
// The pet/backend owner registers this once at application startup.
STMPetHelp.setTransport(async ({ question, language, signal }) => {
  // Call the owner's configured server proxy, with cache: "no-store".
  // The provider key remains on that server; never include it in dist/.
  // Apply server-side scope, validation and response limits there.
  // Return { answer: "plain text" }; throw for a failed service response.
});

const reply = await STMPetHelp.ask(userText, { language: "ms" });
// reply.source is "local" or "api". Render reply.answer as textContent.
```

The registration above intentionally has no invented URL, API key, deployment or credential. `status().api` reports the last request outcome (`unknown`, `available`, `unavailable`, `unconfigured`, `blocked`); a past success is not a permanent health guarantee. Offline/unselected mode always exposes blocked API permission and uses local FAQ. API failure falls back locally while leaving the preference Online. Free API chat still needs a reachable service. Do not bypass `requestOnline` with a direct pet fetch, silently send saves/answers, or award game/learning progress for pet interaction.

Future question-specific hints must respect the canonical question owner's reveal/attempt policy. This branch does not regenerate mathematics answers or split the question bank by seed. Add any future pet artwork/runtime/local-help files through the normal release build; their hashes automatically change the package identity. An older complete bundle is complete only for its own release, not for subsequently added pet files.

## Offline readiness

| Interface | Contract |
| --- | --- |
| `STMHosted.offline.snapshot()` | Actual disk verification for `manifestId/releaseId`, phase, ready, verified/total files and bytes, remaining bytes/file names, failures, errorCode, persistence protection and lastVerifiedAt. |
| `.install()` | Start/Retry/Resume complete installation through the shared verified manager. Does not clear saves, other project caches or successful current-release files. |
| `.pause()` | Stop admission after the active file; no false completion. Foreground gameplay remains independent. |
| `.audit()` | Reopen current CacheStorage and hash all actual files plus the canonical saved manifest. No trust in session counters or an old receipt alone. |
| `.reconcile()` | Cheap retained-file/receipt check; missing files revoke readiness. Full audits run on reopening and returning to the page. |

`ready` requires every declared player file, the HTML, worker and canonical manifest on retained storage, full digest/length verification, a matching final receipt and active worker capability. Browser quota/denial, failed content, missing files and incomplete recovery must not become Ready. Durable CacheStorage is different from the 32 MiB session cache. Storage protection is requested but may be denied; the UI discloses that saved files can be evicted. Clearing browser data can always remove the installation.

The worker recovers installed metadata after its own/browser restart. Offline navigation is pinned with `stm-release=<id>` and its manifest/assets cannot silently fall through to another release. Use the ordinary game address when checking for a later release after finishing a run. API responses, provider secrets, backend files, Developer Hub/fixtures/datasets and player records are not player offline package files. Existing public production client entry/access code is preserved under its current owner.

`STMHosted.downloads().online` is a legacy **cache-fallback** field; it is not the player mode or API permission. New consumers use `storageMode`, `mode`, `connectionHint` and the canonical interfaces above. A portable HTML with embedded `DC_ASSETS` is reported separately and does not create a browser-cache Ready receipt.

## Evidence boundary

See [owner design/audit](../ONLINE_OFFLINE_READINESS.md) and [latest verification](../audits/online-offline-readiness/LATEST.md). Local QA services exercise successful/failed requests without a real provider key; never describe these as live API validation. Native restart tests use a new browser process and retained profile with server/network unavailable, separate from the standalone portable check. Physical devices, other browser families, human audio audition, a final external pet UI/backend and live API availability remain distinct acceptance work.

## Reviewed branch acceptance

The gate now opens the same Settings modal when Offline preparation fails; explicitly selecting Online restarts normal entry. No duplicate mode control or implicit mode change is added. Every Ready transition rehashes actual reopened retained bytes, including warm install/audit and after receipt commit. Master evidence is in `docs/verification/online-offline-readiness/native-reviewed/report.json` (14checks), `review-gate-green.log`, `review-storage-green.log` and the final full suite. The complete candidate release contains769files/232,929,606bytes including the canonical manifest; readiness refers only to its reported release ID. Browser persistence protection was denied in native QA and is visibly disclosed. No external pet branch appears in the inspected37-branch inventory; this shared adapter still requires its pet/backend owner to register a live transport.


## Pet implementation candidate — 27 October 2026

Candidate2.53.0-pet.1 on codex/ai-pet-online-20261025 consumes this published contract on Mathematics Slayer main2.52.0 (7a49fff). It registers the protected server transport, original Emberlyn widget and original-Hint callback without changing the permission/installer owners. All added public resources require the new release manifest/full verification. Earlier paragraphs describe their pinned source; no live provider deployment or main publication is implied. [Actual implementation/setup](../PET_ASSISTANT.md), [audit](../audits/pet-assistant/LATEST.md).
