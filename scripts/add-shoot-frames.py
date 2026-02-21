"""
Re-cut the shooting frames with muzzle flash from row 3 of the sprite sheet.
Add them to the existing sequence as the final frames.
"""
from PIL import Image
import numpy as np
import os

src = r"C:\Users\Rubenbros\Downloads\SPRITES.png"
out_dir = r"C:\Users\Rubenbros\ClaudeProjects\t800labsweb\public\bond-frames"

img = Image.open(src).convert("RGB")
W, H = img.size
pixels = np.array(img)
row_h = H // 3

# Row 2 figures (shooting row)
row2_pixels = pixels[2*row_h:3*row_h, :, :]
h_r, w_r, _ = row2_pixels.shape

white_threshold = 240
is_white_col = []
for x in range(w_r):
    col = row2_pixels[:, x, :]
    white_count = np.sum(np.all(col > white_threshold, axis=1))
    is_white_col.append(white_count / h_r > 0.95)

figures = []
in_figure = False
fig_start = 0
for x in range(w_r):
    if not is_white_col[x] and not in_figure:
        fig_start = x
        in_figure = True
    elif is_white_col[x] and in_figure:
        gap_end = x
        while gap_end < w_r and is_white_col[gap_end]:
            gap_end += 1
        if gap_end - x >= 10:
            figures.append((fig_start, x))
            in_figure = False
if in_figure:
    figures.append((fig_start, w_r))

print(f"Row 3 figures: {len(figures)}")
for i, (xs, xe) in enumerate(figures):
    print(f"  [{i}] x:{xs}-{xe} width:{xe-xs}")

# Save the shooting frames with muzzle flash (the wider ones at the end)
# Figure indices 3 and 4 should be the ones with muzzle flash
shoot_frames = []
for i, (xs, xe) in enumerate(figures):
    fw = xe - xs
    if fw < 150:  # Skip tiny fragments
        continue

    # Crop with vertical trim
    fig_pixels = row2_pixels[:, xs:xe, :]
    top = 0
    for y in range(fig_pixels.shape[0]):
        if not np.all(fig_pixels[y, :, :] > white_threshold):
            top = y
            break
    bottom = fig_pixels.shape[0]
    for y in range(fig_pixels.shape[0] - 1, -1, -1):
        if not np.all(fig_pixels[y, :, :] > white_threshold):
            bottom = y + 1
            break

    pad = 3
    crop_x1 = max(0, xs - pad)
    crop_x2 = min(W, xe + pad)
    crop_y1 = max(0, 2*row_h + top - pad)
    crop_y2 = min(H, 2*row_h + bottom + pad)

    frame = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    # Mirror
    frame = frame.transpose(Image.FLIP_LEFT_RIGHT).convert("RGBA")

    path = os.path.join(out_dir, f"shoot-{i:02d}.png")
    frame.save(path)
    print(f"  Saved shoot-{i:02d}: {frame.size[0]}x{frame.size[1]}")
    shoot_frames.append((i, frame))
