"""Polish product photos: remove busy backgrounds, keep the real product untouched.
Writes JPEG previews into data/images/polished/ for review (not wired to the site yet).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "images"
OUT = ROOT / "data" / "images" / "polished"
COMMON = SRC / "common"
COMMON_OUT = ROOT / "data" / "images" / "lifestyle"

BG = (246, 245, 242, 255)  # site soft cream


def polish_cutout(rgba: Image.Image, size: int = 1600) -> Image.Image:
    """Center the cut-out product on a soft square background."""
    rgba = rgba.convert("RGBA")
    # Trim transparent padding tightly, then add breathing room.
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    # Slight clarity only — no generative changes to the product pixels.
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.06)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.12)
    rgb = ImageEnhance.Color(rgb).enhance(1.04)
    rgba = Image.merge("RGBA", (*rgb.split(), rgba.split()[-1]))

    pad = int(max(rgba.size) * 0.08)
    canvas = Image.new("RGBA", (rgba.width + pad * 2, rgba.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(rgba, (pad, pad), rgba)

    # Fit into square soft background.
    fitted = ImageOps.contain(canvas, (size, size), Image.Resampling.LANCZOS)
    square = Image.new("RGBA", (size, size), BG)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    square.paste(fitted, (x, y), fitted)
    return square.convert("RGB")


def polish_product(path: Path) -> Path:
    out = OUT / f"{path.stem}.jpg"
    if out.exists() and out.stat().st_mtime >= path.stat().st_mtime:
        print(f"skip {path.name}")
        return out
    print(f"polish {path.name}")
    src = Image.open(path).convert("RGBA")
    # Cap very large inputs so rembg stays fast.
    src.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
    cut = remove(src)
    result = polish_cutout(cut)
    result.save(out, "JPEG", quality=92, optimize=True)
    return out


def polish_lifestyle(path: Path, index: int) -> Path:
    """Clean screenshot chrome edges and tone for lifestyle / hero use."""
    out = COMMON_OUT / f"lifestyle-{index:02d}.jpg"
    print(f"lifestyle {path.name} → {out.name}")
    img = Image.open(path).convert("RGB")
    # Screenshots often include UI chrome; crop a thin outer margin if present.
    w, h = img.size
    margin = int(min(w, h) * 0.015)
    if margin > 0:
        img = img.crop((margin, margin, w - margin, h - margin))
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Color(img).enhance(1.03)
    img = ImageEnhance.Sharpness(img).enhance(1.08)
    # Soft vignette-free export at a web-friendly width.
    img.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    img.save(out, "JPEG", quality=90, optimize=True)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    COMMON_OUT.mkdir(parents=True, exist_ok=True)

    products = sorted(
        [p for p in SRC.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} and p.is_file()],
        key=lambda p: p.name.lower(),
    )
    for path in products:
        polish_product(path)

    commons = sorted(COMMON.glob("*.png")) + sorted(COMMON.glob("*.jpg")) + sorted(COMMON.glob("*.jpeg"))
    for i, path in enumerate(commons, start=1):
        polish_lifestyle(path, i)

    print(f"Done. Polished products → {OUT}")
    print(f"Lifestyle / hero candidates → {COMMON_OUT}")


if __name__ == "__main__":
    main()
