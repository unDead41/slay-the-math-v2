"""Import Alyssa's supplied v2 runtime sheets with source timing and boot pivots."""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
from PIL import Image
import argparse
import hashlib
import io
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    source = ROOT / "docs/animations/alyssa-v2"
    source.mkdir(parents=True, exist_ok=True)
    target = ROOT / "dist/animation-data.js"
    data = json.loads(subprocess.check_output(["node", "-e",
        "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(target)], text=True))
    hero = {"id": "mc_01", "name": "Alyssa the Clairvoyance", "stages": [0, 1],
            "facing": "right", "flipX": False, "sourcePivot": [512, 768],
            "drawScale": 1.08, "figureScale": 1.7, "animations": {}}
    audit = {"source": args.archive.name, "source_sha256": hashlib.sha256(args.archive.read_bytes()).hexdigest(),
             "operation": "Lossless WebP encoding of the supplied 1024px runtime cells. No trimming, mirroring or new poses.",
             "resolution_note": "4096px source exports are upscaled; supplied 1024px runtime sheets are used unchanged.",
             "canvas": data["canvas"], "floor_pivot": data["floorPivot"], "draw_scale": hero["drawScale"],
             "figure_scale": hero["figureScale"], "animations": [],
             "usage_source": "Artwork supplied by Ijamm for Slay the Math; no separate license supplied."}
    with ZipFile(args.archive) as z:
        prefix = "MODEL/"
        manifest = json.loads(z.read(prefix + "animation_manifest.json"))
        assert manifest["facing"] == "right" and manifest["flipX"] is False
        assert manifest["runtime_grid"] == {"columns": 3, "rows": 2, "margin": 32,
            "spacing": 32, "frameWidth": 1024, "frameHeight": 1024}
        for name in ["animation_manifest.json", "SOR_ANIMATION.md", "README.md", "GENERATION_NOTES.md"]:
            (source / name).write_bytes(z.read(prefix + name))
        for action, clip in manifest["animations"].items():
            path = clip["sheet_runtime"]
            assert ".." not in PurePosixPath(path).parts
            raw = z.read(prefix + path)
            image = Image.open(io.BytesIO(raw)).convert("RGBA")
            assert image.size == (3200, 2144)
            assert len(clip["frames"]) == len(clip["durations_ms"]) == 6
            assert clip["loop"] == (action == "idle") and all(d > 0 for d in clip["durations_ms"])
            name = f"motion-alyssa-{action}.webp"
            output = ROOT / "dist/assets" / name
            image.save(output, "WEBP", lossless=True, quality=100, method=6, exact=True)
            decoded = Image.open(output).convert("RGBA")
            assert image.getchannel("A").tobytes() == decoded.getchannel("A").tobytes()
            for color in ["black", "white"]:
                bg = Image.new("RGBA", image.size, color)
                assert Image.alpha_composite(bg, image).tobytes() == Image.alpha_composite(bg, decoded).tobytes()
            frames, pivots, checks = [], [], []
            for i, frame in enumerate(clip["frames"]):
                assert frame["index"] == i
                x, y = 32 + i % 3 * 1056, 32 + i // 3 * 1056
                cell = decoded.crop((x, y, x + 1024, y + 1024))
                box = cell.getchannel("A").getbbox()
                assert box and min(box[0], box[1], 1024 - box[2], 1024 - box[3]) >= 128
                pivot = [p / 4 for p in frame["anchor"]]
                scale = hero["drawScale"]
                dest = [800 + (box[0] - pivot[0]) * scale, 1100 + (box[1] - pivot[1]) * scale,
                        800 + (box[2] - pivot[0]) * scale, 1100 + (box[3] - pivot[1]) * scale]
                assert dest[0] >= 0 and dest[1] >= 0 and dest[2] <= 1600 and dest[3] <= 1200, (action, i, dest)
                frames.append([x, y, 1024, 1024])
                pivots.append(pivot)
                checks.append({"frame": i, "alpha_bounds": list(box), "source_pivot": pivot, "canvas_bounds": dest})
            hero["animations"][action] = {"image": name, "durationsMs": clip["durations_ms"],
                "loop": clip["loop"], "frames": frames, "pivots": pivots}
            audit["animations"].append({"action": action, "source": path,
                "source_sha256": hashlib.sha256(raw).hexdigest(), "runtime": name,
                "runtime_sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
                "runtime_bytes": output.stat().st_size, "frames": checks, "visible_pixels_and_alpha_preserved": True})
    data["hero"] = hero
    target.write_text("(function(root){'use strict';\n const data=" + json.dumps(data, separators=(",", ":")) +
        ";\n if(typeof module!=='undefined')module.exports=data;else root.DCAnimationData=data;\n})(typeof window!=='undefined'?window:globalThis);\n")
    (source / "import-audit.json").write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps({"clips": len(hero["animations"]), "frames": 30,
        "runtime_bytes": sum(c["runtime_bytes"] for c in audit["animations"])}))


if __name__ == "__main__":
    main()
