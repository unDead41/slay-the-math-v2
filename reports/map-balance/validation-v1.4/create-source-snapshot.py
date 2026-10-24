"""Freeze the exact measured inputs without including player assets or raw trials."""
import gzip
import hashlib
import io
import json
import pathlib
import subprocess
import tarfile

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = pathlib.Path(__file__).resolve().parent
expected = {}
context_ids = {}
for tier in ["easy", "medium", "hard"]:
    context = json.loads((ROOT / "reports/map-balance/v1.4" / tier / "context.json").read_text())
    context_ids[tier] = hashlib.sha256(json.dumps(context, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest()
    for key in ["sourceHashes", "legacyToolHashes", "protocolHashes", "referenceHashes"]:
        for name, sha in context[key].items():
            assert name not in expected or expected[name] == sha
            expected[name] = sha
analysis = json.loads((ROOT / "reports/map-balance/v1.4/easy/analysis-provenance.json").read_text())
expected.update(analysis["analysisHashes"])
ordinary = json.loads(subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require('./tools/balance/map/source-audit.cjs').sourceAudit().sourceHashes))"], cwd=ROOT, text=True))
for name, sha in ordinary.items():
    assert name not in expected or expected[name] == sha
    expected[name] = sha
# The unused default replay is initialized when its module is imported. Capture
# its archived cartridge and other read dependencies too, so cold replay works.
trace = """
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),root=process.cwd(),read=fs.readFileSync,seen=new Set();
fs.readFileSync=function(file,...args){if(typeof file==='string'&&path.resolve(file).startsWith(root+path.sep))seen.add(path.resolve(file));return read.call(this,file,...args);};
require('./tools/balance/map-advanced/experiments.cjs');
const {runtimeFor}=require('./tools/balance/map-advanced/runtime.cjs');for(const difficulty of ['easy','medium','hard'])runtimeFor({runtimeBuild:'master',difficulty});
process.stdout.write(JSON.stringify(Object.fromEntries([...seen].sort().map(file=>[path.relative(root,file),crypto.createHash('sha256').update(read.call(fs,file)).digest('hex')]))));
"""
for name, sha in json.loads(subprocess.check_output(["node", "-e", trace], cwd=ROOT, text=True)).items():
    assert name not in expected or expected[name] == sha
    expected[name] = sha
for name in ["tools/verify-map-advanced.py", "AGENTS.md", "MASTER_SOR_PROJECT.md", str(pathlib.Path(__file__).resolve().relative_to(ROOT))]:
    expected[name] = hashlib.sha256((ROOT / name).read_bytes()).hexdigest()

buffer = io.BytesIO()
files = {}
with tarfile.open(fileobj=buffer, mode="w", format=tarfile.PAX_FORMAT) as archive:
    for name, sha in sorted(expected.items()):
        path = ROOT / name
        assert path.resolve().is_relative_to(ROOT.resolve())
        data = path.read_bytes()
        assert hashlib.sha256(data).hexdigest() == sha, name
        info = tarfile.TarInfo(name)
        info.size, info.mode, info.mtime = len(data), 0o644, 0
        archive.addfile(info, io.BytesIO(data))
        files[name] = {"sha256": sha, "bytes": len(data)}
payload = gzip.compress(buffer.getvalue(), mtime=0)
archive_path = OUT / "current-source-990541d.tar.gz"
archive_path.write_bytes(payload)
manifest = {"sourceMainCommit": "990541d57c6df96cefb21eddc7a365d1d989a74d", "measuredGameVersion": "2.37.0", "contextIds": context_ids, "archive": archive_path.name, "archiveSha256": hashlib.sha256(payload).hexdigest(), "archiveBytes": len(payload), "files": files, "scope": "Exact source/protocol/reference/analysis plus ordinary audit dependencies. Source-only replay, not a complete player asset distribution."}
(OUT / "current-source-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(json.dumps({"files": len(files), "archiveBytes": len(payload), "sha256": manifest["archiveSha256"]}))
