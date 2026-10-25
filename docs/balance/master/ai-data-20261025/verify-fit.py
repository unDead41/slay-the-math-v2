"""Independent arithmetic/hash check. Run from repo root after fixed calibration."""
import gzip
import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path

base = Path("reports/ai-playtester/data-20261025/train")
manifest = json.loads((base / "exchange/manifest.json").read_text())
for name, metadata in manifest["files"].items():
    data = (base / "exchange" / name).read_bytes()
    assert len(data) == metadata["bytes"]
    assert hashlib.sha256(data).hexdigest() == metadata["sha256"]
raw = [json.loads(line) for line in gzip.decompress((base / "raw.jsonl.gz").read_bytes()).decode().splitlines()]
capsule = json.loads(gzip.decompress((base / "source-capsule.json.gz").read_bytes()))
for report in raw:
    assert report["options"]["experience"] == "off"
    assert report["options"]["seed"] == 93
    for name, digest in report["sources"].items():
        assert hashlib.sha256(capsule[name].encode()).hexdigest() == digest
assert len(raw) == 528
assert sum(len(r["rows"]) for r in raw) == 1152
observations = [json.loads(line) for line in (base / "exchange/observations.jsonl").read_text().splitlines()]
model = json.loads((base / "candidate-model.json").read_text())
assert model == json.loads(Path("tools/ai-playtester/experience-model.json").read_text())
assert model["trainingSeeds"] == [93] and model["validationSeeds"] == [701, 702]
assert model["inputDigest"] == manifest["files"]["observations.jsonl"]["sha256"]
tables = defaultdict(lambda: defaultdict(list))
for o in observations:
    assert o["status"] == "COMPLETE" and o["seed"] == 93 and o["split"] == "train"
    assert o["skill"] == "intermediate" and o["experience"] == "off"
    assert o["source"] == manifest["source"]
    assert [c["mask"] for c in o["cells"]] == list(range(1 << len(o["cards"])))
    assert all(c["status"] in ("WIN", "LOSS") and math.isfinite(c["utility"]) for c in o["cells"])
    runtime = o["runtime"]
    identity = {k: runtime[k] for k in ("version", "difficulty", "definitionHash", "engineHash")}
    key = hashlib.sha256(json.dumps(identity, separators=(",", ":")).encode()).hexdigest()
    upgraded = str(o["upgraded"]).lower()
    u = [c["utility"] for c in o["cells"]]
    if len(o["cards"]) == 1:
        tables[key][("cards", o["cards"][0] + ":" + upgraded)].append(u[1] - u[0])
    else:
        name = "|".join(c + ":" + upgraded for c in sorted(o["cards"]))
        tables[key][("pairs", name)].append(u[3] - u[1] - u[2] + u[0])
assert len(tables) == 3 and len(observations) == 528
entries = 0
for runtime, values in tables.items():
    for (kind, name), deltas in values.items():
        entry = model["profiles"][runtime][kind][name]
        n = len(deltas)
        mean = sum(deltas) / n
        adjustment = max(-0.25, min(0.25, mean / 20 * n / (n + 5)))
        assert entry["contexts"] == n
        assert math.isclose(entry["meanDelta"], mean, abs_tol=1e-12)
        assert math.isclose(entry["adjustment"], adjustment, abs_tol=1e-12)
        entries += 1
print(json.dumps({"status": "PASS", "reports": 528, "outcomes": 1152, "observations": len(observations), "profiles": len(tables), "entries": entries, "arithmetic": "independent Python recomputation", "rawSourceHashes": "all matched capsule", "modelId": model["id"]}, indent=2))
