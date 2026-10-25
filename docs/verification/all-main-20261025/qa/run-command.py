import json, os, platform, subprocess, sys, time
from pathlib import Path

root, out, label, *command = sys.argv[1:]
out = Path(out)
out.mkdir(parents=True, exist_ok=True)
env = dict(os.environ)
env.update({
    'DOM_QA_MODULE': '/tmp/stm-icon-qa-deps/node_modules/jsdom',
    'BROWSER_QA_MODULE': os.environ['CODEX_PRIMARY_RUNTIME_NODE_MODULES'] + '/playwright',
    'IMAGE_QA_MODULE': os.environ['CODEX_PRIMARY_RUNTIME_NODE_MODULES'] + '/sharp',
    'NODE_PATH': '/tmp/stm-icon-qa-deps/node_modules:' + os.environ['CODEX_PRIMARY_RUNTIME_NODE_MODULES'],
    'QA_CHROMIUM_EXECUTABLE': '/tmp/chromium',
    'QA_DISABLE_GPU': '1',
    'NODE_OPTIONS': '--max-old-space-size=4096',
    'TMPDIR': str(out / 'tmp'),
    'TMP': str(out / 'tmp'),
    'TEMP': str(out / 'tmp'),
    'QA_OUTPUT': str(out / (label + '-artifacts')),
    'QA_SCREENSHOTS': str(out / (label + '-screenshots')),
    'QA_REPORT': str(out / (label + '-report.json')),
})
overrides = {}
for arg in list(command):
    if arg.startswith('QAENV:'):
        key, value = arg[6:].split('=', 1)
        env[key] = value
        overrides[key] = value
        command.remove(arg)
meta = {'label': label, 'cwd': root, 'command': command, 'start': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'environment': {k: env[k] for k in ['DOM_QA_MODULE','BROWSER_QA_MODULE','IMAGE_QA_MODULE','NODE_PATH','QA_CHROMIUM_EXECUTABLE','QA_DISABLE_GPU','NODE_OPTIONS','QA_OUTPUT','QA_SCREENSHOTS','QA_REPORT','TMPDIR']}, 'overrides': overrides, 'platform': platform.platform()}
started = time.monotonic()
with (out / (label + '.log')).open('w') as stream:
    result = subprocess.run(command, cwd=root, env=env, stdout=stream, stderr=subprocess.STDOUT)
meta.update(exitCode=result.returncode, elapsedSeconds=round(time.monotonic()-started, 3), log=str(out / (label + '.log')))
(out / (label + '.json')).write_text(json.dumps(meta, indent=2) + '\n')
print(json.dumps(meta, indent=2))
print((out / (label + '.log')).read_text()[-6000:])
sys.exit(result.returncode)
