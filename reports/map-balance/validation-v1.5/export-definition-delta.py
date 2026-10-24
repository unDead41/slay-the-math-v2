"""Read the two canonical bindings; these are definition differences, not CP."""
import concurrent.futures
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
OLD = pathlib.Path(sys.argv[1]).resolve()
SCRIPT = "const x=require('./tools/balance/master/loader.cjs').loadMaster({difficulty:'medium'});process.stdout.write(JSON.stringify({identity:x.provenance,cards:x.binding.cardData(),artifacts:x.binding.artifactData()}));"


def load(root):
    return json.loads(subprocess.check_output(["node", "-e", SCRIPT], cwd=root, text=True))


def diff(a, b, path=""):
    if isinstance(a, dict) and isinstance(b, dict):
        return sum((diff(a.get(k), b.get(k), path+"."+k) for k in sorted(a.keys() | b.keys())), [])
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        return sum((diff(x, y, path+"["+str(i)+"]") for i, (x, y) in enumerate(zip(a, b))), [])
    return [] if a == b else [{"path": path, "old": a, "new": b}]


with concurrent.futures.ThreadPoolExecutor(2) as pool:
    old, new = list(pool.map(load, [OLD, ROOT]))
assert old["identity"]["version"] == "master-1.4.0-candidate.4"
assert new["identity"]["version"] == "master-1.5.0-candidate.5"
a = {c["id"]: c for c in old["cards"]["cards"]}
b = {c["id"]: c for c in new["cards"]["cards"]}
assert a.keys() == b.keys()
rows = [{"cardId": key, "name": b[key].get("name"), "changes": diff(a[key], b[key])} for key in sorted(a) if a[key] != b[key]]
data = {"oldIdentity": old["identity"], "newIdentity": new["identity"], "changedCards": rows, "artifactsEqual": old["artifacts"] == new["artifacts"], "scope": "Read actual canonical bindings only; engine resolver changes are separately pinned by source hashes. This is not a new simulation or card power test."}
(ROOT / "reports/map-balance/v1.5/runtime-definition-delta.json").write_text(json.dumps(data, indent=2)+"\n")
print(json.dumps({"changedCards": len(rows), "changedFields": sum(len(r["changes"]) for r in rows), "artifactDefinitionsEqual": data["artifactsEqual"]}))
