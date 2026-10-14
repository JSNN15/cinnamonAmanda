# Generador Normalizado de Láminas para el Taller de Dibujo
# Produce láminas 600x500 en blanco y negro de ultra alta definición con:
# - Grosor de trazo normalizado (mediana 7-8px, promedio ~9-10px) en todos los personajes
# - Suavizado y anti-aliasing vectorial continuo (sin pixelación tosca de 1-bit ni desenfoque gris)
# - Fondo y relleno interior 100% blanco (#ffffff) para modo de fusión multiply
# - Tinta negra profunda y nítida (#000000 a #1c1815)
# - Integridad anatómica: Mocha con barbilla/cuello/flores intactos, Chiffon nítido, Purin con corazón, Milk con osito

import os
from PIL import Image, ImageFilter

CANVAS_W, CANVAS_H = 600, 500

def contrast_curve(p):
    if p < 100: return 0
    elif p > 240: return 255
    else: return int((p - 100) * 255.0 / (240 - 100))

# 1. Cinnamoroll
def gen_cinna():
    im = Image.open('assets/cinnamoroll_fly.png').convert('RGBA')
    scale2x = 940.0 / im.width
    w2, h2 = int(im.width * scale2x), int(im.height * scale2x)
    im2x = im.resize((w2, h2), Image.Resampling.LANCZOS)
    pix2x = im2x.load()

    canvas2x = Image.new('L', (1200, 1000), 255)
    cpix2x = canvas2x.load()
    ox = (1200 - w2) // 2
    oy = (1000 - h2) // 2

    for y in range(h2):
        for x in range(w2):
            r, g, b, a = pix2x[x, y]
            if a < 30: continue
            lum = 0.299*r + 0.587*g + 0.114*b
            is_eye = (r < 110 and b > 180 and a > 200)
            is_outline = (lum < 140 and a > 100)
            if is_eye or is_outline:
                darkness = max(0.0, min(1.0, (140 - lum) / 35.0)) if not is_eye else 1.0
                val = int(255 - darkness * 255 * (a / 255.0))
                if is_eye: val = min(val, 20)
                cpix2x[ox + x, oy + y] = min(cpix2x[ox + x, oy + y], val)

    sheet = canvas2x.resize((600, 500), Image.Resampling.LANCZOS)
    return sheet.point(contrast_curve).convert('RGB')

# 2. Milk
def gen_milk():
    im = Image.open('assets/milk_teddy.png').convert('RGBA')
    scale2x = 940.0 / im.width
    w2, h2 = int(im.width * scale2x), int(im.height * scale2x)
    im2x = im.resize((w2, h2), Image.Resampling.LANCZOS)
    pix2x = im2x.load()

    canvas2x = Image.new('L', (1200, 1000), 255)
    cpix2x = canvas2x.load()
    ox = (1200 - w2) // 2
    oy = (1000 - h2) // 2 + 20

    for y in range(h2):
        for x in range(w2):
            r, g, b, a = pix2x[x, y]
            if a < 30: continue
            lum = 0.299*r + 0.587*g + 0.114*b
            if lum < 168 and a > 100:
                darkness = max(0.0, min(1.0, (168 - lum) / 32.0))
                val = int(255 - darkness * 255 * (a / 255.0))
                cpix2x[ox + x, oy + y] = min(cpix2x[ox + x, oy + y], val)

    sheet = canvas2x.resize((600, 500), Image.Resampling.LANCZOS)
    return sheet.point(contrast_curve).convert('RGB')

# 3. Pompompurin
def gen_purin():
    im = Image.open('assets/pompompurin_hq.png').convert('RGBA')
    scale2x = 730.0 / im.height
    w2, h2 = int(im.width * scale2x), int(im.height * scale2x)
    im2x = im.resize((w2, h2), Image.Resampling.LANCZOS)
    pix2x = im2x.load()

    heart_mask = Image.new('L', (w2, h2), 0)
    hpix = heart_mask.load()
    for y in range(h2):
        for x in range(w2):
            r, g, b, a = pix2x[x, y]
            if a > 80 and b > r + 15:
                hpix[x, y] = 255

    dilated = heart_mask.filter(ImageFilter.MaxFilter(11))
    eroded = heart_mask.filter(ImageFilter.MinFilter(5))
    h_edge_pix = dilated.load()
    h_in_pix = eroded.load()

    canvas2x = Image.new('L', (1200, 1000), 255)
    cpix2x = canvas2x.load()
    ox = (1200 - w2) // 2
    oy = (1000 - h2) // 2 + 10

    for y in range(h2):
        for x in range(w2):
            r, g, b, a = pix2x[x, y]
            if a < 30: continue
            lum = 0.299*r + 0.587*g + 0.114*b
            in_heart = (h_in_pix[x, y] > 150)
            on_heart_edge = (h_edge_pix[x, y] > 150 and not in_heart)
            is_beret = (y < h2 * 0.32 and r > 30 and lum < 120 and a > 150)
            is_line = (lum < 140 and a > 90 and not in_heart)
            if is_beret or is_line or on_heart_edge:
                darkness = max(0.0, min(1.0, (140 - lum) / 25.0)) if not is_beret else 1.0
                val = int(255 - darkness * 255 * (a / 255.0))
                if is_beret: val = min(val, 10)
                if on_heart_edge: val = min(val, 15)
                cpix2x[ox + x, oy + y] = min(cpix2x[ox + x, oy + y], val)

    sheet = canvas2x.resize((600, 500), Image.Resampling.LANCZOS)
    return sheet.point(contrast_curve).convert('RGB')

# 4. Mocha
def gen_mocha():
    im = Image.open('assets/mocha_hq.png').convert('RGBA')
    scale2x = 940.0 / im.width
    w2, h2 = int(im.width * scale2x), int(im.height * scale2x)
    im2x = im.resize((w2, h2), Image.Resampling.LANCZOS)
    pix2x = im2x.load()

    canvas2x = Image.new('L', (1200, 1000), 255)
    cpix2x = canvas2x.load()
    ox = (1200 - w2) // 2
    oy = (1000 - h2) // 2 + 10

    for y in range(h2):
        for x in range(w2):
            r, g, b, a = pix2x[x, y]
            if a < 30: continue
            lum = 0.299*r + 0.587*g + 0.114*b
            is_eye = (lum < 145 and y < h2 * 0.6 and (x < w2 * 0.45 or x > w2 * 0.55) and x > w2 * 0.3 and x < w2 * 0.7)
            is_line = (lum < 178 and a > 90)
            if is_eye or is_line:
                darkness = max(0.0, min(1.0, (178 - lum) / 30.0)) if not is_eye else 1.0
                val = int(255 - darkness * 255 * (a / 255.0))
                if is_eye: val = min(val, 15)
                cpix2x[ox + x, oy + y] = min(cpix2x[ox + x, oy + y], val)

    thick2x = canvas2x.filter(ImageFilter.MinFilter(3))
    sheet = thick2x.resize((600, 500), Image.Resampling.LANCZOS)
    return sheet.point(contrast_curve).convert('RGB')

# 5. Chiffon
def gen_chiffon():
    im = Image.open('assets/chiffon.png').convert('RGBA')
    scale2x = 940.0 / im.width
    w2, h2 = int(im.width * scale2x), int(im.height * scale2x)
    im2x = im.resize((w2, h2), Image.Resampling.LANCZOS)
    pix2x = im2x.load()

    canvas2x = Image.new('L', (1200, 1000), 255)
    cpix2x = canvas2x.load()
    ox = (1200 - w2) // 2
    oy = (1000 - h2) // 2 + 15

    for y in range(h2):
        for x in range(w2):
            r, g, b, a = pix2x[x, y]
            if a < 30: continue
            lum = 0.299*r + 0.587*g + 0.114*b
            is_eye = (lum < 145 and y < h2 * 0.55 and (x < w2 * 0.45 or x > w2 * 0.55) and x > w2 * 0.3 and x < w2 * 0.7)
            is_line = (lum < 188 and a > 90)
            if is_eye or is_line:
                darkness = max(0.0, min(1.0, (188 - lum) / 30.0)) if not is_eye else 1.0
                val = int(255 - darkness * 255 * (a / 255.0))
                if is_eye: val = min(val, 15)
                cpix2x[ox + x, oy + y] = min(cpix2x[ox + x, oy + y], val)

    sheet = canvas2x.resize((600, 500), Image.Resampling.LANCZOS)
    return sheet.point(contrast_curve).convert('RGB')

if __name__ == '__main__':
    print('Generating normalized sheets for assets/ ...')
    gen_cinna().save('assets/sheet_cinnamoroll.png')
    print('  -> assets/sheet_cinnamoroll.png saved')
    gen_milk().save('assets/sheet_milk.png')
    print('  -> assets/sheet_milk.png saved')
    gen_purin().save('assets/sheet_pompompurin.png')
    print('  -> assets/sheet_pompompurin.png saved')
    gen_mocha().save('assets/sheet_mocha.png')
    print('  -> assets/sheet_mocha.png saved')
    gen_chiffon().save('assets/sheet_chiffon.png')
    print('  -> assets/sheet_chiffon.png saved')
    print('ALL 5 SHEETS GENERATED AND SAVED SUCCESSFULLY!')
