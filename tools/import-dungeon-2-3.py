"""Export user-supplied sheets with a single foot pivot. Never redraw sprites.

Usage: python tools/import-dungeon-2-3.py --finalize <extracted Finalize Design>
Menu backgrounds are separate imagegen clean-plate edits; see menu-art.json.
"""
from pathlib import Path
import argparse
import hashlib
import json
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist/assets'
CANVAS = (1600, 1200)
PIVOT = (800, 1100)
records = []


def webp(image, name, quality=94):
    buffer = BytesIO()
    image.save(buffer, 'WEBP', quality=quality, method=6)
    payload = buffer.getvalue()
    Image.open(BytesIO(payload)).load()
    pending = OUT / (name + '.pending')
    pending.write_bytes(payload)
    pending.replace(OUT / name)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sprite(source, crop, name, label):
    original = Image.open(source).convert('RGBA')
    image = original.crop(crop) if crop else original
    # Discard nearly invisible alpha noise from generated sheets, not artwork.
    image.putalpha(image.getchannel('A').point(lambda a: 0 if a <= 8 else a))
    bounds = image.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
    if not bounds:
        raise ValueError(f'Empty sprite: {source} {crop}')
    image = image.crop(bounds)
    scale = min(1480 / image.width, 1000 / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    image = image.resize(size, Image.Resampling.LANCZOS)
    frame = Image.new('RGBA', CANVAS)
    frame.alpha_composite(image, (PIVOT[0] - image.width // 2, PIVOT[1] - image.height))
    webp(frame, name)
    records.append(dict(asset=name, character=label, source=source.name,
                        source_sha256=digest(source), source_size=list(original.size),
                        crop=crop, alpha_bounds=list(bounds), canvas=list(CANVAS),
                        foot_pivot=list(PIVOT), operation='Crop, alpha-noise trim, uniform resize, foot-aligned transparent canvas; no redraw'))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--finalize', type=Path, required=True)
    args = parser.parse_args()
    base = args.finalize
    mc = base / 'MC/MODEL/mc_standing_4_pov.png'
    w, h = Image.open(mc).size
    sprite(mc, (0, 0, w // 4, h), 'ground-alyssa-standing.webp', 'Alyssa')
    for pose in ['attack', 'defend', 'skill', 'damage']:
        sprite(OUT / f'hero-{pose}.webp', None, f'ground-alyssa-{pose}.webp', 'Alyssa')

    actors = [
        ('NORMAL ENEMY/EMBER MIRROR', 'ember_mirror', 'Ember Mirror'),
        ('NORMAL ENEMY/PRISM GUARD', 'prism_guard', 'Prism Guard'),
        ('NORMAL ENEMY/RUNE BAT', 'rune_bat', 'Rune Bat'),
        ('ELITE ENEMY/MIRROR KNIGHT', 'mirror_knight', 'Mirror Knight'),
        ('ELITE ENEMY/POLISHED SHARD BEAST', 'polished_shard_beast', 'Polished Shard Beast'),
    ]
    for directory, stem, label in actors:
        folder = base / 'SCENE/STAGE 1' / directory
        model = folder / f'{stem}_model.png'
        w, h = Image.open(model).size
        box = (0, 0, w // 4, h) if stem == 'ember_mirror' else (0, 0, w // 2, h // 2)
        sprite(model, box, f'ground-{stem}-standing.webp', label)
        actions = folder / f'{stem}_actions.png'
        w, h = Image.open(actions).size
        for i, pose in enumerate(['attack', 'defend', 'skill', 'damage']):
            x, y = i % 2, i // 2
            sprite(actions, (x*w//2, y*h//2, (x+1)*w//2, (y+1)*h//2),
                   f'ground-{stem}-{pose}.webp', label)

    # Stage 2 and bosses have no dedicated action sheets in the latest ZIP.
    # Use their existing supplied model, with outcome-driven CSS reactions.
    for stem in ['s1_twin_sigil_guardian', 's2_deck_lord', 's2_chain_weaver',
                 's2_deck_guard', 's2_card_mimic', 's2_chain_golem', 's2_rune_reaper']:
        sprite(OUT / f'{stem}.webp', None, f'ground-{stem}.webp', stem)

    for stage in [1, 2]:
        for kind in ['normal', 'elite', 'boss']:
            source = base / f'SCENE/STAGE {stage}/ARENA SCENE/{kind}_arena.png'
            name = f'arena-{kind}-{stage}.webp'
            image = Image.open(source).convert('RGB')
            webp(image, name, quality=92)
            records.append(dict(asset=name, source=str(source.relative_to(base)),
                                source_sha256=digest(source), size=list(image.size),
                                operation='WebP encoding; unchanged composition'))

    atlas_dir = base / 'UI ICON'
    atlas = json.loads((atlas_dir / 'data/ui-icons-atlas.json').read_text())
    source = atlas_dir / 'assets/Slay_the_Math_UI_Icons_13_Sheet_FHD.png'
    image = Image.open(source).convert('RGBA')
    for item in atlas['icons']:
        region = item['paddedRegion']
        box = (region['x'], region['y'], region['x']+region['width'], region['y']+region['height'])
        tile = image.crop(box)
        tile.putalpha(tile.getchannel('A').point(lambda a: 0 if a <= 8 else a))
        tile.thumbnail((224, 224), Image.Resampling.LANCZOS)
        name = f'ui-{item["id"]}.webp'
        webp(tile, name, quality=95)
        records.append(dict(asset=name, source=source.name, source_sha256=digest(source),
                            crop=list(box), operation='Atlas crop with original padding and alpha'))

    # Export the supplied Focus eye crystal too. DCVisuals maps it to Focus;
    # the separate Predict companion asset is maintained outside this import.
    (OUT / 'grounding-assets.json').write_text(json.dumps(dict(
        version='2.3.0', source_package='Finalize Design(2).zip',
        pivot_normalized=[0.5, 11/12], records=records), indent=2)+'\n')
    print(f'Exported {len(records)} grounded sprites, arenas and icons')


if __name__ == '__main__':
    main()
