import json, os, subprocess, sys
from pathlib import Path

out = Path(__file__).parent
roots = {'candidate': out.parent / 'release-integration', 'baseline': out.parent / 'preload-main-baseline'}
failed = set()
samples = []
for attempt in range(1, 4):
    for kind, root in roots.items():
        if kind in failed:
            continue
        label = f'preload-{kind}-boundary-{attempt}'
        command = [sys.executable, str(out/'run-command.py'), str(root), str(out), label, 'QAENV:QA_DIST=release-prod', f'QAENV:QA_DIAGNOSTIC_SOURCE={out}/{label}.executed.cjs', 'node', str(out/'preload-boundary-probe.cjs')]
        result = subprocess.run(command, cwd=root, capture_output=True, text=True)
        record = json.loads((out/(label+'.json')).read_text())
        line = next((line for line in (out/(label+'.log')).read_text().splitlines() if line.startswith('BOUNDARY_DIAGNOSTIC ')), None)
        diagnostic = json.loads(line.split(' ',1)[1]) if line else None
        samples.append({'kind':kind,'attempt':attempt,'label':label,'exitCode':result.returncode,'diagnostic':diagnostic})
        if result.returncode:
            failed.add(kind)
        print(json.dumps({'kind':kind,'attempt':attempt,'exitCode':result.returncode,'available':diagnostic['complete']['p']['availableFiles'] if diagnostic else None,'total':diagnostic['complete']['p']['totalFiles'] if diagnostic else None,'missing':diagnostic['complete'].get('missing') if diagnostic else None}), flush=True)
result = {'status':'DIAGNOSTIC_COLLECTION_COMPLETE','failedKinds':sorted(failed),'samples':samples,'limits':'At most three first-boundary probes per snapshot; no runtime or assertion changes. Does not erase the original failed whole-suite run.'}
(out/'preload-boundary-samples.json').write_text(json.dumps(result,indent=2)+'\n')
