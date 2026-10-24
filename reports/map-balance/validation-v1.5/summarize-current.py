"""Descriptive handoff tables/figure; never generates CP or runs game actions."""
import collections
import csv
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / "reports/map-balance/v1.5"


def read(path):
    return json.loads(path.read_text())


def write_table(name, rows):
    (OUT / (name + ".json")).write_text(json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + "\n")
    with (OUT / (name + ".csv")).open("w", newline="") as f:
        columns = list(dict.fromkeys(k for row in rows for k in row))
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows({k: str(v).lower() if isinstance(v, bool) else v for k, v in row.items()} for row in rows)


profiles, cohorts, censored = [], [], []
for tier in ["easy", "medium", "hard"]:
    folder = OUT / tier
    summary = read(folder / "summary.json")
    assert summary["evaluationComplete"] and summary["campaignReturned"] == 800
    proof = read(ROOT / ("reports/map-balance/validation-v1.5/" + tier + "-independent.json"))
    assert proof["status"] == "PASS" and proof["contextId"] == summary["contextId"]
    policies = read(folder / "policy-summary.json")
    counts = collections.defaultdict(collections.Counter)
    for shard in read(folder / "trials-index.json")["shards"]:
        for line in (folder / shard["file"]).read_text().splitlines():
            trial = json.loads(line)
            assert trial["contextId"] == summary["contextId"]
            if trial["task"]["batch"] == "campaign":
                counts[trial["task"]["policy"], trial["predictProfile"]][trial["status"]] += 1
            if trial["status"] == "BENCHMARK_LIMIT_CENSORED":
                last = trial["rooms"][-1] if trial["rooms"] else {}
                censored.append({"difficulty": tier, "contextId": trial["contextId"], "taskId": trial["task"]["id"], "batch": trial["task"]["batch"], "seed": trial["seed"], "runSeed": trial["runSeed"], "policy": trial["task"]["policy"], "predictProfile": trial["predictProfile"], "stageStopped": trial.get("final", {}).get("stage"), "lastNodeId": last.get("nodeId"), "lastRoomType": last.get("roomType"), "enemyId": last.get("enemyId"), "apiCalls": trial["apiCalls"], "reason": trial["error"], "traceHash": trial.get("traceHash")})
    for row in policies:
        raw = counts[row["policy"], row["predictProfile"]]
        assert (row["wins"], row["losses"], row["censored"]) == (raw["VICTORY"], raw["DEFEAT"], raw["BENCHMARK_LIMIT_CENSORED"])
        assert sum(raw.values()) == row["plannedTrials"]
    drivers = read(folder / "difficulty-drivers.json")
    for stage in [1, 2]:
        for forced, no_rest in [(False, False), (True, False), (False, True), (True, True)]:
            rows = [d for d in drivers if d["stage"] == stage and d["forcedElite"] == forced and d["noEarlyRest"] == no_rest]
            entries = sum(d["observedStageEntries"] for d in rows)
            deaths = sum(d["deathsBeforeFirstRest"] for d in rows)
            cohorts.append({"difficulty": tier, "contextId": summary["contextId"], "stage": stage, "forcedElite": forced, "noEarlyRest": no_rest, "mapInstances": len(rows), "feedbackStageEntries": entries, "deathsBeforeFirstRest": deaths, "observedEarlyDeathFraction": deaths / entries if entries else None, "mysteryFailureHpLossWindows": sum(d["mysteryFailureHpLossWindows"] for d in rows), "mysteryFailureDeathsBeforeRest": sum(d["mysteryFailureDeathsBeforeRest"] for d in rows), "shopVisits": sum(d["shopVisits"] for d in rows), "zeroAffordableCardVisits": sum(d["zeroAffordableCardVisits"] for d in rows), "interpretation": "Disjoint structural groups; repeated feedback route-policy entries; Stage2 conditional; descriptive, not causal"})
    profiles.append({"difficulty": tier, "contextId": summary["contextId"], "summary": summary, "policies": policies, "nominalRankPointInversions": sum(bool(d["rankPointInversion"]) for d in drivers)})

write_table("structural-cohort-outcomes", cohorts)
write_table("censored-cases", censored)
(OUT / "handoff-findings.json").write_text(json.dumps({"profiles": profiles, "censoredCaseCount": len(censored), "pupilTargetsMeasured": False, "scoreInterpretation": "Use per-scope CP/intervals in original tables. No pooled CP is calculated here."}, indent=2) + "\n")

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

conditions = [("uniform-visible-v1", "feedback", "Uniform"), ("avoid-elite", "feedback", "Avoid Elite"), ("seek-reward", "feedback", "Seek reward"), ("seek-shop", "feedback", "Seek Shop"), ("health-recovery", "feedback", "Recovery"), ("health-recovery", "high", "Predict high*"), ("health-recovery", "low", "Predict low*"), ("health-recovery", "skip", "Skip Predict")]
fig, axes = plt.subplots(1, 3, figsize=(13, 5), sharex=True, sharey=True)
for ax, profile in zip(axes, profiles):
    lookup = {(r["policy"], r["predictProfile"]): r for r in profile["policies"]}
    for y, (policy, predict, _) in enumerate(conditions):
        row = lookup[policy, predict]
        unknown = row["plannedTrials"] - row["wins"] - row["losses"]
        left = 0
        for count, color, hatch in [(row["wins"], "#23664d", None), (row["losses"], "#b24732", None), (unknown, "#c49a36", "///")]:
            width = 100 * count / row["plannedTrials"]
            ax.barh(y, width, left=left, height=.65, color=color, hatch=hatch)
            left += width
        ax.text(103, y, f"{row['wins']}/{row['losses']}/{unknown}", va="center", fontsize=8)
    ax.set_title(profile["difficulty"].title())
    ax.set_xlim(0, 127)
    ax.set_xticks([0, 25, 50, 75, 100])
    ax.set_xlabel("% of planned campaigns")
    ax.spines[["top", "right"]].set_visible(False)
axes[0].set_yticks(range(len(conditions)), [c[2] for c in conditions])
axes[0].invert_yaxis()
fig.suptitle("Map 2.40 regression: real-engine bot campaign outcomes", fontsize=14)
fig.text(.12, .03, "Green: win | Red: defeat | Hatched: unresolved. Labels W/L/unknown; All conditions N=100 per tier; fixed regression pilot.\n*High/low use disclosed synthetic knowledge. Master candidate.5, sourceb730cad. Pupil targets remain unmeasured.", fontsize=9)
fig.tight_layout(rect=(0, .12, 1, .94))
fig.savefig(OUT / "policy-outcomes.png", dpi=150)
plt.close(fig)

inputs = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in [pathlib.Path(__file__), *[OUT / t / "manifest.json" for t in ["easy", "medium", "hard"]]]}
(OUT / "handoff-analysis-provenance.json").write_text(json.dumps({"inputHashes": inputs, "matplotlibVersion": matplotlib.__version__, "method": "Raw campaign status reconciliation, descriptive structural cohorts and outcome plot; no new simulation or CP model."}, indent=2) + "\n")
print(json.dumps({"profiles": len(profiles), "cohortRows": len(cohorts), "censoredCases": len(censored), "campaignCountsReconciled": True}))
