#!/usr/bin/env python3
"""Import MUSIC(5).zip: preserve pack 4 and master only its 26 new voices.

Requires FFmpeg/ffprobe. The supplied ZIP is never modified. Re-run with
python3 tools/import-audio-v3.py '/path/to/MUSIC(5).zip'
"""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
GROUPS = {
    'question': ('answering question/question_talking_{}.mp3', range(4, 8)),
    'hint': ('getting hint/hint_talking_{}.mp3', range(5, 9)),
    'more_hint': ('getting more hint/more_hint_talking_{}.mp3', range(5, 9)),
    'correct': ('correct answer/corret_answer_talking_{}.mp3', range(1, 6)),
    'wrong': ('wrong answer/wrong_answer_talking_{}.mp3', range(1, 10)),
}
LABELS = {'question': 'New interactive question', 'hint': 'Hint revealed',
          'more_hint': 'More Hint revealed', 'correct': 'Checked correct answer',
          'wrong': 'Checked wrong answer'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def run(args):
    return subprocess.run(args, check=True, capture_output=True)


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
        temporary = Path(f.name)
    if sha(temporary.read_bytes()) != sha(data):
        raise ValueError('Write verification failed: ' + str(path))
    temporary.replace(path)


def write_json(path, data):
    write(path, (json.dumps(data, indent=2, ensure_ascii=False) + '\n').encode())


def probe(path):
    result = json.loads(run(['ffprobe', '-v', 'error', '-show_format', '-show_streams',
                            '-of', 'json', str(path)]).stdout)
    stream = next(s for s in result['streams'] if s['codec_type'] == 'audio')
    return {'duration': float(result['format']['duration']),
            'sampleRate': int(stream['sample_rate']), 'channels': stream['channels']}


def measure(path):
    result = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(path), '-af',
                  'loudnorm=I=-18:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'])
    values = json.loads(re.findall(r'\{[^{}]+\}', result.stderr.decode())[-1])
    if not all(math.isfinite(float(values[k])) for k in
               ['input_i', 'input_tp', 'input_lra', 'input_thresh', 'target_offset']):
        raise ValueError('Non-finite audio measurement')
    return values


def master(source, target):
    before = measure(source)
    loudnorm = ('loudnorm=I=-18:TP=-2:LRA=7:linear=true:print_format=json:'
                'measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:'
                'measured_thresh={input_thresh}:offset={target_offset}').format(**before)
    correction = 0.0
    for _ in range(4):
        result = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(source), '-map', '0:a:0',
                      '-map_metadata', '-1', '-af', loudnorm + f',volume={correction}dB',
                      '-ar', '44100', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '128k',
                      '-f', 'mp3', 'pipe:1'])
        write(target, result.stdout)
        encoded = measure(target)
        delta = min(-18 - float(encoded['input_i']), -1.15 - float(encoded['input_tp']))
        if abs(float(encoded['input_i']) + 18) <= .1 and float(encoded['input_tp']) <= -1:
            break
        correction += delta
    first = {**probe(source), 'integratedLufs': float(before['input_i']),
             'truePeakDbTP': float(before['input_tp'])}
    final = {**probe(target), 'integratedLufs': float(encoded['input_i']),
             'truePeakDbTP': float(encoded['input_tp'])}
    if abs(final['integratedLufs'] + 18) > .5 or final['truePeakDbTP'] > -1:
        raise ValueError('Encoded output failed loudness/peak acceptance: ' + str(target))
    if abs(first['duration'] - final['duration']) >= .1:
        raise ValueError('Output duration changed: ' + str(target))
    run(['ffmpeg', '-v', 'error', '-nostdin', '-i', str(target), '-f', 'null', '-'])
    mode = json.loads(re.findall(r'\{[^{}]+\}', result.stderr.decode())[-1])['normalization_type']
    return first, final, mode, round(correction, 4)


def import_zip(zip_path):
    original_bytes = zip_path.read_bytes()
    pack = json.loads((ROOT / 'dist/assets/music/audio-pack-4.json').read_text())
    previous = json.loads((ROOT / 'docs/audio/source-pack-4/audio-manifest.v2.json').read_text())
    audit = {'version': 3, 'sourcePack': 5,
             'sourceZip': {'name': zip_path.name, 'sha256': sha(original_bytes), 'sizeBytes': len(original_bytes)},
             'target': {'integratedLufs': -18, 'toleranceLu': .5, 'processingTruePeakDbTP': -2,
                        'maximumEncodedTruePeakDbTP': -1, 'lra': 7, 'sampleRate': 44100,
                        'channels': 2, 'codec': 'libmp3lame', 'bitrate': '128k'},
             'ffmpeg': run(['ffmpeg', '-version']).stdout.decode().splitlines()[0],
             'previousAssetsVerified': [], 'newAssets': [],
             'limits': ['Post-encoding measurement and decode; human audition/transcripts not verified.',
                        'Source v2 manifest is historical and omits these 26 new recordings.']}
    with zipfile.ZipFile(zip_path) as z, tempfile.TemporaryDirectory(prefix='stm-audio-') as temporary:
        if z.testzip() is not None:
            raise ValueError('ZIP integrity failed')
        for item in previous['assets']:
            member = 'MUSIC/' + item['packagePath']
            if sha(z.read(member)) != item['packageSha256']:
                raise ValueError('Unexpected change to previous package asset: ' + item['id'])
            runtime = ROOT / 'dist' / pack['assets'][item['id']]['srcs'][0]
            if sha(runtime.read_bytes()) != item['packageSha256']:
                raise ValueError('Previous runtime asset does not match: ' + item['id'])
            audit['previousAssetsVerified'].append(item['id'])
        expected = {'MUSIC/' + item['packagePath'] for item in previous['assets']}
        additions = []
        for group, (pattern, numbers) in GROUPS.items():
            pack['voicePools'].setdefault(group, [])
            for number in numbers:
                member = 'MUSIC/MUSIC/' + pattern.format(number)
                expected.add(member)
                additions.append((group, number, member))
        active = {n for n in z.namelist() if n.startswith('MUSIC/MUSIC/') and n.lower().endswith(('.mp3', '.mpeg', '.ogg'))}
        if active != expected:
            raise ValueError('Unexpected/missing active audio: ' + repr(active ^ expected))
        for group, number, member in additions:
            voice_id = f'vo_alyssa_{group}_{number:02}'
            data = z.read(member)
            source = Path(temporary) / (voice_id + '.mp3')
            write(source, data)
            runtime = f'assets/audio/voice/alyssa/{group}_{number:02}.mp3'
            target = ROOT / 'dist' / runtime
            first, final, mode, correction = master(source, target)
            asset = {'id': voice_id, 'bus': 'voice', 'srcs': [runtime],
                     'title': LABELS[group], 'label': LABELS[group], 'duration': final['duration'],
                     'loop': False, 'playbackRate': 1, 'clipGain': 1,
                     'sourceSha256': sha(data), 'packageSha256': sha(target.read_bytes()),
                     'group': group, 'integratedLufs': final['integratedLufs'],
                     'truePeakDbTP': final['truePeakDbTP'], 'transcriptVerified': False}
            pack['assets'][voice_id] = asset
            pack['aliases'][voice_id] = voice_id
            pack['voicePools'][group].append(voice_id)
            pack['voiceSequences']['alyssa'].append(voice_id)
            audit['newAssets'].append({'id': voice_id, 'group': group, 'variantIndex': number,
                                      'zipMember': member, 'runtimePath': runtime,
                                      'sourceSha256': sha(data), 'packageSha256': asset['packageSha256'],
                                      'normalizationType': mode, 'postEncodeGainCorrectionDb': correction,
                                      'input': first, 'output': final})
            print(f'{voice_id}: {final["integratedLufs"]} LUFS / {final["truePeakDbTP"]} dBTP', flush=True)
    pack['sourcePack'] = 5
    write_json(ROOT / 'dist/assets/music/audio-pack-5.json', pack)
    write_json(ROOT / 'docs/audio/source-pack-5/audio-manifest.v3.json', audit)
    if zip_path.read_bytes() != original_bytes:
        raise ValueError('Original archive changed')
    print('Verified 57 previous assets; imported and decoded 26 new voices.', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('zip', type=Path)
    import_zip(parser.parse_args().zip.resolve())
