#!/usr/bin/env python3
"""Recolor Eldertree logo to blog brand teal; remove white canvas and halos."""

from __future__ import annotations

import colorsys
import sys
from collections import deque
from pathlib import Path

from PIL import Image

# Tuned for dark blog background (var.css dark mode)
BRAND_DARK = (13, 148, 136)  # #0d9488
BRAND_MID = (20, 184, 166)  # #14b8a6
BRAND_LIGHT = (45, 212, 191)  # #2dd4bf
BRAND_HIGHLIGHT = (94, 234, 212)  # #5eead4 — leaf tips on dark UI


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    return (
        int(a[0] + (b[0] - a[0]) * t),
        int(a[1] + (b[1] - a[1]) * t),
        int(a[2] + (b[2] - a[2]) * t),
    )


def brand_rgb(value: float, saturation: float) -> tuple[int, int, int]:
    v = max(0.0, min(1.0, value))
    if v < 0.30:
        base = lerp(BRAND_DARK, BRAND_MID, v / 0.30)
    elif v < 0.55:
        base = lerp(BRAND_MID, BRAND_LIGHT, (v - 0.30) / 0.25)
    else:
        base = lerp(BRAND_LIGHT, BRAND_HIGHLIGHT, (v - 0.55) / 0.45)
    if saturation < 0.25:
        return lerp(base, BRAND_MID, 0.4)
    return base


def is_green_family(h: float, s: float, v: float) -> bool:
    if s < 0.05 or v < 0.04:
        return False
    return 0.10 <= h <= 0.62


def is_background_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 12:
        return True
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    # White canvas, gray fringe, and anti-aliased white halos
    if v >= 0.78 and s <= 0.20:
        return True
    if min(r, g, b) >= 200 and s <= 0.14:
        return True
    return False


def recolor_pixel(r: int, g: int, b: int, a: int) -> tuple[int, int, int, int]:
    if a < 8:
        return r, g, b, 0
    if is_background_pixel(r, g, b, a):
        return 0, 0, 0, 0

    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    if not is_green_family(h, s, v):
        # Residual light fringe not caught as background
        if v > 0.72 and s < 0.22:
            return 0, 0, 0, 0
        return r, g, b, a

    tr, tg, tb = brand_rgb(v, s)
    blend = 0.9
    nr = int(r * (1 - blend) + tr * blend)
    ng = int(g * (1 - blend) + tg * blend)
    nb = int(b * (1 - blend) + tb * blend)
    return nr, ng, nb, a


def flood_clear_background(im: Image.Image) -> None:
    """Remove background connected to image edges (white square)."""
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h:
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        idx = y * w + x
        if seen[idx]:
            continue
        seen[idx] = 1
        r, g, b, a = px[x, y]
        if not is_background_pixel(r, g, b, a):
            continue
        px[x, y] = (0, 0, 0, 0)
        push(x - 1, y)
        push(x + 1, y)
        push(x, y - 1)
        push(x, y + 1)


def clean_light_fringe(im: Image.Image) -> None:
    """Turn leftover near-white edge pixels into tinted transparency."""
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            hsv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hv, s, v = hsv
            if v > 0.68 and s < 0.28:
                # Strength of green in fringe → keep as brand-tinted alpha
                greenness = max(0.0, min(1.0, (g - max(r, b)) / 80.0))
                if greenness < 0.08:
                    px[x, y] = (0, 0, 0, 0)
                    continue
                tr, tg, tb = brand_rgb(0.55, 0.35)
                alpha = int(a * greenness * 0.85)
                px[x, y] = (tr, tg, tb, max(0, min(255, alpha)))


def process_image(src: Path, dest: Path) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    for y in range(h):
        for x in range(w):
            px[x, y] = recolor_pixel(*px[x, y])
    flood_clear_background(im)
    clean_light_fringe(im)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, optimize=True)
    print(f"wrote {dest} ({w}x{h})")
    return im


def crop_mark(full: Image.Image) -> Image.Image:
    """Icon-only crop above the wordmark, trimmed to opaque bounds."""
    w, h = full.size
    top = int(h * 0.02)
    bottom = int(h * 0.78)
    left = int(w * 0.08)
    right = int(w * 0.92)
    mark = full.crop((left, top, right, bottom))

    # Trim transparent padding
    bbox = mark.getbbox()
    if bbox:
        mark = mark.crop(bbox)

    mw, mh = mark.size
    side = max(mw, mh)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - mw) // 2
    oy = (side - mh) // 2
    canvas.paste(mark, (ox, oy), mark)
    return canvas


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "assets/logo-source.png"
    if not src.exists():
        print(f"source not found: {src}", file=sys.stderr)
        sys.exit(1)

    public = root / "public"
    full = process_image(src, public / "logo-full.png")
    mark = crop_mark(full)
    mark.save(public / "logo.png", optimize=True)
    print(f"wrote {public / 'logo.png'} ({mark.size[0]}x{mark.size[1]})")

    # Stats
    px = list(full.getdata())
    white_left = sum(1 for r, g, b, a in px if a > 20 and min(r, g, b) > 210)
    print(f"near-white opaque pixels remaining: {white_left}")


if __name__ == "__main__":
    main()
