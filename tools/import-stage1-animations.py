"""Import the supplied v3 atlas pack without changing accepted frame registration."""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
from PIL import Image
import argparse
import hashlib
import io
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MAPPING = {"wisp": "ember_mirror", "beetle": "prism_guard", "bat": "rune_bat",
           "knight": "mirror_knight", "shard": "shard_beast"}
ACTIONS = {"idle": 6, "attack": 12, "defend": 10, "skill": 10, "damaged": 12}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    raw = args.archive.read_bytes()
    archive_sha = hashlib.sha256(raw).hexdigest()
    prefix = "NORMAL ELITE ENEMY/"
    assets = ROOT / "dist/assets"
    source = ROOT / "docs/animations/stage1-v3"
    source.mkdir(parents=True, exist_ok=True)
    audit = {"source": args.archive.name, "sha256": archive_sha, "actors": [],
             "operation": "Lossless WebP atlas encoding; source rectangles and frame order unchanged. No frame trim or recenter.",
             "canvas": [1600, 1200], "source_pivot": [384, 578], "floor_pivot": [800, 1100],
             "draw_scale": 2.5, "figure_scale": 0.9, "pending_attachment": "MODEL(1).zip was not available; no Alyssa frames imported."}
    runtime = {"version": "3.0", "canvas": [1600, 1200], "sourcePivot": [384, 578],
               "floorPivot": [800, 1100], "drawScale": 2.5, "figureScale": 0.9, "actors": {}}
    with ZipFile(io.BytesIO(raw)) as z:
        manifest = json.loads(z.read(prefix + "animation_manifest.json"))
        assert manifest["enemy_count"] == 5 and manifest["animation_count"] == 25
        assert manifest["frame_count"] == 128 and manifest["bosses_included"] is False
        for name in ["animation_manifest.json", "SOR_ANIMATION.md", "README.md", "FRAME_COUNTS.csv"]:
            (source / name).write_bytes(z.read(prefix + name))
        for game_id, stem in MAPPING.items():
            actor = manifest["enemies"][stem]
            assert actor["stage"] == 1 and actor["facing"] == "left"
            out = {"id": stem, "name": actor["display_name"], "stage": 0,
                   "facing": "left", "animations": {}}
            actor_audit = {"id": game_id, "source_id": stem, "animations": []}
            for clip in actor["animations"]:
                action = clip["action"]
                assert clip["fps"] == ACTIONS[action]
                assert clip["loop"] == (action == "idle")
                path = clip["file"]
                assert ".." not in PurePosixPath(path).parts
                data = z.read(prefix + path)
                image = Image.open(io.BytesIO(data)).convert("RGBA")
                assert image.size == (2560, 1728)
                name = f"motion-s1-{stem}-{action}.webp"
                image.save(assets / name, "WEBP", lossless=True, quality=100, method=6, exact=True)
                decoded = Image.open(assets / name).convert("RGBA")
                assert image.getchannel("A").tobytes() == decoded.getchannel("A").tobytes()
                for color in ["black", "white"]:
                    bg = Image.new("RGBA", image.size, color)
                    assert Image.alpha_composite(bg, image).tobytes() == Image.alpha_composite(bg, decoded).tobytes()
                frames, boxes = [], []
                for frame in clip["frames"]:
                    x, y, w, h = (frame[k] for k in ["x", "y", "width", "height"])
                    assert w == h == 768
                    cell = decoded.crop((x, y, x + w, y + h))
                    native = Image.open(io.BytesIO(z.read(prefix + frame["file"]))).convert("RGBA")
                    assert cell.getchannel("A").tobytes() == native.getchannel("A").tobytes()
                    box = native.getchannel("A").getbbox()
                    assert box and min(box[0], box[1], w - box[2], h - box[3]) >= 96
                    # A single matrix for every actor and action, with all visible pixels in bounds.
                    dest = [800 + (box[0] - 384) * 2.5, 1100 + (box[1] - 578) * 2.5,
                            800 + (box[2] - 384) * 2.5, 1100 + (box[3] - 578) * 2.5]
                    assert dest[0] >= 0 and dest[1] >= 0 and dest[2] <= 1600 and dest[3] <= 1200, (stem, action, dest)
                    frames.append([x, y, w, h])
                    boxes.append({"frame": frame["index"], "source": list(box), "canvas": dest})
                assert len(frames) == clip["frame_count"]
                out["animations"][action] = {"image": name, "fps": clip["fps"], "loop": clip["loop"], "frames": frames}
                actor_audit["animations"].append({"action": action, "source": path,
                    "source_sha256": hashlib.sha256(data).hexdigest(), "runtime": name,
                    "runtime_sha256": hashlib.sha256((assets / name).read_bytes()).hexdigest(),
                    "runtime_bytes": (assets / name).stat().st_size, "frames": boxes,
                    "visible_pixels_and_alpha_preserved": True})
            runtime["actors"][game_id] = out
            audit["actors"].append(actor_audit)
    target = ROOT / "dist/animation-data.js"
    if target.exists():
        previous = json.loads(subprocess.check_output(["node", "-e",
            "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(target)], text=True))
        if "hero" in previous:
            runtime["hero"] = previous["hero"]
    target.write_text("(function(root){'use strict';\n const data=" + json.dumps(runtime, separators=(",", ":")) +
        ";\n if(typeof module!=='undefined')module.exports=data;else root.DCAnimationData=data;\n})(typeof window!=='undefined'?window:globalThis);\n")
    (source / "import-audit.json").write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps({"actors": len(runtime["actors"]), "clips": 25, "frames": 128,
        "runtime_bytes": sum(c["runtime_bytes"] for a in audit["actors"] for c in a["animations"])}))


if __name__ == "__main__":
    main()
