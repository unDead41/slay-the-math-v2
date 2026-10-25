"""Import the approved V5 review pack without changing its raster animation."""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
from PIL import Image
import argparse, hashlib, io, json, subprocess

ROOT = Path(__file__).resolve().parents[1]
ACTIONS = ("idle", "attack", "damaged", "defend", "skill")
APPROVED_SHA = "4d6d7b3d8b6711679e9dc060e62be351a889459ffbda38e7c06a9c945a8b2302"

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    source_hash = digest(args.archive.read_bytes())
    assert source_hash == APPROVED_SHA, "Use the exact V5 ZIP approved with the HTML review."
    target = ROOT / "dist/animation-data.js"
    data = json.loads(subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(target)], text=True))
    previous = data["hero"]
    actor_hash = digest(json.dumps(data["actors"], separators=(",", ":"), ensure_ascii=False).encode())
    docs = ROOT / "docs/animations/alyssa-v5"
    docs.mkdir(parents=True, exist_ok=True)
    audit_path = docs / "import-audit.json"
    # Re-importing must preserve the original baseline/provenance, not rewrite
    # the before-state to V5 and make an otherwise identical import drift.
    baseline = json.loads(audit_path.read_text())["previous_hero"] if audit_path.exists() else previous
    audit = {"source": args.archive.name, "source_sha256": source_hash, "source_bytes": args.archive.stat().st_size,
             "asset_version": "alyssa-v5-15", "frame_slots": 75, "facing": "right", "rig": False,
             "operation": "Byte-preserved approved atlases; fixed per-clip registration, slower sparse Idle blink; no new poses or local deformation.",
             "usage_source": "V5 artwork reviewed and approved by Ijamm for this game; new drawings used built-in imagegen. No separate licence declaration supplied.",
             "previous_hero": baseline, "untouched_actors_sha256": actor_hash, "animations": [], "posters": []}
    with ZipFile(args.archive) as z:
        assert z.testzip() is None
        manifests = [name for name in z.namelist() if name.endswith("/manifest.json")]
        assert len(manifests) == 1
        prefix = manifests[0].removesuffix("manifest.json")
        manifest_bytes = z.read(manifests[0])
        manifest = json.loads(manifest_bytes)
        assert manifest["version"] == 5 and manifest["frameCount"] == 15
        assert manifest["direction"] == "right" and manifest["rig"] is False and manifest["localWarps"] is False
        assert set(manifest["actions"]) == set(ACTIONS)
        native = manifest["frameSize"][0]
        cell_size = manifest["runtimeFrameSize"][0]
        ratio = cell_size / native
        # V5's stored pivot is the rear boot. The review's ground shadow uses
        # rear boot +60 native px: keep that same fixed two-foot centre here.
        center_offset = [60, 0]
        pivot = [(manifest["pivot"][i] + center_offset[i]) * ratio for i in range(2)]
        scale = 1.08 / ratio
        hero = {"id": "mc_01", "name": previous["name"], "stages": [0, 1], "facing": "right", "flipX": False,
                "assetVersion": "alyssa-v5-15", "sourcePivot": pivot, "drawScale": scale,
                "figureScale": previous["figureScale"], "animations": {}, "posters": {}}
        audit.update(canvas=data["canvas"], floor_pivot=data["floorPivot"], source_pivot=pivot,
                     draw_scale=scale, figure_scale=hero["figureScale"], native_ground_center_offset=center_offset,
                     decoded_atlas_bytes=0, native_resolution_note="1024px exported frames; approved runtime cells are 640px, not native 4K.")
        for action in ACTIONS:
            src = manifest["actions"][action]
            path = PurePosixPath(src["atlas"])
            assert not path.is_absolute() and ".." not in path.parts
            raw = z.read(prefix + str(path))
            sheet = Image.open(io.BytesIO(raw)).convert("RGBA")
            assert sheet.size == (3296, 1984) and max(sheet.size) < 4096
            rects, holds = src["rects"], src["durations"][:]
            clip_pivot = pivot[:]
            if action == "idle":
                # V5 replaced Idle after the original root was recorded. Its
                # annotated rear boot is 116.2 native px ahead of Attack's root.
                # One constant clip offset preserves breathing and foot motion.
                first = src["frames"][0]
                matrix, foot = first["finalMatrix"], first["features"]["foot"]
                clip_pivot[0] += (foot[0] * matrix[0] + matrix[1] - manifest["pivot"][0]) * ratio
                holds[6:9] = [85, 110, 85]
            assert len(rects) == len(holds) == 15 and all(isinstance(t, int) and t > 0 for t in holds)
            frames = []
            for i, (x, y, w, h) in enumerate(rects):
                assert w == h == cell_size and x >= 16 and y >= 16 and x + w <= sheet.width - 16 and y + h <= sheet.height - 16
                cell = sheet.crop((x, y, x + w, y + h))
                box = list(cell.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
                assert min(box[0], box[1], w - box[2], h - box[3]) >= 16
                bounds = [data["floorPivot"][j % 2] + (box[j] - clip_pivot[j % 2]) * scale for j in range(4)]
                assert bounds[0] >= 0 and bounds[1] >= 0 and bounds[2] <= data["canvas"][0] and bounds[3] <= data["canvas"][1], (action, i, bounds)
                native_png = Image.open(io.BytesIO(z.read(prefix + f"frames/{action}_{i+1:02d}.png"))).convert("RGBA")
                assert digest(native_png.tobytes()) == src["hashes"][i]
                frames.append({"index": i, "rect": [x,y,w,h], "alpha_bounds": box, "canvas_bounds": bounds,
                               "duration_ms": holds[i], "native_rgba_sha256": src["hashes"][i]})
            name = f"motion-alyssa-{action}.webp"
            (ROOT / "dist/assets" / name).write_bytes(raw)
            clip = {"image": name, "durationsMs": holds, "loop": action == "idle", "frames": rects, "pivots": [clip_pivot[:] for _ in rects]}
            if action == "idle":
                clip["blink"] = {"everyLoops": 2, "frames": [6, 7, 8], "openFrame": 5}
            hero["animations"][action] = clip
            audit["animations"].append({"action": action, "runtime": name, "source_atlas": str(path), "runtime_sha256": digest(raw),
                "runtime_bytes": len(raw), "sheet_size": list(sheet.size), "unique_native_rasters": len(set(src["hashes"])),
                "source_durations_ms": src["durations"], "source_pivot": clip_pivot, "frames": frames})
            audit["decoded_atlas_bytes"] += sheet.width * sheet.height * 4
            x, y, w, h = rects[0]
            cell = sheet.crop((x,y,x+w,y+h))
            tx, ty = [data["floorPivot"][j] - clip_pivot[j] * scale for j in range(2)]
            poster = cell.transform(tuple(data["canvas"]), Image.Transform.AFFINE, (1/scale,0,-tx/scale,0,1/scale,-ty/scale), resample=Image.Resampling.BICUBIC)
            output = ROOT / "dist/assets" / f"alyssa-right-{action}.webp"
            poster.save(output, "WEBP", lossless=True, method=4, exact=True)
            decoded = Image.open(output).convert("RGBA")
            assert decoded.getchannel("A").tobytes() == poster.getchannel("A").tobytes()
            for color in ("black", "white"):
                bg = Image.new("RGBA", poster.size, color)
                assert Image.alpha_composite(bg, decoded).tobytes() == Image.alpha_composite(bg, poster).tobytes()
            hero["posters"][action] = output.name
            audit["posters"].append({"action": action, "source_frame": 0, "source_runtime": name,
                "runtime": output.name, "runtime_sha256": digest(output.read_bytes()), "runtime_bytes": output.stat().st_size,
                "alpha_bounds": list(decoded.getchannel("A").getbbox()), "canvas_size": data["canvas"], "facing": "right"})
        idle_box = next(p["alpha_bounds"] for p in audit["posters"] if p["action"] == "idle")
        hero["bodyHeight"] = idle_box[3] - idle_box[1]
        audit["idle_body_height"] = hero["bodyHeight"]
        (docs / "source-manifest.json").write_bytes(manifest_bytes)
        for action in ACTIONS:
            (docs / f"{action}-contact.jpg").write_bytes(z.read(prefix + f"contact-sheets/{action}.jpg"))
        (docs / "SOURCE_README.txt").write_bytes(z.read(prefix + "README.txt"))
    data["hero"] = hero
    target.write_text("(function(root){'use strict';\n const data=" + json.dumps(data, separators=(",", ":")) + ";\n if(typeof module!=='undefined')module.exports=data;else root.DCAnimationData=data;\n})(typeof window!=='undefined'?window:globalThis);\n")
    audit_path.write_text(json.dumps(audit, indent=2) + "\n")
    print(json.dumps({"actions": len(hero["animations"]), "frame_slots": 75, "native_unique_rasters": sum(c["unique_native_rasters"] for c in audit["animations"]),
                      "atlas_bytes": sum(c["runtime_bytes"] for c in audit["animations"]), "per_atlas_decoded_bytes": audit["decoded_atlas_bytes"] // 5,
                      "source_sha256": source_hash, "source_pivot": pivot, "draw_scale": scale}))

if __name__ == "__main__":
    main()
