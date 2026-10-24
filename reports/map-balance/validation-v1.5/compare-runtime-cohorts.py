"""Compare existing real-engine records; never create simulations or pooled CP."""
import collections
import csv
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / "reports/map-balance/v1.5"


def read(path):
    return json.loads(path.read_text())


def campaigns(folder):
    selected = {}
    for shard in read(folder / "trials-index.json")["shards"]:
        file = folder / shard["file"]
        if file.exists():
            data = file.read_bytes()
        else:
            assert folder.parent.name == "v1.4", "A current trial shard is missing"
            data = subprocess.check_output(["git", "show", "8606616a475f21cc95bc5e4fc202c8914498bd78:" + str(file.relative_to(ROOT))], cwd=ROOT)
        assert hashlib.sha256(data).hexdigest() == shard["sha256"]
        for line in data.decode().splitlines():
            record = json.loads(line)
            task = record["task"]
            if task["batch"] == "campaign" and task["repetition"] == 0:
                assert task["id"] not in selected
                selected[task["id"]] = record
    assert len(selected) == 800
    return selected


def table(name, rows):
    (OUT / (name + ".json")).write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n")
    columns = list(dict.fromkeys(k for row in rows for k in row))
    with (OUT / (name + ".csv")).open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


rows, summaries, ranks, inputs = [], [], [], {}
resolved = {"VICTORY", "DEFEAT"}
for tier in ["easy", "medium", "hard"]:
    folder = OUT / tier
    proof = read(ROOT / ("reports/map-balance/validation-v1.5/" + tier + "-independent.json"))
    assert proof["status"] == "PASS"
    old_folder = ROOT / "reports/map-balance/v1.4" / tier
    old, new = campaigns(old_folder), campaigns(folder)
    assert old.keys() == new.keys()
    groups = collections.defaultdict(list)
    for task_id in sorted(new):
        a, b = old[task_id], new[task_id]
        for key in ["seed", "runSeed", "difficulty"]:
            assert a[key] == b[key], (tier, task_id, key)
        for key in ["policy", "predictProfile", "repetition", "group"]:
            assert a["task"][key] == b["task"][key], (tier, task_id, key)
        sa, sb = a["status"], b["status"]
        row = {"difficulty": tier, "taskId": task_id, "seed": b["seed"], "runSeed": b["runSeed"], "policy": b["task"]["policy"], "predictProfile": b["task"]["predictProfile"], "oldContextId": a["contextId"], "newContextId": b["contextId"], "oldVersion": a["runtimeIdentity"]["version"], "newVersion": b["runtimeIdentity"]["version"], "oldStatus": sa, "newStatus": sb, "bothResolved": sa in resolved and sb in resolved, "resolvedWinDelta": int(sb == "VICTORY") - int(sa == "VICTORY") if sa in resolved and sb in resolved else None, "oldFinalHp": a.get("final", {}).get("hp"), "newFinalHp": b.get("final", {}).get("hp"), "oldFinalGold": a.get("final", {}).get("gold"), "newFinalGold": b.get("final", {}).get("gold"), "oldTraceHash": a.get("traceHash"), "newTraceHash": b.get("traceHash"), "interpretation": "Same task/seed/runSeed; bundled runtime change, not an isolated card/map effect"}
        rows.append(row)
        groups[row["policy"], row["predictProfile"]].append(row)
    for (policy, predict), cases in groups.items():
        n = len(cases)
        assert n == 100
        counts = collections.Counter((r["oldStatus"], r["newStatus"]) for r in cases)
        old_w = sum(r["oldStatus"] == "VICTORY" for r in cases)
        new_w = sum(r["newStatus"] == "VICTORY" for r in cases)
        old_u = sum(r["oldStatus"] not in resolved for r in cases)
        new_u = sum(r["newStatus"] not in resolved for r in cases)
        summaries.append({"difficulty": tier, "policy": policy, "predictProfile": predict, "pairedCases": n, "oldWins": old_w, "newWins": new_w, "oldLosses": n-old_w-old_u, "newLosses": n-new_w-new_u, "oldUnknown": old_u, "newUnknown": new_u, "oldLowerWinBound": old_w/n, "oldUpperWinBound": (old_w+old_u)/n, "newLowerWinBound": new_w/n, "newUpperWinBound": (new_w+new_u)/n, "winRateDeltaWhenFullyResolved": (new_w-old_w)/n if not old_u and not new_u else None, "oldLossToNewWin": counts["DEFEAT", "VICTORY"], "oldWinToNewLoss": counts["VICTORY", "DEFEAT"], "bothWin": counts["VICTORY", "VICTORY"], "bothLoss": counts["DEFEAT", "DEFEAT"], "unresolvedPairs": sum(not r["bothResolved"] for r in cases), "interpretation": "Fixed repetition0 comparison only; no CP pooling or isolated causal claim"})
    contrasts = read(folder / "matched-contrasts.json")
    for stage in [1, 2]:
        for rank in ["median", "hardest"]:
            pairs = [r for r in contrasts if r["stage"] == stage and r["challengerRank"] == rank]
            complete = [r for r in pairs if r["resolved"]]
            ranks.append({"difficulty": tier, "stage": stage, "challengerRank": rank, "controlRank": "easiest", "entryPairs": len(pairs), "resolvedPairs": len(complete), "winDeltaSum": sum(r["winDelta"] for r in complete), "interpretation": "Actual identical entry state/RNG within each pair; conditional Stage2; N1 per seed"})
    for file in [old_folder/"manifest.json", folder/"manifest.json", folder/"context.json"]:
        inputs[str(file.relative_to(ROOT))] = hashlib.sha256(file.read_bytes()).hexdigest()

table("paired-runtime-cases", rows)
table("paired-runtime-summary", summaries)
table("matched-rank-outcomes", ranks)
old_inputs = read(ROOT / "reports/map-balance/v1.4/runtime-inputs.json")
new_inputs = read(OUT / "runtime-inputs.json")
parity = [{"difficulty": a["difficulty"], **{key+"Equal": a[key] == b[key] for key in ["profile", "referenceStarterBeforeArtifact", "referenceNewRun", "enemyTemplates"]}} for a, b in zip(old_inputs["profiles"], new_inputs["profiles"])]
inputs[str(pathlib.Path(__file__).relative_to(ROOT))] = hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()
(OUT / "runtime-comparison-provenance.json").write_text(json.dumps({"oldSource": "990541d57c6df96cefb21eddc7a365d1d989a74d", "newSource": "b730cad0cb27b53ffbdf687d8fc9edaed143ef43", "pairedCampaigns": len(rows), "inputParity": parity, "inputHashes": inputs, "causalAttribution": False, "pupilCalibration": False}, indent=2) + "\n")
print(json.dumps({"pairedCampaigns": len(rows), "conditionRows": len(summaries), "matchedRankRows": len(ranks), "sameSeedRunSeed": True}))
