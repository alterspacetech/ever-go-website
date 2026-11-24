"""Enhance common product-group screenshots for hero / lifestyle use (no rembg)."""

from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "images" / "common"
OUT = ROOT / "public" / "images" / "lifestyle"
OUT.mkdir(parents=True, exist_ok=True)

for i, path in enumerate(sorted(SRC.glob("*.png")) + sorted(SRC.glob("*.jpg")), start=1):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    m = int(min(w, h) * 0.012)
    if m:
        img = img.crop((m, m, w - m, h - m))
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.04)
    img = ImageEnhance.Sharpness(img).enhance(1.1)
    img.thumbnail((1800, 1400), Image.Resampling.LANCZOS)
    dest = OUT / f"lifestyle-{i:02d}.jpg"
    img.save(dest, "JPEG", quality=90, optimize=True)
    print(dest.name, img.size)
