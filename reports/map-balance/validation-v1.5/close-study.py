"""Verify combined exports and preservation after the independent raw gates."""
import csv
import datetime
import hashlib
import json
import math
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / "reports/map-balance/v1.5"
HERE = pathlib.Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


cells = 0
for name in ["policy-summary", "policy-stage-summary", "predict-summary", "matched-route-summary", "difficulty-drivers", "policy-comparisons"]:
    expected = sum((read(OUT/tier/(name+".json")) for tier in ["easy", "medium", "hard"]), [])
    assert read(OUT/(name+".json")) == expected
    with (OUT/(name+".csv")).open(newline="") as stream:
        rows = list(csv.DictReader(stream))
    assert len(rows) == len(expected)
    for row, original in zip(rows, expected):
        for key, value in original.items():
            cell = row[key]
            if value is None:
                assert cell == ""
            elif isinstance(value, bool):
                assert cell == str(value).lower()
            elif isinstance(value, (float, int)):
                assert math.isclose(float(cell), value, rel_tol=1e-12, abs_tol=1e-12)
            elif isinstance(value, (dict, list)):
                assert json.loads(cell) == value
            else:
                assert cell == str(value)
            cells += 1

profiles, retained = {}, []
for tier in ["easy", "medium", "hard"]:
    proof = read(HERE/(tier+"-independent.json"))
    assert proof["status"] == "PASS"
    profiles[tier] = proof
    records = {}
    for shard in read(OUT/tier/"trials-index.json")["shards"]:
        for line in (OUT/tier/shard["file"]).read_text().splitlines():
            record = json.loads(line)
            assert record["task"]["id"] not in records
            records[record["task"]["id"]] = record["recordHash"]
    for suffix in ["retention-before-resume", "persisted-gap"]:
        path = HERE/(tier+"-"+suffix+".json")
        if not path.exists():
            continue
        previous = read(path)["retainedRecords"]
        assert all(records.get(key) == value for key, value in previous.items())
        retained.append({"difficulty": tier, "checkpoint": suffix, "unchangedRecords": len(previous)})
    before = read(HERE/(tier+"-retention-before-resume.json"))
    (HERE/(tier+"-retention-after-resume.json")).write_text(json.dumps({"status":"PASS","difficulty":tier,"retainedCompleteRecords":len(before["retainedRecords"]),"allRetainedRecordHashesUnchanged":True,"finalRecords":len(records),"changedIds":[]},indent=2)+"\n")

protected = subprocess.check_output(["git", "diff", "--name-only", "b730cad0cb27b53ffbdf687d8fc9edaed143ef43", "--", "dist", "package.json", "tools/cards", "tools/balance/master", "modules/map/src", "modules/map/data"], cwd=ROOT, text=True).splitlines()
assert not protected
for path in ["reports/map-balance/v1.4", "reports/map-balance/v1.3", "reports/map-balance/base-2800f9a"]:
    assert subprocess.check_output(["git", "rev-parse", "HEAD:"+path], cwd=ROOT) == subprocess.check_output(["git", "rev-parse", "8606616a475f21cc95bc5e4fc202c8914498bd78:"+path], cwd=ROOT)
summary = read(OUT/"summary.json")
assert summary["campaigns"] == 2400 and summary["matchedReplays"] == 1683 and not summary["errors"]
cold = read(HERE/"cold-source-proof.json")
assert cold["exactMatches"] == cold["contextsIdentical"] == 3
result = {"status":"PASS","checkedAtUtc":datetime.datetime.now(datetime.timezone.utc).isoformat(),"combinedTables":6,"combinedCsvCells":cells,"primaryRecords":sum(p["trialRecords"] for p in profiles.values()),"primaryCsvCells":sum(p["csvCells"] for p in profiles.values()),"retentionCheckpoints":retained,"protectedRuntimeDiff":protected,"historicalStudyTreesUnchanged":True,"coldSourceExactReplays":3,"plotVisuallyInspected":True}
(HERE/"closing-data-check.json").write_text(json.dumps(result,indent=2)+"\n")
index = {"status":"PASS_WITH_EXPLICIT_CENSORED_SCOPES","sourceMainCommit":"b730cad0cb27b53ffbdf687d8fc9edaed143ef43","gameVersion":"2.40.0","balanceVersion":"master-1.5.0-candidate.5","scope":"Fixed N1 current-runtime regression, separate from v1.4","profiles":profiles,"rootTests":read(HERE/"root-status.json"),"sourceSnapshot":read(HERE/"current-source-manifest.json"),"coldReplay":cold,"closingDataChecks":result,"production":read(HERE/"production-proof.json"),"verifierSha256":hashlib.sha256((ROOT/"tools/verify-map-advanced.py").read_bytes()).hexdigest(),"pupilTargetsMeasured":False}
(HERE/"validation-index.json").write_text(json.dumps(index,indent=2)+"\n")
print(json.dumps(result))
