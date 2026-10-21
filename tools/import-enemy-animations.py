"""Import supplied Stage 1/2 atlases; preserve all other actors and the hero registry."""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
from PIL import Image
import argparse
import hashlib
import io
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MAPPINGS = {
    1: {"wisp": "ember_mirror", "beetle": "prism_guard", "bat": "rune_bat",
        "knight": "mirror_knight", "shard": "shard_beast"},
    2: {"weaver": "chain_weaver", "shade": "deck_guard", "mimic": "card_mimic",
        "golem": "chain_golem", "reaper": "rune_reaper"}}
ACTIONS = {"idle": 6, "attack": 12, "defend": 10, "skill": 10, "damaged": 12}
COUNTS = {1: 128, 2: 135}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def visible_equal(a, b):
    assert a.size == b.size
    assert a.getchannel("A").tobytes() == b.getchannel("A").tobytes()
    for color in ["black", "white"]:
        bg = Image.new("RGBA", a.size, color)
        assert Image.alpha_composite(bg, a).tobytes() == Image.alpha_composite(bg, b).tobytes()


def poster(runtime, actor, action, sheet):
    clip = actor["animations"][action]
    x, y, width, height = clip["frames"][0]
    cell = sheet.crop((x, y, x + width, y + height))
    scale, pivot = actor.get("drawScale", runtime["drawScale"]), actor.get("sourcePivot", runtime["sourcePivot"])
    origin = [round(runtime["floorPivot"][i] - pivot[i] * scale) for i in range(2)]
    canvas = Image.new("RGBA", tuple(runtime["canvas"]))
    canvas.alpha_composite(cell.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS), tuple(origin))
    name = f"poster-s{actor['stage'] + 1}-{actor['id']}-{action}.webp"
    path = ROOT / "dist/assets" / name
    canvas.save(path, "WEBP", lossless=True, quality=100, method=4, exact=True)
    visible_equal(canvas, Image.open(path).convert("RGBA"))
    actor.setdefault("posters", {})[action] = name
    return {"action": action, "runtime": name, "sha256": digest(path.read_bytes()),
            "bytes": path.stat().st_size, "source_frame": 0, "canvas_origin": origin,
            "alpha_bounds": list(canvas.getchannel("A").getbbox())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--verify-existing", action="store_true", help="Verify native sheets against installed runtime without changing their registry or assets.")
    parser.add_argument("--report", type=Path, help="Verification-only report destination.")
    args = parser.parse_args()
    target = ROOT / "dist/animation-data.js"
    runtime = json.loads(subprocess.check_output(["node", "-e",
        "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(target)], text=True))
    audit = {"archive": args.archive.name, "sha256": digest(args.archive.read_bytes()),
             "operation": "Verify supplied frames and losslessly encode native full-cell atlases; no trim, flip, scale by VFX bounds or gameplay changes.",
             "canvas": runtime["canvas"], "source_pivot": runtime["sourcePivot"],
             "floor_pivot": runtime["floorPivot"], "draw_scale": runtime["drawScale"],
             "figure_scale": runtime["figureScale"], "actors": []}
    with ZipFile(args.archive) as z:
        assert z.testzip() is None, "Archive CRC mismatch"
        roots = [n for n in z.namelist() if n.endswith("/animation_manifest.json") and n.count("/") == 1]
        assert len(roots) == 1
        prefix = roots[0][:-len("animation_manifest.json")]
        manifest = json.loads(z.read(roots[0]))
        stage = manifest["stage"]
        assert stage in MAPPINGS and manifest["enemy_count"] == 5 and manifest["animation_count"] == 25
        assert manifest["frame_count"] == COUNTS[stage] and manifest["bosses_included"] is False
        assert manifest["standard"]["frame_size_px"] == [768, 768]
        audit.update(stage=stage, source_version=manifest["version"], verified_only=args.verify_existing)
        source = ROOT / f"docs/animations/stage{stage}-{'v3' if stage == 1 else 'v2'}"
        if not args.verify_existing:
            source.mkdir(parents=True, exist_ok=True)
            guides = ["animation_manifest.json", "README.md", "FRAME_COUNTS.csv",
                      "SOR_ANIMATION.md" if stage == 1 else "SOR_STAGE2_ANIMATION.md"]
            if stage == 2:
                guides += ["normalization.json", "CHAIN_GOLEM_LEFT_FIX.md"]
            for name in guides:
                (source / name).write_bytes(z.read(prefix + name))
        for game_id, stem in MAPPINGS[stage].items():
            source_actor = manifest["enemies"][stem]
            assert source_actor["stage"] == stage and source_actor["facing"] == "left"
            actor = {"id": stem, "name": source_actor["display_name"], "stage": stage - 1,
                     "type": source_actor["type"], "facing": "left", "flipX": False, "animations": {}}
            if stage == 2:
                actor["intentActions"] = ({"Spark": "attack", "Flame Burst": "skill", "Fire Shield": "defend"}
                    if game_id == "weaver" else {"Dark Pulse": "attack", "Mist Shield": "defend", "Dark Wave": "skill"})
            entry = {"id": game_id, "source_id": stem, "type": actor["type"], "facing": "left", "flipX": False, "animations": [], "posters": []}
            for clip in source_actor["animations"]:
                action = clip["action"]
                assert action in ACTIONS and clip["fps"] == ACTIONS[action] and clip["loop"] == (action == "idle")
                path = PurePosixPath(clip["file"])
                assert not path.is_absolute() and ".." not in path.parts
                raw = z.read(prefix + str(path))
                image = Image.open(io.BytesIO(raw)).convert("RGBA")
                assert image.size == (2560, 1728)
                name = f"motion-s{stage}-{stem}-{action}.webp"
                dest_path = ROOT / "dist/assets" / name
                if args.verify_existing:
                    installed = runtime["actors"][game_id]
                    assert installed["stage"] == stage - 1
                    assert installed["animations"][action]["image"] == name
                else:
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    image.save(dest_path, "WEBP", lossless=True, quality=100, method=6, exact=True)
                decoded = Image.open(dest_path).convert("RGBA")
                visible_equal(image, decoded)
                frames, checks = [], []
                for i, frame in enumerate(clip["frames"]):
                    rect = [frame[k] for k in ["x", "y", "width", "height"]]
                    x, y, w, h = rect
                    assert frame["index"] == i and rect == [64 + i % 3 * 832, 64 + i // 3 * 832, 768, 768]
                    native = Image.open(io.BytesIO(z.read(prefix + frame["file"]))).convert("RGBA")
                    cell = decoded.crop((x, y, x + w, y + h))
                    visible_equal(cell, native)
                    box = native.getchannel("A").getbbox()
                    assert box and min(box[0], box[1], w - box[2], h - box[3]) >= 96
                    projected = [runtime["floorPivot"][j % 2] + (box[j] - runtime["sourcePivot"][j % 2]) * runtime["drawScale"] for j in range(4)]
                    assert projected[0] >= 0 and projected[1] >= 0 and projected[2] <= 1600 and projected[3] <= 1200, (stem, action, i, projected)
                    frames.append(rect)
                    checks.append({"frame": i, "source": list(box), "canvas": projected, "pixel_sha256": digest(native.tobytes())})
                assert len(frames) == clip["frame_count"]
                actor["animations"][action] = {"image": name, "fps": clip["fps"], "loop": clip["loop"], "frames": frames}
                if args.verify_existing:
                    assert installed["animations"][action] == actor["animations"][action]
                else:
                    entry["posters"].append(poster(runtime, actor, action, decoded))
                entry["animations"].append({"action": action, "source": str(path), "source_sha256": digest(raw),
                    "runtime": name, "runtime_sha256": digest(dest_path.read_bytes()), "runtime_bytes": dest_path.stat().st_size,
                    "frames": checks, "visible_pixels_and_alpha_preserved": True})
            assert set(actor["animations"]) == set(ACTIONS)
            if not args.verify_existing:
                runtime["actors"][game_id] = actor
            audit["actors"].append(entry)
    assert sum(len(c["frames"]) for a in audit["actors"] for c in a["animations"]) == COUNTS[stage]
    if not args.verify_existing:
        runtime["version"] = "3.1"
        target.write_text("(function(root){'use strict';\n const data=" + json.dumps(runtime, separators=(",", ":")) +
            ";\n if(typeof module!=='undefined')module.exports=data;else root.DCAnimationData=data;\n})(typeof window!=='undefined'?window:globalThis);\n")
    report_path = args.report or (source / ("supplied-pack-verification.json" if args.verify_existing else "import-audit.json"))
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps({"stage": stage, "actors": 5, "clips": 25, "frames": COUNTS[stage], "verified_only": args.verify_existing,
        "atlas_bytes": sum(c["runtime_bytes"] for a in audit["actors"] for c in a["animations"]),
        "poster_bytes": sum(p["bytes"] for a in audit["actors"] for p in a["posters"])}), flush=True)


if __name__ == "__main__":
    main()
