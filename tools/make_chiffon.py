"""Genera los assets de Chiffon a partir de las imágenes de referencia enviadas por el usuario.

- assets/chiffon.png        : sprite a color con fondo transparente (de la imagen de trazo marrón suave)
- assets/sheet_chiffon.png  : lámina para colorear en blanco y negro (de la imagen de trazo negro grueso)
"""
from collections import deque
from PIL import Image, ImageFilter
import sys

import os
UP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ref') + '/'
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
SRC_COLOR = UP + 'chiffon_ref_color.png'   # trazo marrón suave, fondo blanco
SRC_LINES = UP + 'chiffon_ref_lines.png'   # trazo negro grueso, fondo gris claro


def is_bg(p, thr):
    r, g, b, a = p
    return min(r, g, b) >= thr and (max(r, g, b) - min(r, g, b)) <= 12


def flood_background(img, thr):
    """Marca como fondo los píxeles casi blancos/grises conectados al borde."""
    w, h = img.size
    pix = img.load()
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg(pix[x, y], thr) and not bg[y][x]:
                bg[y][x] = True; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg(pix[x, y], thr) and not bg[y][x]:
                bg[y][x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx] and is_bg(pix[nx, ny], thr):
                bg[ny][nx] = True; q.append((nx, ny))
    return bg


def make_sprite():
    img = Image.open(SRC_COLOR).convert('RGBA')
    w, h = img.size
    pix = img.load()
    bg = flood_background(img, 232)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    opix = out.load()
    for y in range(h):
        for x in range(w):
            if bg[y][x]:
                continue
            r, g, b, a = pix[x, y]
            near_bg = any(0 <= x + dx < w and 0 <= y + dy < h and bg[y + dy][x + dx]
                          for dx in (-1, 0, 1) for dy in (-1, 0, 1))
            if near_bg:
                # Des-mateado del borde antialiasado contra blanco: alpha según cuánto se aleja del blanco
                m = min(r, g, b)
                alpha = max(0.0, min(1.0, (255 - m) / 110.0))
                if alpha < 0.04:
                    continue
                ur = int(max(0, min(255, (r - 255 * (1 - alpha)) / alpha)))
                ug = int(max(0, min(255, (g - 255 * (1 - alpha)) / alpha)))
                ub = int(max(0, min(255, (b - 255 * (1 - alpha)) / alpha)))
                opix[x, y] = (ur, ug, ub, int(alpha * 255))
            else:
                opix[x, y] = (r, g, b, 255)
    bbox = out.getbbox()
    out = out.crop(bbox)
    # Margen de 4px para que el contorno no quede cortado al escalar
    pad = Image.new('RGBA', (out.width + 8, out.height + 8), (0, 0, 0, 0))
    pad.paste(out, (4, 4))
    pad.save(f'{ROOT}/assets/chiffon.png', optimize=True)
    print('assets/chiffon.png', pad.size)


def make_sheet(bg_size=(600, 500)):
    img = Image.open(SRC_LINES).convert('RGBA')
    bg = flood_background(img, 225)
    w, h = img.size
    pix = img.load()
    # Líneas = píxeles oscuros; todo lo demás blanco
    lines = Image.new('L', (w, h), 255)
    lpix = lines.load()
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if bg[y][x]:
                continue
            r, g, b, a = pix[x, y]
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            lpix[x, y] = 0 if lum < 55 else (255 if lum > 95 else int((lum - 55) / 40 * 255))
            minx, miny, maxx, maxy = min(minx, x), min(miny, y), max(maxx, x), max(maxy, y)
    lines = lines.crop((minx, miny, maxx + 1, maxy + 1))
    scale = min(500 / lines.width, 400 / lines.height)
    lines = lines.resize((int(lines.width * scale), int(lines.height * scale)), Image.Resampling.LANCZOS)
    sheet = Image.new('L', bg_size, 255)
    sheet.paste(lines, ((bg_size[0] - lines.width) // 2, (bg_size[1] - lines.height) // 2 + 10))
    sheet.convert('RGB').save(f'{ROOT}/assets/sheet_chiffon.png', optimize=True)
    print('assets/sheet_chiffon.png', sheet.size)


make_sprite()
make_sheet()
