"""Restore and verify the measured source tree into a new, empty directory."""
import hashlib
import json
import pathlib
import subprocess
import sys
import tarfile

here = pathlib.Path(__file__).resolve().parent
manifest = json.loads((here / "current-source-manifest.json").read_text())
archive = here / manifest["archive"]
assert hashlib.sha256(archive.read_bytes()).hexdigest() == manifest["archiveSha256"]
dest = pathlib.Path(sys.argv[1]).resolve()
if dest.exists() and any(dest.iterdir()):
    raise SystemExit("Choose a new or empty source directory.")
dest.mkdir(parents=True, exist_ok=True)
seen = set()
with tarfile.open(archive, "r:gz") as source:
    for member in source.getmembers():
        path = (dest / member.name).resolve()
        assert member.isfile() and path.is_relative_to(dest) and member.name not in seen
        info = manifest["files"][member.name]
        data = source.extractfile(member).read()
        assert len(data) == info["bytes"] and hashlib.sha256(data).hexdigest() == info["sha256"]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        seen.add(member.name)
assert seen == set(manifest["files"])
subprocess.run(["git", "init", "--quiet", str(dest)], check=True)
subprocess.run(["git", "-C", str(dest), "add", "."], check=True)
subprocess.run(["git", "-C", str(dest), "-c", "user.name=Map audit", "-c", "user.email=map-audit@example.invalid", "commit", "--quiet", "-m", "Restore measured map audit source"], check=True)
print(json.dumps({"restoredFiles": len(seen), "sourceRoot": str(dest), "gameVersion": manifest["measuredGameVersion"]}))
