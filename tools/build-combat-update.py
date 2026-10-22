"""Build the 2.2 cumulative in-place patch from the supplied 2.0/2.1 ZIPs."""
import argparse
import hashlib
import json
import shutil
import zipfile
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', type=Path, action='append', required=True)
parser.add_argument('--stage', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
project = Path(__file__).resolve().parents[1]
stage = args.stage.resolve()
if stage == project or project in stage.parents:
    parser.error('Stage directory must be outside the source project')
if stage.exists():
    parser.error('Use a new, empty stage path')
package = stage / 'STM-Combat-2.2'
payload = package / 'payload'
payload.mkdir(parents=True)

def sha(data):
    return hashlib.sha256(data).hexdigest()

baselines = []
for archive in args.base:
    with zipfile.ZipFile(archive) as bundle:
        prefix = 'slay-the-math-v2/'
        if prefix + 'package.json' not in bundle.namelist():
            parser.error('Unexpected project ZIP root: ' + str(archive))
        baselines.append({name[len(prefix):]: sha(bundle.read(name))
                          for name in bundle.namelist()
                          if name.startswith(prefix) and not name.endswith('/')})

manifest = {'schemaVersion': 1, 'release': '2.2.0',
            'projectName': 'duel-cube-math', 'supportedSourceVersions': ['2.0.0', '2.1.0'],
            'files': [], 'requires': [], 'portableBuiltLocally': True}
excluded = {'MAIN-SEKARANG.html', 'SLAY-THE-MATH-OFFLINE.html', 'AGENTS.md', 'APPLY-UPDATE.ps1'}
for source in sorted(project.rglob('*')):
    if not source.is_file() or any(part in {'.git', 'node_modules', '__pycache__'} for part in source.parts):
        continue
    relative = source.relative_to(project).as_posix()
    if relative in excluded:
        continue
    digest = sha(source.read_bytes())
    if all(base.get(relative) == digest for base in baselines):
        if relative.startswith('dist/') or relative in {'server.cjs', 'build-portable.cjs'}:
            manifest['requires'].append(relative)
        continue
    target = payload / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    manifest['files'].append({'path': relative, 'sha256': digest,
                              'previousHashes': sorted({base[relative] for base in baselines if relative in base})})

(package / 'UPDATE-MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
shutil.copy2(project / 'tools/windows/Apply-CombatUpdate.ps1', package / 'APPLY-UPDATE.ps1')
shutil.copy2(project / 'tools/windows/Rollback-CombatUpdate.ps1', package / 'ROLLBACK-UPDATE.ps1')
instructions = r'''SLAY THE MATH - COMBAT UPDATE 2.2

This is an in-place patch. Keep your existing VS Code window/project.
Confirmed target: C:\Users\ijmah\Desktop\slay-the-math-v2

Save Slay_the_Math_Combat_Update_v2_2.zip in Downloads.
Paste this entire block into the existing VS Code PowerShell terminal:

& {
    $ErrorActionPreference = 'Stop'
    $stmZip = Get-ChildItem -LiteralPath (Join-Path $env:USERPROFILE 'Downloads') -Filter 'Slay_the_Math_Combat_Update_v2_2*.zip' -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (!$stmZip) { throw 'ZIP Combat Update tidak ditemui dalam Downloads.' }
    $stmTemp = Join-Path $env:TEMP ('STM-combat-' + [guid]::NewGuid())
    try {
        Expand-Archive -LiteralPath $stmZip.FullName -DestinationPath $stmTemp
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $stmTemp 'STM-Combat-2.2\APPLY-UPDATE.ps1') -ProjectPath 'C:\Users\ijmah\Desktop\slay-the-math-v2'
        if ($LASTEXITCODE -ne 0) { throw 'Pemasangan gagal. Baca mesej di atas.' }
    } finally {
        if (Test-Path -LiteralPath $stmTemp) { Remove-Item -LiteralPath $stmTemp -Recurse -Force }
    }
    Set-Location -LiteralPath 'C:\Users\ijmah\Desktop\slay-the-math-v2'
    Remove-Item Env:PORT -ErrorAction SilentlyContinue
    & npm.cmd start
}

Open http://localhost:4173 and refresh with Ctrl+F5. Continue keeps your save.
The installer verifies affected files, backs them up and rebuilds the offline HTML.
It never opens another VS Code window or creates another Desktop project.

If it reports unknown file edits, no files are replaced: merge those edits first.
If port 4173 belongs to another folder, stop that server with Ctrl+C and rerun.
Only the server proven to serve this exact target folder may be stopped automatically.

Rollback: stop the server, then run ROLLBACK-UPDATE.ps1 inside the printed backup folder.
More details: payload\MULA-DI-SINI.md and payload\docs\VERIFICATION_2_2.md.
'''
(package / 'INSTALL-DALAM-TERMINAL.txt').write_text(instructions, encoding='utf-8')
args.output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(args.output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as bundle:
    for source in sorted(package.rglob('*')):
        if source.is_file():
            bundle.write(source, source.relative_to(stage))
with zipfile.ZipFile(args.output) as bundle:
    assert bundle.testzip() is None
print(json.dumps({'zip': str(args.output.resolve()), 'stage': str(package),
                  'filesToInstall': len(manifest['files']), 'requiredExistingFiles': len(manifest['requires']),
                  'bytes': args.output.stat().st_size, 'sha256': sha(args.output.read_bytes())}, indent=2))
