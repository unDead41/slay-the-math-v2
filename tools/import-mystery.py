"""Import supplied Mystery v2 specifications and viewport-sized scene derivatives.

Usage: python tools/import-mystery.py /absolute/path/to/upload
Original PNGs and the older question-bank snapshot are never added to the game.
"""
import hashlib
import io
import json
import os
import sys
import zipfile
from pathlib import Path
from PIL import Image, ImageFile

ROOT = Path(__file__).resolve().parents[1]
PREFIX = 'Slay_the_Math_Mystery_Events_v2/'

def main():
    source = Path(sys.argv[1])
    paths = sorted(source.glob('Slay_the_Math_Mystery_Events_v2_Part_*_of_04.zip'))
    if len(paths) != 4:
        raise ValueError('All four artwork ZIPs are required.')
    docs = ROOT / 'docs/mystery/source-v2'
    docs.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(paths[0]) as archive:
        config_bytes = archive.read(PREFIX + 'data/mystery-events.v2.json')
        config = json.loads(config_bytes)
        manifest = json.loads(archive.read(PREFIX + 'data/asset-manifest.v2.json'))
        for name in ['SOR_MYSTERY_EVENTS_v2.md', 'JADUAL_MEKANIK_MYSTERY_EVENTS_v2.md']:
            text = archive.read(PREFIX + 'docs/' + name).decode('utf-8')
            # Preserve Markdown hard breaks without trailing whitespace.
            normalized = '\n'.join(line.rstrip() + (chr(92) if line.endswith('  ') else '') for line in text.splitlines()) + '\n'
            (docs / name).write_text(normalized)
        (docs / 'mystery-events.v2.json').write_bytes(config_bytes)
    # Keep the supplied data unchanged; the adapter owns runtime category/tier IDs.
    (ROOT / 'dist/mystery-data.js').write_text(
        "(function(r){'use strict';const data=" + json.dumps(config, separators=(',', ':')) +
        ";if(typeof module!=='undefined')module.exports=data;else r.DCMysteryData=data;})(typeof window!=='undefined'?window:globalThis);\n"
    )
    lookup = {PREFIX + a['file']: a for a in manifest['assets']}
    assets = []
    for path in paths:
        with zipfile.ZipFile(path) as archive:
            if archive.read(PREFIX + 'data/mystery-events.v2.json') != config_bytes:
                raise ValueError('The four parts contain different event configurations.')
            for name in archive.namelist():
                if name not in lookup:
                    continue
                a = lookup[name]
                blob = archive.read(name)
                digest = hashlib.sha256(blob).hexdigest()
                if digest != a['sha256']:
                    raise ValueError('Source hash mismatch: ' + name)
                with Image.open(io.BytesIO(blob)) as image:
                    if image.size != (a['width'], a['height']):
                        raise ValueError('Source dimension mismatch: ' + name)
                    recovery = None
                    if a['eventId'] == 'ME04' and not blob.endswith(bytes.fromhex('0000000049454e44ae426082')):
                        # The supplied, hash-matching file ends inside its final
                        # IDAT chunk. Independent zlib inspection confirms 4316
                        # complete scanlines; discard the four incomplete floor
                        # margin rows rather than display decoder-filled pixels.
                        ImageFile.LOAD_TRUNCATED_IMAGES = True
                        try:
                            image.load()
                        finally:
                            ImageFile.LOAD_TRUNCATED_IMAGES = False
                        image = image.crop((0, 0, 7680, 4316))
                        recovery = {'issue': 'supplied PNG truncated in final IDAT', 'completeRowsUsed': 4316, 'bottomMarginRowsDiscarded': 4, 'sourceUnchanged': True}
                    outputs = []
                    for width, quality in [(1920, 88), (960, 82)]:
                        filename = 'mystery-' + a['eventId'].lower() + ('-small' if width == 960 else '') + '.webp'
                        target = ROOT / 'dist/assets' / filename
                        # Encode before opening the destination, then replace
                        # atomically. Readers never observe a zero-byte texture.
                        encoded = io.BytesIO()
                        image.resize((width, width * 9 // 16), Image.Resampling.LANCZOS).save(encoded, 'WEBP', quality=quality, method=6)
                        temporary = target.with_suffix('.webp.importing')
                        temporary.write_bytes(encoded.getvalue())
                        os.replace(temporary, target)
                        outputs.append({'file': filename, 'width': width, 'bytes': target.stat().st_size, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
                    assets.append({'eventId': a['eventId'], 'assetKey': a['assetKey'], 'sourceFile': name, 'sourceZip': path.name, 'sourceSha256': digest, 'sourceDimensions': [a['width'], a['height']], 'recovery': recovery, 'outputs': outputs})
                    print(a['eventId'], sum(x['bytes'] for x in outputs), flush=True)
    if len(assets) != 15 or len({a['eventId'] for a in assets}) != 15:
        raise ValueError('Expected exactly fifteen unique scenes.')
    for a in assets:
        for output in a['outputs']:
            with Image.open(ROOT / 'dist/assets' / output['file']) as image:
                image.load()
    (ROOT / 'dist/assets/mystery-art.json').write_text(json.dumps({'packageVersion': config['packageVersion'], 'activeQuestionBank': 'unchanged; uses DCEducation adapter', 'configSha256': hashlib.sha256(config_bytes).hexdigest(), 'assets': sorted(assets, key=lambda a: a['eventId'])}, indent=2) + '\n')

if __name__ == '__main__':
    main()
