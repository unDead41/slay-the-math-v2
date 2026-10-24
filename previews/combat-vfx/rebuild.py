"""Refresh the tracked offline preview from its editable modules; no game build."""
from pathlib import Path
import argparse
import hashlib
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Fail if the tracked HTML differs from its modules.')
args = parser.parse_args()
target = ROOT / 'index.html'
original = target.read_text(encoding='utf-8')
compiled = original
scripts = {
    'passive-circle-v5': 'passive-vfx.js',
    'shield-material-v3': 'shield-vfx.js',
    'orbital-material-v9': 'orbital-vfx.js',
    'reference-effects': 'effects.js',
    'reference-controller': 'controller.js',
}
for element_id, filename in scripts.items():
    source = (ROOT / filename).read_text(encoding='utf-8')
    pattern = r'(<script id="' + re.escape(element_id) + r'">)[\s\S]*?(</script>)'
    compiled, count = re.subn(pattern, lambda m: m[1] + source + m[2], compiled)
    if count != 1:
        raise SystemExit('Expected one inline module: ' + element_id)
styles = list(re.finditer(r'<style>[\s\S]*?</style>', compiled))
if len(styles) != 2:
    raise SystemExit('Expected the base artwork style and the editable preview style.')
css = '\n'.join((ROOT / f).read_text(encoding='utf-8') for f in
                ['preview-v2.css', 'shield-preview.css', 'passive-preview.css', 'aura-preview.css'])
last = styles[-1]
compiled = compiled[:last.start()] + '<style>' + css + '</style>' + compiled[last.end():]
(ROOT / 'dist').mkdir(exist_ok=True)
subprocess.run([sys.executable, str(ROOT / 'build-passive-catalog.py')], cwd=ROOT, check=True)
gallery = (ROOT / 'dist/passive-catalog.html').read_bytes()
if args.check:
    if compiled != original or gallery != (ROOT / 'passive-catalog.html').read_bytes():
        raise SystemExit('Tracked HTML is stale. Run rebuild.py and review the diff.')
    print('PASS: main preview and gallery match editable sources; artwork bytes retained.')
else:
    target.write_text(compiled, encoding='utf-8', newline='\n')
    (ROOT / 'passive-catalog.html').write_bytes(gallery)
    print('Rebuilt standalone preview and gallery. Production files were not touched.')
print('Preview SHA256:', hashlib.sha256(target.read_bytes()).hexdigest())
