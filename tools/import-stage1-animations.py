"""Compatibility entry point; shared importer preserves both stages and Alyssa."""
from pathlib import Path
import runpy

if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).with_name("import-enemy-animations.py")), run_name="__main__")
