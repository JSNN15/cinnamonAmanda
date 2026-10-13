from PIL import Image, ImageFilter, ImageOps, ImageDraw
from collections import deque

src_path = 'C:/Users/JuliánNeiraNova/.gemini/antigravity/brain/b4ade427-5458-4e3a-bc9d-65fece9018b2/.user_uploaded/media_1791898537359_abda6cbb.png'
im = Image.open(src_path).convert('RGB')
w, h = im.size

# 1. Floodfill from corners to find outer white background
visited = bytearray(w * h)
bg_mask = bytearray(w * h)

queue = deque()
for x in range(w):
    queue.append((x, 0))
    queue.append((x, h - 1))
for y in range(h):
    queue.append((0, y))
    queue.append((w - 1, y))

pix = im.load()

while queue:
    x, y = queue.popleft()
    if x < 0 or x >= w or y < 0 or y >= h:
        continue
    idx = y * w + x
    if visited[idx]:
        continue
    visited[idx] = 1

    r, g, b = pix[x, y]
    if r > 238 and g > 238 and b > 238:
        bg_mask[idx] = 1
        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))

# Build alpha image
alpha_bytes = bytes(0 if bg_mask[i] else 255 for i in range(w * h))
alpha_img = Image.frombytes('L', (w, h), alpha_bytes)

# Feather alpha slightly at edges for smooth anti-aliasing
alpha_smooth = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.7))

# Create RGBA sprite
sprite_rgba = Image.new('RGBA', (w, h))
sprite_rgba.paste(im, (0, 0))
sprite_rgba.putalpha(alpha_smooth)

# Crop to bounding box with small padding
bbox = sprite_rgba.getbbox()
cropped = sprite_rgba.crop(bbox)

# Upscale cleanly to high resolution (height 360)
target_h = 360
target_w = int(cropped.width * (target_h / cropped.height))
chiffon_hq = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
chiffon_hq.save('assets/chiffon.png')
print('Saved assets/chiffon.png:', chiffon_hq.size)

# 2. Generate Black & White coloring sheet (600x500)
# We want:
# Outlines, eyes, mouth = solid dark gray / black (#222222)
# Inside of body, ears, face = pure white (#ffffff)
# Background = pure white (#ffffff)

crop_w, crop_h = cropped.size
crop_rgb = cropped.convert('RGB').load()
crop_a = cropped.split()[3].load()

sheet_bytes = bytearray(crop_w * crop_h)

for y in range(crop_h):
    for x in range(crop_w):
        idx = y * crop_w + x
        a = crop_a[x, y]
        if a < 35:
            sheet_bytes[idx] = 255  # outer white
            continue
        
        r, g, b = crop_rgb[x, y]
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        
        # Body fill has lum > 220
        # Contour lines, eyes, mouth have lum < 198
        if lum < 198:
            # Scale darkness based on line depth
            darkness = max(0.0, min(1.0, (198 - lum) / 45.0))
            val = int(255 - darkness * 225 * (a / 255.0))
            sheet_bytes[idx] = max(20, min(255, val))
        else:
            sheet_bytes[idx] = 255

sheet_im = Image.frombytes('L', (crop_w, crop_h), bytes(sheet_bytes))
sheet_im = sheet_im.filter(ImageFilter.SMOOTH)

# Place into 600x500 white canvas (scaled to fit proportionally with Cinnamoroll and Milk sheets)
canvas_w, canvas_h = 600, 500
sh_w = 450
sh_h = int(sheet_im.height * (sh_w / sheet_im.width))
sheet_resized = sheet_im.resize((sh_w, sh_h), Image.Resampling.LANCZOS)

final_sheet = Image.new('RGB', (canvas_w, canvas_h), (255, 255, 255))
offset_x = (canvas_w - sh_w) // 2
offset_y = (canvas_h - sh_h) // 2
final_sheet.paste(sheet_resized, (offset_x, offset_y))

final_sheet.save('assets/sheet_chiffon.png')
print('Saved assets/sheet_chiffon.png: 600x500')
