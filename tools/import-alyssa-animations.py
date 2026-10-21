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


def write_right_posters(data, audit):
    """Project supplied frame 0 into the exact animation canvas for image fallbacks."""
    hero = data["hero"]
    hero["posters"] = {}
    audit["posters"] = []
    for action, clip in hero["animations"].items():
        sheet_path = ROOT / "dist/assets" / clip["image"]
        expected = next(c["runtime_sha256"] for c in audit["animations"] if c["action"] == action)
        assert hashlib.sha256(sheet_path.read_bytes()).hexdigest() == expected
        sheet = Image.open(sheet_path).convert("RGBA")
        x, y, width, height = clip["frames"][0]
        cell = sheet.crop((x, y, x + width, y + height))
        pivot, scale = clip["pivots"][0], hero["drawScale"]
        origin = [round(data["floorPivot"][i] - pivot[i] * scale) for i in range(2)]
        canvas = Image.new("RGBA", tuple(data["canvas"]), (0, 0, 0, 0))
        canvas.alpha_composite(cell.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS), tuple(origin))
        name = f"alyssa-right-{action}.webp"
        output = ROOT / "dist/assets" / name
        canvas.save(output, "WEBP", lossless=True, quality=100, method=4, exact=True)
        decoded = Image.open(output).convert("RGBA")
        assert decoded.getchannel("A").tobytes() == canvas.getchannel("A").tobytes()
        for color in ["black", "white"]:
            bg = Image.new("RGBA", canvas.size, color)
            assert Image.alpha_composite(bg, canvas).tobytes() == Image.alpha_composite(bg, decoded).tobytes()
        hero["posters"][action] = name
        audit["posters"].append({"action": action, "source_runtime": clip["image"],
            "source_frame": 0, "source_rect": clip["frames"][0], "source_pivot": pivot,
            "canvas_origin": origin, "canvas_size": data["canvas"], "facing": "right",
            "runtime": name, "runtime_sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
            "runtime_bytes": output.stat().st_size, "alpha_bounds": list(decoded.getchannel("A").getbbox()),
            "operation": "Mechanical frame projection at the animation scale; no redraw, flip or old artwork."})


def write_registry(target, source, data, audit):
    target.write_text("(function(root){'use strict';\n const data=" + json.dumps(data, separators=(",", ":")) +
        ";\n if(typeof module!=='undefined')module.exports=data;else root.DCAnimationData=data;\n})(typeof window!=='undefined'?window:globalThis);\n")
    (source / "import-audit.json").write_text(json.dumps(audit, indent=2) + "\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument("--posters-only", action="store_true", help="Derive new right-facing fallbacks from the already verified runtime sheets.")
    args = parser.parse_args()
    source = ROOT / "docs/animations/alyssa-v2"
    source.mkdir(parents=True, exist_ok=True)
    target = ROOT / "dist/animation-data.js"
    data = json.loads(subprocess.check_output(["node", "-e",
        "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(target)], text=True))
    if args.posters_only:
        audit = json.loads((source / "import-audit.json").read_text())
        assert hashlib.sha256(args.archive.read_bytes()).hexdigest() == audit["source_sha256"]
        write_right_posters(data, audit)
        write_registry(target, source, data, audit)
        print(json.dumps({"right_facing_posters": len(audit["posters"]),
            "poster_bytes": sum(p["runtime_bytes"] for p in audit["posters"])}))
        return
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
    write_right_posters(data, audit)
    write_registry(target, source, data, audit)
    print(json.dumps({"clips": len(hero["animations"]), "frames": 30,
        "runtime_bytes": sum(c["runtime_bytes"] for c in audit["animations"])}))


if __name__ == "__main__":
    main()
