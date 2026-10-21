"""Prepare the supplied transparent sheets and map icons. Never redraw artwork."""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets'
records = []

def export(source, box, name, canvas=None, size=None):
    image = Image.open(source).convert('RGBA')
    if box:
        image = image.crop(box)
    bounds = image.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
    if bounds:
        image = image.crop(bounds)
    if canvas:
        scale = min((canvas[0] - 72) / image.width, (canvas[1] - 72) / image.height)
        image = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
        frame = Image.new('RGBA', canvas)
        frame.alpha_composite(image, ((canvas[0] - image.width)//2, canvas[1] - image.height - 36))
        image = frame
    elif size:
        image.thumbnail(size, Image.Resampling.LANCZOS)
    else:
        frame = Image.new('RGBA', (image.width + 48, image.height + 48))
        frame.alpha_composite(image, (24, 24))
        image = frame
    image.save(OUT / name, 'WEBP', quality=94, method=6)
    records.append({'asset': name, 'source': str(source.relative_to(ROOT)),
                    'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                    'crop': box, 'outputSize': list(image.size),
                    'operation': 'Mechanical crop, transparent padding and WebP encoding; no generated artwork'})

hero = ROOT/'source-art/alyssa-standing-4-pov.png'
for index, view in enumerate(['front', 'back', 'left', 'right']):
    export(hero, (index*418, 0, (index+1)*418, 941), f'alyssa-{view}.webp')
model = ROOT/'source-art/ember-mirror-model.png'
for index, view in enumerate(['front', 'back', 'left', 'right']):
    export(model, (index*418, 0, (index+1)*418, 941), f'ember-mirror-{view}.webp', canvas=(900, 760))
actions = ROOT/'source-art/ember-mirror-actions.png'
for name, box in [('attack',(0,0,960,540)), ('defend',(960,0,1920,540)),
                  ('skill',(0,540,960,1080)), ('damage',(960,540,1920,1080))]:
    export(actions, box, f'ember-mirror-{name}.webp', canvas=(900, 760))
for key, name in [('battle','normal_enemy'),('elite','elite_enemy'),('boss','boss'),
                  ('shop','shop'),('camp','rest'),('event','mystery')]:
    export(ROOT/f'modules/map/assets/map-icons/square/{name}.png', None, f'map-{key}.webp', size=(224,224))
(OUT/'scene-assets.json').write_text(json.dumps(records, indent=2)+'\n')
print(f'Prepared {len(records)} transparent scene assets')
