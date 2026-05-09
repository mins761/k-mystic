from pathlib import Path
import json
import shutil

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "img"
OUT = ROOT / "public" / "images" / "tarot"
CARD_OUT = OUT / "cards"
SPECIAL_OUT = OUT / "special"
BACK_OUT = OUT / "backs"
MANIFEST_OUT = OUT / "manifest.json"
TARGET = (600, 1020)
WHITE_THRESHOLD = 232
WHITE_EDGE_RATIO = 0.18


SHEETS: dict[str, list[str | None]] = {
    "01.png": [
        "00-the-fool",
        "01-the-magician",
        "02-the-high-priestess",
        "03-the-empress",
        "04-the-emperor",
        "05-the-hierophant",
        "06-the-lovers",
        "07-the-chariot",
        "08-strength",
        "09-the-hermit",
    ],
    "02.png": [
        "10-wheel-of-fortune",
        "11-justice",
        "12-the-hanged-man",
        "13-death",
        "14-temperance",
        "15-the-devil",
        "16-the-tower",
        "17-the-star",
        "18-the-moon",
        "19-the-sun",
    ],
    "03.png": [
        "20-judgement",
        "21-the-world",
        "22-ace-of-wands",
        "23-two-of-wands",
        "24-three-of-wands",
        "25-four-of-wands",
        "26-five-of-wands",
        "27-six-of-wands",
        "28-seven-of-wands",
        "29-eight-of-wands",
    ],
    "04.png": [
        "30-nine-of-wands",
        "31-ten-of-wands",
        "36-ace-of-cups",
        "37-two-of-cups",
        "38-three-of-cups",
        "39-four-of-cups",
        "40-five-of-cups",
        "41-six-of-cups",
        "42-seven-of-cups",
        "43-eight-of-cups",
    ],
    "05.png": [
        "50-ace-of-swords",
        "51-two-of-swords",
        "52-three-of-swords",
        "53-four-of-swords",
        "54-five-of-swords",
        "55-six-of-swords",
        "56-seven-of-swords",
        "57-eight-of-swords",
        "58-nine-of-swords",
        "59-ten-of-swords",
    ],
    "06.png": [
        "60-page-of-swords",
        "61-knight-of-swords",
        "62-queen-of-swords",
        "63-king-of-swords",
        "64-ace-of-pentacles",
        "65-two-of-pentacles",
        "66-three-of-pentacles",
        "67-four-of-pentacles",
        "68-five-of-pentacles",
        "69-six-of-pentacles",
    ],
    "07.png": [
        "70-seven-of-pentacles",
        "71-eight-of-pentacles",
        "72-nine-of-pentacles",
        "73-ten-of-pentacles",
        "74-page-of-pentacles",
        "75-knight-of-pentacles",
        "76-queen-of-pentacles",
        "77-king-of-pentacles",
        None,
        None,
    ],
    "08.png": [None, None, None, None, None, None, None, None, "32-page-of-wands", "33-knight-of-wands"],
    "09.png": ["34-queen-of-wands", "35-king-of-wands", None, None, None, None, None, None, None, None],
    "10.png": [
        "44-nine-of-cups",
        "45-ten-of-cups",
        "46-page-of-cups",
        "47-knight-of-cups",
        "48-queen-of-cups",
        "49-king-of-cups",
        "special-the-golden-sun",
        "special-the-treasure",
        "special-the-fortune",
        "special-the-divine-light",
    ],
}

TRIM = {
    "default": (4, 6, 4, 6),
    "09.png": (8, 8, 8, 8),
    "10.png": (10, 8, 10, 8),
    "back": (10, 12, 10, 12),
}


def cell_box(image: Image.Image, index: int, key: str = "default", cols: int = 5, rows: int = 2) -> tuple[int, int, int, int]:
    width, height = image.size
    col = index % cols
    row = index // cols
    x0 = round(col * width / cols)
    x1 = round((col + 1) * width / cols)
    y0 = round(row * height / rows)
    y1 = round((row + 1) * height / rows)
    left, top, right, bottom = TRIM.get(key, TRIM["default"])
    return x0 + left, y0 + top, x1 - right, y1 - bottom


def fit_card(crop: Image.Image) -> Image.Image:
    return ImageOps.fit(crop, TARGET, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def normalize_card(crop: Image.Image) -> Image.Image:
    fitted = fit_card(trim_white_edges(crop))
    trimmed = remove_lower_white_band(trim_white_edges(fitted))
    if trimmed.size != TARGET:
        return trimmed.resize(TARGET, Image.Resampling.LANCZOS)
    return trimmed


def remove_lower_white_band(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    scan_top = max(0, height - 90)
    for y in range(scan_top, height):
        white = 0
        for x in range(width):
            r, g, b = rgb.getpixel((x, y))
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                white += 1
        if white / width > 0.5:
            return image.crop((0, 0, width, y))
    return image


def trim_white_edges(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    left = 0
    right = width
    top = 0
    bottom = height

    def white_ratio_row(y: int) -> float:
        white = 0
        for x in range(width):
            r, g, b = rgb.getpixel((x, y))
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                white += 1
        return white / width

    def white_ratio_col(x: int) -> float:
        white = 0
        for y in range(height):
            r, g, b = rgb.getpixel((x, y))
            if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD:
                white += 1
        return white / height

    while top < bottom - 1 and white_ratio_row(top) > WHITE_EDGE_RATIO:
        top += 1
    while bottom > top + 1 and white_ratio_row(bottom - 1) > WHITE_EDGE_RATIO:
        bottom -= 1
    while left < right - 1 and white_ratio_col(left) > WHITE_EDGE_RATIO:
        left += 1
    while right > left + 1 and white_ratio_col(right - 1) > WHITE_EDGE_RATIO:
        right -= 1

    if (left, top, right, bottom) == (0, 0, width, height):
        return image
    return image.crop((left, top, right, bottom))


def split_cards() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    for folder in (CARD_OUT, SPECIAL_OUT, BACK_OUT):
        folder.mkdir(parents=True, exist_ok=True)

    manifest = {"cards": [], "special": [], "backs": {}}

    for sheet_name, names in SHEETS.items():
        image = Image.open(SRC / sheet_name).convert("RGB")
        for index, name in enumerate(names):
            if not name:
                continue
            crop = normalize_card(image.crop(cell_box(image, index, sheet_name)))
            is_special = name.startswith("special-")
            slug = name[8:] if is_special else name
            out = SPECIAL_OUT / f"{slug}.png" if is_special else CARD_OUT / f"{slug}.png"
            crop.save(out, optimize=True)
            if is_special:
                manifest["special"].append(
                    {
                        "name": slug,
                        "front": f"/images/tarot/special/{slug}.png",
                        "back": "/images/tarot/backs/gold-back.png",
                    }
                )
            else:
                manifest["cards"].append(
                    {
                        "name": slug,
                        "front": f"/images/tarot/cards/{slug}.png",
                        "back": "/images/tarot/backs/classic-back.png",
                    }
                )

    back_path = next(path for path in SRC.glob("last-*.png"))
    back_image = Image.open(back_path).convert("RGB")
    for index, name in [(0, "gold-back"), (1, "classic-back")]:
        crop = normalize_card(back_image.crop(cell_box(back_image, index, "back")))
        crop.save(BACK_OUT / f"{name}.png", optimize=True)

    manifest["backs"] = {
        "classic": "/images/tarot/backs/classic-back.png",
        "gold": "/images/tarot/backs/gold-back.png",
        "special": "/images/tarot/backs/gold-back.png",
    }
    MANIFEST_OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"cards={len(list(CARD_OUT.glob('*.png')))}")
    print(f"special={len(list(SPECIAL_OUT.glob('*.png')))}")
    print(f"backs={len(list(BACK_OUT.glob('*.png')))}")
    print(f"special_back={manifest['backs']['special']}")


if __name__ == "__main__":
    split_cards()
